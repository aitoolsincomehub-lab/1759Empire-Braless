import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Room } from "@/types";

export async function GET() {
  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json({ ok: false, error: "Please contact 1759 directly to confirm room availability." }, { status: 503 });
  const { data, error } = await supabase.from("rooms").select("*").eq("is_active", true).order("created_at");
  if (error) return NextResponse.json({ ok: false, error: "Rooms could not be loaded." }, { status: 500 });
  return NextResponse.json({ ok: true, data: (data || []) as Room[] });
}
