import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";

export default async function ConversionsAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: bookings } = await supabase.from("bookings").select("id, source, status, payment_status, created_at, guest_name").order("created_at", { ascending: false }).limit(50);
  const confirmed = (bookings || []).filter((booking) => booking.status === "confirmed" || booking.status === "checked_in" || booking.status === "checked_out").length;
  const paid = (bookings || []).filter((booking) => booking.payment_status === "paid").length;

  return <>
    <AdminPageHeader eyebrow="INSIGHTS" title="Conversions" description="Measure booking conversion and sales momentum." />
    <section className="adminKpiGrid"><article className="adminStatCard"><span>Booking requests</span><strong>{bookings?.length ?? 0}</strong></article><article className="adminStatCard"><span>Confirmed or stayed</span><strong>{confirmed}</strong></article><article className="adminStatCard"><span>Paid</span><strong>{paid}</strong></article></section><section className="adminTableShell">
      <table className="adminDataTable">
        <thead><tr><th>Source</th><th>Guest</th><th>Status</th><th>Payment</th><th>Created</th></tr></thead>
        <tbody>{(bookings || []).map((booking) => <tr key={booking.id}><td>{booking.source || "Direct"}</td><td>{booking.guest_name}</td><td>{booking.status}</td><td>{booking.payment_status}</td><td>{new Date(booking.created_at).toLocaleString("en-NG")}</td></tr>)}</tbody>
      </table>
    </section>
  </>;
}
