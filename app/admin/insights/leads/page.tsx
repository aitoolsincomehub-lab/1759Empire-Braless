import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";

export default async function LeadsAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: sources } = await supabase.from("general_enquiries").select("id, source, created_at, name, phone").order("created_at", { ascending: false }).limit(25);

  return <>
    <AdminPageHeader eyebrow="INSIGHTS" title="Leads / Sources" description="Monitor lead volume and acquisition sources." action="Export report" actionHref="/admin/insights/leads/export" />
    <section className="adminTableShell">
      <table className="adminDataTable">
        <thead><tr><th>Source</th><th>Lead</th><th>Phone</th><th>Date</th></tr></thead>
        <tbody>{(sources || []).map((lead) => <tr key={lead.id}><td>{lead.source || "Direct"}</td><td>{lead.name}</td><td>{lead.phone}</td><td>{lead.created_at}</td></tr>)}</tbody>
      </table>
    </section>
  </>;
}
