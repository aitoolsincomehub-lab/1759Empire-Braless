import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/AdminShell";
import AdminInventory, { type InventoryItem } from "@/components/AdminInventory";
import { getSupabaseServer } from "@/lib/supabase/server";

export default async function InventoryAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");
  const { data: items } = await supabase.from("inventory_items").select("*").order("status").order("name");
  return <><AdminPageHeader eyebrow="FOOD & BEVERAGE" title="Inventory" description="Keep a simple, private view of what 1759 currently has on hand." /><AdminInventory initialItems={(items || []) as InventoryItem[]} /></>;
}