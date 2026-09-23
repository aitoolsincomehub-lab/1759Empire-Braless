import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";
import AdminRoomEnquiries from "@/components/AdminRoomEnquiries";
import type { GeneralEnquiry } from "@/types";

export default async function RoomEnquiriesAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: enquiries } = await supabase.from("general_enquiries").select("*").order("created_at", { ascending: false }).limit(30);

  return <>
    <AdminPageHeader eyebrow="SALES" title="Room enquiries" description="Track room and stay enquiries." />
    <AdminRoomEnquiries items={(enquiries || []) as GeneralEnquiry[]} />
  </>;
}
