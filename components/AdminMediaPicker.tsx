"use client";

import { useMemo, useState } from "react";
import type { MediaAsset } from "@/types";

function isApprovedPublicAsset(url?: string | null) {
  if (!url) return false;
  if (url.startsWith("/assets/visual-assets/") || url.startsWith("/media_stills/")) return false;
  return url.startsWith("/assets/");
}

export default function AdminMediaPicker({ label, items, value, onChange }: { label: string; items: MediaAsset[]; value: string; onChange: (next: string) => void }) {
  const [open, setOpen] = useState(false);
  const published = useMemo(() => items.filter((item) => item.is_published && Boolean(item.public_url) && (isApprovedPublicAsset(item.public_url) || item.platform === "youtube" || item.platform === "mixcloud")), [items]);
  const selected = useMemo(() => published.find((item) => item.public_url === value || item.storage_path === value || item.thumbnail_url === value) || null, [published, value]);

  return <div className="adminMediaPicker">
    <div className="adminMediaPickerHeader">
      <div><span className="adminMediaPickerLabel">{label}</span><small className="adminMediaPickerHint">Choose from published CMS media</small></div>
      <button type="button" className="adminSecondaryButton" onClick={() => setOpen((current) => !current)}>{selected ? "Change media" : "Select media"}</button>
    </div>
    <input className="adminTextInput" value={value} onChange={(event) => onChange(event.target.value)} placeholder="/assets/... or https://..." aria-label={`${label} URL`} />
    {selected && <div className="adminMediaPickerPreview"><img src={selected.thumbnail_url || selected.public_url} alt={selected.alt_text || selected.title || label} loading="lazy" /><div><strong>{selected.title || selected.caption || "Selected media"}</strong><span>{selected.section} · {selected.platform || "website"}</span></div></div>}
    {open && <div className="adminMediaPickerGrid">{published.length === 0 ? <p className="adminMediaPickerEmpty">No published CMS media is available for this picker yet.</p> : published.map((item) => <button type="button" key={item.id} className={`adminMediaPickerItem ${value === item.public_url ? "selected" : ""}`} onClick={() => { onChange(item.public_url); setOpen(false); }} title={item.title || item.caption || item.section}><img src={item.thumbnail_url || item.public_url} alt={item.alt_text || item.title || item.section} loading="lazy" /><span>{item.title || item.caption || item.section}</span></button>)}</div>}
  </div>;
}
