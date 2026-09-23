-- 1759 Empire: simple production-ready foundation
create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false) $$;

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text default '',
  price_per_night numeric(12,2) not null default 0,
  total_units integer not null default 1 check (total_units > 0),
  amenities jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default ('1759-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  room_id uuid references rooms(id) on delete restrict,
  guest_name text not null,
  guest_phone text not null,
  guest_email text,
  guests integer not null default 1 check (guests between 1 and 2),
  check_in date not null,
  check_out date not null,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','checked_in','checked_out')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','partial','paid','refunded')),
  amount numeric(12,2) not null default 0,
  notes text default '',
  source text not null default 'Website',
  source_type text not null default 'website' check (source_type in ('website','event','whatsapp','social','referral','direct')),
  event_id uuid,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  created_at timestamptz not null default now(),
  check (check_out > check_in)
);

create index if not exists bookings_room_dates_idx on bookings(room_id, check_in, check_out);
create index if not exists bookings_status_idx on bookings(status);

create table if not exists menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  category_id uuid references menu_categories(id) on delete set null,
  name text not null,
  description text default '',
  price numeric(12,2) not null default 0,
  currency text not null default 'NGN',
  image_url text,
  is_available boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  description text default '',
  entry_price numeric(12,2) default 0,
  image_url text,
  slug text unique,
  event_time time,
  end_time time,
  short_description text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  performers jsonb not null default '[]'::jsonb,
  performer_socials jsonb not null default '[]'::jsonb,
  video_url text,
  location text,
  status text not null default 'draft' check (status in ('draft','published','live','completed','cancelled')),
  livestream_url text,
  live_title text,
  live_description text,
  live_cta text,
  replay_url text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  show_countdown boolean not null default false,
  show_room_promotion boolean not null default true,
  is_published boolean not null default true,
  is_recurring boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists event_reservations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  guest_name text not null,
  phone text not null,
  email text,
  people integer not null default 1 check (people > 0),
  reservation_type text not null default 'general',
  message text not null default '',
  source text not null default 'Website',
  source_type text not null default 'event' check (source_type in ('website','event','whatsapp','social','referral','direct')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  amount numeric(12,2) not null default 0,
  status text not null default 'new' check (status in ('new','contacted','in_progress','resolved','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists general_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text not null,
  source text not null default 'Website',
  source_type text not null default 'website' check (source_type in ('website','event','whatsapp','social','referral','direct')),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  created_at timestamptz not null default now()
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('hero','rooms','club','events','food','gallery','venue','braless','media','tv','dj','conversation','fm')),
  title text not null default '',
  category text not null default '',
  platform text not null default 'website' check (platform in ('website','youtube','mixcloud','instagram','tiktok','short_form')),
  content_type text not null default 'website_media' check (content_type in ('website_media','event_highlight','event_teaser','dj_clip','interview_clip','guest_reaction','food_clip','nightlife_clip','behind_the_scenes','announcement','countdown','promotional_clip','event_recap','dj_set','podcast','short','event','braless','dj_mix','tv','conversation','fm')),
  external_url text not null default '',
  video_id text not null default '',
  thumbnail_url text not null default '',
  event_id uuid references events(id) on delete set null,
  campaign_name text not null default '',
  campaign_slug text not null default '',
  publish_date date,
  social_caption text not null default '',
  call_to_action text not null default '',
  hashtags text not null default '',
  duration_seconds integer,
  status text not null default 'draft' check (status in ('draft','ready','published','archived')),
  storage_path text not null unique,
  public_url text not null,
  media_type text not null check (media_type in ('image','video')),
  alt_text text not null default '',
  caption text not null default '',
  is_featured boolean not null default false,
  is_published boolean not null default true,
  display_order integer not null default 0,
  file_size bigint not null check (file_size > 0),
  created_at timestamptz not null default now()
);

alter table events add column if not exists slug text;
alter table events add column if not exists event_time time;
alter table events add column if not exists end_time time;
alter table events add column if not exists short_description text not null default '';
alter table events add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table events add column if not exists performers jsonb not null default '[]'::jsonb;
alter table events add column if not exists video_url text;
alter table events add column if not exists is_featured boolean not null default false;
alter table events add column if not exists show_countdown boolean not null default false;
alter table events add column if not exists show_room_promotion boolean not null default true;
alter table events add column if not exists is_published boolean not null default true;
alter table events add column if not exists is_recurring boolean not null default false;
alter table events add column if not exists stream_platform text not null default 'youtube';
alter table events add column if not exists stream_url text not null default '';
alter table events add column if not exists stream_status text not null default 'coming_soon';
alter table events add column if not exists stream_title text not null default '';
alter table events add column if not exists stream_description text not null default '';
alter table events add column if not exists poster_image text not null default '';
alter table events add column if not exists is_live boolean not null default false;
create unique index if not exists events_slug_idx on events(slug) where slug is not null;

alter table bookings add column if not exists reference text;
update bookings set reference = '1759-' || upper(substr(replace(id::text, '-', ''), 1, 8)) where reference is null;
alter table bookings alter column reference set default ('1759-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)));
alter table bookings alter column reference set not null;
alter table bookings add column if not exists source text not null default 'Website';
alter table bookings add column if not exists source_type text not null default 'website';
alter table bookings add column if not exists event_id uuid references events(id) on delete set null;
alter table bookings add column if not exists utm_source text;
alter table bookings add column if not exists utm_medium text;
alter table bookings add column if not exists utm_campaign text;
alter table bookings add column if not exists utm_content text;
create unique index if not exists bookings_reference_idx on bookings(reference);

alter table event_reservations add column if not exists email text;
alter table event_reservations add column if not exists people integer not null default 1;
alter table event_reservations add column if not exists message text not null default '';
alter table event_reservations add column if not exists source text not null default 'Website';
alter table event_reservations add column if not exists source_type text not null default 'event';
alter table event_reservations add column if not exists utm_source text;
alter table event_reservations add column if not exists utm_medium text;
alter table event_reservations add column if not exists utm_campaign text;
alter table event_reservations add column if not exists utm_content text;

alter table general_enquiries enable row level security;

alter table media_assets add column if not exists caption text not null default '';
alter table media_assets add column if not exists is_featured boolean not null default false;
alter table media_assets add column if not exists is_published boolean not null default true;
alter table media_assets add column if not exists display_order integer not null default 0;
alter table media_assets add column if not exists campaign_name text not null default '';
alter table media_assets add column if not exists campaign_slug text not null default '';
alter table media_assets add column if not exists publish_date date;
alter table media_assets add column if not exists social_caption text not null default '';
alter table media_assets add column if not exists call_to_action text not null default '';
alter table media_assets add column if not exists hashtags text not null default '';
alter table media_assets add column if not exists duration_seconds integer;
alter table media_assets add column if not exists status text not null default 'draft' check (status in ('draft','ready','published','archived'));

create table if not exists site_settings (
  id integer primary key default 1 check (id = 1),
  business_name text not null default '1759 Empire Lounge, Hotel & Suites',
  address text not null default '', phone text not null default '', whatsapp_number text not null default '',
  email text not null default '', google_maps_url text not null default '', instagram_url text not null default '',
  tiktok_url text not null default '', facebook_url text not null default '', opening_hours text not null default '',
  club_hours text not null default '', booking_contact text not null default '', event_enquiry_contact text not null default '',
  hero_headline text not null default 'Stay here. Live the night.', hero_subheadline text not null default '',
  hero_primary_cta text not null default 'Book a Room', hero_secondary_cta text not null default 'Discover Club Klass',
  club_description text not null default '', dine_description text not null default '', lounge_description text not null default '',
  contact_cta text not null default '',
  hero_media_url text not null default '',
  show_featured_event boolean not null default true,
  show_events_section boolean not null default true,
  show_rooms_section boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into site_settings (id) values (1) on conflict (id) do nothing;
alter table site_settings enable row level security;

alter table rooms enable row level security;
alter table bookings enable row level security;
alter table menu_items enable row level security;
alter table events enable row level security;
alter table event_reservations enable row level security;
alter table media_assets enable row level security;

drop policy if exists "public read active rooms" on rooms;
drop policy if exists "public read available menu" on menu_items;
drop policy if exists "public read active events" on events;
drop policy if exists "admins manage rooms" on rooms;
drop policy if exists "admins manage bookings" on bookings;
drop policy if exists "admins manage menu" on menu_items;
drop policy if exists "admins manage events" on events;
drop policy if exists "admins manage event reservations" on event_reservations;
drop policy if exists "admins read general enquiries" on general_enquiries;
drop policy if exists "public read media" on media_assets;
drop policy if exists "admins manage media" on media_assets;
drop policy if exists "public read site settings" on site_settings;
drop policy if exists "admins manage site settings" on site_settings;

create policy "public read active rooms" on rooms for select using (is_active = true);
create policy "public read available menu" on menu_items for select using (is_available = true);
create policy "public read active events" on events for select using (is_active = true);
create policy "public read site settings" on site_settings for select using (true);
create policy "admins manage site settings" on site_settings for all using (public.is_admin()) with check (public.is_admin());


insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('hotel-images', 'hotel-images', true, 104857600, array['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "public read hotel media" on storage.objects;
drop policy if exists "admins upload hotel media" on storage.objects;
drop policy if exists "admins delete hotel media" on storage.objects;
create policy "public read hotel media" on storage.objects for select using (bucket_id = 'hotel-images');
create policy "admins upload hotel media" on storage.objects for insert with check (bucket_id = 'hotel-images' and public.is_admin());
create policy "admins delete hotel media" on storage.objects for delete using (bucket_id = 'hotel-images' and public.is_admin());
create policy "admins manage rooms" on rooms for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage bookings" on bookings for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage menu" on menu_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage events" on events for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage event reservations" on event_reservations for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read general enquiries" on general_enquiries for select using (public.is_admin());
create policy "public read media" on media_assets for select using (true);
create policy "admins manage media" on media_assets for all using (public.is_admin()) with check (public.is_admin());

create index if not exists bookings_check_in_idx on bookings(check_in);
create index if not exists events_date_idx on events(event_date) where is_active = true;
create index if not exists media_section_idx on media_assets(section);
create index if not exists general_enquiries_created_at_idx on general_enquiries(created_at desc);

create or replace function public.create_booking_request(
  p_room_id uuid, p_guest_name text, p_guest_phone text, p_guest_email text,
  p_guests integer, p_check_in date, p_check_out date, p_notes text
) returns bookings language plpgsql security definer set search_path = public
as $$
declare
  selected_room rooms%rowtype;
  active_count integer;
  created_booking bookings%rowtype;
begin
  if p_check_out <= p_check_in or p_check_in < current_date then raise exception 'INVALID_DATES'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 1759));
  select * into selected_room from rooms where id = p_room_id and is_active = true;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  select count(*) into active_count from bookings
    where room_id = p_room_id and status in ('pending','confirmed','checked_in')
      and check_in < p_check_out and check_out > p_check_in;
  if active_count >= selected_room.total_units then raise exception 'ROOM_UNAVAILABLE'; end if;
  insert into bookings(room_id, guest_name, guest_phone, guest_email, guests, check_in, check_out, amount, notes)
    values (selected_room.id, left(trim(p_guest_name), 100), left(trim(p_guest_phone), 40), nullif(left(trim(p_guest_email), 254), ''), p_guests, p_check_in, p_check_out, selected_room.price_per_night * (p_check_out - p_check_in), left(coalesce(p_notes, ''), 500))
    returning * into created_booking;
  return created_booking;
end; $$;

create or replace function public.get_available_rooms(p_check_in date, p_check_out date)
returns setof rooms language sql security definer set search_path = public
as $$
  select r.* from rooms r
  where r.is_active = true and p_check_out > p_check_in
    and (select count(*) from bookings b where b.room_id = r.id
      and b.status in ('pending','confirmed','checked_in')
      and b.check_in < p_check_out and b.check_out > p_check_in) < r.total_units
  order by r.created_at;
$$;

create or replace function public.admin_update_booking_status(p_booking_id uuid, p_status text, p_payment_status text default null, p_notes text default null)
returns bookings language plpgsql security invoker set search_path = public
as $$
declare
  current_booking bookings%rowtype;
  selected_room rooms%rowtype;
  active_count integer;
begin
  if not public.is_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if p_status not in ('pending','confirmed','cancelled','checked_in','checked_out') then raise exception 'INVALID_STATUS'; end if;
  if p_payment_status is not null and p_payment_status not in ('unpaid','partial','paid','refunded') then raise exception 'INVALID_PAYMENT_STATUS'; end if;
  select * into current_booking from bookings where id = p_booking_id;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
  if p_status in ('pending','confirmed','checked_in') then
    perform pg_advisory_xact_lock(hashtextextended(current_booking.room_id::text, 1759));
    select * into selected_room from rooms where id = current_booking.room_id;
    if not found then raise exception 'ROOM_NOT_FOUND'; end if;
    if not selected_room.is_active then raise exception 'ROOM_INACTIVE'; end if;
    if current_booking.check_out <= current_booking.check_in then raise exception 'INVALID_DATES'; end if;
    select count(*) into active_count from bookings
      where room_id = current_booking.room_id and id <> current_booking.id
        and status in ('pending','confirmed','checked_in')
        and check_in < current_booking.check_out and check_out > current_booking.check_in;
    if active_count >= selected_room.total_units then raise exception 'ROOM_UNAVAILABLE'; end if;
  end if;
  update bookings set status = p_status, payment_status = coalesce(p_payment_status, payment_status), notes = coalesce(left(p_notes, 500), notes)
    where id = p_booking_id returning * into current_booking;
  return current_booking;
end; $$;

create or replace function public.create_booking_request_with_attribution(
  p_room_id uuid, p_guest_name text, p_guest_phone text, p_guest_email text,
  p_guests integer, p_check_in date, p_check_out date, p_notes text,
  p_source text, p_source_type text, p_event_id uuid,
  p_utm_source text, p_utm_medium text, p_utm_campaign text, p_utm_content text
) returns bookings language plpgsql security definer set search_path = public
as $$
declare
  selected_room rooms%rowtype;
  active_count integer;
  created_booking bookings%rowtype;
begin
  if p_check_out <= p_check_in or p_check_in < current_date then raise exception 'INVALID_DATES'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_room_id::text, 1759));
  select * into selected_room from rooms where id = p_room_id and is_active = true;
  if not found then raise exception 'ROOM_NOT_FOUND'; end if;
  select count(*) into active_count from bookings where room_id = p_room_id
    and status in ('pending','confirmed','checked_in')
    and check_in < p_check_out and check_out > p_check_in;
  if active_count >= selected_room.total_units then raise exception 'ROOM_UNAVAILABLE'; end if;
  insert into bookings(room_id, guest_name, guest_phone, guest_email, guests, check_in, check_out, amount, notes, source, source_type, event_id, utm_source, utm_medium, utm_campaign, utm_content)
    values (selected_room.id, left(trim(p_guest_name), 100), left(trim(p_guest_phone), 40), nullif(left(trim(p_guest_email), 254), ''), p_guests, p_check_in, p_check_out, selected_room.price_per_night * (p_check_out - p_check_in), left(coalesce(p_notes, ''), 500), left(coalesce(p_source, 'Website'), 80), coalesce(p_source_type, 'website'), p_event_id, left(p_utm_source, 100), left(p_utm_medium, 100), left(p_utm_campaign, 150), left(p_utm_content, 150))
    returning * into created_booking;
  return created_booking;
end; $$;

revoke all on function public.get_available_rooms(date, date) from public;
grant execute on function public.get_available_rooms(date, date) to anon, authenticated;
revoke all on function public.create_booking_request(uuid, text, text, text, integer, date, date, text) from public;
grant execute on function public.create_booking_request(uuid, text, text, text, integer, date, date, text) to anon, authenticated;
revoke all on function public.create_booking_request_with_attribution(uuid, text, text, text, integer, date, date, text, text, text, uuid, text, text, text, text) from public;
grant execute on function public.create_booking_request_with_attribution(uuid, text, text, text, integer, date, date, text, text, text, uuid, text, text, text, text) to anon, authenticated;
revoke all on function public.admin_update_booking_status(uuid, text, text, text) from public;
grant execute on function public.admin_update_booking_status(uuid, text, text, text) to authenticated;

create or replace function public.create_event_enquiry(
  p_event_id uuid, p_guest_name text, p_phone text, p_email text,
  p_people integer, p_enquiry_type text, p_message text,
  p_source text, p_source_type text, p_utm_source text, p_utm_medium text,
  p_utm_campaign text, p_utm_content text
) returns event_reservations language plpgsql security definer set search_path = public
as $$
declare created_enquiry event_reservations%rowtype;
begin
  if not exists (select 1 from events where id = p_event_id and is_active = true) then raise exception 'EVENT_NOT_FOUND'; end if;
  if p_people < 1 or p_enquiry_type not in ('table','general','vip','birthday','other') then raise exception 'INVALID_ENQUIRY'; end if;
  insert into event_reservations(event_id, guest_name, phone, email, people, reservation_type, message, source, source_type, utm_source, utm_medium, utm_campaign, utm_content)
    values (p_event_id, left(trim(p_guest_name), 100), left(trim(p_phone), 40), nullif(left(trim(p_email), 254), ''), p_people, p_enquiry_type, left(coalesce(p_message, ''), 1000), left(coalesce(p_source, 'Event page'), 80), coalesce(p_source_type, 'event'), left(p_utm_source, 100), left(p_utm_medium, 100), left(p_utm_campaign, 150), left(p_utm_content, 150))
    returning * into created_enquiry;
  return created_enquiry;
end; $$;

create or replace function public.admin_update_event_enquiry(p_enquiry_id uuid, p_status text)
returns event_reservations language plpgsql security invoker set search_path = public
as $$
declare updated_enquiry event_reservations%rowtype;
begin
  if not public.is_admin() then raise exception 'NOT_AUTHORIZED'; end if;
  if p_status not in ('new','contacted','in_progress','resolved','cancelled') then raise exception 'INVALID_STATUS'; end if;
  update event_reservations set status = p_status where id = p_enquiry_id returning * into updated_enquiry;
  if not found then raise exception 'ENQUIRY_NOT_FOUND'; end if;
  return updated_enquiry;
end; $$;

drop function if exists public.create_general_enquiry(text, text, text, text, text, text, text, text, text, text);

create function public.create_general_enquiry(
  p_name text, p_phone text, p_email text, p_message text,
  p_source text, p_source_type text, p_utm_source text, p_utm_medium text,
  p_utm_campaign text, p_utm_content text
) returns uuid language plpgsql security definer set search_path = public
as $$
declare created_enquiry general_enquiries%rowtype;
begin
  if length(trim(coalesce(p_name, ''))) < 2 or length(trim(coalesce(p_phone, ''))) < 7 or length(trim(coalesce(p_message, ''))) < 2 then raise exception 'INVALID_ENQUIRY'; end if;
  if p_source_type not in ('website','event','whatsapp','social','referral','direct') then raise exception 'INVALID_SOURCE'; end if;
  insert into general_enquiries(name, phone, email, message, source, source_type, utm_source, utm_medium, utm_campaign, utm_content)
    values (left(trim(p_name), 100), left(trim(p_phone), 40), nullif(left(trim(coalesce(p_email, '')), 254), ''), left(trim(p_message), 1500), left(coalesce(p_source, 'Website'), 80), coalesce(p_source_type, 'website'), left(p_utm_source, 100), left(p_utm_medium, 100), left(p_utm_campaign, 150), left(p_utm_content, 150))
    returning * into created_enquiry;
  return created_enquiry.id;
end; $$;

revoke all on function public.create_general_enquiry(text, text, text, text, text, text, text, text, text, text) from public;
revoke all on function public.create_general_enquiry(text, text, text, text, text, text, text, text, text, text) from anon;
revoke all on function public.create_general_enquiry(text, text, text, text, text, text, text, text, text, text) from authenticated;
grant execute on function public.create_general_enquiry(text, text, text, text, text, text, text, text, text, text) to anon, authenticated;

-- For production: add authenticated admin policies before enabling admin UI.
-- Booking creation should use a server action / API route with validation.

-- Existing private inventory_items contract used by the admin inventory module.
-- This documents the live table only; it intentionally does not create or alter it.
-- Columns used: id, name, category, quantity, unit, status, reorder_level,
-- notes, is_active.

-- 1759 Empire room inventory: match existing records by slug or name, preserve IDs,
-- create missing rooms, and deactivate non-source rooms without deleting history.
do $$
declare
  room_spec record;
  existing_id uuid;
  desired_ids uuid[] := array[]::uuid[];
begin
  for room_spec in
    select * from jsonb_to_recordset($rooms$
      [
        {"name":"Bixbite","slug":"bixbite","price":18500},
        {"name":"Musgravite","slug":"musgravite","price":18500},
        {"name":"Onyx","slug":"onyx","price":25500},
        {"name":"Opal","slug":"opal","price":20500},
        {"name":"Sapphire","slug":"sapphire","price":20500},
        {"name":"Ruby","slug":"ruby","price":25500},
        {"name":"Agate","slug":"agate","price":20500},
        {"name":"Benitoite","slug":"benitoite","price":25500},
        {"name":"Coral","slug":"coral","price":20500},
        {"name":"Pearl","slug":"pearl","price":20500},
        {"name":"Oriental","slug":"oriental","price":30500},
        {"name":"Diamond","slug":"diamond","price":35500},
        {"name":"Emerald","slug":"emerald","price":35500},
        {"name":"Topaz","slug":"topaz","price":30500},
        {"name":"Beryl","slug":"beryl","price":35500},
        {"name":"Jasper","slug":"jasper","price":30500}
      ]
    $rooms$::jsonb) as rooms(name text, slug text, price numeric)
  loop
    select id into existing_id
    from rooms
    where lower(slug) = lower(room_spec.slug) or lower(name) = lower(room_spec.name)
    order by case when lower(slug) = lower(room_spec.slug) then 0 else 1 end, created_at, id
    limit 1;

    if existing_id is null then
      insert into rooms(name, slug, description, price_per_night, is_active)
      values (
        room_spec.name,
        room_spec.slug,
        E'Check-in: 12:00 PM\nCheck-out: 12:00 PM\n\nNO SMOKING\nNOT MORE THAN TWO PERSONS IN A ROOM\nNO VISITORS ARE ALLOWED ONCE IT''S 10:30PM\nFOODS AND DRINKS GOTTEN OUTSIDE ARE NOT ALLOWED IN THE ROOMS\n\nThanks for your understanding.',
        room_spec.price,
        true
      )
      returning id into existing_id;
    else
      update rooms
      set name = room_spec.name,
          slug = room_spec.slug,
          description = E'Check-in: 12:00 PM\nCheck-out: 12:00 PM\n\nNO SMOKING\nNOT MORE THAN TWO PERSONS IN A ROOM\nNO VISITORS ARE ALLOWED ONCE IT''S 10:30PM\nFOODS AND DRINKS GOTTEN OUTSIDE ARE NOT ALLOWED IN THE ROOMS\n\nThanks for your understanding.',
          price_per_night = room_spec.price,
          is_active = true
      where id = existing_id;
    end if;

    desired_ids := array_append(desired_ids, existing_id);
    existing_id := null;
  end loop;

  update rooms set is_active = false where not (id = any(desired_ids));
end $$;

alter table bookings drop constraint if exists bookings_guests_check;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.bookings'::regclass and conname = 'bookings_guests_check'
  ) then
    alter table bookings add constraint bookings_guests_check check (guests between 1 and 2);
  end if;
end $$;
