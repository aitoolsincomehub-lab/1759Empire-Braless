import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

const resources = { rooms: "rooms", events: "events", menu: "menu_items", menu_categories: "menu_categories" } as const;
type Resource = keyof typeof resources;

async function adminClient() {
  const supabase = await getSupabaseServer();
  if (!supabase) return { supabase: null, authorized: false };
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, authorized: user?.app_metadata?.role === "admin" };
}

function resource(value: string | null): Resource | null { return value && value in resources ? value as Resource : null; }

export async function GET(request: Request) {
  const { supabase, authorized } = await adminClient();
  const table = resource(new URL(request.url).searchParams.get("resource"));
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });
  if (!authorized) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  if (!table) return NextResponse.json({ ok: false, error: "Unknown catalogue section." }, { status: 400 });
  const { data, error } = await supabase.from(resources[table]).select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ ok: false, error: "Catalogue could not be loaded." }, { status: 500 });
  return NextResponse.json({ ok: true, data });
}

export async function POST(request: Request) {
  const { supabase, authorized } = await adminClient();
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const table = resource(typeof input?.resource === "string" ? input.resource : null);
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });
  if (!authorized) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  if (!table) return NextResponse.json({ ok: false, error: "Unknown catalogue section." }, { status: 400 });
  const data = { ...input };
  delete data.resource;
  delete data.id;
  const { data: created, error } = await supabase.from(resources[table]).insert(data).select().single();
  if (error) return NextResponse.json({ ok: false, error: "Item could not be created." }, { status: 400 });
  return NextResponse.json({ ok: true, data: created }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { supabase, authorized } = await adminClient();
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const table = resource(typeof input?.resource === "string" ? input.resource : null);
  const id = typeof input?.id === "string" ? input.id : "";
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });
  if (!authorized) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  if (!table || !id) return NextResponse.json({ ok: false, error: "Invalid catalogue update." }, { status: 400 });
  const data = { ...input };
  delete data.resource;
  delete data.id;
  const { data: updated, error } = await supabase.from(resources[table]).update(data).eq("id", id).select().single();
  if (error) return NextResponse.json({ ok: false, error: "Item could not be updated." }, { status: 400 });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(request: Request) {
  const { supabase, authorized } = await adminClient();
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const table = resource(typeof input?.resource === "string" ? input.resource : null);
  const id = typeof input?.id === "string" ? input.id : "";
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });
  if (!authorized) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  if (!table || !id) return NextResponse.json({ ok: false, error: "Invalid catalogue item." }, { status: 400 });
  const update = table === "rooms" ? { is_active: false } : table === "events" ? { is_active: false } : table === "menu_categories" ? { is_active: false } : table === "menu" ? { is_available: false } : null;
  const result = update ? await supabase.from(resources[table]).update(update).eq("id", id) : await supabase.from(resources[table]).delete().eq("id", id);
  if (result.error) return NextResponse.json({ ok: false, error: "Item could not be removed." }, { status: 400 });
  return NextResponse.json({ ok: true });
}