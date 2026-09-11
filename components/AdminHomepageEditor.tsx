"use client";

import { useState } from "react";
import type { MediaAsset, SiteSettings } from "@/types";
import AdminMediaPicker from "@/components/AdminMediaPicker";

const defaultSettings: SiteSettings = {
  business_name: "1759 Empire Lounge, Hotel & Suites",
  address: "",
  phone: "",
  whatsapp_number: "",
  email: "",
  google_maps_url: "",
  instagram_url: "",
  tiktok_url: "",
  facebook_url: "",
  opening_hours: "Open daily",
  club_hours: "",
  booking_contact: "",
  event_enquiry_contact: "",
  hero_headline: "Stay here. Live the night.",
  hero_subheadline: "",
  hero_primary_cta: "Book a Room",
  hero_secondary_cta: "Discover Club Klass",
  club_description: "",
  dine_description: "",
  lounge_description: "",
  contact_cta: "",
  hero_media_url: "/assets/hero/1759-exterior-current-hero.webp",
  show_featured_event: true,
  show_events_section: true,
  show_rooms_section: true,
};

export default function AdminHomepageEditor({
  initialSettings,
  media,
}: {
  initialSettings: Partial<SiteSettings> | null;
  media: MediaAsset[];
}) {
  const [form, setForm] = useState<Record<string, string | boolean>>({
    ...defaultSettings,
    ...(initialSettings || {}),
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function update(key: string, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json().catch(() => ({}));
    setMessage(response.ok ? "Homepage settings saved." : result?.error || "We couldn’t save those changes.");
    setSaving(false);
  }

  return (
    <section className="adminFormShell">
      <div className="adminFormHeader">
        <div>
          <span className="adminEyebrow">HOME</span>
          <h2>Homepage settings</h2>
        </div>
        <button className="adminPrimaryButton small" type="button" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save settings"}
        </button>
      </div>

      {message && <div className="adminFormMessage">{message}</div>}

      <div className="adminFormGrid">
        <label>
          Business name
          <input value={String(form.business_name || "")} onChange={(event) => update("business_name", event.target.value)} />
        </label>
        <label>
          Address
          <input value={String(form.address || "")} onChange={(event) => update("address", event.target.value)} />
        </label>
        <label>
          Phone
          <input value={String(form.phone || "")} onChange={(event) => update("phone", event.target.value)} />
        </label>
        <label>
          WhatsApp number
          <input value={String(form.whatsapp_number || "")} onChange={(event) => update("whatsapp_number", event.target.value)} />
        </label>
        <label>
          Email
          <input value={String(form.email || "")} onChange={(event) => update("email", event.target.value)} />
        </label>
        <label>
          Instagram URL
          <input value={String(form.instagram_url || "")} onChange={(event) => update("instagram_url", event.target.value)} />
        </label>
        <label>
          TikTok URL
          <input value={String(form.tiktok_url || "")} onChange={(event) => update("tiktok_url", event.target.value)} />
        </label>
        <label>
          Google Maps URL
          <input value={String(form.google_maps_url || "")} onChange={(event) => update("google_maps_url", event.target.value)} />
        </label>
        <label>
          Opening hours
          <input value={String(form.opening_hours || "")} onChange={(event) => update("opening_hours", event.target.value)} />
        </label>
        <label>
          Club hours
          <input value={String(form.club_hours || "")} onChange={(event) => update("club_hours", event.target.value)} />
        </label>
        <label className="adminFieldFull">
          Hero headline
          <input value={String(form.hero_headline || "")} onChange={(event) => update("hero_headline", event.target.value)} />
        </label>
        <label className="adminFieldFull">
          Hero subheadline
          <input value={String(form.hero_subheadline || "")} onChange={(event) => update("hero_subheadline", event.target.value)} />
        </label>
        <label>
          Primary CTA
          <input value={String(form.hero_primary_cta || "")} onChange={(event) => update("hero_primary_cta", event.target.value)} />
        </label>
        <label>
          Secondary CTA
          <input value={String(form.hero_secondary_cta || "")} onChange={(event) => update("hero_secondary_cta", event.target.value)} />
        </label>
        <label className="adminFieldFull">
          Club description
          <textarea value={String(form.club_description || "")} onChange={(event) => update("club_description", event.target.value)} />
        </label>
        <label className="adminFieldFull">
          Dining description
          <textarea value={String(form.dine_description || "")} onChange={(event) => update("dine_description", event.target.value)} />
        </label>
        <label className="adminFieldFull">
          Lounge description
          <textarea value={String(form.lounge_description || "")} onChange={(event) => update("lounge_description", event.target.value)} />
        </label>
        <label className="adminFieldFull">
          Contact CTA
          <input value={String(form.contact_cta || "")} onChange={(event) => update("contact_cta", event.target.value)} />
        </label>

        <div className="adminFieldFull">
          <AdminMediaPicker
            label="Hero media"
            items={media.filter((item) => ["hero", "rooms", "events", "club", "venue", "gallery"].includes(item.section))}
            value={String(form.hero_media_url || "")}
            onChange={(next) => update("hero_media_url", next)}
          />
        </div>
      </div>
    </section>
  );
}
