"use client";

import TrackedWhatsAppLink from "@/components/TrackedWhatsAppLink";
import type { GeneralEnquiry } from "@/types";

export default function AdminRoomEnquiries({ items }: { items: GeneralEnquiry[] }) {
  return <section className="adminPanel"><div className="panelHeading"><h2>Room and stay enquiries</h2><span>{items.length} shown</span></div>{items.length === 0 ? <p className="muted">No room enquiries yet.</p> : <div className="bookingTable">{items.map((item) => <div className="bookingRow" key={item.id}><div><strong>{item.name}</strong><span>{item.phone}{item.email ? ` · ${item.email}` : ""}</span><span>{item.message}</span><span>{item.source}{item.source_type ? ` · ${item.source_type}` : ""}{item.utm_source ? ` · ${item.utm_source}` : ""}{item.utm_campaign ? ` · ${item.utm_campaign}` : ""}</span><span>{new Date(item.created_at).toLocaleString("en-NG")}</span></div><TrackedWhatsAppLink className="textButton dark" context="admin_room_enquiry" href={`https://wa.me/${item.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${item.name}, this is 1759 Empire regarding your room enquiry.`)}`}>WhatsApp</TrackedWhatsAppLink></div>)}</div>}</section>;
}