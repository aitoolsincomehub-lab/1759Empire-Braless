export type BookingStatus = "pending" | "confirmed" | "cancelled" | "checked_in" | "checked_out";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";
export type EnquiryStatus = "new" | "contacted" | "in_progress" | "resolved" | "cancelled";
export type EventStatus = "draft" | "published" | "live" | "completed" | "cancelled";
export type SourceType = "website" | "event" | "whatsapp" | "social" | "referral" | "direct";

export interface Attribution {
  source: string;
  source_type: SourceType;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_per_night: number;
  total_units: number;
  amenities: string[];
  images: string[];
  is_active: boolean;
}

export interface Booking {
  id: string;
  reference: string;
  room_id: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  guests: number;
  check_in: string;
  check_out: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  amount: number;
  notes: string;
  source: string;
  source_type: SourceType;
  event_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  category: string;
  category_id?: string | null;
  name: string;
  description: string;
  price: number;
  currency?: string;
  image_url: string | null;
  is_available: boolean;
  featured?: boolean;
  sort_order?: number;
  created_at: string;
}

export interface PerformerSocial {
  name: string;
  instagram?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  mixcloud?: string | null;
  website?: string | null;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  event_time: string | null;
  end_time: string | null;
  description: string;
  short_description: string;
  entry_price: number;
  image_url: string | null;
  gallery: string[];
  video_url: string | null;
  is_active?: boolean;
  is_published: boolean;
  is_featured: boolean;
  show_countdown: boolean;
  show_room_promotion: boolean;
  is_recurring: boolean;
  status?: EventStatus;
  location?: string | null;
  livestream_url?: string | null;
  live_title?: string | null;
  live_description?: string | null;
  live_cta?: string | null;
  replay_url?: string | null;
  stream_platform?: string | null;
  stream_url?: string | null;
  stream_status?: string | null;
  stream_title?: string | null;
  stream_description?: string | null;
  poster_image?: string | null;
  is_live?: boolean;
  created_at: string;
  performers?: string[];
  performer_socials?: PerformerSocial[];
}

export interface EventReservation {
  id: string;
  event_id: string;
  guest_name: string;
  phone: string;
  email: string | null;
  people: number;
  reservation_type: string;
  message: string;
  source: string;
  source_type: SourceType;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  amount: number;
  status: EnquiryStatus;
  created_at: string;
}

export interface GeneralEnquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  source: string;
  source_type: SourceType;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  created_at: string;
}

export type MediaAssetSection = "hero" | "rooms" | "club" | "events" | "food" | "gallery" | "venue" | "braless" | "media" | "tv" | "dj" | "conversation" | "fm";
export type MediaPlatform = "website" | "youtube" | "mixcloud" | "instagram" | "tiktok" | "short_form";
export type MediaContentType = "website_media" | "event_highlight" | "event_teaser" | "dj_clip" | "interview_clip" | "guest_reaction" | "food_clip" | "nightlife_clip" | "behind_the_scenes" | "announcement" | "countdown" | "promotional_clip" | "event_recap" | "dj_set" | "podcast" | "short" | "event" | "braless" | "dj_mix" | "tv" | "conversation" | "fm";
export type MediaCampaignStatus = "draft" | "ready" | "published" | "archived";

export interface MediaAsset {
  id: string;
  section: MediaAssetSection;
  title?: string;
  category?: string;
  platform?: MediaPlatform;
  content_type?: MediaContentType;
  external_url?: string | null;
  video_id?: string | null;
  thumbnail_url?: string | null;
  storage_path: string;
  public_url: string;
  media_type: "image" | "video";
  alt_text: string;
  caption: string;
  event_id?: string | null;
  campaign_name?: string | null;
  campaign_slug?: string | null;
  publish_date?: string | null;
  social_caption?: string | null;
  call_to_action?: string | null;
  hashtags?: string | null;
  duration_seconds?: number | null;
  status?: MediaCampaignStatus | null;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  file_size: number;
  created_at: string;
}

export interface SiteSettings {
  business_name: string;
  address: string;
  phone: string;
  whatsapp_number: string;
  email: string;
  google_maps_url: string;
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  opening_hours: string;
  club_hours: string;
  booking_contact: string;
  event_enquiry_contact: string;
  hero_headline: string;
  hero_subheadline: string;
  hero_primary_cta: string;
  hero_secondary_cta: string;
  club_description: string;
  dine_description: string;
  lounge_description: string;
  contact_cta: string;
  hero_media_url: string;
  show_featured_event: boolean;
  show_events_section: boolean;
  show_rooms_section: boolean;
}

export interface BookingRequest {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  notes?: string;
  attribution?: Attribution;
  eventId?: string;
}

export interface EventEnquiryRequest extends Attribution {
  eventId: string;
  guestName: string;
  phone: string;
  email?: string;
  people: number;
  enquiryType: "table" | "general" | "vip" | "birthday" | "other";
  message?: string;
}

export interface ActionResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

export interface DashboardStats {
  todayBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  activeRooms: number;
  upcomingEvents: number;
}
