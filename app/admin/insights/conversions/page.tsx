import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";

export default async function ConversionsAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: bookings } = await supabase.from("bookings").select("id, source, status, created_at, guest_name").order("created_at", { ascending: false }).limit(30);

  return <>
    <AdminPageHeader eyebrow="INSIGHTS" title="Conversions" description="Measure booking conversion and sales momentum." action="Refresh funnel" actionHref="/admin/insights/conversions/refresh" />
    <section className="adminTableShell">
      <table className="adminDataTable">
        <thead><tr><th>Source</th><th>Guest</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>{(bookings || []).map((booking) => <tr key={booking.id}><td>{booking.source || "Direct"}</td><td>{booking.guest_name}</td><td>{booking.status}</td><td>{booking.created_at}</td></tr>)}</tbody>
      </table>
    </section>
  </>;
}
