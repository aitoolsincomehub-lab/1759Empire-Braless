"use client";

import { useState } from "react";

const sections = ["hero", "rooms", "club", "events", "food", "gallery", "venue"] as const;
type Section = typeof sections[number];

export default function MediaUploader() {
  const [section, setSection] = useState<Section>("hero");
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function upload() { if (!file) { setMessage("Choose a file first."); return; } setSaving(true); setMessage(""); const body = new FormData(); body.append("file", file); body.append("section", section); body.append("altText", altText); try { const response = await fetch("/api/admin/media", { method: "POST", body }); const result = await response.json() as { ok: boolean }; setMessage(result.ok ? "Media uploaded. Refresh to see it in the library." : "We couldn't upload that media. Please try again."); } catch { setMessage("We couldn't upload that media. Please try again."); } finally { setSaving(false); } }
  return <div className="mediaUploader"><div className="panelHeading"><h2>Media library</h2><span>Controlled uploads</span></div><p className="muted">Upload clear, confirmed 1759 content. The limits prevent the library becoming a social feed.</p><label>Section<select value={section} onChange={(event) => setSection(event.target.value as Section)}>{sections.map((value) => <option key={value}>{value}</option>)}</select></label><p className="uploadHelp"><strong>ⓘ {section === "rooms" ? "Rooms:" : section === "club" ? "Club Klass:" : section === "events" ? "Events:" : "Upload guidance:"}</strong> {section === "rooms" ? "wide bed, bathroom, workspace and clean room details." : section === "club" ? "crowd, DJ, bar, tables, lighting and wide venue shots." : section === "events" ? "strongest flyer, crowd, performer and short atmosphere videos." : "Use good lighting and descriptive alt text."}</p><label>File<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label><label>Alt text<input value={altText} onChange={(event) => setAltText(event.target.value)} /></label>{message && <p className="formMessage">{message}</p>}<button className="button" onClick={upload} disabled={saving}>{saving ? "Uploading..." : "Upload media"}</button></div>;
}
