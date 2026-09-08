import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function PATCH(request: Request) {
  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== "admin") return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!input) return NextResponse.json({ ok: false, error: "Invalid settings." }, { status: 400 });
  delete input.id;
  const { data, error } = await supabase.from("site_settings").upsert({ id: 1, ...input }).select().single();
  if (error) return NextResponse.json({ ok: false, error: "Settings could not be saved." }, { status: 400 });
  return NextResponse.json({ ok: true, data });
}