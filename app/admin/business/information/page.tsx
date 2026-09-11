import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";
import AdminBusinessInfoEditor from "@/components/AdminBusinessInfoEditor";

export default async function BusinessInformationAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: settings } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();

  return <>
    <AdminPageHeader eyebrow="BUSINESS" title="Business information" description="Manage contact, ownership and public settings." />
    <AdminBusinessInfoEditor initialSettings={settings || null} />
  </>;
}
