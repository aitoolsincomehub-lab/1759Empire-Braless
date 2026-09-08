import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { ActionResponse, Booking, BookingStatus, PaymentStatus } from "@/types";

const statuses: BookingStatus[] = ["pending", "confirmed", "cancelled", "checked_in", "checked_out"];
const payments: PaymentStatus[] = ["unpaid", "partial", "paid", "refunded"];

export async function PATCH(request: Request) {
  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json<ActionResponse<never>>({ ok: false, error: "Supabase is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") return NextResponse.json<ActionResponse<never>>({ ok: false, error: "Not authorized." }, { status: 403 });
  const input = await request.json().catch(() => null) as { bookingId?: unknown; status?: unknown; paymentStatus?: unknown; notes?: unknown } | null;
  const bookingId = typeof input?.bookingId === "string" ? input.bookingId : "";
  const status = input?.status;
  const paymentStatus = input?.paymentStatus;
  if (!bookingId || typeof status !== "string" || !statuses.includes(status as BookingStatus) || (paymentStatus !== undefined && paymentStatus !== null && (typeof paymentStatus !== "string" || !payments.includes(paymentStatus as PaymentStatus)))) return NextResponse.json<ActionResponse<never>>({ ok: false, error: "Invalid booking update." }, { status: 400 });
  const { data, error } = await supabase.rpc("admin_update_booking_status", { p_booking_id: bookingId, p_status: status, p_payment_status: paymentStatus || null, p_notes: typeof input?.notes === "string" ? input.notes : null });
  if (error) return NextResponse.json<ActionResponse<never>>({ ok: false, error: "Booking could not be updated." }, { status: 500 });
  return NextResponse.json<ActionResponse<Booking>>({ ok: true, data: data as Booking });
}
