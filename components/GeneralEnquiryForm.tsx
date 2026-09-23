"use client";

import { FormEvent, useState } from "react";
import { getAttribution } from "@/lib/attribution";
import { trackEvent } from "@/lib/analytics";
import TrackedWhatsAppLink from "@/components/TrackedWhatsAppLink";

export default function GeneralEnquiryForm({ whatsapp }: { whatsapp: string }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  function update(key: keyof typeof form, value: string) { setForm((current) => ({ ...current, [key]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("loading"); setError("");
    try {
      const response = await fetch("/api/general-enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, attribution: getAttribution() }) });
      const result = await response.json() as { ok: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "We could not send your enquiry.");
      trackEvent("general_enquiry_submitted", { page: window.location.pathname }); setState("success");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "We could not send your enquiry."); setState("error"); }
  }
  if (state === "success") return <div className="success"><h2>THANK YOU</h2><p>Your enquiry has been received. The 1759 team will get back to you shortly.</p>{whatsapp && <TrackedWhatsAppLink className="button" context="general_enquiry_success" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello 1759 Empire, I have just sent a Braless enquiry.")}`}>CHAT ON WHATSAPP</TrackedWhatsAppLink>}</div>;
  return <div className="enquiryPanel generalEnquiry"><div className="panelHeading"><h2>Contact 1759</h2><span>Braless enquiry</span></div>{state === "error" && <p className="formError" role="alert">{error}</p>}<form className="enquiryForm" onSubmit={submit}><label>Name<input required minLength={2} value={form.name} onChange={(event) => update("name", event.target.value)} /></label><label>Phone / WhatsApp<input required value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label><label>Email (optional)<input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label><label className="fullField">Tell us what you&apos;re looking for<textarea required rows={4} value={form.message} onChange={(event) => update("message", event.target.value)} /></label><button className="button" disabled={state === "loading"}>{state === "loading" ? "Sending..." : "Send enquiry"}</button></form></div>;
}
