import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getPublicCatalogue } from "@/lib/catalogue";

async function getConciergeKnowledgeBase(): Promise<string> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("concierge_knowledge_base")
        .select("content")
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .maybeSingle();

      if (!error && typeof data?.content === "string" && data.content.trim()) {
        return data.content.trim();
      }
    } catch {
      // fall through to local markdown fallback below
    }
  }

  try {
    const filePath = path.join(process.cwd(), "docs", "1759-Empire-Concierge-Knowledge-Base-v1.md");
    const contents = await readFile(filePath, "utf8");
    const trimmed = contents.trim();
    if (trimmed) return trimmed;
  } catch {
    // intentional: continue with empty knowledge base if no source is available
  }

  return "";
}

type Action = { type: "BOOK_ROOM" | "VIEW_EVENT" | "EVENT_ENQUIRY" | "WHATSAPP" | "GENERAL_ENQUIRY"; label: string; href: string };
function actionsFor(message: string, whatsapp: string, event?: { slug: string; id: string; title: string }): Action[] {
  const lower = message.toLowerCase();
  if (/vip|table|birthday|celebrat|party|enquir/.test(lower)) return [{ type: "EVENT_ENQUIRY", label: "Make an event enquiry", href: event ? `/events/${event.slug}#enquiry` : "/events" }, ...(whatsapp ? [{ type: "WHATSAPP", label: "Chat on WhatsApp", href: `https://wa.me/${whatsapp}` } as Action] : []), { type: "GENERAL_ENQUIRY", label: "Send an enquiry", href: "/#contact" }];
  if (/event|what.s on|weekend|happen/.test(lower) && event) return [{ type: "VIEW_EVENT", label: "View current event", href: `/events/${event.slug}` }, { type: "EVENT_ENQUIRY", label: "Make an event enquiry", href: `/events/${event.slug}#enquiry` }];
  if (/room|stay|book|available|availability|night/.test(lower)) return [{ type: "BOOK_ROOM", label: "Check availability", href: "/book" }];
  if (whatsapp) return [{ type: "WHATSAPP", label: "Chat on WhatsApp", href: `https://wa.me/${whatsapp}` }, { type: "GENERAL_ENQUIRY", label: "Send an enquiry", href: "/#contact" }];
  return [{ type: "GENERAL_ENQUIRY", label: "Send an enquiry", href: "/#contact" }];
}

function fallbackReply(message: string, catalogue: Awaited<ReturnType<typeof getPublicCatalogue>>, whatsapp: string, event?: { slug: string; id: string; title: string }): { message: string; actions: Action[] } {
  const lower = message.toLowerCase();
  const roomNames = catalogue.rooms.slice(0, 4).map((room) => room.name);
  const eventNames = catalogue.events.slice(0, 3).map((item) => item.title);
  const menuNames = catalogue.menu.slice(0, 4).map((item) => item.name);
  const business = catalogue.settings.business_name || "1759 Empire";
  const address = catalogue.settings.address || "Akute, Lagos";
  const clubDescription = catalogue.settings.club_description || "Club Klass is the late-night social destination at 1759 Empire.";
  const loungeDescription = catalogue.settings.lounge_description || "The viewing centre is set up for sports, lounge time and social catch-ups.";
  const bralessEvent = catalogue.events.find((item) => /braless/i.test(item.title) || /braless/i.test(item.slug));

  if (/what is|about 1759|who are you|what is 1759 empire/.test(lower)) {
    return { message: `${business} is a hotel, lounge, club and event destination in ${address}. We bring stays, food, drinks, live nights and social experiences together in one place.`, actions: actionsFor(message, whatsapp, event) };
  }

  if (/where|location|address|akute|lagos/.test(lower)) {
    return { message: `1759 Empire is located at ${address}.`, actions: actionsFor(message, whatsapp, event) };
  }

  if (/room|stay|accommodation|suite|book|available|availability/.test(lower)) {
    const roomText = roomNames.length ? `Current room types include ${roomNames.join(", ")}.` : "Room information is not currently published.";
    return { message: `${roomText} To check room availability, use the booking flow.`, actions: [{ type: "BOOK_ROOM", label: "Check availability", href: "/book" }] };
  }

  if (/food|drink|menu|dine|eat/.test(lower)) {
    const menuText = menuNames.length ? `Current menu highlights include ${menuNames.join(", ")}.` : "Menu details are not currently published.";
    return { message: `${menuText} For dining enquiries, use the booking or enquiry path.`, actions: actionsFor(message, whatsapp, event) };
  }

  if (/club klass|club|nightlife|party|late night|dj/.test(lower)) {
    return { message: clubDescription, actions: actionsFor(message, whatsapp, event) };
  }

  if (/event|what's on|what is on|upcoming|coming up|weekend/.test(lower)) {
    const overview = eventNames.length ? `Current event highlights include ${eventNames.join(", ")}.` : "There are no published event titles available right now.";
    return { message: `${overview} You can also view the full events listing for more details.`, actions: event ? [{ type: "VIEW_EVENT", label: `View ${event.title}`, href: `/events/${event.slug}` }, { type: "EVENT_ENQUIRY", label: "Make an event enquiry", href: `/events/${event.slug}#enquiry` }] : [{ type: "GENERAL_ENQUIRY", label: "See events", href: "/events" }] };
  }

  if (/braless/.test(lower)) {
    if (bralessEvent) return { message: `Braless at 1759 Empire is part of the current event programme: ${bralessEvent.title}.`, actions: [{ type: "VIEW_EVENT", label: `View ${bralessEvent.title}`, href: `/events/${bralessEvent.slug}` }, { type: "EVENT_ENQUIRY", label: "Make an enquiry", href: `/events/${bralessEvent.slug}#enquiry` }] };
    return { message: "Braless information is not currently published. Use the event listing or enquiry flow for updates.", actions: actionsFor(message, whatsapp, event) };
  }

  if (/football|sport|watch|viewing|screen|match/.test(lower)) {
    return { message: loungeDescription, actions: actionsFor(message, whatsapp, event) };
  }

  if (/contact|whatsapp|call|enquiry|talk|reach/.test(lower)) {
    return { message: whatsapp ? `You can reach 1759 Empire on WhatsApp at ${whatsapp}.` : "Contact details are not currently available in the public settings.", actions: whatsapp ? [{ type: "WHATSAPP", label: "Chat on WhatsApp", href: `https://wa.me/${whatsapp}` }, { type: "GENERAL_ENQUIRY", label: "Send an enquiry", href: "/#contact" }] : [{ type: "GENERAL_ENQUIRY", label: "Send an enquiry", href: "/#contact" }] };
  }

  if (/media|youtube|mixcloud|social|content/.test(lower)) {
    return { message: "The 1759 media section highlights events, nightlife and social content. See the media section or event pages for published content.", actions: [{ type: "GENERAL_ENQUIRY", label: "See events", href: "/events" }] };
  }

  return { message: `I can help with rooms, dining, club nights, events, bookings and enquiries at 1759 Empire. For the latest details, use the booking or events pages.`, actions: [{ type: "BOOK_ROOM", label: "Check availability", href: "/book" }, { type: "GENERAL_ENQUIRY", label: "See events", href: "/events" }] };
}

export async function POST(request: Request) {
  const input = await request.json().catch(() => null) as { message?: unknown; history?: unknown } | null;
  const message = typeof input?.message === "string" ? input.message.trim().slice(0, 1000) : "";
  if (!message) return NextResponse.json({ ok: false, error: "Ask the Concierge a question." }, { status: 400 });
  const catalogue = await getPublicCatalogue();
  const event = catalogue.events.find((item) => item.is_featured) || catalogue.events[0];
  const whatsapp = catalogue.settings.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const actions = actionsFor(message, whatsapp, event);
  const fallback = fallbackReply(message, catalogue, whatsapp, event);
  const dateMatches = message.match(/\d{4}-\d{2}-\d{2}/g) || [];
  const knowledgeBase = await getConciergeKnowledgeBase();
  let availability = "";
  if (/available|availability|vacan|room for/.test(message.toLowerCase()) && dateMatches.length >= 2) {
    const supabase = await getSupabaseServer();
    if (supabase) { const { data } = await supabase.rpc("get_available_rooms", { p_check_in: dateMatches[0], p_check_out: dateMatches[1] }); availability = `Availability checked for ${dateMatches[0]} to ${dateMatches[1]}: ${(data || []).length} room option(s) returned.`; }
  }
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ ok: true, message: fallback.message, actions: fallback.actions });
  const context = JSON.stringify({ settings: catalogue.settings, rooms: catalogue.rooms.map(({ id, name, description, price_per_night, amenities }) => ({ id, name, description, price_per_night, amenities })), menu: catalogue.menu.map(({ name, category, description, price }) => ({ name, category, description, price })), events: catalogue.events.map(({ id, slug, title, event_date, event_time, description, short_description, entry_price }) => ({ id, slug, title, event_date, event_time, description, short_description, entry_price })), availability, knowledgeBase: knowledgeBase || "Knowledge base unavailable; use live catalogue data only." });
  const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.1, messages: [{ role: "system", content: `You are the 1759 Empire hospitality concierge. Answer only from the supplied current data. Never invent prices, dates, availability, facilities, policies, or contact details. If the answer is absent, say it is not currently available and recommend an existing action. Be concise and warm. Live catalogue data remains authoritative for availability, published events, room catalogue, menu, and current settings. Owner-confirmed knowledge in the supplemental knowledge base may fill gaps only where live data is missing. Supplemental knowledge base: ${knowledgeBase || "(unavailable)"}\n\nCurrent data: ${context}` }, ...((Array.isArray(input?.history) ? input.history : []) as Array<{ role: "user" | "assistant"; content: string }>).slice(-6), { role: "user", content: message }] }) });
  if (!response.ok) return NextResponse.json({ ok: true, message: fallback.message, actions: fallback.actions });
  const result = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const assistantMessage = result.choices?.[0]?.message?.content?.trim();
  return NextResponse.json({ ok: true, message: assistantMessage || fallback.message, actions: assistantMessage ? actions : fallback.actions });
}
