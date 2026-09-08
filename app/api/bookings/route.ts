import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { ActionResponse, Booking, BookingRequest } from "@/types";

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function validate(payload: unknown): { value?: BookingRequest; errors?: Record<string, string> } {
  if (!payload || typeof payload !== "object") return { errors: { form: "Enter valid booking details." } };
  const input = payload as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const roomId = typeof input.roomId === "string" ? input.roomId.trim() : "";
  const guestName = typeof input.guestName === "string" ? input.guestName.trim() : "";
  const guestPhone = typeof input.guestPhone === "string" ? input.guestPhone.trim() : "";
  const guestEmail = typeof input.guestEmail === "string" ? input.guestEmail.trim() : undefined;
  const eventId = typeof input.eventId === "string" ? input.eventId.trim() : undefined;
  const attribution = input.attribution && typeof input.attribution === "object" ? input.attribution as Record<string, unknown> : {};
  const checkIn = input.checkIn;
  const checkOut = input.checkOut;
  const guests = Number(input.guests);
  if (!roomId) errors.roomId = "Choose a room.";
  if (!isIsoDate(checkIn)) errors.checkIn = "Choose a valid check-in date.";
  if (!isIsoDate(checkOut)) errors.checkOut = "Choose a valid check-out date.";
  if (isIsoDate(checkIn) && isIsoDate(checkOut) && checkOut <= checkIn) errors.checkOut = "Check-out must be after check-in.";
  if (isIsoDate(checkIn) && checkIn < new Date().toISOString().slice(0, 10)) errors.checkIn = "Check-in cannot be in the past.";
  if (!Number.isInteger(guests) || guests < 1 || guests > 20) errors.guests = "Guests must be between 1 and 20.";
  if (guestName.length < 2 || guestName.length > 100) errors.guestName = "Enter the guest's full name.";
  if (!/^[+\d][\d\s().-]{6,24}$/.test(guestPhone)) errors.guestPhone = "Enter a valid phone number.";
  if (guestEmail && !/^\S+@\S+\.\S+$/.test(guestEmail)) errors.guestEmail = "Enter a valid email address.";
  if (Object.keys(errors).length) return { errors };
  return { value: { roomId, checkIn: checkIn as string, checkOut: checkOut as string, guests, guestName, guestPhone, guestEmail, eventId, notes: typeof input.notes === "string" ? input.notes.trim().slice(0, 500) : undefined, attribution: { source: typeof attribution.source === "string" ? attribution.source.slice(0, 80) : "Website", source_type: attribution.source_type === "event" ? "event" : "website", utm_source: typeof attribution.utm_source === "string" ? attribution.utm_source.slice(0, 100) : undefined, utm_medium: typeof attribution.utm_medium === "string" ? attribution.utm_medium.slice(0, 100) : undefined, utm_campaign: typeof attribution.utm_campaign === "string" ? attribution.utm_campaign.slice(0, 150) : undefined, utm_content: typeof attribution.utm_content === "string" ? attribution.utm_content.slice(0, 150) : undefined } } };
}

export async function POST(request: Request) {
  const parsed = validate(await request.json().catch(() => null));
  if (parsed.errors) return NextResponse.json<ActionResponse<never>>({ ok: false, fieldErrors: parsed.errors, error: "Please review the booking details." }, { status: 400 });
  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json<ActionResponse<never>>({ ok: false, error: "Please contact 1759 directly to confirm the booking request." }, { status: 503 });

  const { data, error } = await supabase.rpc("create_booking_request_with_attribution", {
    p_room_id: parsed.value!.roomId,
    p_guest_name: parsed.value!.guestName,
    p_guest_phone: parsed.value!.guestPhone,
    p_guest_email: parsed.value!.guestEmail ?? null,
    p_guests: parsed.value!.guests,
    p_check_in: parsed.value!.checkIn,
    p_check_out: parsed.value!.checkOut,
    p_notes: parsed.value!.notes ?? "",
    p_source: parsed.value!.attribution?.source || "Website",
    p_source_type: parsed.value!.attribution?.source_type || "website",
    p_event_id: parsed.value!.eventId || null,
    p_utm_source: parsed.value!.attribution?.utm_source || null,
    p_utm_medium: parsed.value!.attribution?.utm_medium || null,
    p_utm_campaign: parsed.value!.attribution?.utm_campaign || null,
    p_utm_content: parsed.value!.attribution?.utm_content || null,
  });
  if (error) {
    const message = error.message.includes("ROOM_UNAVAILABLE") ? "That room is no longer available for those dates." : "We could not submit the request. Please try again or contact 1759.";
    return NextResponse.json<ActionResponse<never>>({ ok: false, error: message }, { status: error.message.includes("ROOM_UNAVAILABLE") ? 409 : 500 });
  }
  return NextResponse.json<ActionResponse<Booking>>({ ok: true, data: data as Booking }, { status: 201 });
}
