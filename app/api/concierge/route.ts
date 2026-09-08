import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getPublicCatalogue } from "@/lib/catalogue";

type Action = { type: "BOOK_ROOM" | "VIEW_EVENT" | "EVENT_ENQUIRY" | "WHATSAPP" | "GENERAL_ENQUIRY"; label: string; href: string };
function actionsFor(message: string, whatsapp: string, event?: { slug: string; id: string; title: string }): Action[] {
  const lower = message.toLowerCase();
  if (/vip|table|birthday|celebrat|party|enquir/.test(lower)) return [{ type: "EVENT_ENQUIRY", label: "Make an event enquiry", href: event ? `/events/${event.slug}#enquiry` : "/events" }, ...(whatsapp ? [{ type: "WHATSAPP", label: "Chat on WhatsApp", href: `https://wa.me/${whatsapp}` } as Action] : []), { type: "GENERAL_ENQUIRY", label: "Send an enquiry", href: "/#contact" }];
  if (/event|what.s on|weekend|happen/.test(lower) && event) return [{ type: "VIEW_EVENT", label: "View current event", href: `/events/${event.slug}` }, { type: "EVENT_ENQUIRY", label: "Make an event enquiry", href: `/events/${event.slug}#enquiry` }];
  if (/room|stay|book|available|availability|night/.test(lower)) return [{ type: "BOOK_ROOM", label: "Check availability", href: "/book" }];
  if (whatsapp) return [{ type: "WHATSAPP", label: "Chat on WhatsApp", href: `https://wa.me/${whatsapp}` }, { type: "GENERAL_ENQUIRY", label: "Send an enquiry", href: "/#contact" }];
  return [{ type: "GENERAL_ENQUIRY", label: "Send an enquiry", href: "/#contact" }];
}

export async function POST(request: Request) {
  const input = await request.json().catch(() => null) as { message?: unknown; history?: unknown } | null;
  const message = typeof input?.message === "string" ? input.message.trim().slice(0, 1000) : "";
  if (!message) return NextResponse.json({ ok: false, error: "Ask the Concierge a question." }, { status: 400 });
  const catalogue = await getPublicCatalogue();
  const event = catalogue.events.find((item) => item.is_featured) || catalogue.events[0];
  const whatsapp = catalogue.settings.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const actions = actionsFor(message, whatsapp, event);
  const dateMatches = message.match(/\d{4}-\d{2}-\d{2}/g) || [];
  let availability = "";
  if (/available|availability|vacan|room for/.test(message.toLowerCase()) && dateMatches.length >= 2) {
    const supabase = await getSupabaseServer();
    if (supabase) { const { data } = await supabase.rpc("get_available_rooms", { p_check_in: dateMatches[0], p_check_out: dateMatches[1] }); availability = `Availability checked for ${dateMatches[0]} to ${dateMatches[1]}: ${(data || []).length} room option(s) returned.`; }
  }
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ ok: true, message: "The Concierge is ready to help, but its live assistant connection still needs to be configured. You can use the options below to continue with 1759.", actions });
  const context = JSON.stringify({ settings: catalogue.settings, rooms: catalogue.rooms.map(({ id, name, description, price_per_night, amenities }) => ({ id, name, description, price_per_night, amenities })), menu: catalogue.menu.map(({ name, category, description, price }) => ({ name, category, description, price })), events: catalogue.events.map(({ id, slug, title, event_date, event_time, description, short_description, entry_price }) => ({ id, slug, title, event_date, event_time, description, short_description, entry_price })), availability });
  const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.1, messages: [{ role: "system", content: `You are the 1759 Empire hospitality concierge. Answer only from the supplied current data. Never invent prices, dates, availability, facilities, policies, or contact details. If the answer is absent, say it is not currently available and recommend an existing action. Be concise and warm. Current data: ${context}` }, ...((Array.isArray(input?.history) ? input.history : []) as Array<{ role: "user" | "assistant"; content: string }>).slice(-6), { role: "user", content: message }] }) });
  if (!response.ok) return NextResponse.json({ ok: true, message: "The Concierge could not reach its live assistant connection. Please use one of the options below.", actions });
  const result = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return NextResponse.json({ ok: true, message: result.choices?.[0]?.message?.content || "I could not find that in the current 1759 information.", actions });
}
