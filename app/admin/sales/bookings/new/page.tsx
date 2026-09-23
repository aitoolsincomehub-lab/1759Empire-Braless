import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/AdminShell";
import AdminBookingCreator from "@/components/AdminBookingCreator";
import type { Room } from "@/types";
import { getSupabaseServer } from "@/lib/supabase/server";

export default async function NewBookingAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");
  const { data: rooms } = await supabase.from("rooms").select("*").eq("is_active", true).order("name");
  return <><AdminPageHeader eyebrow="SALES" title="New booking" description="Create a booking request through the existing availability-protected flow." /><AdminBookingCreator rooms={(rooms || []) as Room[]} /></>;
}