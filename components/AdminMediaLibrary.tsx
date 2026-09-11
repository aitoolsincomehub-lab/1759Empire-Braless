"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MediaAsset, MediaAssetSection } from "@/types";
import { getMediaGuidance, type MediaGuidance } from "@/lib/media-guidance";

type AssetSource = "database" | "static";
type LibraryItem = {
  id: string;
  source: AssetSource;
  section: MediaAssetSection;
  title: string;
  caption: string;
  alt_text: string;
  media_type: "image" | "video";
  public_url: string;
  storage_path?: string;
  is_published: boolean;
  platform?: string;
  display_order?: number;
  status?: string;
  file_size?: number;
  content_type?: string;
  category?: string;
  created_at?: string;
  event_id?: string | null;
  guidance: MediaGuidance;
};

type Props = {
  initialMedia: MediaAsset[];
  staticImages?: string[];
  section?: MediaAssetSection;
  homepageHeroUrl?: string;
};

const sectionLabels: Record<MediaAssetSection, string> = {
  hero: "Homepage", rooms: "Rooms", club: "Club Klass", events: "Events", food: "Food & Drinks", gallery: "Gallery", venue: "Venue", braless: "Braless", media: "Media", tv: "Viewing Centre", dj: "DJ", conversation: "Conversation", fm: "FM",
};

const filterOrder = [
  { key: "all", label: "All" }, { key: "hero", label: "Homepage" }, { key: "rooms", label: "Rooms" }, { key: "events", label: "Events" }, { key: "food", label: "Food & Drinks" }, { key: "braless", label: "Braless" }, { key: "club", label: "Club Klass" }, { key: "tv", label: "Viewing Centre" }, { key: "media", label: "Media" },
];
const statusOptions = [{ key: "all", label: "All status" }, { key: "published", label: "Published" }, { key: "draft", label: "Draft" }];
const platformOptions = ["all", "website", "youtube", "mixcloud", "instagram", "tiktok", "short_form"];

const homepageAuditCatalog: Record<string, string[]> = {
  "/assets/hero/1759-exterior-current-hero.webp": ["CMS-controlled — Homepage Hero"],
  "/assets/brand/1759-empire-logo-transparent.png": ["Brand asset — Header Logo", "Brand asset — Footer Logo"],
};

function normalize(value?: string | null) {
  return value ? value.split("?")[0].replace(/\/+/g, "/").trim() : "";
}

function deriveAssetTitle(url: string, fallback: string) {
  const name = url.split("/").pop() || fallback;
  const clean = name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
  return clean.replace(/\b\w/g, (char) => char.toUpperCase());
}

function staticSection(url: string): MediaAssetSection {
  const path = url.toLowerCase();
  if (path.includes("/hero/")) return "hero";
  if (path.includes("/rooms/")) return "rooms";
  if (path.includes("/club-klass/") || path.includes("/nightlife/")) return "club";
  if (path.includes("/events/")) return "events";
  if (path.includes("/food/") || path.includes("/drinks/")) return "food";
  if (path.includes("/gallery/")) return "gallery";
  if (path.includes("/viewing-centre/") || path.includes("/venue/")) return "tv";
  if (path.includes("/braless/")) return "braless";
  if (path.includes("/brand/")) return "media";
  return "media";
}

function deriveHomepageUsage(item: LibraryItem, homepageHeroUrl?: string) {
  const candidates = [normalize(item.public_url), normalize(item.storage_path), normalize(homepageHeroUrl)].filter(Boolean);
  const usage = new Set<string>();
  for (const candidate of candidates) {
    homepageAuditCatalog[candidate]?.forEach((label) => usage.add(label));
  }
  if (normalize(item.public_url) === normalize(homepageHeroUrl) && item.section === "hero") usage.add("CMS-controlled — Homepage Hero");
  return Array.from(usage);
}

export default function AdminMediaLibrary({ initialMedia, staticImages = [], section, homepageHeroUrl }: Props) {
  const [media, setMedia] = useState<MediaAsset[]>(initialMedia);
  const [sectionFilter, setSectionFilter] = useState<string>(section || "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [previewItem, setPreviewItem] = useState<LibraryItem | null>(null);
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formAltText, setFormAltText] = useState("");
  const [formCaption, setFormCaption] = useState("");
  const [formSection, setFormSection] = useState<MediaAssetSection>("media");
  const [formPlatform, setFormPlatform] = useState("website");
  const [formContentType, setFormContentType] = useState("website_media");
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [formPublished, setFormPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const staticItems = useMemo<LibraryItem[]>(() => staticImages.map((url, index) => ({
    id: `static:${url}`, source: "static", section: staticSection(url), title: deriveAssetTitle(url, url), caption: "Production fallback. A published CMS image can replace this asset where the slot allows it.", alt_text: deriveAssetTitle(url, url), media_type: "image", public_url: url, storage_path: url.replace(/^\/assets\//, ""), is_published: true, display_order: index, platform: "website", content_type: "website_media", guidance: getMediaGuidance(staticSection(url), index),
  })), [staticImages]);

  const combined = useMemo<LibraryItem[]>(() => [
    ...media.map((item) => { const guidance = getMediaGuidance(item.section, item.display_order || 0); return { id: item.id, source: "database" as const, section: item.section, title: item.title || "Untitled asset", caption: `${item.caption || item.alt_text || "1759 Empire media asset"} Used: ${guidance.placement} Recommended: ${guidance.recommendedWidth} × ${guidance.recommendedHeight}px · ${guidance.aspectRatio}.`, alt_text: item.alt_text || item.title || "1759 Empire asset", media_type: item.media_type, public_url: item.public_url || "", storage_path: item.storage_path, is_published: Boolean(item.is_published), platform: item.platform, display_order: item.display_order, status: item.status ?? undefined, file_size: item.file_size, content_type: item.content_type, category: item.category, created_at: item.created_at, event_id: item.event_id, guidance }; }),
    ...staticItems,
  ], [media, staticItems]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return combined.filter((item) => {
      const sectionMatch = sectionFilter === "all" || item.section === sectionFilter;
      const statusMatch = statusFilter === "all" || (statusFilter === "published" ? item.is_published : !item.is_published);
      const platformMatch = platformFilter === "all" || item.platform === platformFilter;
      const sourceMatch = sourceFilter === "all" || item.source === sourceFilter;
      const searchMatch = !needle || [item.title, item.caption, item.alt_text, item.public_url, item.category, item.content_type].some((value) => String(value || "").toLowerCase().includes(needle));
      return sectionMatch && statusMatch && platformMatch && sourceMatch && searchMatch;
    });
  }, [combined, sectionFilter, statusFilter, platformFilter, sourceFilter, search]);

  const getUsageLabels = (item: LibraryItem) => deriveHomepageUsage(item, homepageHeroUrl);

  function openEdit(item: LibraryItem) {
    setEditingItem(item); setError(""); setFormTitle(item.title); setFormAltText(item.alt_text); setFormCaption(item.caption); setFormSection(item.section); setFormPlatform(item.platform || "website"); setFormContentType(item.content_type || "website_media"); setFormDisplayOrder(item.display_order || 0); setFormPublished(Boolean(item.is_published));
  }

  async function saveEdit() {
    if (!editingItem || editingItem.source !== "database") { setError("Only CMS-managed records can be edited here."); return; }
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/admin/media", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingItem.id, title: formTitle, alt_text: formAltText, caption: formCaption, section: formSection, platform: formPlatform, content_type: formContentType, display_order: Number(formDisplayOrder), is_featured: false, is_published: formPublished, status: formPublished ? "published" : "draft", event_id: null, publish_date: null }) });
      const json = await response.json() as { ok?: boolean; error?: string; data?: MediaAsset };
      if (!response.ok || !json.ok) { setError(json.error || "The media record could not be saved."); return; }
      if (json.data) setMedia((current) => current.map((item) => item.id === json.data!.id ? json.data! : item));
      setEditingItem(null);
    } catch { setError("The media record could not be saved."); } finally { setSaving(false); }
  }

  async function deleteAsset(item: LibraryItem) {
    if (item.source !== "database" || !item.storage_path) { setError("Built-in repository assets are not deleted from this desk."); return; }
    if (!window.confirm("Delete this CMS media asset?")) return;
    try {
      const response = await fetch("/api/admin/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id, path: item.storage_path }) });
      const json = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !json.ok) { setError(json.error || "The media asset could not be deleted."); return; }
      setMedia((current) => current.filter((entry) => entry.id !== item.id)); setPreviewItem(null);
    } catch { setError("The media asset could not be deleted."); }
  }

  return <>
    <section className="adminMediaDeskIntro"><div><span className="adminEyebrow">CONTENT OPERATIONS</span><h2>Know what is live before you replace it.</h2><p>CMS media, production assets and homepage audit information stay visibly separate. YouTube, Mixcloud, event and campaign content can use the same media record without creating a second content system.</p></div><div className="adminMediaDeskLegend"><span><i className="isCms" />CMS managed</span><span><i className="isBuilt" />Built-in</span><span><i className="isAudit" />Homepage audit</span></div></section>

    <section className="adminMediaLibraryToolbar">
      <div className="adminMediaFilterRow">{filterOrder.map((filter) => <button type="button" className={`adminMediaFilter ${sectionFilter === filter.key ? "active" : ""}`} key={filter.key} onClick={() => setSectionFilter(filter.key)}>{filter.label}</button>)}</div>
      <div className="adminMediaControls"><label className="adminMediaSearch"><span>Search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, caption, URL..." /></label><select value={platformFilter} onChange={(event) => setPlatformFilter(event.target.value)} aria-label="Filter by platform">{platformOptions.map((option) => <option key={option} value={option}>{option === "all" ? "All platforms" : option}</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">{statusOptions.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}</select><select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)} aria-label="Filter by source"><option value="all">All sources</option><option value="database">CMS managed</option><option value="static">Built-in</option></select></div>
      <div className="adminMediaLibraryStats"><span>{visible.length} visible</span><span>{media.length} CMS records</span><span>{staticItems.length} production assets</span></div>
    </section>

    {error && <section className="adminMediaError" role="alert"><span>{error}</span></section>}

    <section className="adminMediaLibraryGrid">
      {visible.length === 0 ? <article className="adminMediaEmptyState"><span className="adminMediaEmptyIcon">+</span><h3>No matching media</h3><p>Adjust the filters or upload the production asset you need.</p></article> : visible.map((item) => {
        const usage = getUsageLabels(item);
        return <article className="adminMediaCard" key={item.id}>
          <div className="adminMediaThumb">{item.public_url ? (item.media_type === "video" ? <video src={item.public_url} controls preload="metadata" /> : <img src={item.public_url} alt={item.alt_text || item.title} loading="lazy" />) : <div className="mediaFallback"><span className="mediaMark">1759</span><strong>Missing media source</strong></div>}<span className="adminMediaSectionBadge">{sectionLabels[item.section]}</span><span className={`adminMediaStatus ${item.is_published ? "published" : "draft"}`}>{item.is_published ? "Published" : "Draft"}</span></div>
          <div className="adminMediaCardBody"><div className="adminMediaCardTop"><span className="adminMediaType">{item.platform || "website"}</span><span className={`adminSourcePill ${item.source === "database" ? "cms" : "built"}`}>{item.source === "database" ? "CMS image" : "Production fallback"}</span></div><h3 className="adminMediaCardTitle">{item.title}</h3><p className="adminMediaCardDescription">{item.caption || item.alt_text || "1759 Empire media asset"}</p><div className="adminMediaCardMeta"><span className="adminMediaMetaItem"><span className="adminMediaMetaLabel">Placement</span><span className="adminMediaMetaValue">{item.guidance.placement}</span></span><span className="adminMediaMetaItem"><span className="adminMediaMetaLabel">Recommended</span><span className="adminMediaMetaValue">{item.guidance.recommendedWidth} × {item.guidance.recommendedHeight}px · {item.guidance.aspectRatio}</span></span><span className="adminMediaMetaItem"><span className="adminMediaMetaLabel">Homepage</span><span className="adminMediaMetaValue">{usage.length ? usage.join(" · ") : "Not currently mapped"}</span></span></div><div className="adminMediaActions"><button type="button" className="adminActionButton adminActionPreview" onClick={() => setPreviewItem(item)}>Preview</button>{item.source === "database" ? <><Link className="adminActionButton adminActionEdit" href={`/admin/media/upload?section=${item.section}&replaceId=${item.id}`}>Replace</Link><button type="button" className="adminActionButton adminActionEdit" onClick={() => openEdit(item)}>Edit</button><button type="button" className="adminActionButton adminActionDelete" onClick={() => deleteAsset(item)}>Delete</button></> : <Link className="adminActionButton adminActionEdit" href={`/admin/media/upload?section=${item.section}`}>Add replacement</Link>}</div></div>
        </article>;
      })}
    </section>

    {previewItem && <div className="adminMediaModalBackdrop" onClick={() => setPreviewItem(null)}><div className="adminMediaModal" onClick={(event) => event.stopPropagation()}><div className="adminMediaModalHead"><div><span className="adminEyebrow">{sectionLabels[previewItem.section]}</span><h2>{previewItem.title}</h2></div><button type="button" className="adminCloseButton" onClick={() => setPreviewItem(null)} aria-label="Close preview">×</button></div><div className="adminMediaPreviewFrame">{previewItem.public_url ? (previewItem.media_type === "video" ? <video src={previewItem.public_url} controls /> : <img src={previewItem.public_url} alt={previewItem.alt_text || previewItem.title} />) : <div className="mediaFallback"><span className="mediaMark">1759</span><strong>Missing media source</strong></div>}</div><div className="adminMediaPreviewDetails"><div><strong>Ownership</strong><span>{previewItem.source === "database" ? "CMS managed" : "Built-in production asset"}</span></div><div><strong>Homepage</strong><span>{getUsageLabels(previewItem).join("; ") || "Not currently mapped"}</span></div><div><strong>Platform</strong><span>{previewItem.platform || "website"}</span></div><div><strong>Content type</strong><span>{previewItem.content_type || "website_media"}</span></div><div><strong>Storage</strong><span>{previewItem.storage_path || previewItem.public_url || "—"}</span></div><div><strong>Alt text</strong><span>{previewItem.alt_text || "—"}</span></div></div><div className="adminMediaModalActions">{previewItem.source === "database" && <button type="button" className="adminPrimaryButton" onClick={() => { const item = previewItem; setPreviewItem(null); openEdit(item); }}>Edit record</button>}<button type="button" className="adminSecondaryButton" onClick={() => setPreviewItem(null)}>Close</button></div></div></div>}

    {editingItem && <div className="adminMediaModalBackdrop" onClick={() => setEditingItem(null)}><div className="adminMediaModal editModal" onClick={(event) => event.stopPropagation()}><div className="adminMediaModalHead"><div><span className="adminEyebrow">CMS MEDIA</span><h2>Edit record</h2></div><button type="button" className="adminCloseButton" onClick={() => setEditingItem(null)} aria-label="Close editor">×</button></div><div className="adminMediaFormGrid"><label className="adminField"><span>Title</span><input value={formTitle} onChange={(event) => setFormTitle(event.target.value)} /></label><label className="adminField"><span>Alt text</span><input value={formAltText} onChange={(event) => setFormAltText(event.target.value)} /></label><label className="adminField full"><span>Caption</span><textarea value={formCaption} onChange={(event) => setFormCaption(event.target.value)} /></label><label className="adminField"><span>Section</span><select value={formSection} onChange={(event) => setFormSection(event.target.value as MediaAssetSection)}>{Object.entries(sectionLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><label className="adminField"><span>Platform</span><select value={formPlatform} onChange={(event) => setFormPlatform(event.target.value)}>{platformOptions.filter((value) => value !== "all").map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label className="adminField"><span>Content type</span><input value={formContentType} onChange={(event) => setFormContentType(event.target.value)} /></label><label className="adminField"><span>Display order</span><input type="number" value={formDisplayOrder} onChange={(event) => setFormDisplayOrder(Number(event.target.value || 0))} /></label><label className="adminField"><span>Status</span><select value={formPublished ? "published" : "draft"} onChange={(event) => setFormPublished(event.target.value === "published")}><option value="published">Published</option><option value="draft">Draft</option></select></label></div>{error && <p className="adminMediaErrorText">{error}</p>}<div className="adminMediaModalActions"><button type="button" className="adminPrimaryButton" disabled={saving} onClick={saveEdit}>{saving ? "Saving…" : "Save changes"}</button><button type="button" className="adminSecondaryButton" onClick={() => setEditingItem(null)}>Cancel</button></div></div></div>}
  </>;
}
