import { NextResponse } from "next/server";
import sharp from "sharp";
import { getSupabaseServer } from "@/lib/supabase/server";

const limits: Record<string, number> = { hero: 1, rooms: 8, club: 12, events: 6, food: 12, gallery: 12, venue: 12, braless: 6, media: 12, tv: 12, dj: 12, conversation: 12, fm: 6 };
const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const videoTypes = ["video/mp4", "video/webm", "video/quicktime"];
const contentTypes = ["website_media", "event_highlight", "event_teaser", "dj_clip", "interview_clip", "guest_reaction", "food_clip", "nightlife_clip", "behind_the_scenes", "announcement", "countdown", "promotional_clip", "event_recap", "dj_set", "podcast", "short", "event", "braless", "dj_mix", "tv", "conversation", "fm"] as const;
const platforms = ["website", "youtube", "mixcloud", "instagram", "tiktok", "short_form"] as const;

function originalPathFor(runtimePath: string) {
  const parts = runtimePath.split("/");
  const fileName = parts.pop() || "source";
  return ["originals", ...parts, fileName.replace(/\.webp$/i, "")].join("/");
}

async function getAdmin() {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.app_metadata?.role === "admin" ? supabase : null;
}

export async function GET(request: Request) {
  const supabase = await getAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const section = searchParams.get("section");
  const eventId = searchParams.get("eventId");
  let query = supabase.from("media_assets").select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false });
  if (section && section in limits) query = query.eq("section", section);
  if (eventId) query = query.eq("event_id", eventId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: "Media library could not be loaded." }, { status: 500 });
  return NextResponse.json({ ok: true, data: data || [] });
}

export async function POST(request: Request) {
  const supabase = await getAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  const form = await request.formData();
  const file = form.get("file");
  const section = form.get("section");
  const altText = form.get("altText");
  const title = form.get("title");
  const category = form.get("category");
  const eventId = form.get("eventId");
  const caption = form.get("caption");
  const isFeatured = form.get("isFeatured");
  const isPublished = form.get("isPublished");
  const platform = (form.get("platform") || "website").toString();
  const contentType = (form.get("contentType") || "website_media").toString();
  const externalUrl = (form.get("externalUrl") || "").toString();
  const videoId = (form.get("videoId") || "").toString();
  const thumbnailUrl = (form.get("thumbnailUrl") || "").toString();
  const displayOrder = Number(form.get("displayOrder") || 0);
  const campaignName = (form.get("campaignName") || "").toString();
  const campaignSlug = (form.get("campaignSlug") || "").toString();
  const publishDate = (form.get("publishDate") || "").toString();
  const socialCaption = (form.get("socialCaption") || "").toString();
  const callToAction = (form.get("callToAction") || "").toString();
  const hashtags = (form.get("hashtags") || "").toString();
  const durationSeconds = Number(form.get("durationSeconds") || 0);
  const status = (form.get("status") || "draft").toString();
  const replaceId = (form.get("replaceId") || "").toString();
  const replaceSlot = form.get("replaceSlot") === "true";
  if (!(file instanceof File) || typeof section !== "string" || !(section in limits)) return NextResponse.json({ ok: false, error: "Choose a valid file and section." }, { status: 400 });
  if (!platforms.includes(platform as typeof platforms[number])) return NextResponse.json({ ok: false, error: "Choose a supported platform." }, { status: 400 });
  if (!contentTypes.includes(contentType as typeof contentTypes[number])) return NextResponse.json({ ok: false, error: "Choose a supported content type." }, { status: 400 });
  if (!["draft", "ready", "published", "archived"].includes(status)) return NextResponse.json({ ok: false, error: "Choose a supported publish status." }, { status: 400 });
  const allowed = [...imageTypes, ...videoTypes];
  const isVideo = file.type.startsWith("video/");
  const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
  if (!allowed.includes(file.type)) return NextResponse.json({ ok: false, error: isVideo ? "This video format isn't supported. Please choose another video." : "This image format isn't supported. Please choose a JPG, PNG or WebP image." }, { status: 400 });
  if (file.size > maxSize) return NextResponse.json({ ok: false, error: isVideo ? "This video is too large. Please choose a shorter video." : "This image is too large. Please choose an image under 10 MB." }, { status: 400 });
  const { count } = await supabase.from("media_assets").select("id", { count: "exact", head: true }).eq("section", section).eq("is_published", true);
  if (!replaceId && !replaceSlot && (count || 0) >= limits[section]) return NextResponse.json({ ok: false, error: `The ${section} media limit is ${limits[section]}. Delete or replace an existing asset first.` }, { status: 409 });
  let existing: { id: string; storage_path: string } | null = null;
  if (replaceId) {
    const { data } = await supabase.from("media_assets").select("id, storage_path").eq("id", replaceId).maybeSingle();
    if (!data) return NextResponse.json({ ok: false, error: "The media item to replace could not be found." }, { status: 404 });
    existing = data;
  } else if (replaceSlot) {
    const { data: slotRows } = await supabase.from("media_assets").select("id, storage_path").eq("section", section).eq("display_order", Number.isFinite(displayOrder) ? displayOrder : 0).eq("platform", "website").eq("is_published", true).order("created_at", { ascending: false }).limit(1);
    existing = slotRows?.[0] || null;
  }
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const imageUpload = imageTypes.includes(file.type);
  const runtimePath = imageUpload ? `${section}/${crypto.randomUUID()}-${safeName.replace(/\.[^.]+$/, "")}.webp` : `${section}/${crypto.randomUUID()}-${safeName}`;
  const originalPath = imageUpload ? originalPathFor(runtimePath) : null;
  const sourceBuffer = imageUpload ? Buffer.from(await file.arrayBuffer()) : null;
  const runtimeBuffer = imageUpload ? await sharp(sourceBuffer!).rotate().webp({ quality: 82 }).toBuffer() : null;
  const originalUpload = originalPath ? await supabase.storage.from("hotel-images").upload(originalPath, sourceBuffer!, { contentType: file.type, upsert: false }) : null;
  if (originalUpload?.error) return NextResponse.json({ ok: false, error: "The original image could not be stored. Please try again." }, { status: 500 });
  const upload = await supabase.storage.from("hotel-images").upload(runtimePath, runtimeBuffer || file, { contentType: imageUpload ? "image/webp" : file.type, upsert: false });
  if (upload.error) {
    if (originalPath) await supabase.storage.from("hotel-images").remove([originalPath]);
    return NextResponse.json({ ok: false, error: "The file could not be uploaded. Please try again." }, { status: 500 });
  }
  const { data: publicUrl } = supabase.storage.from("hotel-images").getPublicUrl(runtimePath);
  const payload = {
    section,
    title: typeof title === "string" ? title.slice(0, 120) : "",
    category: typeof category === "string" ? category.slice(0, 60) : "",
    platform,
    content_type: contentType,
    external_url: externalUrl.slice(0, 500),
    video_id: videoId.slice(0, 120),
    thumbnail_url: thumbnailUrl.slice(0, 500),
    event_id: typeof eventId === "string" && eventId.trim() ? eventId : null,
    campaign_name: campaignName.slice(0, 120),
    campaign_slug: campaignSlug.slice(0, 120),
    publish_date: publishDate || null,
    social_caption: socialCaption.slice(0, 280),
    call_to_action: callToAction.slice(0, 120),
    hashtags: hashtags.slice(0, 120),
    duration_seconds: Number.isFinite(durationSeconds) && durationSeconds > 0 ? durationSeconds : null,
    status,
    storage_path: runtimePath,
    public_url: publicUrl.publicUrl,
    media_type: isVideo ? "video" : "image",
    alt_text: typeof altText === "string" ? altText.slice(0, 160) : "",
    caption: typeof caption === "string" ? caption.slice(0, 300) : "",
    is_featured: isFeatured === "true",
    is_published: isPublished === "true" || status === "published",
    display_order: Number.isFinite(displayOrder) ? displayOrder : 0,
    file_size: file.size,
  };
  const recordQuery = existing
    ? supabase.from("media_assets").update(payload).eq("id", existing.id).select().single()
    : supabase.from("media_assets").insert(payload).select().single();
  const { data, error } = await recordQuery;
  if (error) {
    await supabase.storage.from("hotel-images").remove([runtimePath, ...(originalPath ? [originalPath] : [])]);
    return NextResponse.json({ ok: false, error: "Media metadata could not be saved." }, { status: 500 });
  }
  if (existing) {
    const oldPaths = [existing.storage_path, originalPathFor(existing.storage_path)];
    await supabase.storage.from("hotel-images").remove(oldPaths.filter((path) => path !== runtimePath));
  }
  if (section === "hero" && (replaceId || replaceSlot)) {
    const { error: settingsError } = await supabase.from("site_settings").upsert({ id: 1, hero_media_url: data.public_url });
    if (settingsError) return NextResponse.json({ ok: false, error: "The Homepage hero setting could not be updated." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data, optimized: imageUpload, replaced: Boolean(existing) }, { status: 201 });
}

export async function PATCH(request: Request) {
  const supabase = await getAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  const input = await request.json().catch(() => null) as { id?: string; title?: string; category?: string; event_id?: string | null; section?: string; caption?: string; alt_text?: string; is_featured?: boolean; is_published?: boolean; display_order?: number; platform?: string; content_type?: string; external_url?: string; video_id?: string; thumbnail_url?: string; campaign_name?: string; campaign_slug?: string; publish_date?: string | null; social_caption?: string; call_to_action?: string; hashtags?: string; duration_seconds?: number | null; status?: string } | null;
  if (!input?.id) return NextResponse.json({ ok: false, error: "Choose a media item." }, { status: 400 });
  const platform = input.platform && platforms.includes(input.platform as typeof platforms[number]) ? input.platform : "website";
  const contentType = input.content_type && contentTypes.includes(input.content_type as typeof contentTypes[number]) ? input.content_type : "website_media";
  const status = input.status && ["draft", "ready", "published", "archived"].includes(input.status) ? input.status : "draft";
  const payload: Record<string, unknown> = {
    title: input.title?.slice(0, 120) || "",
    category: input.category?.slice(0, 60) || "",
    platform,
    content_type: contentType,
    external_url: input.external_url?.slice(0, 500) || "",
    video_id: input.video_id?.slice(0, 120) || "",
    thumbnail_url: input.thumbnail_url?.slice(0, 500) || "",
    event_id: input.event_id || null,
    campaign_name: input.campaign_name?.slice(0, 120) || "",
    campaign_slug: input.campaign_slug?.slice(0, 120) || "",
    publish_date: input.publish_date || null,
    social_caption: input.social_caption?.slice(0, 280) || "",
    call_to_action: input.call_to_action?.slice(0, 120) || "",
    hashtags: input.hashtags?.slice(0, 120) || "",
    duration_seconds: typeof input.duration_seconds === "number" && input.duration_seconds > 0 ? input.duration_seconds : null,
    status,
    caption: input.caption?.slice(0, 300) || "",
    alt_text: input.alt_text?.slice(0, 160) || "",
    is_featured: Boolean(input.is_featured),
    is_published: Boolean(input.is_published),
    display_order: typeof input.display_order === "number" ? input.display_order : 0,
  };
  const { data, error } = await supabase.from("media_assets").update(payload).eq("id", input.id).select().single();
  if (error) return NextResponse.json({ ok: false, error: "Media metadata could not be updated." }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(request: Request) {
  const supabase = await getAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  const input = await request.json().catch(() => null) as { id?: unknown; path?: unknown } | null;
  if (typeof input?.id !== "string" || typeof input.path !== "string") return NextResponse.json({ ok: false, error: "Invalid media item." }, { status: 400 });
  const removed = await supabase.storage.from("hotel-images").remove([input.path]);
  if (removed.error) return NextResponse.json({ ok: false, error: "File could not be removed." }, { status: 500 });
  await supabase.storage.from("hotel-images").remove([originalPathFor(input.path)]);
  const { error } = await supabase.from("media_assets").delete().eq("id", input.id);
  if (error) return NextResponse.json({ ok: false, error: "Media record could not be removed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}