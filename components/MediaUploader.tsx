"use client";

import { useEffect, useState } from "react";
import type { MediaAsset, MediaAssetSection } from "@/types";
import { getMediaGuidance } from "@/lib/media-guidance";

const sections = ["hero", "rooms", "club", "events", "food", "gallery", "venue", "braless", "media", "tv", "dj", "conversation", "fm"] as const;
type Section = typeof sections[number];

export default function MediaUploader({ initialSection = "hero", replaceId = "" }: { initialSection?: Section; replaceId?: string }) {
  const [section, setSection] = useState<Section>(initialSection);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  const [eventId, setEventId] = useState("");
  const [platform, setPlatform] = useState("website");
  const [contentType, setContentType] = useState("website_media");
  const [externalUrl, setExternalUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [campaignSlug, setCampaignSlug] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [socialCaption, setSocialCaption] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("0");
  const [status, setStatus] = useState("draft");
  const [displayOrder, setDisplayOrder] = useState("0");
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
  async function upload() { if (!file) { setMessage("Choose a file first."); return; } setSaving(true); setMessage(""); const body = new FormData(); body.append("file", file); body.append("section", section); body.append("altText", altText); body.append("title", title); body.append("category", category); body.append("caption", caption); if (replaceId) body.append("replaceId", replaceId); if (eventId.trim()) body.append("eventId", eventId.trim()); body.append("platform", platform); body.append("contentType", contentType); if (externalUrl.trim()) body.append("externalUrl", externalUrl.trim()); if (videoId.trim()) body.append("videoId", videoId.trim()); if (thumbnailUrl.trim()) body.append("thumbnailUrl", thumbnailUrl.trim()); if (campaignName.trim()) body.append("campaignName", campaignName.trim()); if (campaignSlug.trim()) body.append("campaignSlug", campaignSlug.trim()); if (publishDate.trim()) body.append("publishDate", publishDate.trim()); if (socialCaption.trim()) body.append("socialCaption", socialCaption.trim()); if (callToAction.trim()) body.append("callToAction", callToAction.trim()); if (hashtags.trim()) body.append("hashtags", hashtags.trim()); if (durationSeconds.trim()) body.append("durationSeconds", durationSeconds.trim()); body.append("status", status); if (displayOrder.trim()) body.append("displayOrder", displayOrder.trim()); try { const response = await fetch("/api/admin/media", { method: "POST", body }); const result = await response.json() as { ok: boolean; error?: string; optimized?: boolean; replaced?: boolean }; setMessage(result.ok ? (result.replaced ? "Image replaced and optimized for web." : result.optimized ? "Image uploaded and optimized for web." : "Media uploaded successfully.") : result.error || "We couldn't upload that media. Please try again."); if (result.ok) { setFile(null); setTitle(""); setCategory(""); setCaption(""); setAltText(""); setEventId(""); setExternalUrl(""); setVideoId(""); setThumbnailUrl(""); setCampaignName(""); setCampaignSlug(""); setPublishDate(""); setSocialCaption(""); setCallToAction(""); setHashtags(""); setDurationSeconds("0"); setStatus("draft"); setDisplayOrder("0"); await loadLibrary(); } } catch { setMessage("We couldn't upload that media. Please try again."); } finally { setSaving(false); } }
  async function remove(id: string, path: string) {
    if (!window.confirm("Remove this media item from the public media library?")) return;
    try {
      const response = await fetch("/api/admin/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, path }) });
      const result = await response.json() as { ok: boolean; error?: string };
      if (result.ok) await loadLibrary();
      setMessage(result.ok ? "Media removed." : result.error || "Media could not be removed.");
    } catch { setMessage("Media could not be removed."); }
  }
  const slot = getMediaGuidance(section);
  return <div className="mediaUploader"><div className="panelHeading"><h2>Media library</h2><span>Controlled uploads</span></div><p className="muted">Upload clear, confirmed 1759 content. The limits prevent the library becoming a social feed.</p><label>Section<select value={section} onChange={(event) => setSection(event.target.value as Section)}>{sections.map((value) => <option key={value}>{value}</option>)}</select></label><div className="uploadHelp"><strong>{slot.title}</strong><span><b>What this is for:</b> {slot.purpose}</span><span><b>Where it appears:</b> {slot.placement}</span><span><b>Best image:</b> {slot.bestImage}</span><span><b>Avoid:</b> {slot.avoid}</span><span><b>Recommended:</b> {slot.recommendedWidth} × {slot.recommendedHeight}px · {slot.aspectRatio} landscape</span><span><b>AI tip:</b> Need to resize or crop it? Ask AI first.</span></div><label>File<input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime" onChange={(event) => setFile(event.target.files?.[0] || null)} /></label><label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Optional title" /></label><label>Campaign name<input value={campaignName} onChange={(event) => setCampaignName(event.target.value)} placeholder="Campaign" /></label><label>Campaign slug<input value={campaignSlug} onChange={(event) => setCampaignSlug(event.target.value)} placeholder="content-slug" /></label><label>Publish date<input value={publishDate} onChange={(event) => setPublishDate(event.target.value)} placeholder="YYYY-MM-DD" /></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="draft">draft</option><option value="ready">ready</option><option value="published">published</option><option value="archived">archived</option></select></label><label>Category<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Section or campaign" /></label><label>Event ID<input value={eventId} onChange={(event) => setEventId(event.target.value)} placeholder="Optional event UUID" /></label><label>Content type<select value={contentType} onChange={(event) => setContentType(event.target.value)}><option value="website_media">website_media</option><option value="event_highlight">event_highlight</option><option value="event_teaser">event_teaser</option><option value="dj_clip">dj_clip</option><option value="interview_clip">interview_clip</option><option value="guest_reaction">guest_reaction</option><option value="food_clip">food_clip</option><option value="nightlife_clip">nightlife_clip</option><option value="behind_the_scenes">behind_the_scenes</option><option value="announcement">announcement</option><option value="countdown">countdown</option><option value="promotional_clip">promotional_clip</option><option value="event_recap">event_recap</option><option value="dj_set">dj_set</option><option value="podcast">podcast</option><option value="short">short</option><option value="event">event</option><option value="braless">braless</option><option value="dj_mix">dj_mix</option><option value="tv">tv</option><option value="conversation">conversation</option><option value="fm">fm</option></select></label><label>Platform<select value={platform} onChange={(event) => setPlatform(event.target.value)}><option value="website">website</option><option value="youtube">youtube</option><option value="mixcloud">mixcloud</option><option value="instagram">instagram</option><option value="tiktok">tiktok</option><option value="short_form">short_form</option></select></label><label>External URL<input value={externalUrl} onChange={(event) => setExternalUrl(event.target.value)} placeholder="Optional external URL" /></label><label>YouTube / video ID<input value={videoId} onChange={(event) => setVideoId(event.target.value)} placeholder="Optional video ID" /></label><label>Thumbnail URL<input value={thumbnailUrl} onChange={(event) => setThumbnailUrl(event.target.value)} placeholder="Optional thumbnail URL" /></label><label>CTA<input value={callToAction} onChange={(event) => setCallToAction(event.target.value)} placeholder="CTA" /></label><label>Social caption<textarea value={socialCaption} onChange={(event) => setSocialCaption(event.target.value)} placeholder="Social caption" /></label><label>Hashtags<input value={hashtags} onChange={(event) => setHashtags(event.target.value)} placeholder="#1759 #Empire" /></label><label>Duration seconds<input value={durationSeconds} onChange={(event) => setDurationSeconds(event.target.value)} placeholder="0" /></label><label>Display order<input value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} placeholder="0" /></label><label>Caption<textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Caption" /></label><label>Alt text<input value={altText} onChange={(event) => setAltText(event.target.value)} /></label>{message && <p className="formMessage">{message}</p>}<button className="button" onClick={upload} disabled={saving}>{saving ? "Uploading..." : "Upload media"}</button><div className="mediaLibrary"><div className="panelHeading"><h3>Library</h3><span>{items.length}</span></div>{items.length === 0 ? <p className="muted">No media here yet.</p> : <div className="mediaLibraryGrid">{items.map((item) => <div className="mediaLibraryItem" key={item.id}><img src={item.public_url} className="mediaThumb" alt={item.alt_text || item.caption} /><div><strong>{item.title || item.category || item.section}</strong><span>{item.section} · {item.media_type}</span><span>{new Date(item.created_at).toLocaleDateString("en-NG")}</span><button className="textButton dark" onClick={() => remove(item.id, item.storage_path)}>Delete</button></div></div>)}</div>}</div></div>;
}
