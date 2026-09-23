"use client";

import { useMemo, useState } from "react";
import type { Event, MediaAsset, MenuItem, Room } from "@/types";
import AdminMediaPicker from "@/components/AdminMediaPicker";

function isApprovedPublicAsset(url?: string | null) {
  if (!url) return false;
  if (url.startsWith("/assets/visual-assets/") || url.startsWith("/media_stills/")) return false;
  return url.startsWith("/assets/");
}

type Resource = "rooms" | "events" | "menu";
type CatalogueItem = Room | Event | MenuItem;

export default function AdminCatalogueEditor({
  resource,
  initialItems,
  media,
}: {
  resource: Resource;
  initialItems: Room[] | Event[] | MenuItem[];
  media: MediaAsset[];
}) {
  const [items, setItems] = useState<CatalogueItem[]>(initialItems as CatalogueItem[]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [menuFilter, setMenuFilter] = useState<"all" | "food" | "drinks">("all");

  const mediaOptions = useMemo(
    () => media.filter((item) => resource === "events" ? item.section === "events" : resource === "rooms" ? item.section === "rooms" : item.section === "food"),
    [media, resource],
  );

  function beginEdit(item: CatalogueItem) {
    const roomItem = item as Room;
    const eventItem = item as Event;
    const menuItem = item as MenuItem;

    const base: Record<string, unknown> = {
      ...item,
      price: resource === "menu" ? Number(menuItem.price ?? 0) : Number((roomItem.price_per_night ?? 0) || 0),
      price_per_night: Number(roomItem.price_per_night ?? 0),
      is_active: Boolean(resource === "rooms" ? roomItem.is_active : eventItem.is_active),
      is_published: Boolean(eventItem.is_published),
      is_available: Boolean(menuItem.is_available),
      images: resource === "rooms" ? (Array.isArray(roomItem.images) ? roomItem.images : []) : resource === "menu" && menuItem.image_url ? [menuItem.image_url] : eventItem.image_url ? [eventItem.image_url] : [],
      image_url: resource === "events" ? (eventItem.image_url ?? "") : resource === "menu" ? (menuItem.image_url ?? "") : "",
      name: resource !== "events" ? (roomItem.name || menuItem.name || "") : "",
      title: resource === "events" ? (eventItem.title || "") : "",
      slug: resource === "events" ? (eventItem.slug || "") : "",
      description: item.description || "",
      category: menuItem.category || "",
      total_units: Number(roomItem.total_units ?? 1),
      event_date: eventItem.event_date || new Date().toISOString().slice(0, 10),
      event_time: eventItem.event_time || "",
      end_time: eventItem.end_time || "",
      location: eventItem.location || "",
      entry_price: Number(eventItem.entry_price ?? 0),
      is_recurring: Boolean(eventItem.is_recurring),
    };
    setIsCreating(false);
    setEditingId(String(item.id));
    setDraft(base);
    setMessage("");
  }

  function beginCreate() {
    const base: Record<string, unknown> = {
      name: "",
      title: "",
      description: "",
      category: "",
      price: 0,
      price_per_night: 0,
      total_units: 1,
      is_active: true,
      is_published: false,
      is_available: true,
      event_date: new Date().toISOString().slice(0, 10),
      event_time: "",
      end_time: "",
      location: "",
      entry_price: 0,
      is_recurring: false,
      images: [],
      image_url: "",
    };
    setIsCreating(true);
    setEditingId(null);
    setDraft(base);
    setMessage("");
  }

  async function save() {
    setSaving(true);
    setMessage("");

    const payload: Record<string, unknown> = { resource };
    if (resource === "rooms") {
      payload.name = draft.name ?? "";
      payload.description = draft.description ?? "";
      payload.price_per_night = Number(draft.price_per_night ?? 0);
      payload.total_units = Number(draft.total_units ?? 1);
      payload.is_active = Boolean(draft.is_active);
      payload.images = Array.isArray(draft.images) ? draft.images.filter(Boolean) : [];
    }
    if (resource === "events") {
      payload.title = draft.title ?? "";
      payload.slug = draft.slug || null;
      payload.event_date = draft.event_date ?? new Date().toISOString().slice(0, 10);
      payload.event_time = draft.event_time || null;
      payload.end_time = draft.end_time || null;
      payload.location = draft.location || null;
      payload.entry_price = Number(draft.entry_price ?? 0);
      payload.description = draft.description ?? "";
      payload.is_published = Boolean(draft.is_published);
      payload.is_active = Boolean(draft.is_active);
      payload.is_recurring = Boolean(draft.is_recurring);
      payload.image_url = draft.image_url ?? null;
    }
    if (resource === "menu") {
      payload.name = draft.name ?? "";
      payload.category = draft.category ?? "";
      payload.description = draft.description ?? "";
      payload.price = Number(draft.price ?? 0);
      payload.is_available = Boolean(draft.is_available);
      payload.image_url = draft.image_url ?? null;
    }

    if (isCreating) {
      if (!payload.name && !payload.title) {
        setMessage("Please add a title or name before saving.");
        setSaving(false);
        return;
      }
    }

    if (!isCreating && !editingId) {
      setMessage("Choose an item to edit.");
      setSaving(false);
      return;
    }

    if (!isCreating) {
      payload.id = editingId;
    }

    const response = await fetch("/api/admin/catalogue", {
      method: isCreating ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));

    if (response.ok && result?.data) {
      const nextData = result.data as Partial<CatalogueItem>;
      if (isCreating) {
        setItems((current) => [nextData as CatalogueItem, ...current]);
        setMessage("Item created.");
      } else {
        setItems((current) => current.map((item) => (String(item.id) === editingId ? ({ ...item, ...nextData } as CatalogueItem) : item)));
        setMessage("Changes saved.");
      }
      setIsCreating(false);
      setEditingId(null);
      setDraft({});
    } else {
      setMessage(result?.error || "We couldn’t save those changes.");
    }
    setSaving(false);
  }

  async function remove(id: string) {
    const response = await fetch("/api/admin/catalogue", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource, id }),
    });
    if (response.ok) {
      setItems((current) => current.filter((item) => String(item.id) !== id));
      if (editingId === id) {
        setEditingId(null);
        setDraft({});
      }
      setMessage("Item removed.");
    }
  }

  const rowLabel = resource === "rooms" ? "Rooms" : resource === "events" ? "Events" : "Menu";
  const filteredItems = resource !== "menu" || menuFilter === "all" ? items : items.filter((item) => {
    const isDrink = /drink|beverage|cocktail|mocktail|wine|beer|spirit|bar|juice/i.test((item as MenuItem).category);
    return menuFilter === "drinks" ? isDrink : !isDrink;
  });

  return (
    <section className="adminFormShell">
      <div className="adminFormHeader">
        <div>
          <span className="adminEyebrow">{rowLabel.toUpperCase()}</span>
          <h2>Manage current {rowLabel.toLowerCase()}</h2>
        </div>
        <button type="button" className="adminPrimaryButton small" onClick={beginCreate}>Add {rowLabel.slice(0, -1)}</button>
      </div>

      {message && <div className="adminFormMessage">{message}</div>}

      {resource === "menu" && <div className="adminMenuFilters" role="tablist" aria-label="Menu type"><button type="button" className={menuFilter === "all" ? "active" : ""} onClick={() => setMenuFilter("all")}>All</button><button type="button" className={menuFilter === "food" ? "active" : ""} onClick={() => setMenuFilter("food")}>Food</button><button type="button" className={menuFilter === "drinks" ? "active" : ""} onClick={() => setMenuFilter("drinks")}>Drinks</button></div>}

      <div className="adminCardGrid">
        {(filteredItems || []).map((item) => {
          const id = String(item.id);
          const isEditing = editingId === id;
          const candidateImage = resource === "rooms"
            ? Array.isArray((item as Room).images) && (item as Room).images.length > 0 ? (item as Room).images[0] : ""
            : resource === "events"
              ? (item as Event).image_url || ""
              : (item as MenuItem).image_url || "";
          const imageUrl = isApprovedPublicAsset(candidateImage) ? candidateImage : "";
          const title = resource === "events" ? (item as Event).title : (item as Room | MenuItem).name;

          return (
            <article className="adminMenuCard" key={id}>
              <div className="adminRoomMedia">
                {imageUrl ? <img src={imageUrl} alt={String(title ?? "Item")} /> : <div className="adminRoomImageFallback"><span>1759</span><strong>{String(title ?? "Item")}</strong><small>Production media slot</small></div>}
              </div>
              <div className="adminRoomBody">
                <div>
                  <span className="adminMetaLabel">{resource === "menu" ? ((item as MenuItem).is_available ? "Available" : "Unavailable") : resource === "rooms" ? ((item as Room).is_active ? "Active" : "Inactive") : ((item as Event).is_published ? "Published" : "Draft")}</span>
                  <h3>{title}</h3>
                  <p>{resource === "rooms" ? (item as Room).description : resource === "events" ? (item as Event).description : (item as MenuItem).description}</p>
                </div>
                <div className="adminRoomDetails">
                  <span>{resource === "rooms" ? `₦${Number((item as Room).price_per_night || 0).toLocaleString()}` : resource === "events" ? (item as Event).event_date : `₦${Number((item as MenuItem).price || 0).toLocaleString()}`}</span>
                  <span>{resource === "rooms" ? `${(item as Room).total_units || 1} units` : resource === "events" ? ((item as Event).is_active ? "Live" : "Hidden") : "Menu item"}</span>
                </div>
              </div>
              <div className="adminMediaActions" style={{ marginTop: 0, paddingTop: 12 }}>
                <button type="button" className="adminActionButton" onClick={() => beginEdit(item)}>Edit</button>
                <button type="button" className="adminActionButton adminActionDelete" onClick={() => remove(id)}>Delete</button>
              </div>

              {(isEditing || isCreating) && (
                <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                  {resource === "rooms" && (
                    <>
                      <label className="adminField">
                        Name
                        <input value={String(draft.name ?? "")} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
                      </label>
                      <label className="adminFieldFull">
                        Description
                        <textarea value={String(draft.description ?? "")} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
                      </label>
                      <label>
                        Price per night
                        <input type="number" value={Number(draft.price_per_night ?? 0)} onChange={(event) => setDraft((current) => ({ ...current, price_per_night: Number(event.target.value) }))} />
                      </label>
                      <label>
                        Units
                        <input type="number" value={Number(draft.total_units ?? 1)} onChange={(event) => setDraft((current) => ({ ...current, total_units: Number(event.target.value) }))} />
                      </label>
                      <label>
                        Active
                        <input type="checkbox" checked={Boolean(draft.is_active)} onChange={(event) => setDraft((current) => ({ ...current, is_active: event.target.checked }))} />
                      </label>
                      <div className="adminFieldFull">
                        <AdminMediaPicker label="Room image" items={mediaOptions} value={String((Array.isArray(draft.images) ? draft.images[0] : "") || "")} onChange={(next) => setDraft((current) => ({ ...current, images: [next] }))} />
                      </div>
                    </>
                  )}

                  {resource === "events" && (
                    <>
                      <label className="adminFieldFull">
                        Title
                        <input value={String(draft.title ?? "")} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
                      </label>
                      <label className="adminFieldFull">
                        Slug
                        <input value={String(draft.slug ?? "")} onChange={(event) => setDraft((current) => ({ ...current, slug: event.target.value }))} />
                      </label>
                      <label>
                        Event date
                        <input type="date" value={String(draft.event_date ?? "")} onChange={(event) => setDraft((current) => ({ ...current, event_date: event.target.value }))} />
                      </label>
                      <label>
                        Published
                        <input type="checkbox" checked={Boolean(draft.is_published)} onChange={(event) => setDraft((current) => ({ ...current, is_published: event.target.checked }))} />
                      </label>
                      <label>
                        Event time
                        <input type="time" value={String(draft.event_time ?? "")} onChange={(event) => setDraft((current) => ({ ...current, event_time: event.target.value }))} />
                      </label>
                      <label>
                        End time
                        <input type="time" value={String(draft.end_time ?? "")} onChange={(event) => setDraft((current) => ({ ...current, end_time: event.target.value }))} />
                      </label>
                      <label>
                        Entry price
                        <input type="number" value={Number(draft.entry_price ?? 0)} onChange={(event) => setDraft((current) => ({ ...current, entry_price: Number(event.target.value) }))} />
                      </label>
                      <label>
                        Recurring
                        <input type="checkbox" checked={Boolean(draft.is_recurring)} onChange={(event) => setDraft((current) => ({ ...current, is_recurring: event.target.checked }))} />
                      </label>
                      <label>
                        Active
                        <input type="checkbox" checked={Boolean(draft.is_active)} onChange={(event) => setDraft((current) => ({ ...current, is_active: event.target.checked }))} />
                      </label>
                      <label className="adminFieldFull">
                        Location
                        <input value={String(draft.location ?? "")} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} />
                      </label>
                      <label className="adminFieldFull">
                        Description
                        <textarea value={String(draft.description ?? "")} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
                      </label>
                      <div className="adminFieldFull">
                        <AdminMediaPicker label="Event image" items={mediaOptions} value={String(draft.image_url ?? "")} onChange={(next) => setDraft((current) => ({ ...current, image_url: next }))} />
                      </div>
                    </>
                  )}

                  {resource === "menu" && (
                    <>
                      <label>
                        Name
                        <input value={String(draft.name ?? "")} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
                      </label>
                      <label>
                        Category
                        <input value={String(draft.category ?? "")} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} />
                      </label>
                      <label>
                        Price
                        <input type="number" value={Number(draft.price ?? 0)} onChange={(event) => setDraft((current) => ({ ...current, price: Number(event.target.value) }))} />
                      </label>
                      <label>
                        Available
                        <input type="checkbox" checked={Boolean(draft.is_available)} onChange={(event) => setDraft((current) => ({ ...current, is_available: event.target.checked }))} />
                      </label>
                      <label className="adminFieldFull">
                        Description
                        <textarea value={String(draft.description ?? "")} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
                      </label>
                      <div className="adminFieldFull">
                        <AdminMediaPicker label="Menu image" items={mediaOptions} value={String(draft.image_url ?? "")} onChange={(next) => setDraft((current) => ({ ...current, image_url: next }))} />
                      </div>
                    </>
                  )}

                  <div className="adminMediaActions" style={{ marginTop: 6 }}>
                    <button type="button" className="adminPrimaryButton" onClick={save} disabled={saving}>{saving ? "Saving..." : isCreating ? "Create" : "Save"}</button>
                    <button type="button" className="adminSecondaryButton" onClick={() => { setEditingId(null); setIsCreating(false); setDraft({}); setMessage(""); }}>Close</button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
