-- 1759 Empire: focused media/content engine migration
-- Safe, idempotent metadata augmentation for the current one-media-assets architecture.

create extension if not exists pgcrypto;

alter table events add column if not exists performer_socials jsonb not null default '[]'::jsonb;

alter table media_assets add column if not exists campaign_name text not null default '';
alter table media_assets add column if not exists campaign_slug text not null default '';
alter table media_assets add column if not exists publish_date date;
alter table media_assets add column if not exists social_caption text not null default '';
alter table media_assets add column if not exists call_to_action text not null default '';
alter table media_assets add column if not exists hashtags text not null default '';
alter table media_assets add column if not exists duration_seconds integer;
alter table media_assets add column if not exists status text not null default 'draft' check (status in ('draft','ready','published','archived'));

-- Keep the event association central and extendable without a parallel content system.
alter table media_assets add column if not exists event_id uuid references events(id) on delete set null;

-- Confirm the public storage bucket assumption in SQL-friendly documentation form.
-- Storage bucket expected by the app route: hotel-images
-- Keep uploaded files under Supabase Storage; do not move / paste large videos into Postgres.

-- Optional visibility/readability indexes.
create index if not exists media_assets_event_id_idx on media_assets(event_id);
create index if not exists media_assets_platform_idx on media_assets(platform);
create index if not exists media_assets_content_type_idx on media_assets(content_type);
create index if not exists media_assets_status_idx on media_assets(status);
create index if not exists media_assets_publish_date_idx on media_assets(publish_date);
