import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { ActionResponse, EventEnquiryRequest, EventReservation } from "@/types";

const enquiryTypes = ["table", "general", "vip", "birthday", "other"] as const;
function clean(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
function validate(input: unknown): { value?: EventEnquiryRequest; error?: string } {
  if (!input || typeof input !== "object") return { error: "Enter your enquiry details." };
  const data = input as Record<string, unknown>;
  const value: EventEnquiryRequest = {
    eventId: clean(data.eventId, 80), guestName: clean(data.guestName, 100), phone: clean(data.phone, 40), email: clean(data.email, 254), people: Number(data.people), enquiryType: clean(data.enquiryType, 20) as EventEnquiryRequest["enquiryType"], message: clean(data.message, 1000), source: clean(data.source, 80) || "Event page", source_type: "event", utm_source: clean(data.utm_source, 100), utm_medium: clean(data.utm_medium, 100), utm_campaign: clean(data.utm_campaign, 150), utm_content: clean(data.utm_content, 150),
  };
  if (!value.eventId || value.guestName.length < 2 || !/^[+\d][\d\s().-]{6,24}$/.test(value.phone) || !Number.isInteger(value.people) || value.people < 1 || value.people > 100 || !enquiryTypes.includes(value.enquiryType)) return { error: "Please check your name, phone, group size, and enquiry type." };
  if (value.email && !/^\S+@\S+\.\S+$/.test(value.email)) return { error: "Enter a valid email address." };
  return { value };
}

export async function POST(request: Request) {
  const parsed = validate(await request.json().catch(() => null));
  if (parsed.error) return NextResponse.json<ActionResponse<never>>({ ok: false, error: parsed.error }, { status: 400 });
  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json<ActionResponse<never>>({ ok: false, error: "Please contact 1759 directly to confirm your enquiry." }, { status: 503 });
  const value = parsed.value!;
  const { data, error } = await supabase.rpc("create_event_enquiry", { p_event_id: value.eventId, p_guest_name: value.guestName, p_phone: value.phone, p_email: value.email || null, p_people: value.people, p_enquiry_type: value.enquiryType, p_message: value.message || "", p_source: value.source, p_source_type: value.source_type, p_utm_source: value.utm_source || null, p_utm_medium: value.utm_medium || null, p_utm_campaign: value.utm_campaign || null, p_utm_content: value.utm_content || null });
  if (error) return NextResponse.json<ActionResponse<never>>({ ok: false, error: "We could not save the enquiry. Please try WhatsApp instead." }, { status: 500 });
  return NextResponse.json<ActionResponse<EventReservation>>({ ok: true, data: data as EventReservation }, { status: 201 });
}
