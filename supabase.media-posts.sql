create table if not exists public.media_posts (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  tagline text not null default '',
  event_name text not null default '',
  event_date date not null,

  start_time time,
  end_time time,

  venue text not null default '1759 Empire Lounge',
  location text not null default 'Akute, Lagos',

  placement text not null
    check (placement in ('featured', 'weekly')),

  flyer_media_id uuid
    references public.media_assets(id)
    on delete set null,

  foreground_video_media_id uuid
    references public.media_assets(id)
    on delete set null,

  background_video_media_id uuid
    references public.media_assets(id)
    on delete set null,

  description text not null default '',
  cta_label text not null default '',
  cta_url text not null default '',

  published boolean not null default false,
  sort_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.media_posts
  add column if not exists tagline text not null default '';

alter table public.media_posts
  add column if not exists start_time time;

alter table public.media_posts
  add column if not exists end_time time;

alter table public.media_posts
  add column if not exists venue text not null default '1759 Empire Lounge';

alter table public.media_posts
  add column if not exists location text not null default 'Akute, Lagos';

create index if not exists media_posts_public_idx
  on public.media_posts (published, placement, event_date, sort_order);

create index if not exists media_posts_event_date_idx
  on public.media_posts (event_date);

alter table public.media_posts enable row level security;

drop policy if exists "Public can view published media posts"
  on public.media_posts;

create policy "Public can view published media posts"
  on public.media_posts
  for select
  using (published = true);

drop policy if exists "Admins can manage media posts"
  on public.media_posts;

create policy "Admins can manage media posts"
  on public.media_posts
  for all
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.set_media_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_media_posts_updated_at
  on public.media_posts;

create trigger set_media_posts_updated_at
before update on public.media_posts
for each row
execute function public.set_media_posts_updated_at();