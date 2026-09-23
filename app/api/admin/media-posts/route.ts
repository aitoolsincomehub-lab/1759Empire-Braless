import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

async function getAdmin() {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.app_metadata?.role === "admin" ? supabase : null;
}

const placements = ["featured", "weekly"];

export async function GET() {
  const supabase = await getAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  const { data, error } = await supabase.from("media_posts").select("*").order("event_date", { ascending: true }).order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ ok: false, error: "Posts could not be loaded." }, { status: 500 });
  return NextResponse.json({ ok: true, data: data || [] });
}

export async function POST(request: Request) {
  const supabase = await getAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const title = typeof input?.title === "string" ? input.title.trim().slice(0, 160) : "";
  const eventName = typeof input?.event_name === "string" ? input.event_name.trim().slice(0, 160) : "";
  const eventDate = typeof input?.event_date === "string" ? input.event_date : "";
  const placement = typeof input?.placement === "string" ? input.placement : "";
  if (!title || !eventName || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || !placements.includes(placement)) return NextResponse.json({ ok: false, error: "Title, event name, date and placement are required." }, { status: 400 });
  const payload = {
    title, event_name: eventName, event_date: eventDate, placement,
    flyer_media_id: typeof input?.flyer_media_id === "string" ? input.flyer_media_id : null,
    foreground_video_media_id: typeof input?.foreground_video_media_id === "string" ? input.foreground_video_media_id : null,
    background_video_media_id: typeof input?.background_video_media_id === "string" ? input.background_video_media_id : null,
    description: typeof input?.description === "string" ? input.description.slice(0, 500) : "",
    cta_label: typeof input?.cta_label === "string" ? input.cta_label.slice(0, 80) : "",
    cta_url: typeof input?.cta_url === "string" ? input.cta_url.slice(0, 500) : "",
    published: Boolean(input?.published), sort_order: typeof input?.sort_order === "number" ? input.sort_order : 0,
  };
  const { data, error } = await supabase.from("media_posts").insert(payload).select().single();
  if (error) return NextResponse.json({ ok: false, error: "Post could not be saved. Run supabase.media-posts.sql first." }, { status: 500 });
  return NextResponse.json({ ok: true, data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const supabase = await getAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (typeof input?.id !== "string") return NextResponse.json({ ok: false, error: "Choose a post." }, { status: 400 });
  const allowed = ["title", "event_name", "event_date", "placement", "flyer_media_id", "foreground_video_media_id", "background_video_media_id", "description", "cta_label", "cta_url", "published", "sort_order"];
  const payload = Object.fromEntries(Object.entries(input).filter(([key]) => allowed.includes(key)));
  const { data, error } = await supabase.from("media_posts").update(payload).eq("id", input.id).select().single();
  if (error) return NextResponse.json({ ok: false, error: "Post could not be updated." }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(request: Request) {
  const supabase = await getAdmin();
  if (!supabase) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  const input = await request.json().catch(() => null) as { id?: unknown } | null;
  if (typeof input?.id !== "string") return NextResponse.json({ ok: false, error: "Choose a post." }, { status: 400 });
  const { error } = await supabase.from("media_posts").delete().eq("id", input.id);
  if (error) return NextResponse.json({ ok: false, error: "Post could not be deleted." }, { status: 500 });
  return NextResponse.json({ ok: true });
}