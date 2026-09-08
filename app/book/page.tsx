"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getAttribution } from "@/lib/attribution";
import { trackEvent } from "@/lib/analytics";
import TrackedWhatsAppLink from "@/components/TrackedWhatsAppLink";

type FormState = { checkIn: string; checkOut: string; guests: string; roomId: string; guestName: string; guestPhone: string; guestEmail: string; notes: string; eventId: string };
type RoomOption = { id: string; name: string; price_per_night: number };
type BookingResult = { id: string; reference: string; check_in: string; check_out: string; guests: number; amount: number; status: string };
const initialForm: FormState = { checkIn: "", checkOut: "", guests: "2", roomId: "", guestName: "", guestPhone: "", guestEmail: "", notes: "", eventId: "" };

export default function Book() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [roomsMessage, setRoomsMessage] = useState("Loading rooms...");
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  useEffect(() => { const params = new URLSearchParams(window.location.search); const eventId = params.get("event_id"); if (eventId) update("eventId", eventId); fetch("/api/rooms").then(async (response) => { const result = await response.json() as { ok: boolean; data?: RoomOption[]; error?: string }; if (!response.ok || !result.ok) throw new Error(result.error); setRooms(result.data || []); setRoomsMessage(result.data?.length ? "" : "No rooms are published yet."); }).catch((error: unknown) => setRoomsMessage(error instanceof Error ? error.message : "Rooms could not be loaded.")); }, []);
  useEffect(() => { if (!form.checkIn || !form.checkOut || form.checkOut <= form.checkIn) return; setRoomsMessage("Checking availability..."); fetch(`/api/availability?checkIn=${encodeURIComponent(form.checkIn)}&checkOut=${encodeURIComponent(form.checkOut)}`).then(async (response) => { const result = await response.json() as { ok: boolean; data?: RoomOption[]; error?: string }; if (!response.ok || !result.ok) throw new Error(result.error); setRooms(result.data || []); setRoomsMessage(result.data?.length ? "" : "No rooms are available for those dates."); }).catch((error: unknown) => setRoomsMessage(error instanceof Error ? error.message : "Availability could not be loaded.")); }, [form.checkIn, form.checkOut]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    try {
      const params = new URLSearchParams(window.location.search);
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, attribution: { ...getAttribution(), source: form.eventId ? (params.get("event") || "Event page") : getAttribution().source, source_type: form.eventId ? "event" : getAttribution().source_type } }) });
      const result = await response.json() as { ok: boolean; data?: BookingResult; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "We could not submit your request.");
      trackEvent("booking_request_submitted", { page: window.location.pathname }); setBooking(result.data || null);
      setReference(result.data?.reference || result.data?.id.slice(0, 8).toUpperCase() || "1759");
      setState("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not submit your request.");
      setState("error");
    }
  }

  if (state === "success") { const selectedRoom = rooms.find((room) => room.id === form.roomId); const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""; return <main className="bookingPage"><nav className="nav darkNav"><Link className="brand" href="/">1759 <span>EMPIRE</span></Link><Link className="textButton dark" href="/">Back home</Link></nav><div className="bookingWrap"><p className="eyebrow">REQUEST RECEIVED</p><h1>Your stay is<br /><em>on our list.</em></h1><div className="success"><h2>Reference {reference}</h2><p>{selectedRoom?.name || "Room"} · {booking?.check_in || form.checkIn} to {booking?.check_out || form.checkOut} · {booking?.guests || form.guests} guests</p><p>Estimated amount: ₦{(booking?.amount || 0).toLocaleString()}. Status: pending confirmation. Payment has not been taken.</p>{whatsapp ? <TrackedWhatsAppLink className="button" context="booking_success" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello 1759 Empire, my booking reference is ${reference}.` )}`}>WhatsApp 1759</TrackedWhatsAppLink> : <p className="muted">1759 will contact you to confirm the request.</p>}</div></div></main>; }

  return <main className="bookingPage"><nav className="nav darkNav"><Link className="brand" href="/">1759 <span>EMPIRE</span></Link><Link className="textButton dark" href="/">Back home</Link></nav><div className="bookingWrap"><p className="eyebrow">DIRECT BOOKING</p><h1>Check availability.</h1><p className="muted">Choose your dates and send a request. 1759 will confirm the room before any payment is discussed.</p>{state === "error" && <div className="formError" role="alert">{message}</div>}<form onSubmit={submit} className="bookingForm"><label>Check-in<input required type="date" value={form.checkIn} min={new Date().toISOString().slice(0, 10)} onChange={(event) => update("checkIn", event.target.value)} /></label><label>Check-out<input required type="date" value={form.checkOut} min={form.checkIn || new Date().toISOString().slice(0, 10)} onChange={(event) => update("checkOut", event.target.value)} /></label><label>Guests<select value={form.guests} onChange={(event) => update("guests", event.target.value)}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label><label>Room<select required value={form.roomId} onChange={(event) => update("roomId", event.target.value)}><option value="">{roomsMessage || "Choose a room"}</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}{room.price_per_night > 0 ? ` - ₦${room.price_per_night.toLocaleString()}/night` : ""}</option>)}</select></label><label>Full name<input required minLength={2} value={form.guestName} onChange={(event) => update("guestName", event.target.value)} /></label><label>Phone / WhatsApp<input required value={form.guestPhone} onChange={(event) => update("guestPhone", event.target.value)} /></label><label>Email (optional)<input type="email" value={form.guestEmail} onChange={(event) => update("guestEmail", event.target.value)} /></label><label className="fullField">Notes (optional)<textarea rows={4} value={form.notes} onChange={(event) => update("notes", event.target.value)} /></label><button className="button wide" type="submit" disabled={state === "loading" || rooms.length === 0}>{state === "loading" ? "Checking availability..." : "Request booking"}</button></form></div></main>;
}