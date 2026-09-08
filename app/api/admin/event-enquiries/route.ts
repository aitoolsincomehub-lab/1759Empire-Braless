import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { ActionResponse, EnquiryStatus, EventReservation } from "@/types";

const statuses: EnquiryStatus[] = ["new", "contacted", "confirmed", "cancelled", "closed"];
export async function PATCH(request: Request) {
  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json<ActionResponse<never>>({ ok: false, error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  const input = await request.json().catch(() => null) as { enquiryId?: unknown; status?: unknown } | null;
  if (user?.app_metadata?.role !== "admin") return NextResponse.json<ActionResponse<never>>({ ok: false, error: "Not authorized." }, { status: 403 });
  if (typeof input?.enquiryId !== "string" || typeof input.status !== "string" || !statuses.includes(input.status as EnquiryStatus)) return NextResponse.json<ActionResponse<never>>({ ok: false, error: "Invalid enquiry update." }, { status: 400 });
  const { data, error } = await supabase.rpc("admin_update_event_enquiry", { p_enquiry_id: input.enquiryId, p_status: input.status });
  if (error) return NextResponse.json<ActionResponse<never>>({ ok: false, error: "Enquiry could not be updated." }, { status: 500 });
  return NextResponse.json<ActionResponse<EventReservation>>({ ok: true, data: data as EventReservation });
}
