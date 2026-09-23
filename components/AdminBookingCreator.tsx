"use client";

import { useState } from "react";
import type { Room } from "@/types";

export default function AdminBookingCreator({ rooms }: { rooms: Room[] }) {
  const [form, setForm] = useState({ roomId: "", checkIn: "", checkOut: "", guests: "1", guestName: "", guestPhone: "", guestEmail: "", notes: "" });
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setSaved("");
    const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, attribution: { source: "Admin desk", source_type: "direct" } }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) { setMessage(result.error || "Booking could not be created."); return; }
    setSaved(`Booking ${result.data?.reference || "request"} created with pending status.`);
    setForm({ roomId: "", checkIn: "", checkOut: "", guests: "1", guestName: "", guestPhone: "", guestEmail: "", notes: "" });
  }

  return <form className="adminBookingCreator" onSubmit={submit}><div className="adminFormHeader"><div><span className="adminEyebrow">ROOMS & BOOKINGS</span><h2>Create booking request</h2></div></div>{message && <p className="formError" role="alert">{message}</p>}{saved && <p className="adminFormMessage">{saved}</p>}<div className="inventoryFormGrid"><label className="adminFieldFull">Room<select required value={form.roomId} onChange={(event) => setForm({ ...form, roomId: event.target.value })}><option value="">Choose a room</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label><label className="adminField">Check-in<input required type="date" value={form.checkIn} onChange={(event) => setForm({ ...form, checkIn: event.target.value })} /></label><label className="adminField">Check-out<input required type="date" value={form.checkOut} onChange={(event) => setForm({ ...form, checkOut: event.target.value })} /></label><label className="adminField">Guests<input required type="number" min="1" max="2" value={form.guests} onChange={(event) => setForm({ ...form, guests: event.target.value })} /></label><label className="adminField">Guest name<input required value={form.guestName} onChange={(event) => setForm({ ...form, guestName: event.target.value })} /></label><label className="adminField">Phone<input required value={form.guestPhone} onChange={(event) => setForm({ ...form, guestPhone: event.target.value })} /></label><label className="adminField">Email<input type="email" value={form.guestEmail} onChange={(event) => setForm({ ...form, guestEmail: event.target.value })} /></label><label className="adminFieldFull">Notes<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label></div><button className="adminPrimaryButton" type="submit">Create booking request</button></form>;
}