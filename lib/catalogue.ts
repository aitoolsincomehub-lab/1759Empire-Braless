import { getSupabaseServer } from "@/lib/supabase/server";
import type { Event, MenuItem, Room, SiteSettings } from "@/types";

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
  hero_media_url: "",
  show_featured_event: true,
  show_events_section: true,
  show_rooms_section: true,
};
const localFeaturedEvent: Event = {
  id: "00000000-0000-4000-8000-000000000175",
  title: "SOUND — BEYOND THE BEAT",
  slug: "sound-beyond-the-beat",
  event_date: "2026-09-12",
  event_time: null,
  end_time: null,
  description: "SOUND — BEYOND THE BEAT at 1759 Empire.",
  short_description: "A night of sound, performance and atmosphere at 1759 Empire.",
  entry_price: 0,
  image_url: "/media_stills/sound-stage-01.jpg",
  gallery: ["/media_stills/sound-dj-01.jpg", "/media_stills/sound-interview-01.jpg"],
  video_url: null,
  is_published: true,
  is_featured: true,
  show_countdown: true,
  show_room_promotion: true,
  is_recurring: false,
  created_at: "2026-01-01T00:00:00.000Z",
  performers: ["Orisa King", "Abike Ilu", "Vicky Gey Guitarist", "Slatt Soundz", "Hypeman Sky"],
};

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

export async function getPublicCatalogue() {
  const supabase = await getSupabaseServer();
  if (!supabase) return { rooms: [] as Room[], menu: [] as MenuItem[], events: [localFeaturedEvent], settings: defaultSettings };
  const [roomsResult, menuResult, eventsResult, settingsResult] = await Promise.all([
    supabase.from("rooms").select("*").eq("is_active", true).order("created_at"),
    supabase.from("menu_items").select("*").eq("is_available", true).order("category").order("name"),
    supabase.from("events").select("*").eq("is_active", true).eq("is_published", true).order("event_date"),
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  return {
    rooms: (roomsResult.data || []) as Room[],
    menu: (menuResult.data || []) as MenuItem[],
    events: (eventsResult.data || []).map((event) => ({ ...event, event_date: resolveEventDate(event as Event) })) as Event[],
    settings: { ...defaultSettings, ...(settingsResult.data || {}) } as SiteSettings,
  };
}

export async function getPublicEvent(slug: string): Promise<Event | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return slug === localFeaturedEvent.slug ? localFeaturedEvent : null;
  const { data } = await supabase.from("events").select("*").eq("slug", slug).eq("is_active", true).eq("is_published", true).maybeSingle();
  return data ? { ...(data as Event), event_date: resolveEventDate(data as Event) } : null;
}
