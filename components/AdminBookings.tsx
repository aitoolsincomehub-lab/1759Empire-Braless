"use client";

import { useState } from "react";
import type { Booking, BookingStatus, PaymentStatus } from "@/types";

export type BookingRow = Booking & { room?: { name: string } | null };
const statusOptions: BookingStatus[] = ["pending", "confirmed", "cancelled", "checked_in", "checked_out"];
const paymentOptions: PaymentStatus[] = ["unpaid", "partial", "paid", "refunded"];

export default function AdminBookings({ initialBookings }: { initialBookings: BookingRow[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  async function update(id: string, status: string, paymentStatus: string) {
    setSaving(id); setMessage("");
    try {
      const response = await fetch("/api/admin/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId: id, status, paymentStatus }) });
      const result = await response.json() as { ok: boolean; data?: Booking };
      if (!response.ok || !result.ok) setMessage("We couldn't update that booking. Please try again.");
      else if (result.data) setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, ...result.data } : booking));
    } catch {
      setMessage("We couldn't update that booking. Please try again.");
    } finally {
      setSaving(null);
    }
  }
  return <div className="adminPanel"><div className="panelHeading"><h2>Recent bookings</h2><span>{bookings.length} shown</span></div>{message && <p className="formError" role="alert">{message}</p>}{bookings.length === 0 ? <p className="muted">No booking requests yet.</p> : <div className="bookingTable">{bookings.map((booking) => <div className="bookingRow" key={booking.id}><div><strong>{booking.guest_name}</strong><span>Reference {booking.reference} · {booking.room?.name || "Room"}</span><span>{booking.check_in} to {booking.check_out} · {booking.guests} guests</span><span>{booking.guest_phone}{booking.guest_email ? ` · ${booking.guest_email}` : ""}</span><span>{booking.source}{booking.event_id ? " · event context" : ""}</span></div><label>Status<select value={booking.status} disabled={saving === booking.id} onChange={(event) => update(booking.id, event.target.value, booking.payment_status)}>{statusOptions.map((option) => <option key={option} value={option}>{option.replace("_", " ")}</option>)}</select></label><label>Payment<select value={booking.payment_status} disabled={saving === booking.id} onChange={(event) => update(booking.id, booking.status, event.target.value)}>{paymentOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label></div>)}</div>}</div>;
}
