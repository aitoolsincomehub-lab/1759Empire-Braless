import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

const limits: Record<string, number> = { hero: 1, rooms: 8, club: 12, events: 6, food: 12, gallery: 12, venue: 12 };
const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const videoTypes = ["video/mp4", "video/webm", "video/quicktime"];

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
  if (!(file instanceof File) || typeof section !== "string" || !(section in limits)) return NextResponse.json({ ok: false, error: "Choose a valid file and section." }, { status: 400 });
  const allowed = [...imageTypes, ...videoTypes];
  const maxSize = videoTypes.includes(file.type) ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
  if (!allowed.includes(file.type) || file.size > maxSize) return NextResponse.json({ ok: false, error: videoTypes.includes(file.type) ? "Use MP4/WebM/MOV video under 100 MB." : "Use JPG, PNG, or WebP images under 10 MB." }, { status: 400 });
  const { count } = await supabase.from("media_assets").select("id", { count: "exact", head: true }).eq("section", section).eq("is_published", true);
  if ((count || 0) >= limits[section]) return NextResponse.json({ ok: false, error: `The ${section} media limit is ${limits[section]}. Delete or replace an existing asset first.` }, { status: 409 });
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  const path = `${section}/${crypto.randomUUID()}-${safeName}`;
  const upload = await supabase.storage.from("hotel-images").upload(path, file, { contentType: file.type, upsert: false });
  if (upload.error) return NextResponse.json({ ok: false, error: "The file could not be uploaded. Please try again." }, { status: 500 });
  const { data: publicUrl } = supabase.storage.from("hotel-images").getPublicUrl(path);
  const { data, error } = await supabase.from("media_assets").insert({ section, title: typeof title === "string" ? title.slice(0, 120) : "", category: typeof category === "string" ? category.slice(0, 60) : "", event_id: typeof eventId === "string" && eventId.trim() ? eventId : null, storage_path: path, public_url: publicUrl.publicUrl, media_type: videoTypes.includes(file.type) ? "video" : "image", alt_text: typeof altText === "string" ? altText.slice(0, 160) : "", caption: typeof caption === "string" ? caption.slice(0, 300) : "", is_featured: isFeatured === "true", is_published: isPublished !== "false", display_order: 0, file_size: file.size }).select().single();
  if (error) { await supabase.storage.from("hotel-images").remove([path]); return NextResponse.json({ ok: false, error: "Media metadata could not be saved." }, { status: 500 }); }
  return NextResponse.json({ ok: true, data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const supabase = await getAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  const input = await request.json().catch(() => null) as { id?: string; title?: string; category?: string; event_id?: string | null; section?: string; caption?: string; alt_text?: string; is_featured?: boolean; is_published?: boolean; display_order?: number } | null;
  if (!input?.id) return NextResponse.json({ ok: false, error: "Choose a media item." }, { status: 400 });
  const payload: Record<string, unknown> = { title: input.title?.slice(0, 120) || "", category: input.category?.slice(0, 60) || "", event_id: input.event_id || null, caption: input.caption?.slice(0, 300) || "", alt_text: input.alt_text?.slice(0, 160) || "", is_featured: Boolean(input.is_featured), is_published: Boolean(input.is_published), display_order: typeof input.display_order === "number" ? input.display_order : 0 };
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
  const { error } = await supabase.from("media_assets").delete().eq("id", input.id);
  if (error) return NextResponse.json({ ok: false, error: "Media record could not be removed." }, { status: 500 });
  return NextResponse.json({ ok: true });
}