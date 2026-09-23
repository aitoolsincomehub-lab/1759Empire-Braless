import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";
import AdminBookings, { type BookingRow } from "@/components/AdminBookings";

export default async function BookingsAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: bookings } = await supabase.from("bookings").select("*, room:rooms(name)").order("created_at", { ascending: false }).limit(20);

  return <><AdminPageHeader eyebrow="SALES" title="Bookings" description="Manage booking requests and arrivals." action="Create booking" actionHref="/admin/sales/bookings/new" /><AdminBookings initialBookings={(bookings || []) as BookingRow[]} /></>;
}
