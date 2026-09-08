import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { ActionResponse, Attribution } from "@/types";

function clean(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
const sourceTypes = ["website", "event", "whatsapp", "social", "referral", "direct"] as const;
export async function POST(request: Request) {
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = clean(input?.name, 100), phone = clean(input?.phone, 40), email = clean(input?.email, 254), message = clean(input?.message, 1500);
  if (name.length < 2 || !/^[+\d][\d\s().-]{6,24}$/.test(phone) || message.length < 2) return NextResponse.json<ActionResponse<never>>({ ok: false, error: "Please check your name, phone and message." }, { status: 400 });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json<ActionResponse<never>>({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  const attribution = input?.attribution && typeof input.attribution === "object" ? input.attribution as Partial<Attribution> : {};
  const sourceType = typeof attribution.source_type === "string" && sourceTypes.includes(attribution.source_type as typeof sourceTypes[number]) ? attribution.source_type : "website";
  const supabase = await getSupabaseServer();
  if (!supabase) return NextResponse.json<ActionResponse<never>>({ ok: false, error: "Please contact 1759 directly to send your enquiry." }, { status: 503 });
  const { data, error } = await supabase.rpc("create_general_enquiry", { p_name: name, p_phone: phone, p_email: email || null, p_message: message, p_source: clean(attribution.source, 80) || "Website", p_source_type: sourceType, p_utm_source: clean(attribution.utm_source, 100) || null, p_utm_medium: clean(attribution.utm_medium, 100) || null, p_utm_campaign: clean(attribution.utm_campaign, 150) || null, p_utm_content: clean(attribution.utm_content, 150) || null });
  if (error) return NextResponse.json<ActionResponse<never>>({ ok: false, error: "We could not save your enquiry. Please try WhatsApp instead." }, { status: 500 });
  return NextResponse.json<ActionResponse<{ id: string }>>({ ok: true, data: data as { id: string } }, { status: 201 });
}
