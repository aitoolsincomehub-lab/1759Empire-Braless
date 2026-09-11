import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";
import AdminMediaLibrary from "@/components/AdminMediaLibrary";

export default async function ClubKlassAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: media } = await supabase.from("media_assets").select("*").eq("section", "club").order("display_order", { ascending: true }).order("created_at", { ascending: false }).limit(24);

  return <>
    <AdminPageHeader eyebrow="MARKETING" title="Club Klass" description="Programming, themes and promotion for Club Klass." />
    <AdminMediaLibrary initialMedia={media || []} section="club" />
  </>;
}
