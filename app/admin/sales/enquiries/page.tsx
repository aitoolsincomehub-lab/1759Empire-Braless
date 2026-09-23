import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";
import AdminEnquiries, { type EnquiryRow } from "@/components/AdminEnquiries";

export default async function EnquiriesAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: enquiries } = await supabase.from("event_reservations").select("*, event:events(title)").order("created_at", { ascending: false }).limit(30);

  return <>
    <AdminPageHeader eyebrow="SALES" title="Enquiries" description="Track event and reservation enquiries." action="Review sources" actionHref="/admin/insights/leads" />
    <AdminEnquiries initialEnquiries={(enquiries || []) as EnquiryRow[]} />
  </>;
}
