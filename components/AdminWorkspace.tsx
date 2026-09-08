"use client";

import { useState } from "react";
import type { Event, MenuCategory, MenuItem, Room, SiteSettings } from "@/types";

type Section = "rooms" | "events" | "menu" | "categories" | "settings";
type Item = Room | Event | MenuItem | MenuCategory;

export default function AdminWorkspace({ rooms, events, menu, categories, settings }: { rooms: Room[]; events: Event[]; menu: MenuItem[]; categories: MenuCategory[]; settings: SiteSettings }) {
  const [section, setSection] = useState<Section>("rooms");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const items = section === "rooms" ? rooms : section === "events" ? events : section === "categories" ? categories : menu;

  function begin(item?: Item) {
    setEditing(item || null);
    const allKeys = ["name", "title", "slug", "description", "short_description", "event_date", "event_time", "end_time", "category", "price", "entry_price", "price_per_night", "total_units", "amenities", "performers", "is_published", "is_featured", "show_countdown", "show_room_promotion", "is_recurring", "sort_order", "is_active"];
    const selection = item ? Object.fromEntries(Object.entries(item).filter(([key]) => allKeys.includes(key)).map(([key, value]) => [key, Array.isArray(value) ? value.join(", ") : String(value ?? "")])) : {};
    setForm(selection);
    setMessage("");
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const resource = section === "categories" ? "menu_categories" : section;
    const payload: Record<string, unknown> = { resource, ...form };
    if (section === "rooms") {
      payload.price_per_night = Number(form.price_per_night || 0);
      payload.total_units = Number(form.total_units || 1);
      payload.amenities = (form.amenities || "").split(",").map((value) => value.trim()).filter(Boolean);
      payload.is_active = true;
    }
    if (section === "menu") { payload.price = Number(form.price || 0); payload.is_available = true; }
    if (section === "events") {
      payload.entry_price = Number(form.entry_price || 0);
      payload.is_active = true;
      payload.is_published = form.is_published !== "false";
      payload.is_featured = form.is_featured === "true";
      payload.show_countdown = form.show_countdown === "true";
      payload.show_room_promotion = form.show_room_promotion !== "false";
      payload.is_recurring = form.is_recurring === "true";
      payload.performers = (form.performers || "").split(",").map((value) => value.trim()).filter(Boolean);
    }
    if (section === "categories") {
      payload.sort_order = Number(form.sort_order || 0);
      payload.is_active = form.is_active !== "false";
    }
    if (editing) payload.id = editing.id;
    try {
      const response = await fetch("/api/admin/catalogue", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { ok: boolean };
      setMessage(result.ok ? "Changes saved successfully." : "We couldn't save those changes. Please try again.");
      if (result.ok) setEditing(null);
    } catch {
      setMessage("We couldn't save those changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Remove this item from the public website?")) return;
    const resource = section === "categories" ? "menu_categories" : section;
    const response = await fetch("/api/admin/catalogue", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resource, id }) });
    setMessage(response.ok ? "Changes saved successfully." : "We couldn't remove that item. Please try again.");
  }

  return <div className="adminWorkspace">
    <div className="workspaceTabs">
      {(["rooms", "events", "menu", "categories", "settings"] as Section[]).map((value) => <button className={section === value ? "active" : ""} onClick={() => { setSection(value); setEditing(null); }} key={value}>{value === "menu" ? "Food & Drinks" : value === "categories" ? "Menu Categories" : value === "settings" ? "Business Information" : value}</button>)}
    </div>
    {section === "settings" ? <SettingsForm settings={settings} /> : <>
      <div className="workspaceHeading">
        <div>
          <p className="eyebrow">{section === "rooms" ? "ROOMS" : section === "events" ? "EVENTS" : section === "categories" ? "CATEGORIES" : "MENU"}</p>
          <h2>Manage {section === "menu" ? "food & drinks" : section === "categories" ? "menu categories" : section}</h2>
        </div>
        <button className="button" onClick={() => begin()}>Add {section === "menu" ? "item" : section === "categories" ? "category" : section.slice(0, -1)}</button>
      </div>
      {message && <p className="formMessage">{message}</p>}
      <div className="adminItems">
        {items.map((item) => <div className="adminItem" key={item.id}>
          <div>
            <strong>{"name" in item ? item.name : item.title}</strong>
            <span>{section === "categories" && "sort_order" in item ? `sort ${item.sort_order}` : section === "categories" ? "sort 0" : ("price_per_night" in item ? (item.price_per_night > 0 ? `₦${item.price_per_night.toLocaleString()}/night` : "Price on request") : "price" in item ? (item.price > 0 ? `₦${item.price.toLocaleString()}` : "Price on request") : "event_date" in item ? item.event_date : "")}</span>
          </div>
          <div className="itemActions">
            <button onClick={() => begin(item)}>Edit</button>
            <button onClick={() => remove(item.id)}>Remove</button>
          </div>
        </div>)}
        {items.length === 0 && <p className="muted">Nothing here yet. Add the first item above.</p>}
      </div>
      {editing !== null || Object.keys(form).length > 0 ? <Editor section={section} form={form} setForm={setForm} save={save} cancel={() => { setEditing(null); setForm({}); }} saving={saving} /> : null}
    </>}
  </div>;
}

function Editor({ section, form, setForm, save, cancel, saving }: { section: Exclude<Section, "settings">; form: Record<string, string>; setForm: (value: Record<string, string>) => void; save: () => Promise<void>; cancel: () => void; saving: boolean }) {
  const fields = section === "rooms" ? ["name", "slug", "description", "price_per_night", "total_units", "amenities"] : section === "events" ? ["title", "slug", "short_description", "description", "event_date", "event_time", "end_time", "entry_price", "performers", "is_published", "is_featured", "show_countdown", "show_room_promotion", "is_recurring"] : section === "categories" ? ["name", "description", "sort_order", "is_active"] : ["name", "category", "description", "price"];
  const labels: Record<string, string> = { name: "Room name", title: "Event name", slug: "Web address", description: "Description", short_description: "Short description", event_date: "Event date", event_time: "Event time", end_time: "End time", category: "Category", price: "Price", price_per_night: "Price per night", entry_price: "Entry price", total_units: "Number of rooms", amenities: "Amenities (comma-separated)", performers: "Performers (comma-separated)", is_published: "Published", is_featured: "Featured event", show_countdown: "Show countdown", show_room_promotion: "Promote rooms", is_recurring: "Recurring event", sort_order: "Sort order", is_active: "Visible" };
  const booleanFields = ["is_published", "is_featured", "show_countdown", "show_room_promotion", "is_recurring", "is_active"];
  return <div className="editor">
    <h3>{form.name || form.title ? "Edit" : "Add"} {section === "events" ? "event" : section === "rooms" ? "room" : section === "categories" ? "category" : "menu item"}</h3>
    {fields.map((field) => booleanFields.includes(field) ? <label className="checkField" key={field}><input type="checkbox" checked={form[field] === "true"} onChange={(event) => setForm({ ...form, [field]: String(event.target.checked) })} />{labels[field]}</label> : <label key={field}>{labels[field]}<input type={field === "event_date" ? "date" : field === "event_time" || field === "end_time" ? "time" : field === "sort_order" ? "number" : field.includes("price") ? "number" : "text"} value={form[field] || ""} onChange={(event) => setForm({ ...form, [field]: event.target.value })} /></label>)}
    <div className="editorActions">
      <button className="button" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
      <button className="textButton" onClick={cancel}>Cancel</button>
    </div>
  </div>;
}

function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [form, setForm] = useState({ business_name: settings.business_name, address: settings.address, phone: settings.phone, whatsapp_number: settings.whatsapp_number, email: settings.email, google_maps_url: settings.google_maps_url, instagram_url: settings.instagram_url, opening_hours: settings.opening_hours, club_hours: settings.club_hours, hero_headline: settings.hero_headline, hero_subheadline: settings.hero_subheadline, club_description: settings.club_description, dine_description: settings.dine_description, contact_cta: settings.contact_cta });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const labels: Record<string, string> = { business_name: "Business name", address: "Address", phone: "Phone number", whatsapp_number: "WhatsApp number", email: "Email address", google_maps_url: "Google Maps link", instagram_url: "Instagram link", opening_hours: "Opening hours", club_hours: "Club hours", hero_headline: "Homepage headline", hero_subheadline: "Homepage introduction", club_description: "Club Klass description", dine_description: "Food and drinks description", contact_cta: "Contact call to action" };
  async function save() { setSaving(true); const response = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); setMessage(response.ok ? "Changes saved successfully." : "We couldn't save those changes. Please try again."); setSaving(false); }
  return <div className="settingsForm"><div className="workspaceHeading"><div><p className="eyebrow">BUSINESS INFORMATION</p><h2>Website details</h2></div></div>{Object.entries(form).map(([key, value]) => <label key={key}>{labels[key]}<input type={key === "email" ? "email" : "text"} value={value} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}{message && <p className="formMessage">{message}</p>}<button className="button" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save settings"}</button></div>;
}
