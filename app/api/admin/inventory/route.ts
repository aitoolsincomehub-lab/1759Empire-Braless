import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

const statuses = ["available", "low_stock", "out_of_stock"] as const;
type InventoryStatus = typeof statuses[number];

async function authorizedClient() {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user?.app_metadata?.role === "admin" ? supabase : null;
}

function item(input: Record<string, unknown> | null) {
  const status = typeof input?.status === "string" && statuses.includes(input.status as InventoryStatus) ? input.status : "available";
  return {
    name: typeof input?.name === "string" ? input.name.trim().slice(0, 120) : "",
    category: typeof input?.category === "string" ? input.category.trim().slice(0, 80) : "",
    quantity: Number(input?.quantity ?? 0),
    unit: typeof input?.unit === "string" ? input.unit.trim().slice(0, 40) : "",
    status,
    reorder_level: Number(input?.reorder_level ?? 0),
    notes: typeof input?.notes === "string" ? input.notes.trim().slice(0, 500) : "",
    is_active: input?.is_active !== false,
  };
}

export async function GET() {
  const supabase = await authorizedClient();
  if (!supabase) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  const { data, error } = await supabase.from("inventory_items").select("*").order("status").order("name");
  if (error) return NextResponse.json({ ok: false, error: "Inventory could not be loaded." }, { status: 500 });
  return NextResponse.json({ ok: true, data: data || [] });
}

export async function POST(request: Request) {
  const supabase = await authorizedClient();
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!supabase) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  const data = item(input);
  if (!data.name || !data.unit || !Number.isFinite(data.quantity) || data.quantity < 0 || !Number.isFinite(data.reorder_level) || data.reorder_level < 0) return NextResponse.json({ ok: false, error: "Enter a valid name, unit and quantity." }, { status: 400 });
  const { data: created, error } = await supabase.from("inventory_items").insert(data).select().single();
  if (error) return NextResponse.json({ ok: false, error: "Inventory item could not be created." }, { status: 400 });
  return NextResponse.json({ ok: true, data: created }, { status: 201 });
}

export async function PATCH(request: Request) {
  const supabase = await authorizedClient();
  const input = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = typeof input?.id === "string" ? input.id : "";
  if (!supabase) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  if (!id) return NextResponse.json({ ok: false, error: "Invalid inventory item." }, { status: 400 });
  const data = item(input);
  if (!data.name || !data.unit || !Number.isFinite(data.quantity) || data.quantity < 0 || !Number.isFinite(data.reorder_level) || data.reorder_level < 0) return NextResponse.json({ ok: false, error: "Enter a valid name, unit and quantity." }, { status: 400 });
  const { data: updated, error } = await supabase.from("inventory_items").update(data).eq("id", id).select().single();
  if (error) return NextResponse.json({ ok: false, error: "Inventory item could not be updated." }, { status: 400 });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(request: Request) {
  const supabase = await authorizedClient();
  const input = await request.json().catch(() => null) as { id?: unknown } | null;
  const id = typeof input?.id === "string" ? input.id : "";
  if (!supabase) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });
  if (!id) return NextResponse.json({ ok: false, error: "Invalid inventory item." }, { status: 400 });
  const { error } = await supabase.from("inventory_items").update({ is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: "Inventory item could not be deactivated." }, { status: 400 });
  return NextResponse.json({ ok: true });
}