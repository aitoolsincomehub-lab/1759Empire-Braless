import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";
import AdminCatalogueEditor from "@/components/AdminCatalogueEditor";

export default async function RoomsAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const [{ data: rooms }, { data: media }] = await Promise.all([
    supabase.from("rooms").select("*").order("created_at", { ascending: false }),
    supabase.from("media_assets").select("*").eq("section", "rooms").order("display_order", { ascending: true }).order("created_at", { ascending: false }).limit(48),
  ]);

  return <>
    <AdminPageHeader eyebrow="BUSINESS" title="Rooms" description="Manage rooms" />
    <AdminCatalogueEditor resource="rooms" initialItems={rooms || []} media={media || []} />
  </>;
}
