"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { getAttribution } from "@/lib/attribution";
import { trackEvent } from "@/lib/analytics";
import TrackedWhatsAppLink from "@/components/TrackedWhatsAppLink";
import type { Room } from "@/types";

function isApprovedPublicAsset(url?: string | null) {
  if (!url) return false;
  if (url.startsWith("/assets/visual-assets/") || url.startsWith("/media_stills/")) return false;
  return url.startsWith("/assets/");
}

type FormState = { checkIn: string; checkOut: string; guests: string; roomId: string; guestName: string; guestPhone: string; guestEmail: string; notes: string; eventId: string };
type BookingResult = { id: string; reference: string; check_in: string; check_out: string; guests: number; amount: number; status: string };
const initialForm: FormState = { checkIn: "", checkOut: "", guests: "2", roomId: "", guestName: "", guestPhone: "", guestEmail: "", notes: "", eventId: "" };

export default function Book() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsMessage, setRoomsMessage] = useState("Loading rooms...");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const checkedAvailability = useRef("");
  const availabilityRequest = useRef(0);

  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("event_id");
    if (eventId) update("eventId", eventId);

    const requestId = availabilityRequest.current;
    fetch("/api/rooms").then(async (response) => {
      const result = await response.json() as { ok: boolean; data?: Room[]; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error);
      if (availabilityRequest.current !== requestId) return;
      setRooms(result.data || []);
      setRoomsMessage(result.data?.length ? "" : "No rooms are published yet.");
    }).catch((error: unknown) => setRoomsMessage(error instanceof Error ? error.message : "Rooms could not be loaded."));
  }, []);

  useEffect(() => {
    if (!form.checkIn && !form.checkOut) return;
    const requestId = ++availabilityRequest.current;
    setRooms([]);
    setForm((current) => current.roomId ? { ...current, roomId: "" } : current);
    if (!form.checkIn || !form.checkOut || form.checkOut <= form.checkIn) {
      setAvailabilityLoading(false);
      return;
    }
    setAvailabilityLoading(true);
    setRoomsMessage("Checking availability...");
    fetch(`/api/availability?checkIn=${encodeURIComponent(form.checkIn)}&checkOut=${encodeURIComponent(form.checkOut)}`).then(async (response) => {
      const result = await response.json() as { ok: boolean; data?: Room[]; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error);
      if (availabilityRequest.current !== requestId) return;
      setRooms(result.data || []);
      setRoomsMessage(result.data?.length ? "" : "No rooms are available for those dates.");
      const availabilityKey = `${form.checkIn}:${form.checkOut}`;
      if (checkedAvailability.current !== availabilityKey) {
        checkedAvailability.current = availabilityKey;
        trackEvent("availability_checked", { page: window.location.pathname });
      }
    }).catch((error: unknown) => { if (availabilityRequest.current === requestId) setRoomsMessage(error instanceof Error ? error.message : "Availability could not be loaded."); }).finally(() => { if (availabilityRequest.current === requestId) setAvailabilityLoading(false); });
  }, [form.checkIn, form.checkOut]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    try {
      const params = new URLSearchParams(window.location.search);
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          attribution: {
            ...getAttribution(),
            source: form.eventId ? (params.get("event") || "Event page") : getAttribution().source,
            source_type: form.eventId ? "event" : getAttribution().source_type,
          },
        }),
      });

      const result = await response.json() as { ok: boolean; data?: BookingResult; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "We could not submit your request.");

      trackEvent("booking_request_submitted", { page: window.location.pathname });
      setBooking(result.data || null);
      setReference(result.data?.reference || result.data?.id.slice(0, 8).toUpperCase() || "1759");
      setState("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We could not submit your request.");
      setState("error");
    }
  }

  if (state === "success") {
    const selectedRoom = rooms.find((room) => room.id === form.roomId);
    const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";

    return <main className="bookingPage premiumBookingPage">
      <nav className="nav darkNav"><Link className="brand" href="/">1759 <span>EMPIRE</span></Link><div className="navActions"><Link className="textButton dark" href="/">Back home</Link><Link className="textButton dark" href="/admin/login">Staff Access</Link></div></nav>
      <div className="bookingExperience bookingSuccessExperience">
        <section className="bookingVisual">
          <div className="bookingVisualStack">
            <span className="bookingVisualLabel">1759 EMPIRE</span>
            <span className="bookingVisualLine" />
            <span className="bookingVisualInner">Direct Stay</span>
          </div>
        </section>
        <section className="bookingPanel bookingSuccessPanel">
          <div className="bookingWrap successWrap">
            <p className="eyebrow">REQUEST RECEIVED</p>
            <h1>Your stay is<br /><em>on our list.</em></h1>
            <div className="success">
              <h2>Reference {reference}</h2>
              <p>{selectedRoom?.name || "Room"} · {booking?.check_in || form.checkIn} to {booking?.check_out || form.checkOut} · {booking?.guests || form.guests} guests</p>
              <p>Estimated amount: ₦{(booking?.amount || 0).toLocaleString()}. Status: pending confirmation. Payment has not been taken.</p>
              {whatsapp ? <TrackedWhatsAppLink className="button" context="booking_success" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello 1759 Empire, my booking reference is ${reference}.`)}`}>WhatsApp 1759</TrackedWhatsAppLink> : <p className="muted">1759 will contact you to confirm the request.</p>}
            </div>
          </div>
        </section>
      </div>
    </main>;
  }

  return <main className="bookingPage premiumBookingPage">
    <nav className="nav darkNav"><Link className="brand" href="/">1759 <span>EMPIRE</span></Link><div className="navActions"><Link className="textButton dark" href="/">Back home</Link><Link className="textButton dark" href="/admin/login">Staff Access</Link></div></nav>
    <div className="bookingExperience">
      <section className="bookingVisual">
        <div className="bookingVisualStack">
          <span className="bookingVisualLabel">1759 EMPIRE</span>
          <span className="bookingVisualLine" />
          <span className="bookingVisualInner">AKUTE · LAGOS</span>
          <span className="bookingVisualTitle">The room is ready<br />before the night begins.</span>
          <div className="bookingVisualMeta"><span>Hotel calm</span><span>Food & drinks</span><span>Events</span></div>
        </div>
      </section>

      <section className="bookingPanel">
        <div className="bookingWrap">
          <div className="bookingTopbar">
            <span className="eyebrow">DIRECT BOOKING</span>
            <span className="bookingLocation">Akute · Lagos</span>
          </div>

          <div className="bookingCopy">
            <h1>Check availability.</h1>
            <p className="muted">Choose your dates and send a request. 1759 will confirm the room before any payment is discussed.</p>
          </div>

          <div className="bookingNote">
            <span>Direct stay enquiry</span>
            <span>Staff confirmation before payment</span>
          </div>

          {state === "error" && <div className="formError" role="alert">{message}</div>}

          <form onSubmit={submit} className="bookingForm">
            <label className="bookingField">
              <span>Check-in</span>
              <input required type="date" value={form.checkIn} min={new Date().toISOString().slice(0, 10)} onChange={(event) => update("checkIn", event.target.value)} />
            </label>
            <label className="bookingField">
              <span>Check-out</span>
              <input required type="date" value={form.checkOut} min={form.checkIn || new Date().toISOString().slice(0, 10)} onChange={(event) => update("checkOut", event.target.value)} />
            </label>
            <label className="bookingField">
              <span>Guests</span>
              <select value={form.guests} onChange={(event) => update("guests", event.target.value)}>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </label>
            <label className="bookingField">
              <span>Room</span>
              <select required disabled={availabilityLoading} value={form.roomId} onChange={(event) => update("roomId", event.target.value)}>
                <option value="">{roomsMessage || "Choose a room"}</option>
                {rooms.map((room) => <option key={room.id} value={room.id}>{room.name}{room.price_per_night > 0 ? ` - ₦${room.price_per_night.toLocaleString()}/night` : ""}</option>)}
              </select>
            </label>

            <label className="bookingField fullField">
              <span>Full name</span>
              <input required minLength={2} value={form.guestName} onChange={(event) => update("guestName", event.target.value)} />
            </label>
            <label className="bookingField">
              <span>Phone / WhatsApp</span>
              <input required value={form.guestPhone} onChange={(event) => update("guestPhone", event.target.value)} />
            </label>
            <label className="bookingField">
              <span>Email (optional)</span>
              <input type="email" value={form.guestEmail} onChange={(event) => update("guestEmail", event.target.value)} />
            </label>
            <label className="bookingField fullField">
              <span>Notes (optional)</span>
              <textarea rows={4} value={form.notes} onChange={(event) => update("notes", event.target.value)} />
            </label>

            <div className="bookingActions">
              <button className="button wide premiumBookingButton" type="submit" disabled={state === "loading" || availabilityLoading || rooms.length === 0}>{state === "loading" ? "Checking availability..." : "Request booking"}</button>
              <Link className="conciergeButton" href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2349013230224"}?text=${encodeURIComponent("Hello 1759 Empire, I need concierge help with my stay.")}`}><span>WhatsApp Concierge</span><small>Need help before you book? Chat with the 1759 team on WhatsApp.</small></Link>
            </div>
          </form>

          <section className="bookingResultStrip">
            {rooms.length > 0 ? <div className="bookingRoomsFound">
              <span className="roomsFoundLabel">Available rooms</span>
              <div className="bookingRoomsGrid">
                {rooms.map((room) => <article className="bookingRoomCard" key={room.id} aria-disabled={availabilityLoading} onClick={() => { if (!availabilityLoading) update("roomId", room.id); }}>
                  <div className="bookingRoomImage">{isApprovedPublicAsset(room.images?.[0]) ? <img src={room.images[0] as string} alt={room.name} /> : <div className="bookingRoomImageFallback"><span>1759</span><strong>{room.name}</strong><small>Room photography coming soon</small></div>}</div>
                  <div className="bookingRoomBody">
                    <div className="bookingRoomHeader">
                      <span className="bookingRoomName">{room.name}</span>
                      <span className="bookingRoomPrice">₦{Number(room.price_per_night || 0).toLocaleString()}<small>/night</small></span>
                    </div>
                    <p>{room.description}</p>
                    <div className="bookingRoomMeta">
                      <span>{room.amenities?.slice(0, 2).join(" · ")}</span>
                      <button className="roomSelectButton" type="button" disabled={availabilityLoading} onClick={(event) => { event.stopPropagation(); update("roomId", room.id); }}>Select</button>
                    </div>
                  </div>
                </article>)}
              </div>
            </div> : <div className="bookingNoRooms">{roomsMessage}</div>}
          </section>
        </div>
      </section>
    </div>
  </main>;
}
