# 1759 Empire - Hotel, Lounge & Club

Production MVP foundation for 1759 Empire at 197 Ajuwon-Akute Road, Ile-Ise Bus Stop, Akute, Lagos.

## Stack
- Next.js + TypeScript
- Supabase (database/auth/storage)
- Vercel deployment
- Paystack is intentionally not enabled; payment status remains admin-managed

## Local setup

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000

## Supabase
1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase.sql`.
4. Add URL + anon key to `.env.local`.
5. Create a Storage bucket called `hotel-images` with a 10 MB upload limit.
6. Create staff users in Supabase Auth and set `app_metadata.role` to `admin` using a trusted server-side process.
7. Configure `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_HOTEL_NAME`, and deploy.

Never expose a service-role key to the browser.

## Implemented routes
- `/` public hotel, lounge, Club Klass and events page
- `/book` validated booking request flow
- `/api/bookings` server-side booking mutation and atomic overlap check
- `/admin/login` Supabase Auth login
- `/admin` protected dashboard overview
- `/sitemap.xml` and `/robots.txt`

## Important product rule
Keep the admin simple:
Dashboard / Rooms / Bookings / Menu / Events / Settings.

Room CRUD should support:
name, price, number of units, description, amenities, photos, active/inactive.

Availability is derived from bookings overlapping the requested dates. Pending, confirmed, and checked-in bookings reserve units. `create_booking_request` takes a PostgreSQL advisory lock per room before counting overlaps and inserting.

## Current handoff blockers
The supplied repository contains only the logo and exterior image; room, Club Klass, food, gallery, and event files are intentional slots. Live catalogue room selection, admin CRUD screens, uploader UI, event reservations, upload enforcement, owner-confirmed seed data, and configured Supabase QA remain before full owner handoff. No payment provider is connected.

Do not add full PMS, accounting, inventory, payroll or POS in V1.
