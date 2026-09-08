# 1759 Empire build roadmap

Implemented: public shell, typed booking API, Supabase helpers, atomic availability protection, Auth-protected admin entry, dashboard counts, SEO routes, and database RLS/media foundations.

Finish in this order:
1. ~~Supabase client/server helpers.~~
2. Seed rooms from owner-confirmed data.
3. ~~Server-side availability query using date overlap:~~
   existing.check_in < requested.check_out AND existing.check_out > requested.check_in
4. Replace static room cards with Supabase data.
5. ~~Booking server action with validation and duplicate/overlap protection.~~
6. ~~Admin authentication.~~
7. ~~Admin dashboard overview.~~
8. Admin room CRUD + Supabase Storage image upload.
9. Booking management: pending/confirmed/cancelled/check-in/check-out.
10. Menu CRUD and availability toggle.
11. Events + simple reservations.
12. ~~WhatsApp link with pre-filled booking reference.~~
13. Paystack deposit integration only after booking flow is stable.
14. Production QA and Vercel deployment.

Keep the UI simple. Do not build POS, accounting, kitchen inventory, payroll or a full PMS in V1.
