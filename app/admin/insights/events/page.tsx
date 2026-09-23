import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";

export default async function EventPerformanceAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const [{ data: events }, { data: enquiries }] = await Promise.all([
    supabase.from("events").select("id, title, event_date, is_active, is_published, status").order("event_date", { ascending: false }).limit(48),
    supabase.from("event_reservations").select("id, event_id, status"),
  ]);
  const enquiryCounts = (enquiries || []).reduce<Record<string, number>>((counts, enquiry) => { counts[enquiry.event_id] = (counts[enquiry.event_id] || 0) + 1; return counts; }, {});

  return <>
    <AdminPageHeader eyebrow="INSIGHTS" title="Event performance" description="Track event momentum and active programme demand." />
    <section className="adminKpiGrid"><article className="adminStatCard"><span>Events</span><strong>{events?.length ?? 0}</strong></article><article className="adminStatCard"><span>Upcoming</span><strong>{events?.filter((event) => event.event_date >= new Date().toISOString().slice(0, 10)).length ?? 0}</strong></article><article className="adminStatCard"><span>Event enquiries</span><strong>{enquiries?.length ?? 0}</strong></article></section><section className="adminTableShell"><table className="adminDataTable"><thead><tr><th>Event</th><th>Date</th><th>Status</th><th>Enquiries</th></tr></thead><tbody>{(events || []).map((event) => <tr key={event.id}><td>{event.title}</td><td>{event.event_date}</td><td>{event.is_active && event.is_published ? "Published" : "Draft"}</td><td>{enquiryCounts[event.id] || 0}</td></tr>)}</tbody></table></section>
  </>;
}
