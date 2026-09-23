import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";

export default async function LeadsAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const [{ data: sources }, { data: eventEnquiries }] = await Promise.all([
    supabase.from("general_enquiries").select("id, source, source_type, created_at, name, phone").order("created_at", { ascending: false }).limit(25),
    supabase.from("event_reservations").select("id, source, source_type, created_at, guest_name, phone").order("created_at", { ascending: false }).limit(25),
  ]);
  const leads = [...(sources || []).map((lead) => ({ ...lead, name: lead.name, phone: lead.phone })), ...(eventEnquiries || []).map((lead) => ({ ...lead, name: lead.guest_name, phone: lead.phone }))].sort((first, second) => second.created_at.localeCompare(first.created_at)).slice(0, 40);
  const sourceCounts = leads.reduce<Record<string, number>>((counts, lead) => { const source = lead.source || "Direct"; counts[source] = (counts[source] || 0) + 1; return counts; }, {});

  return <>
    <AdminPageHeader eyebrow="INSIGHTS" title="Leads / Sources" description="Monitor lead volume and acquisition sources." />
    <section className="adminKpiGrid"><article className="adminStatCard"><span>Recent leads</span><strong>{leads.length}</strong></article><article className="adminStatCard"><span>Sources</span><strong>{Object.keys(sourceCounts).length}</strong></article></section>
    <section className="adminSectionCard"><div className="adminSectionCardHead"><h2>Lead sources</h2></div><div className="adminSectionCardBody">{Object.entries(sourceCounts).sort(([, first], [, second]) => second - first).map(([source, count]) => <div className="sourceRow" key={source}><span>{source}</span><strong>{count}</strong></div>)}</div></section>
    <section className="adminTableShell"><table className="adminDataTable"><thead><tr><th>Source</th><th>Lead</th><th>Phone</th><th>Date</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id}><td>{lead.source || "Direct"}</td><td>{lead.name}</td><td>{lead.phone}</td><td>{new Date(lead.created_at).toLocaleString("en-NG")}</td></tr>)}</tbody></table></section>
  </>;
}
