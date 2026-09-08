"use client";

import { FormEvent, useState } from "react";
import type { EventEnquiryRequest } from "@/types";
import { getAttribution } from "@/lib/attribution";
import { trackEvent } from "@/lib/analytics";
import TrackedWhatsAppLink from "@/components/TrackedWhatsAppLink";

export default function EventEnquiryForm({ eventId, eventTitle, whatsapp }: { eventId: string; eventTitle: string; whatsapp: string }) {
  const [form, setForm] = useState({ guestName: "", phone: "", email: "", people: "2", enquiryType: "table", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  function update(key: string, value: string) { setForm((current) => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("loading"); setMessage("");
    const attribution = getAttribution();
    const payload: EventEnquiryRequest = { ...form, eventId, people: Number(form.people), enquiryType: form.enquiryType as EventEnquiryRequest["enquiryType"], ...attribution, source: eventTitle, source_type: "event" };
    try {
      const response = await fetch("/api/event-enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { ok: boolean };
      if (!response.ok || !result.ok) { setMessage("We couldn't send your enquiry. Please try again or contact 1759 directly."); setState("error"); return; }
      trackEvent("event_enquiry_submitted", { event_context: eventTitle, page: window.location.pathname }); setState("success");
    } catch {
      setMessage("We couldn't send your enquiry. Please try again or contact 1759 directly.");
      setState("error");
    }
  }
  const whatsappUrl = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello 1759 Empire, I'd like to enquire about ${eventTitle}. My name is ${form.guestName || ""}.` )}` : "";
  if (state === "success") return <div className="success"><h2>Enquiry received.</h2><p>Our team will contact you about {eventTitle}.</p>{whatsappUrl && <TrackedWhatsAppLink className="button" context="event_enquiry_success" href={whatsappUrl}>WhatsApp 1759</TrackedWhatsAppLink>}</div>;
  return <div id="enquiry" className="enquiryPanel"><div className="panelHeading"><h2>Reserve your night</h2><span>Table & event enquiries</span></div>{state === "error" && <p className="formError" role="alert">{message}</p>}<form className="enquiryForm" onSubmit={submit}><label>Name<input required minLength={2} value={form.guestName} onChange={(event) => update("guestName", event.target.value)} /></label><label>Phone / WhatsApp<input required value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label><label>Email (optional)<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label><label>People<input required type="number" min="1" max="100" value={form.people} onChange={(event) => update("people", event.target.value)} /></label><label>Enquiry type<select value={form.enquiryType} onChange={(event) => update("enquiryType", event.target.value)}><option value="table">Table</option><option value="general">General event enquiry</option><option value="vip">VIP</option><option value="birthday">Birthday / celebration</option><option value="other">Other</option></select></label><label className="fullField">Message (optional)<textarea rows={3} value={form.message} onChange={(event) => update("message", event.target.value)} /></label><button className="button" disabled={state === "loading"}>{state === "loading" ? "Sending..." : "Send enquiry"}</button>{whatsappUrl && <TrackedWhatsAppLink className="textButton dark" context="event_enquiry" href={whatsappUrl}>WhatsApp Us</TrackedWhatsAppLink>}</form></div>;
}
