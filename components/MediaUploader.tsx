"use client";

import { useEffect, useState } from "react";
import type { MediaAsset } from "@/types";

const sections = ["hero", "rooms", "club", "events", "food", "gallery", "venue"] as const;
type Section = typeof sections[number];

const guidance: Record<Section, { title: string; subject: string; ratio: string; dimensions: string }> = {
  hero: { title: "Homepage hero", subject: "landscape atmosphere shot and high resolution", ratio: "16:9", dimensions: "approx. 1600×900" },
  rooms: { title: "Room image", subject: "bright, clean room photograph showing the room clearly", ratio: "4:3", dimensions: "approx. 1400×1050" },
  club: { title: "Club Klass image", subject: "crowd, DJ, performance or bar atmosphere", ratio: "16:9", dimensions: "approx. 1600×900" },
  events: { title: "Event image", subject: "flyer, performer, crowd and event atmosphere", ratio: "4:3", dimensions: "approx. 1400×1050" },
  food: { title: "Food and drink image", subject: "dish, table or bar presentation with clean plating", ratio: "4:3", dimensions: "approx. 1200×900" },
  gallery: { title: "Gallery image", subject: "brand story, ambience and photo essay scene", ratio: "4:3", dimensions: "approx. 1200×900" },
  venue: { title: "Venue image", subject: "space, structure, entry and guest experience", ratio: "16:9", dimensions: "approx. 1600×900" },
};

export default function MediaUploader() {
  const [section, setSection] = useState<Section>("hero");
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<MediaAsset[]>([]);
  async function loadLibrary() {
    try {
      const response = await fetch(`/api/admin/media?section=${encodeURIComponent(section)}`);
      const result = await response.json() as { ok: boolean; data?: MediaAsset[]; error?: string };
      if (result.ok) setItems(result.data || []);
    } catch {
      setMessage("The media library could not be loaded.");
    }
  }
  useEffect(() => { loadLibrary(); }, [section]);
  async function upload() { if (!file) { setMessage("Choose a file first."); return; } setSaving(true); setMessage(""); const body = new FormData(); body.append("file", file); body.append("section", section); body.append("altText", altText); body.append("title", title); body.append("category", category); body.append("caption", caption); try { const response = await fetch("/api/admin/media", { method: "POST", body }); const result = await response.json() as { ok: boolean; error?: string }; setMessage(result.ok ? "Media uploaded. Refresh to see it in the library." : result.error || "We couldn't upload that media. Please try again."); if (result.ok) { setFile(null); setTitle(""); setCategory(""); setCaption(""); setAltText(""); await loadLibrary(); } } catch { setMessage("We couldn't upload that media. Please try again."); } finally { setSaving(false); } }
  async function remove(id: string, path: string) {
    if (!window.confirm("Remove this media item from the public media library?")) return;
    try {
      const response = await fetch("/api/admin/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, path }) });
      const result = await response.json() as { ok: boolean; error?: string };
      if (result.ok) await loadLibrary();
      setMessage(result.ok ? "Media removed." : result.error || "Media could not be removed.");
    } catch { setMessage("Media could not be removed."); }
  }
  const slot = guidance[section];
  return <div className="mediaUploader"><div className="panelHeading"><h2>Media library</h2><span>Controlled uploads</span></div><p className="muted">Upload clear, confirmed 1759 content. The limits prevent the library becoming a social feed.</p><label>Section<select value={section} onChange={(event) => setSection(event.target.value as Section)}>{sections.map((value) => <option key={value}>{value}</option>)}</select></label><div className="uploadHelp"><strong>ⓘ {slot.title}:</strong> <span>Recommended subject: {slot.subject}.</span><span>Aspect ratio: {slot.ratio}.</span><span>Approximate width × height: {slot.dimensions}.</span></div><label>File<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label><label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Optional image title" /></label><label>Category<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Section or campaign" /></label><label>Caption<textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Caption" /></label><label>Alt text<input value={altText} onChange={(event) => setAltText(event.target.value)} /></label>{message && <p className="formMessage">{message}</p>}<button className="button" onClick={upload} disabled={saving}>{saving ? "Uploading..." : "Upload media"}</button><div className="mediaLibrary"><div className="panelHeading"><h3>Library</h3><span>{items.length}</span></div>{items.length === 0 ? <p className="muted">No media here yet.</p> : <div className="mediaLibraryGrid">{items.map((item) => <div className="mediaLibraryItem" key={item.id}><img src={item.public_url} className="mediaThumb" alt={item.alt_text || item.caption} /><div><strong>{item.title || item.category || item.section}</strong><span>{item.section} · {item.media_type}</span><span>{new Date(item.created_at).toLocaleDateString("en-NG")}</span><button className="textButton dark" onClick={() => remove(item.id, item.storage_path)}>Delete</button></div></div>)}</div>}</div></div>;
}
