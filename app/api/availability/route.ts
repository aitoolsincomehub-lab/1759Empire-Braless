import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Room } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  if (!checkIn || !checkOut || !/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut) || checkOut <= checkIn) {
    return NextResponse.json({ ok: false, error: "Choose a valid date range." }, { status: 400 });
  }
  if (checkIn < new Date().toISOString().slice(0, 10)) {
    return NextResponse.json({ ok: false, error: "Check-in cannot be in the past." }, { status: 400 });
  }
  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json({ ok: false, error: "Please contact 1759 directly to confirm availability." }, { status: 503 });
  const { data, error } = await supabase.rpc("get_available_rooms", { p_check_in: checkIn, p_check_out: checkOut });
  if (error) return NextResponse.json({ ok: false, error: "Availability could not be loaded." }, { status: 500 });
  return NextResponse.json({ ok: true, data: (data || []) as Room[] });
}
