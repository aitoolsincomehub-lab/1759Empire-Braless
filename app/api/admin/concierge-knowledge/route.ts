import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

const SINGLETON_ID = "00000000-0000-0000-0000-000000000001";

async function adminClient() {
  const supabase = await getSupabaseServer();
  if (!supabase) return { supabase: null, authorized: false, user: null as any };
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, authorized: user?.app_metadata?.role === "admin", user };
}

export async function GET() {
  const { supabase, authorized } = await adminClient();
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });
  if (!authorized) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });

  const { data, error } = await supabase
    .from("concierge_knowledge_base")
    .select("id, content, updated_at, updated_by")
    .eq("id", SINGLETON_ID)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: "Knowledge base could not be loaded." }, { status: 400 });

  return NextResponse.json({ ok: true, data: data || { id: SINGLETON_ID, content: "", updated_at: null, updated_by: null } });
}

export async function PATCH(request: Request) {
  const { supabase, authorized, user } = await adminClient();
  if (!supabase) return NextResponse.json({ ok: false, error: "Supabase is not configured." }, { status: 503 });
  if (!authorized) return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 403 });

  const input = await request.json().catch(() => null) as { content?: unknown } | null;
  const content = typeof input?.content === "string" ? input.content : "";
  if (typeof input?.content !== "string") return NextResponse.json({ ok: false, error: "Invalid knowledge-base content." }, { status: 400 });

  const { data, error } = await supabase
    .from("concierge_knowledge_base")
    .upsert({ id: SINGLETON_ID, content, updated_by: user?.id ?? null }, { onConflict: "id" })
    .select("id, content, updated_at, updated_by")
    .single();

  if (error) return NextResponse.json({ ok: false, error: "Knowledge base could not be saved." }, { status: 400 });

  return NextResponse.json({ ok: true, data });
}

export const PUT = PATCH;
