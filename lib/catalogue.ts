import { getSupabaseServer } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Event, MediaAsset, MenuCategory, MenuItem, Room, SiteSettings } from "@/types";

export const defaultSettings: SiteSettings = {
  business_name: "1759 Empire Lounge, Hotel & Suites",
  address: "197 Ajuwon-Akute Road, Ile-Ise Bus Stop, Akute, Lagos",
  phone: "",
  whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  email: "",
  google_maps_url: "",
  instagram_url: "",
  tiktok_url: "",
  facebook_url: "",
  opening_hours: "Open daily",
  club_hours: "",
  booking_contact: "",
  event_enquiry_contact: "",
  hero_headline: "Stay here. Live the night.",
  hero_subheadline: "Hotel stays, food, drinks, nightlife and events at 1759 Empire.",
  hero_primary_cta: "Book a Room",
  hero_secondary_cta: "Discover Club Klass",
  club_description: "Music, tables, drinks, people and the late-night energy of Akute.",
  dine_description: "Food for the table. Energy for the night.",
  lounge_description: "A social destination for good food, drinks, football and the big moments.",
  contact_cta: "Ready to stay, dine or celebrate?",
  hero_media_url: "/assets/hero/1759-exterior-current-hero.webp",
  show_featured_event: true,
  show_events_section: true,
  show_rooms_section: true,
};
export function isApprovedPublicAsset(url?: string | null) {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("data:")) return false;
  if (trimmed.startsWith("/assets/visual-assets/") || trimmed.startsWith("/media_stills/")) return false;
  if (trimmed.startsWith("/assets/")) return true;

  try {
    const parsed = new URL(trimmed);
    if (!["http:", "https:"].includes(parsed.protocol)) return false;
    const pathname = parsed.pathname.toLowerCase();
    return !pathname.includes("/media_stills/") && !pathname.includes("/assets/visual-assets/");
  } catch {
    return false;
  }
}

export function nextLastSaturday(from = new Date()) {
  const candidate = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1));
  candidate.setUTCMonth(candidate.getUTCMonth() + 1, 0);
  candidate.setUTCHours(0, 0, 0, 0);
  while (candidate.getUTCDay() !== 6) candidate.setUTCDate(candidate.getUTCDate() - 1);
  if (candidate.getTime() < from.getTime()) return nextLastSaturday(new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1)));
  return candidate.toISOString().slice(0, 10);
}

export function resolveEventDate(event: Event) {
  return event.is_recurring && event.title.trim().toLowerCase() === "braless party" ? nextLastSaturday() : event.event_date;
}

export function findBralessEvent(events: Event[]) {
  return events.find((event) => {
    const title = event.title.toLowerCase();
    const slug = event.slug.toLowerCase();
    return title.includes("braless") || slug.includes("braless") || (event.is_recurring && title.includes("party"));
  }) || null;
}

async function readCatalogue(client: SupabaseClient) {
  return Promise.all([
    client.from("rooms").select("*").eq("is_active", true).order("created_at"),
    client.from("menu_items").select("*").eq("is_available", true).order("category").order("name"),
    client.from("menu_categories").select("*").eq("is_active", true).order("sort_order", { ascending: true }),
    client.from("events").select("*").eq("is_active", true).eq("is_published", true).order("event_date"),
    client.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    client.from("media_assets").select("*").eq("is_published", true).order("display_order", { ascending: true }).order("created_at", { ascending: false }),
  ]);
}

export async function getPublicCatalogue() {
  const supabase = await getSupabaseServer();
  if (!supabase) return { rooms: [] as Room[], menu: [] as MenuItem[], categories: [] as MenuCategory[], events: [] as Event[], settings: defaultSettings, media: [] as MediaAsset[] };
  let [roomsResult, menuResult, categoriesResult, eventsResult, settingsResult, mediaResult] = await readCatalogue(supabase);
  if ([roomsResult, menuResult, categoriesResult, eventsResult, settingsResult, mediaResult].some((result) => result.error)) {
    const admin = getSupabaseAdmin();
    if (admin) [roomsResult, menuResult, categoriesResult, eventsResult, settingsResult, mediaResult] = await readCatalogue(admin);
  }

  const normalizedSettings = settingsResult.data
    ? Object.fromEntries(
        Object.entries(settingsResult.data).filter(([, value]) => value !== null && value !== "" && value !== undefined)
      )
    : {};

  return {
    rooms: (roomsResult.data || []) as Room[],
    menu: (menuResult.data || []) as MenuItem[],
    categories: (categoriesResult.data || []) as MenuCategory[],
    events: (eventsResult.data || []).map((event) => ({ ...event, event_date: resolveEventDate(event as Event) })) as Event[],
    settings: { ...defaultSettings, ...normalizedSettings } as SiteSettings,
    media: (mediaResult.data || []) as MediaAsset[],
  };
}

export async function getPublicEvent(slug: string): Promise<Event | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase.from("events").select("*").eq("slug", slug).eq("is_active", true).eq("is_published", true).maybeSingle();
  return data ? { ...(data as Event), event_date: resolveEventDate(data as Event) } : null;
}
