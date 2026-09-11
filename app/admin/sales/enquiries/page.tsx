import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";

export default async function EnquiriesAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: enquiries } = await supabase.from("event_reservations").select("*, event:events(title)").order("created_at", { ascending: false }).limit(30);

  return <>
    <AdminPageHeader eyebrow="SALES" title="Enquiries" description="Track event and reservation enquiries." action="Review sources" actionHref="/admin/insights/leads" />
    <section className="adminTableShell">
      <table className="adminDataTable">
        <thead><tr><th>Guest</th><th>Event</th><th>People</th><th>Status</th><th>Source</th></tr></thead>
        <tbody>{(enquiries || []).map((enquiry) => <tr key={enquiry.id}><td>{enquiry.guest_name}</td><td>{enquiry.event?.title || "Event"}</td><td>{enquiry.people}</td><td>{enquiry.status}</td><td>{enquiry.source}</td></tr>)}</tbody>
      </table>
    </section>
  </>;
}
