# 1759 Empire production media pack

This folder is the canonical replacement structure for public-facing imagery. The existing user-supplied legacy media is deliberately excluded.

## Required production sizes

| Slot | Target | Use |
|---|---:|---|
| hero desktop | 2400 × 1350 | Homepage hero |
| hero mobile | 1200 × 1600 | Mobile hero crop |
| rooms | 1800 × 1200 | Room cards / booking |
| food | 1800 × 1200 | Dining cards |
| drinks | 1800 × 1200 | Drinks cards |
| Club Klass | 1800 × 1200 | Nightlife cards |
| Braless | 1800 × 1200 | Braless experience |
| events | 1800 × 1200 | Event feature imagery |
| viewing centre | 1800 × 1200 | Sports/viewing centre |
| gallery | 1800 × 1200 | Atmosphere gallery |
| media thumbnails | 1280 × 720 | YouTube/Mixcloud/editorial cards |
| logo transparent | 1200 × 990 or source ratio | Header/footer brand |

## Image rules

- Keep important subjects inside the central 70% safe area so responsive crops remain usable.
- Do not stretch or upscale small originals into hero imagery.
- Prefer WebP/AVIF for website delivery and keep a high-resolution master outside the public runtime if needed.
- Do not place text inside photographic assets unless the asset is intentionally an event poster.
- Do not invent factual views of the real hotel exterior, rooms, staff or facilities. AI imagery is for generic hospitality/editorial concepts only unless explicitly approved as representative.
- Event posters remain event artwork, not generic food/nightlife photography.

## Current implementation policy

The public homepage only uses approved production paths and published CMS media that has been explicitly placed into those production slots. Legacy `/media_stills` and `/assets/visual-assets/1759-empire-visual-assets` are not public homepage sources and are not scanned by the Media Desk.
