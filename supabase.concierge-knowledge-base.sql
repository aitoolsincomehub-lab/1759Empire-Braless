-- 1759 Empire Concierge Knowledge Base
-- Singleton table for admin-editable supplemental business knowledge.

create extension if not exists pgcrypto;

create table if not exists public.concierge_knowledge_base (
  id uuid primary key default '00000000-0000-0000-0000-000000000001'::uuid,
  content text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid null,
  constraint concierge_knowledge_base_singleton
    check (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

create or replace function public.set_concierge_knowledge_base_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists concierge_knowledge_base_updated_at_trg
on public.concierge_knowledge_base;

create trigger concierge_knowledge_base_updated_at_trg
before insert or update on public.concierge_knowledge_base
for each row
execute function public.set_concierge_knowledge_base_updated_at();

alter table public.concierge_knowledge_base enable row level security;


-- SELECT policies
drop policy if exists "Concierge knowledge is readable through server-side use"
on public.concierge_knowledge_base;

drop policy if exists "Admins can read concierge knowledge"
on public.concierge_knowledge_base;

create policy "Admins can read concierge knowledge"
on public.concierge_knowledge_base
for select
to authenticated
using (public.is_admin());


-- INSERT policy
drop policy if exists "Admins can insert concierge knowledge"
on public.concierge_knowledge_base;

create policy "Admins can insert concierge knowledge"
on public.concierge_knowledge_base
for insert
to authenticated
with check (public.is_admin());


-- UPDATE policy
drop policy if exists "Admins can update concierge knowledge"
on public.concierge_knowledge_base;

create policy "Admins can update concierge knowledge"
on public.concierge_knowledge_base
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- Seed the initial Concierge Knowledge Base.
insert into public.concierge_knowledge_base (
  id,
  content,
  updated_by
)
values (
  '00000000-0000-0000-0000-000000000001',

  $$
# 1759 Empire — Concierge Knowledge Base v1

**Status:** Living document. Update as management confirms room types, prices, menus, events, policies, hours, facilities and contact details.

**Date:** 10 September 2026

## 1. Source hierarchy

The Concierge should prioritize information in this order:
1. Owner/management-confirmed information.
2. Live 1759 website/Supabase data.
3. Carefully marked external research.
4. If unknown, say so and offer an enquiry/WhatsApp route.

Never invent availability, prices, events, opening hours, policies, amenities, bookings or payments.

## 2. Business identity

**Business:** 1759 Empire Lounge and Hotels.

The public information found online describes the property as a combined hotel, lounge/bar and nightlife destination. External listings classify it as a hotel/nightclub/bar/lounge.

Current production positioning can be summarized as:
**STAY · DINE · PARTY · WATCH · BELONG**

## 3. Location and contact

**Publicly reported address:**
197 Ajuwon-Akute Road, Ile-Ise Bus Stop, Akute, 112107, Lagos State, Nigeria.

**Publicly reported phone:**
+234 812 477 7227 / 0812 477 7227.

External directories classify the location inconsistently as Akute/Agege/Ifo. The live 1759 site/Supabase business-information record should be the final customer-facing authority.

## 4. Rooms

1759 Empire provides hotel accommodation.

External listings report accommodation features including air conditioning, private bathrooms, Wi-Fi, parking, restaurant/bar access and a 24-hour front desk. Some other amenities reported online conflict and therefore require management confirmation.

### Owner-confirmed current baseline prices

- **₦22,000 per night — room tier/type not yet mapped**
- **₦25,000 per night — room tier/type not yet mapped**

Do NOT guess which named room corresponds to either price.

Safe Concierge response:
> “Our current room rates include ₦22,000 and ₦25,000 per night, depending on the room. I can help you check availability or connect you with 1759 Empire for the exact room type.”

Availability must come from the live booking/availability system or staff.

## 5. Check-in/check-out

Online sources contain inconsistent check-in information. One current external listing reports a 12:00 PM check-out, while other data is ambiguous.

Until management confirms the official policy, the Concierge should not state definitive check-in, early check-in, late check-out or cancellation rules.

## 6. Dining and drinks

1759 Empire has restaurant and bar/lounge offerings according to multiple external accommodation listings.

The current production site positions the experience around Nigerian dining, drinks, lounge hospitality and nightlife.

Do not invent menu items or prices. Use the live Supabase menu/catalogue when populated.

Current content categories represented in the approved production media include:
- Nigerian food
- pepper chicken
- pepper soup
- rice/jollof-style dining
- cocktails
- drinks
- lounge/bar atmosphere

These are content categories, not a substitute for a confirmed written menu.

## 7. Club Klass / nightlife

Club Klass is part of the current 1759 Empire nightlife architecture.

The Concierge may describe it generally as part of the property's nightlife/entertainment experience.

Do not invent DJ names, dates, ticket prices, entry fees, VIP/table prices, opening hours or dress-code rules. Use live event data when available.

## 8. Braless Party

Braless Party is represented in the current 1759 Empire site as a recurring 1759 experience.

It may be described generally as a music/nightlife/social experience.

Do not invent dates, ticket prices, performers, entry requirements or table packages. Use published event data when available.

## 9. Events and private events

1759 Empire is positioned for nightlife and social/event enquiries.

Suitable Concierge enquiry categories include:
- birthdays
- celebrations
- private events
- group visits
- nightlife/event enquiries

Do not invent packages, capacities or prices until management supplies them.

## 10. Viewing Centre

The current 1759 site includes a Viewing Centre experience.

The intended proposition is:
- watch sports/games
- meet friends
- food and drinks
- social lounge atmosphere

Do not claim specific leagues, channels, fixtures or broadcast rights unless current information confirms them.

For “Are you showing the match tonight?”, the Concierge should check current information or direct the guest to staff/WhatsApp rather than guessing.

## 11. Facilities reported online — verify before using as hard facts

External sources report some combination of:
- Wi-Fi
- free/private parking
- air conditioning
- restaurant
- bar/lounge
- room service
- 24-hour front desk
- garden
- sauna
- hot tub/Jacuzzi
- swimming pool
- pet-friendly status

These sources conflict on some amenities. Do not present disputed facilities as confirmed until management verifies them.

## 12. Concierge actions

Where appropriate, guide guests toward existing actions:
- Check room availability
- Book a room
- Ask about an event
- Make a general enquiry
- Contact 1759 on WhatsApp
- See current events
- Explore dining
- Explore Club Klass
- Explore the Viewing Centre

Only claim an action was completed when the underlying system actually completed it.

## 13. Concierge tone

The Concierge should feel like a helpful 1759 hospitality host:
- warm
- concise
- confident
- locally appropriate
- useful
- conversion-aware without being pushy

Avoid generic “AI assistant” language.

## 14. Safe fallback language

When information is unavailable:
> “I don’t have the latest confirmed information for that yet. I can help you make an enquiry with 1759 Empire.”

For room availability:
> “I can help you check availability. I don’t want to guess whether a room is available, so please use the booking/availability option.”

For event details:
> “I don’t have the confirmed details for that event yet. I can help you make an event enquiry.”

## 15. Information to add later

### Rooms
- exact room names
- mapping of ₦22,000 and ₦25,000 to room types
- other rates
- bed types/capacity
- amenities
- breakfast
- check-in/check-out
- cancellation
- extra guest policy

### Food/drinks
- full menu
- prices
- service hours
- dietary options
- room service
- drinks/bottle/cocktail prices

### Club Klass
- opening hours
- weekly schedule
- entry fees
- table/VIP prices
- dress code
- DJs
- age policy

### Braless
- confirmed description
- dates
- tickets
- table packages
- performers

### Events
- calendar
- private-event packages
- birthday/corporate packages
- capacities
- enquiry process
$$,

  null
)
on conflict (id)
do update set
  content = excluded.content,
  updated_at = excluded.updated_at,
  updated_by = excluded.updated_by;