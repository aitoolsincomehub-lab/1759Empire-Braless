import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";
import AdminCatalogueEditor from "@/components/AdminCatalogueEditor";

export default async function MarketingEventsAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const [{ data: events }, { data: media }] = await Promise.all([
    supabase.from("events").select("*").order("event_date", { ascending: false }).limit(24),
    supabase.from("media_assets").select("*").eq("section", "events").order("display_order", { ascending: true }).order("created_at", { ascending: false }).limit(48),
  ]);

  return <>
    <AdminPageHeader eyebrow="MARKETING" title="Events" description="Plan, publish and reposition event programmes." />
    <AdminCatalogueEditor resource="events" initialItems={events || []} media={media || []} />
  </>;
}
