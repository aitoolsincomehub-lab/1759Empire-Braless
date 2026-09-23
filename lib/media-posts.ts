import { getSupabaseServer } from "@/lib/supabase/server";
import type { MediaAsset, MediaPost } from "@/types";

function getWhatsAppUrl() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const cleanNumber = number.replace(/\D/g, "");

  if (!cleanNumber) {
    return "";
  }

  return `https://wa.me/${cleanNumber}`;
}

function buildCampaign(
  flyer: MediaAsset,
  foregroundVideo: MediaAsset | null,
): MediaPost {
  const whatsappUrl = getWhatsAppUrl();

  return {
    id: `braless-anniversary-${flyer.id}`,
    title: "BRALESS",
    tagline: "ONE YEAR. ONE NIGHT.",
    event_name: "BRALESS",
    event_date: "2026-09-26",
    start_time: "22:00:00",
    end_time: null,
    venue: "1759 Empire Lounge",
    location: "Akute, Lagos",
    placement: "featured",

    flyer_media_id: flyer.id,
    foreground_video_media_id: foregroundVideo?.id || null,
    background_video_media_id: null,

    description:
      "September 26, 2026 · 10 PM — Late · 1759 Empire Lounge",

    cta_label: "WHATSAPP TO RESERVE",
    cta_url: whatsappUrl,

    published: true,
    sort_order: 0,

    created_at: flyer.created_at,
    updated_at: flyer.created_at,

    flyer,
    foreground_video: foregroundVideo,
    background_video: null,
  };
}

export async function getPublicMediaPosts() {
  const supabase = await getSupabaseServer();

  if (!supabase) {
    return {
      featured: null as MediaPost | null,
      weekly: [] as MediaPost[],
      videos: [] as MediaAsset[],
    };
  }

  const { data, error } = await supabase
    .from("media_assets")
    .select("*")
    .eq("section", "braless")
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return {
      featured: null as MediaPost | null,
      weekly: [] as MediaPost[],
      videos: [] as MediaAsset[],
    };
  }

  const assets = data as MediaAsset[];

  const flyer =
    assets.find((asset) => asset.media_type === "image") || null;

  const videos = assets.filter(
    (asset) => asset.media_type === "video",
  );

  const featured = flyer
    ? buildCampaign(flyer, videos[0] || null)
    : null;

  return {
    featured,
    weekly: [] as MediaPost[],
    videos,
  };
}

/*
 * Kept as a compatibility export for any old admin import.
 *
 * The Braless public page does not use a media_posts table.
 * The current project uses media_assets directly.
 *
 * Do not reintroduce a media_posts table just to satisfy this
 * compatibility function.
 */
export async function getAdminMediaPosts() {
  return [] as MediaPost[];
}