# 1759 Empire production implementation

## Visual direction

Dark editorial hospitality, restrained gold, strong serif display typography, compact uppercase utility labels, generous spacing, precise grids, cinematic imagery and high-contrast CTAs.

Reference logic: Canadian editorial/hospitality discipline + Lagos/Nigerian hospitality and nightlife subject matter. The generated visual direction board is a design reference, not a production photograph source.

## Content architecture

Public site:
- Stay / rooms
- Dine / food & drinks
- Club Klass
- Braless
- Events
- Viewing Centre
- Media: YouTube, Mixcloud, event highlights, DJ sets
- AI Concierge
- Contact / enquiry / WhatsApp

Admin:
- Marketing / Homepage
- Events
- Braless
- Club Klass
- Media Desk
- Sales / Bookings / Enquiries / Room enquiries
- Business / Rooms / Food & Drinks / Information
- Insights / Leads / Conversions / Event performance

## Media ownership model

1. CMS managed: database media records editable through the media API.
2. Built-in production asset: committed file under `public/assets`.
3. CMS-controlled homepage: a current `site_settings.hero_media_url` that points to an approved production asset.
4. Homepage audit: an explicit mapping that says where a production asset is used.
5. Legacy user media: not scanned, not rendered, not used as a fallback.

## Future media integrations

The current `media_assets` model already supports `youtube`, `mixcloud`, `instagram`, `tiktok` and `short_form`, plus content types for event highlights, recaps, DJ sets, interviews, food clips, nightlife clips and more. The homepage now has one unified media surface so these can be populated later without introducing another media table.

AI Concierge remains global and is intentionally kept separate from the media model; it can use the live catalogue and existing booking/event/enquiry actions.
