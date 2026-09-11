import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";
import AdminHomepageEditor from "@/components/AdminHomepageEditor";

export default async function MarketingHomepageAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const [{ data: settings }, { data: media }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("media_assets").select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false }).limit(60),
  ]);

  return <>
    <AdminPageHeader eyebrow="MARKETING" title="Homepage" description="Manage the flagship homepage and campaign placements." />
    <AdminHomepageEditor initialSettings={settings || null} media={media || []} />
  </>;
}
