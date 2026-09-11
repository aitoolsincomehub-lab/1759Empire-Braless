import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";

export default async function EventPerformanceAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: events } = await supabase.from("events").select("id, title, event_date, is_active, capacity").order("event_date", { ascending: false }).limit(24);

  return <>
    <AdminPageHeader eyebrow="INSIGHTS" title="Event performance" description="Track event momentum and active programme demand." action="Compare events" actionHref="/admin/insights/events/compare" />
    <section className="adminTableShell">
      <table className="adminDataTable">
        <thead><tr><th>Event</th><th>Date</th><th>Status</th><th>Capacity</th></tr></thead>
        <tbody>{(events || []).map((event) => <tr key={event.id}><td>{event.title}</td><td>{event.event_date}</td><td>{event.is_active ? "Published" : "Draft"}</td><td>{event.capacity || "--"}</td></tr>)}</tbody>
      </table>
    </section>
  </>;
}
