"use client";

import { useState } from "react";
import type { MediaAsset, MediaPost, MediaPostPlacement } from "@/types";

type PostKind = "photo" | "video" | "photo-video";
type Draft = {
  title: string;
  event_name: string;
  event_date: string;
  placement: MediaPostPlacement;
  description: string;
  cta_label: string;
  cta_url: string;
  published: boolean;
  kind: PostKind;
};

const emptyDraft: Draft = {
  title: "",
  event_name: "",
  event_date: "2026-09-26",
  placement: "featured",
  description: "",
  cta_label: "",
  cta_url: "",
  published: false,
  kind: "photo",
};

function assetFor(id: string | null, assets: MediaAsset[]) {
  return id ? assets.find((asset) => asset.id === id) || null : null;
}

function dateLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function friendlyUploadMessage(message: string) {
  if (/too large|100 mb/i.test(message)) return "This video is too large. Please choose a shorter video.";
  if (/format|mp4|webm|quicktime|supported/i.test(message)) return "This video format isn't supported. Please choose another video.";
  return "We couldn't upload this file. Please try again.";
}

export default function MediaPostDesk({ initialPosts, assets }: { initialPosts: MediaPost[]; assets: MediaAsset[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editing, setEditing] = useState<MediaPost | null>(null);
  const [showForm, setShowForm] = useState(initialPosts.length === 0);
  const [flyer, setFlyer] = useState<File | null>(null);
  const [shortVideo, setShortVideo] = useState<File | null>(null);
  const [removeFlyer, setRemoveFlyer] = useState(false);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [publishedMessage, setPublishedMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function startCreate() {
    setEditing(null);
    setShowForm(true);
    setDraft(emptyDraft);
    setFlyer(null);
    setShortVideo(null);
    setRemoveFlyer(false);
    setRemoveVideo(false);
    setShowMoreOptions(false);
    setPublishedMessage(false);
    setMessage("");
  }

  function startEdit(post: MediaPost) {
    setEditing(post);
    setShowForm(true);
    setDraft({
      title: post.title,
      event_name: post.event_name,
      event_date: post.event_date,
      placement: post.placement,
      description: post.description,
      cta_label: post.cta_label,
      cta_url: post.cta_url,
      published: post.published,
      kind: post.flyer_media_id && post.foreground_video_media_id ? "photo-video" : post.foreground_video_media_id ? "video" : "photo",
    });
    setFlyer(null);
    setShortVideo(null);
    setRemoveFlyer(false);
    setRemoveVideo(false);
    setShowMoreOptions(Boolean(post.cta_label || post.cta_url));
    setPublishedMessage(false);
    setMessage("");
  }

  function update(key: keyof Draft, value: string | boolean) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function upload(file: File, title: string, section: string, contentType: string, published: boolean) {
    const body = new FormData();
    body.append("file", file);
    body.append("section", section);
    body.append("title", title);
    body.append("altText", title);
    body.append("caption", title);
    body.append("contentType", contentType);
    body.append("status", published ? "published" : "draft");
    body.append("isPublished", String(published));
    const response = await fetch("/api/admin/media", { method: "POST", body });
    const result = await response.json() as { ok?: boolean; error?: string; data?: MediaAsset };
    if (!response.ok || !result.ok || !result.data) throw new Error(friendlyUploadMessage(result.error || ""));
    return result.data;
  }

  async function save(publishOverride?: boolean) {
    const published = publishOverride ?? draft.published;
    const title = draft.title.trim() || draft.event_name.trim();
    if (!title || !draft.event_name.trim() || !draft.event_date) {
      setMessage("Add the event name and event date.");
      return;
    }
    if (!editing && !flyer && !shortVideo) {
      setMessage("Please add a photo, flyer or short video.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const mediaIds = {
        flyer_media_id: removeFlyer ? null : editing?.flyer_media_id || null,
        foreground_video_media_id: removeVideo ? null : editing?.foreground_video_media_id || null,
        background_video_media_id: editing?.background_video_media_id || null,
      };
      if (flyer) mediaIds.flyer_media_id = (await upload(flyer, title, draft.placement === "featured" ? "braless" : "events", "event", published)).id;
      if (shortVideo) mediaIds.foreground_video_media_id = (await upload(shortVideo, title, "media", "short", published)).id;
      const payload = { ...draft, title, published, ...mediaIds };
      const response = await fetch("/api/admin/media-posts", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...payload, id: editing.id } : payload),
      });
      const result = await response.json() as { ok?: boolean; error?: string; data?: MediaPost };
      if (!response.ok || !result.ok || !result.data) throw new Error(result.error || "We couldn't save this post. Please try again.");
      const saved = result.data;
      setPosts((current) => editing ? current.map((post) => post.id === saved.id ? { ...post, ...saved, ...mediaIds } : post) : [...current, { ...saved, ...mediaIds }]);
      setEditing(null);
      setShowForm(false);
      setPublishedMessage(published);
      setMessage(published ? "POST PUBLISHED" : "Post saved as a draft.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We couldn't save this post. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(post: MediaPost) {
    const response = await fetch("/api/admin/media-posts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id, published: !post.published }) });
    const result = await response.json() as { ok?: boolean };
    if (result.ok) setPosts((current) => current.map((item) => item.id === post.id ? { ...item, published: !post.published } : item));
  }

  async function remove(post: MediaPost) {
    if (!window.confirm(`Delete ${post.title}?`)) return;
    const response = await fetch("/api/admin/media-posts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id }) });
    const result = await response.json() as { ok?: boolean };
    if (result.ok) setPosts((current) => current.filter((item) => item.id !== post.id));
  }

  return <div className="mediaPostDesk">
    <div className="mediaPostIntro"><div><span className="adminEyebrow">1759 MEDIA</span><h2>Share the night.</h2><p>Create a simple event post for the homepage or Events page.</p></div><button className="adminPrimaryButton" type="button" onClick={startCreate}>+ Create Event Post</button></div>
    {publishedMessage && <section className="mediaPostSuccess"><strong>POST PUBLISHED</strong><span>Your post is now live on the website.</span><div><a className="adminPrimaryButton" href="/" target="_blank" rel="noreferrer">View website</a><button className="adminSecondaryButton" type="button" onClick={startCreate}>Create another post</button></div></section>}
    {showForm && <section className="mediaPostForm">
      <div className="mediaPostFormHead"><div><span className="adminEyebrow">{editing ? "EDIT EVENT POST" : "CREATE EVENT POST"}</span><h3>{editing ? "Update your post" : "Create Event Post"}</h3></div>{editing && <button className="adminSecondaryButton" type="button" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>}</div>
      <fieldset className="mediaPostChoices"><legend>WHAT ARE YOU POSTING?</legend><button type="button" className={draft.kind === "photo" ? "selected" : ""} onClick={() => update("kind", "photo")}><strong>📸 Photo / Flyer</strong><span>Upload a flyer or event photo</span></button><button type="button" className={draft.kind === "video" ? "selected" : ""} onClick={() => update("kind", "video")}><strong>🎬 Short Video</strong><span>Upload a short video from your phone</span></button><button type="button" className={draft.kind === "photo-video" ? "selected" : ""} onClick={() => update("kind", "photo-video")}><strong>✨ Photo + Video</strong><span>Use a flyer or photo with a short video</span></button></fieldset>
      <div className="mediaPostFields"><label>Event name<input value={draft.event_name} onChange={(event) => update("event_name", event.target.value)} placeholder="What is the event called?" /></label><label>Event date<input type="date" value={draft.event_date} onChange={(event) => update("event_date", event.target.value)} /></label><label className="wide">Caption<textarea value={draft.description} onChange={(event) => update("description", event.target.value)} placeholder="Tell guests what they need to know (optional)" /></label><label className="wide">Headline (optional)<input value={draft.title} onChange={(event) => update("title", event.target.value)} placeholder="Uses the event name if left blank" /></label><label>Where should this appear?<select value={draft.placement} onChange={(event) => update("placement", event.target.value as MediaPostPlacement)}><option value="featured">Homepage</option><option value="weekly">Events page</option></select></label>{(draft.kind === "photo" || draft.kind === "photo-video") && <label className="mediaFileField">Upload Photo or Flyer<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setFlyer(event.target.files?.[0] || null); setRemoveFlyer(false); }} /><small>{editing?.flyer_media_id ? "Choose a new file to replace the current photo." : "JPG, PNG or WebP"}</small></label>}{(draft.kind === "video" || draft.kind === "photo-video") && <label className="mediaFileField">Upload Short Video<input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => { setShortVideo(event.target.files?.[0] || null); setRemoveVideo(false); }} /><small>You can upload a video directly from your phone.</small></label>}{editing?.flyer_media_id && <button type="button" className="mediaRemoveButton" onClick={() => setRemoveFlyer((current) => !current)}>{removeFlyer ? "Keep current photo" : "Remove current photo"}</button>}{editing?.foreground_video_media_id && <button type="button" className="mediaRemoveButton" onClick={() => setRemoveVideo((current) => !current)}>{removeVideo ? "Keep current video" : "Remove current video"}</button>}</div>
      <details className="mediaMoreOptions" open={showMoreOptions} onToggle={(event) => setShowMoreOptions(event.currentTarget.open)}><summary>More options</summary><div><label>Button text (optional)<input value={draft.cta_label} onChange={(event) => update("cta_label", event.target.value)} placeholder="Make an enquiry" /></label><label>Button link (optional)<input value={draft.cta_url} onChange={(event) => update("cta_url", event.target.value)} placeholder="https://wa.me/..." /></label></div></details>
      {message && <p className="adminFormMessage" role="alert">{message}</p>}<div className="mediaPostPublishActions"><button className="adminPrimaryButton" type="button" disabled={saving} onClick={() => void save(true)}>{saving ? "Publishing..." : "PUBLISH POST"}</button><button className="adminSecondaryButton" type="button" disabled={saving} onClick={() => void save(false)}>{editing ? "Save as draft" : "Save draft"}</button></div>
    </section>}
    {message && !editing && posts.length > 0 && !publishedMessage && <p className="adminFormMessage">{message}</p>}
    <section className="mediaPostList">{posts.length === 0 ? <p className="mediaPostEmpty">No event posts yet.</p> : posts.map((post) => { const flyerAsset = assetFor(post.flyer_media_id, assets); const videoAsset = assetFor(post.foreground_video_media_id, assets); return <article className={`mediaPostRow ${post.placement}`} key={post.id}><div className="mediaPostThumb">{flyerAsset?.public_url ? <img src={flyerAsset.public_url} alt={post.title} /> : videoAsset?.public_url ? <video src={videoAsset.public_url} muted /> : <span>1759</span>}</div><div className="mediaPostRowCopy"><div className="mediaPostMeta"><span>{post.event_name}</span><span className={post.published ? "isPublished" : "isDraft"}>{post.published ? "Published" : "Draft"}</span></div><h3>{post.title}</h3><p>{dateLabel(post.event_date)}</p><small>{[flyerAsset && "Photo", videoAsset && "Video"].filter(Boolean).join(" + ") || "No media yet"}</small></div><div className="mediaPostActions"><button type="button" onClick={() => startEdit(post)}>Edit</button><button type="button" onClick={() => toggle(post)}>{post.published ? "Unpublish" : "Publish"}</button><button type="button" onClick={() => remove(post)}>Delete</button></div></article>; })}</section>
  </div>;
}
