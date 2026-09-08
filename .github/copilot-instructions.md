# 1759 Empire project rules

Build this as a production hospitality website, not a mockup.

Priorities:
1. Simple staff UX.
2. Real Supabase-backed room, booking, menu and event data.
3. Real date-overlap availability checks.
4. Mobile-first.
5. Nigerian Naira formatting.
6. WhatsApp-first guest communication.
7. Never hard-code room availability in production UI.
8. Never expose Supabase service-role keys in browser code.
9. Validate all booking dates server-side.
10. Keep V1 limited to Rooms, Bookings, Availability, Menu, Events, Settings.

Admin workflow:
Add room -> upload photos -> set price -> set number of rooms -> save.
Booking -> confirm/cancel -> availability updates.

Use server actions/API routes for mutations. Use Supabase RLS. Do not invent hotel amenities or prices when real owner data is not available; use clearly marked seed data during development.
