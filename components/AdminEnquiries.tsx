"use client";

import { useState } from "react";
import type { EnquiryStatus, EventReservation } from "@/types";
import TrackedWhatsAppLink from "@/components/TrackedWhatsAppLink";

export type EnquiryRow = EventReservation & { event?: { title: string } | null };
const statuses: EnquiryStatus[] = ["new", "contacted", "in_progress", "resolved", "cancelled"];

export default function AdminEnquiries({ initialEnquiries }: { initialEnquiries: EnquiryRow[] }) {
  const [items, setItems] = useState(initialEnquiries);
  const [message, setMessage] = useState("");
  async function update(id: string, status: EnquiryStatus) {
    try {
      const response = await fetch("/api/admin/event-enquiries", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enquiryId: id, status }) });
      const result = await response.json() as { ok: boolean; data?: EventReservation };
      if (!response.ok || !result.ok) setMessage("We couldn't update that enquiry. Please try again.");
      else if (result.data) setItems((current) => current.map((item) => item.id === id ? { ...item, ...result.data } : item));
    } catch {
      setMessage("We couldn't update that enquiry. Please try again.");
    }
  }
  return <div className="adminPanel"><div className="panelHeading"><h2>Event enquiries</h2><span>{items.length} shown</span></div>{message && <p className="formError" role="alert">{message}</p>}{items.length === 0 ? <p className="muted">No event enquiries yet.</p> : <div className="bookingTable">{items.map((item) => <div className="bookingRow" key={item.id}><div><strong>{item.guest_name}</strong><span>{item.event?.title || "Event"} · {item.reservation_type} · {item.people} people</span><span>{item.phone}{item.email ? ` · ${item.email}` : ""}</span><span>{item.message || "No message"} · {item.source}</span></div><label>Status<select value={item.status} onChange={(event) => update(item.id, event.target.value as EnquiryStatus)}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><TrackedWhatsAppLink className="textButton dark" context="admin_event_enquiry" href={`https://wa.me/${item.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${item.guest_name}, this is 1759 Empire regarding your ${item.reservation_type} enquiry for ${item.event?.title || "our event"}.` )}`}>WhatsApp</TrackedWhatsAppLink></div>)}</div>}</div>;
}
