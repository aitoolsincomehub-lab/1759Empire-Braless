import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader, AdminSectionCard, AdminStatCard } from "@/components/AdminShell";
import AdminBookings, { type BookingRow } from "@/components/AdminBookings";
import AdminEnquiries, { type EnquiryRow } from "@/components/AdminEnquiries";
import AdminGeneralEnquiries from "@/components/AdminGeneralEnquiries";
import type { GeneralEnquiry } from "@/types";

export default async function AdminDashboard() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const today = new Date().toISOString().slice(0, 10);
  const [roomsCount, bookingsPending, eventsCount, todayBookings, recentBookings, recentEnquiries, recentGeneralEnquiries] = await Promise.all([
    supabase.from("rooms").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("is_active", true).gte("event_date", today),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("check_in", today),
    supabase.from("bookings").select("*, room:rooms(name)").order("created_at", { ascending: false }).limit(8),
    supabase.from("event_reservations").select("*, event:events(title)").order("created_at", { ascending: false }).limit(8),
    supabase.from("general_enquiries").select("*").order("created_at", { ascending: false }).limit(8)
  ]);

  const sourceCounts = (recentEnquiries.data || []).reduce<Record<string, number>>((counts, enquiry) => {
    const source = (enquiry as { source?: string }).source || "Direct";
    counts[source] = (counts[source] || 0) + 1;
    return counts;
  }, {});

  return <>
    <AdminPageHeader eyebrow="OVERVIEW" title="Good evening." description="A clear view of what needs attention at 1759 Empire." action="Add booking" actionHref="/admin/sales/bookings" />

    <section className="adminKpiGrid">
      <AdminStatCard label="Today's bookings" value={todayBookings.count ?? 0} />
      <AdminStatCard label="Pending bookings" value={bookingsPending.count ?? 0} />
      <AdminStatCard label="Upcoming events" value={eventsCount.count ?? 0} />
      <AdminStatCard label="New enquiries" value={recentEnquiries.data?.filter((enquiry) => (enquiry as { status?: string }).status === "new").length ?? 0} />
    </section>

    <div className="adminDashboardGrid">
      <div className="adminDashboardLeft">
        <AdminSectionCard title="Recent bookings">
          <AdminBookings initialBookings={(recentBookings.data || []) as BookingRow[]} />
        </AdminSectionCard>

        <AdminSectionCard title="Event enquiries">
          <AdminEnquiries initialEnquiries={(recentEnquiries.data || []) as EnquiryRow[]} />
        </AdminSectionCard>

        <AdminSectionCard title="General enquiries">
          <AdminGeneralEnquiries items={(recentGeneralEnquiries.data || []) as GeneralEnquiry[]} />
        </AdminSectionCard>
      </div>

      <div className="adminDashboardRight">
        <AdminSectionCard title="Where enquiries are coming from">
          {Object.keys(sourceCounts).length === 0 ? <p className="muted">Source insights will appear after the first enquiry.</p> : Object.entries(sourceCounts).sort(([, first], [, second]) => second - first).map(([source, count]) => <div className="sourceRow" key={source}><span>{source}</span><strong>{count}</strong></div>)}
        </AdminSectionCard>

        <AdminSectionCard title="Operations">
          <div className="adminMiniList">
            <div><span>Rooms active</span><strong>{roomsCount.count ?? 0}</strong></div>
            <div><span>Booking status</span><strong>Synced</strong></div>
            <div><span>Media library</span><strong>Ready</strong></div>
          </div>
          <Link className="adminSecondaryButton" href="/admin/media">Manage media</Link>
        </AdminSectionCard>
      </div>
    </div>
  </>;
}

