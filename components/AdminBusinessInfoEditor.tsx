"use client";

import { useState } from "react";
import type { SiteSettings } from "@/types";

export default function AdminBusinessInfoEditor({ initialSettings }: { initialSettings: Partial<SiteSettings> | null }) {
  const [form, setForm] = useState<Record<string, string>>({
    business_name: initialSettings?.business_name || "1759 Empire Lounge, Hotel & Suites",
    address: initialSettings?.address || "",
    phone: initialSettings?.phone || "",
    whatsapp_number: initialSettings?.whatsapp_number || "",
    email: initialSettings?.email || "",
    google_maps_url: initialSettings?.google_maps_url || "",
    instagram_url: initialSettings?.instagram_url || "",
    tiktok_url: initialSettings?.tiktok_url || "",
    facebook_url: initialSettings?.facebook_url || "",
    opening_hours: initialSettings?.opening_hours || "Open daily",
    club_hours: initialSettings?.club_hours || "",
    booking_contact: initialSettings?.booking_contact || "",
    event_enquiry_contact: initialSettings?.event_enquiry_contact || "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true);
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Business details saved." : result?.error || "We couldn’t save those changes.");
    setSaving(false);
  }

  function update(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="adminFormShell">
      <div className="adminFormHeader">
        <div>
          <span className="adminEyebrow">BUSINESS</span>
          <h2>Business information</h2>
        </div>
        <button className="adminPrimaryButton small" type="button" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save details"}
        </button>
      </div>

      {message && <div className="adminFormMessage">{message}</div>}

      <div className="adminFormGrid">
        <label>Business name<input value={form.business_name} onChange={(event) => update("business_name", event.target.value)} /></label>
        <label>Phone<input value={form.phone} onChange={(event) => update("phone", event.target.value)} /></label>
        <label>WhatsApp<input value={form.whatsapp_number} onChange={(event) => update("whatsapp_number", event.target.value)} /></label>
        <label>Email<input value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
        <label>Address<input value={form.address} onChange={(event) => update("address", event.target.value)} /></label>
        <label>Google Maps URL<input value={form.google_maps_url} onChange={(event) => update("google_maps_url", event.target.value)} /></label>
        <label>Instagram URL<input value={form.instagram_url} onChange={(event) => update("instagram_url", event.target.value)} /></label>
        <label>TikTok URL<input value={form.tiktok_url} onChange={(event) => update("tiktok_url", event.target.value)} /></label>
        <label>Facebook URL<input value={form.facebook_url} onChange={(event) => update("facebook_url", event.target.value)} /></label>
        <label>Opening hours<input value={form.opening_hours} onChange={(event) => update("opening_hours", event.target.value)} /></label>
        <label>Club hours<input value={form.club_hours} onChange={(event) => update("club_hours", event.target.value)} /></label>
        <label>Booking contact<input value={form.booking_contact} onChange={(event) => update("booking_contact", event.target.value)} /></label>
        <label>Event enquiry contact<input value={form.event_enquiry_contact} onChange={(event) => update("event_enquiry_contact", event.target.value)} /></label>
      </div>
    </section>
  );
}
