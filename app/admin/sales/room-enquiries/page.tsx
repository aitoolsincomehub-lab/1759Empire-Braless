import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";

export default async function RoomEnquiriesAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: enquiries } = await supabase.from("general_enquiries").select("*").order("created_at", { ascending: false }).limit(30);

  return <>
    <AdminPageHeader eyebrow="SALES" title="Room enquiries" description="Track room and stay enquiries." action="New enquiry" actionHref="/admin/sales/room-enquiries/new" />
    <section className="adminTableShell">
      <table className="adminDataTable">
        <thead><tr><th>Name</th><th>Phone</th><th>Message</th><th>Source</th></tr></thead>
        <tbody>{(enquiries || []).map((enquiry) => <tr key={enquiry.id}><td>{enquiry.name}</td><td>{enquiry.phone}</td><td>{enquiry.message}</td><td>{enquiry.source}</td></tr>)}</tbody>
      </table>
    </section>
  </>;
}
