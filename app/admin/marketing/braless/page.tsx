import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";
import AdminMediaLibrary from "@/components/AdminMediaLibrary";

export default async function BralessAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: media } = await supabase.from("media_assets").select("*").eq("section", "braless").order("display_order", { ascending: true }).order("created_at", { ascending: false }).limit(24);

  return <>
    <AdminPageHeader eyebrow="MARKETING" title="Braless" description="Campaign and tactical content for the Braless experience." />
    <AdminMediaLibrary initialMedia={media || []} section="braless" />
  </>;
}
