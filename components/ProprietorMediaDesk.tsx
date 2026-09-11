"use client";

import { useEffect, useMemo, useState } from "react";
import type { MediaAsset, MediaAssetSection } from "@/types";

type Target = {
  id: string;
  section: MediaAssetSection;
  title: string;
  publicUrl: string;
  storagePath?: string;
  displayOrder: number;
  source: "picture" | "website";
};

type Props = { initialMedia: MediaAsset[]; staticImages: string[] };

const sections: Array<{ key: MediaAssetSection | "all"; label: string }> = [
  { key: "all", label: "All pictures" },
  { key: "hero", label: "Homepage" },
  { key: "rooms", label: "Rooms" },
  { key: "food", label: "Food & Drinks" },
  { key: "club", label: "Club Klass" },
  { key: "events", label: "Events" },
  { key: "gallery", label: "Gallery" },
  { key: "braless", label: "Braless" },
  { key: "tv", label: "Viewing Centre" },
  { key: "media", label: "Media" },
];

const sectionLabels: Record<MediaAssetSection, string> = {
  hero: "Homepage", rooms: "Rooms", club: "Club Klass", events: "Events", food: "Food & Drinks", gallery: "Gallery", venue: "Venue", braless: "Braless", media: "Media", tv: "Viewing Centre", dj: "DJ", conversation: "Conversation", fm: "FM",
};

function sectionForUrl(url: string): MediaAssetSection {
  const lower = url.toLowerCase();
  if (lower.includes("/hero/")) return "hero";
  if (lower.includes("/rooms/")) return "rooms";
  if (lower.includes("/club-klass/") || lower.includes("/nightlife/")) return "club";
  if (lower.includes("/events/")) return "events";
  if (lower.includes("/food/") || lower.includes("/drinks/")) return "food";
  if (lower.includes("/gallery/")) return "gallery";
  if (lower.includes("/viewing-centre/") || lower.includes("/venue/")) return "tv";
  if (lower.includes("/braless/")) return "braless";
  return "media";
}

function titleForUrl(url: string) {
  const name = url.split("/").pop()?.replace(/\.[^.]+$/, "") || "1759 picture";
  return name.replace(/[-_]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function ProprietorMediaDesk({ initialMedia, staticImages }: Props) {
  const [media, setMedia] = useState(initialMedia);
  const [section, setSection] = useState<MediaAssetSection | "all">("all");
  const [target, setTarget] = useState<Target | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const pictures = useMemo<Target[]>(() => {
    const sectionIndexes = new Map<MediaAssetSection, number>();
    const staticTargets = staticImages.map((url) => {
      const mediaSection = sectionForUrl(url);
      const displayOrder = sectionIndexes.get(mediaSection) || 0;
      sectionIndexes.set(mediaSection, displayOrder + 1);
      return { id: `static:${url}`, section: mediaSection, title: titleForUrl(url), publicUrl: url, displayOrder, source: "website" as const };
    });
    return [
    ...staticTargets,
    ...media.map((item) => ({ id: item.id, section: item.section, title: item.title || titleForUrl(item.public_url) || "1759 picture", publicUrl: item.public_url, storagePath: item.storage_path, displayOrder: item.display_order || 0, source: "picture" as const })),
    ];
  }, [media, staticImages]);

  const visible = pictures.filter((item) => section === "all" || item.section === section);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function closeDialog() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setTarget(null); setFile(null); setPreviewUrl(""); setMessage("");
  }

  function chooseFile(next: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setMessage("");
    if (!next) { setFile(null); setPreviewUrl(""); return; }
    if (next.type.startsWith("video/")) {
      const probe = document.createElement("video");
      probe.preload = "metadata";
      probe.onloadedmetadata = () => {
        URL.revokeObjectURL(probe.src);
        if (probe.duration > 30) { setFile(null); setPreviewUrl(""); setMessage("Short clips must be 30 seconds or less."); return; }
        setFile(next); setPreviewUrl(URL.createObjectURL(next));
      };
      probe.src = URL.createObjectURL(next);
      return;
    }
    setFile(next); setPreviewUrl(URL.createObjectURL(next));
  }

  async function save() {
    if (!target || !file) { setMessage("Choose a picture first."); return; }
    setSaving(true); setMessage("");
    const body = new FormData();
    body.append("file", file);
    body.append("section", target.section);
    body.append("title", target.title);
    body.append("altText", target.title);
    body.append("caption", target.title);
    body.append("platform", "website");
    body.append("contentType", "website_media");
    body.append("status", "published");
    body.append("isPublished", "true");
    body.append("displayOrder", String(target.displayOrder));
    if (target.source === "picture") body.append("replaceId", target.id);
    if (target.source === "website") body.append("replaceSlot", "true");

    try {
      const response = await fetch("/api/admin/media", { method: "POST", body });
      const result = await response.json() as { ok?: boolean; error?: string; data?: MediaAsset };
      if (!response.ok || !result.ok) { setMessage(result.error || "The picture could not be saved."); return; }
      if (result.data) setMedia((current) => target.source === "picture" ? current.map((item) => item.id === target.id ? result.data! : item) : [...current, result.data!]);
      closeDialog(); setMessage("Picture replaced and optimized for the website.");
    } catch { setMessage("The picture could not be saved. Please try again."); } finally { setSaving(false); }
  }

  return <section className="proprietorMediaDesk">
    <header className="proprietorMediaHeader"><div><span className="adminEyebrow">MEDIA</span><h2>Keep the pictures on 1759 fresh.</h2><p>Choose a section and replace a picture whenever you need to refresh the website.</p></div><button type="button" className="adminPrimaryButton" onClick={() => setTarget({ id: "new", section: "hero", title: "New 1759 picture", publicUrl: "", displayOrder: 0, source: "website" })}>+ Add picture</button></header>
    <nav className="proprietorMediaSections" aria-label="Picture sections">{sections.map((item) => <button type="button" key={item.key} className={section === item.key ? "active" : ""} onClick={() => setSection(item.key)}>{item.label}</button>)}</nav>
    {message && <p className="adminFormMessage" role="status">{message}</p>}
    <div className="proprietorMediaGrid">{visible.map((item) => <article className="proprietorMediaCard" key={item.id}><div className="proprietorMediaImage">{item.publicUrl ? <img src={item.publicUrl} alt={item.title} loading="lazy" /> : <span>Choose a picture</span>}</div><div className="proprietorMediaBody"><h3>{item.title}</h3><p>{sectionLabels[item.section]}</p><button type="button" className="adminPrimaryButton small" onClick={() => { setTarget(item); setMessage(""); }}>Replace picture</button></div></article>)}</div>
    {visible.length === 0 && <div className="adminEmptyState"><h3>No pictures in this section yet.</h3><p>Use Add picture to give this part of the website a new image.</p></div>}
    {target && <div className="proprietorMediaDialogBackdrop" role="presentation" onClick={closeDialog}><div className="proprietorMediaDialog" role="dialog" aria-modal="true" aria-labelledby="replace-picture-title" onClick={(event) => event.stopPropagation()}><button type="button" className="adminCloseButton" onClick={closeDialog} aria-label="Close">×</button><span className="adminEyebrow">{sectionLabels[target.section]}</span><h2 id="replace-picture-title">Replace picture</h2><p className="muted">Choose a clear picture for this part of the website. Short clips must be 30 seconds or less.</p>{target.id === "new" && <label className="adminField">Section<select value={target.section} onChange={(event) => setTarget({ ...target, section: event.target.value as MediaAssetSection })}>{sections.filter((item) => item.key !== "all").map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>}<label className="proprietorChooseFile">Choose picture<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" onChange={(event) => chooseFile(event.target.files?.[0] || null)} /></label>{previewUrl && <div className="proprietorMediaPreview">{file?.type.startsWith("video/") ? <video src={previewUrl} controls /> : <img src={previewUrl} alt="Selected picture preview" />}</div>}{message && <p className="formError" role="alert">{message}</p>}<div className="proprietorMediaDialogActions"><button type="button" className="adminSecondaryButton" onClick={closeDialog}>Cancel</button><button type="button" className="adminPrimaryButton" disabled={saving || !file} onClick={save}>{saving ? "Saving..." : "Save picture"}</button></div></div></div>}
  </section>;
}
