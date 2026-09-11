import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";

export default async function BookingsAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: bookings } = await supabase.from("bookings").select("*, room:rooms(name)").order("created_at", { ascending: false }).limit(20);

  return <>
    <AdminPageHeader eyebrow="SALES" title="Bookings" description="Manage booking bookings and arrivals." action="Create booking" actionHref="/admin/sales/bookings/new" />
    <section className="adminTableShell">
      <table className="adminDataTable">
        <thead><tr><th>Guest</th><th>Room</th><th>Stay</th><th>Status</th><th>Payment</th></tr></thead>
        <tbody>{(bookings || []).map((booking) => <tr key={booking.id}><td>{booking.guest_name}</td><td>{booking.room?.name || "Room"}</td><td>{booking.check_in} → {booking.check_out}</td><td>{booking.status}</td><td>{booking.payment_status}</td></tr>)}</tbody>
      </table>
    </section>
  </>;
}
