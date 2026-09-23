import { NextResponse } from "next/server";
import { sendBookingNotificationEmails } from "@/lib/email";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { ActionResponse, Booking, BookingRequest, SourceType } from "@/types";

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
  if (!Number.isInteger(guests) || guests < 1 || guests > 2) errors.guests = "Guests must be between 1 and 2.";
  if (guestName.length < 2 || guestName.length > 100) errors.guestName = "Enter the guest's full name.";
  if (!/^[+\d][\d\s().-]{6,24}$/.test(guestPhone)) errors.guestPhone = "Enter a valid phone number.";
  if (guestEmail && !/^\S+@\S+\.\S+$/.test(guestEmail)) errors.guestEmail = "Enter a valid email address.";
  if (Object.keys(errors).length) return { errors };
  const sourceType: SourceType = ["website", "event", "whatsapp", "social", "referral", "direct"].includes(String(attribution.source_type)) ? String(attribution.source_type) as SourceType : "website";
  return { value: { roomId, checkIn: checkIn as string, checkOut: checkOut as string, guests, guestName, guestPhone, guestEmail, eventId, notes: typeof input.notes === "string" ? input.notes.trim().slice(0, 500) : undefined, attribution: { source: typeof attribution.source === "string" ? attribution.source.slice(0, 80) : "Website", source_type: sourceType, utm_source: typeof attribution.utm_source === "string" ? attribution.utm_source.slice(0, 100) : undefined, utm_medium: typeof attribution.utm_medium === "string" ? attribution.utm_medium.slice(0, 100) : undefined, utm_campaign: typeof attribution.utm_campaign === "string" ? attribution.utm_campaign.slice(0, 150) : undefined, utm_content: typeof attribution.utm_content === "string" ? attribution.utm_content.slice(0, 150) : undefined } } };
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
    const errorMessage = error.message;
    const unavailable = errorMessage.includes("ROOM_UNAVAILABLE");
    const inactive = errorMessage.includes("ROOM_INACTIVE");
    const notFound = errorMessage.includes("ROOM_NOT_FOUND");
    const invalidDates = errorMessage.includes("INVALID_DATES");
    const invalidGuests = errorMessage.includes("bookings_guests_check");
    const message = unavailable ? "That room is no longer available for those dates." : inactive ? "That room is not currently available for booking." : notFound ? "That room could not be found. Please choose another room." : invalidDates ? "Choose a valid check-in and check-out date." : invalidGuests ? "Guests must be between 1 and 2." : "We could not submit the request. Please try again or contact 1759.";
    const status = unavailable || inactive ? 409 : notFound ? 404 : invalidDates || invalidGuests ? 400 : 500;
    return NextResponse.json<ActionResponse<never>>({ ok: false, error: message }, { status });
  }

  const booking = data as Booking | null;
  if (booking) {
    try {
      const { data: room } = await supabase.from("rooms").select("name").eq("id", booking.room_id || parsed.value!.roomId).maybeSingle();
      await sendBookingNotificationEmails({
        bookingReference: booking.reference || booking.id,
        roomName: room?.name || "1759 Empire room",
        checkIn: booking.check_in || parsed.value!.checkIn,
        checkOut: booking.check_out || parsed.value!.checkOut,
        guests: booking.guests || parsed.value!.guests,
        amount: Number(booking.amount || 0),
        status: booking.status || "pending",
        source: booking.source || parsed.value!.attribution?.source || "Website",
        guestEmail: booking.guest_email ?? parsed.value!.guestEmail ?? null,
      });
    } catch (emailError) {
      console.error("booking email notification failed", emailError);
    }
  }

  return NextResponse.json<ActionResponse<Booking>>({ ok: true, data: booking || (data as Booking) }, { status: 201 });
}
