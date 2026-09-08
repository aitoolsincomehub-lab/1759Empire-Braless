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

export async function POST(request: Request) {
  const supabase = await getAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  const form = await request.formData();
  const file = form.get("file");
  const section = form.get("section");
  const altText = form.get("altText");
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
  const { data, error } = await supabase.from("media_assets").insert({ section, storage_path: path, public_url: publicUrl.publicUrl, media_type: videoTypes.includes(file.type) ? "video" : "image", alt_text: typeof altText === "string" ? altText.slice(0, 160) : "", file_size: file.size }).select().single();
  if (error) { await supabase.storage.from("hotel-images").remove([path]); return NextResponse.json({ ok: false, error: "Media metadata could not be saved." }, { status: 500 }); }
  return NextResponse.json({ ok: true, data }, { status: 201 });
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