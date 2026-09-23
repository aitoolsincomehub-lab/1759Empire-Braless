import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import MediaPostDesk from "@/components/MediaPostDesk";
import { AdminPageHeader } from "@/components/AdminShell";
import type { MediaAsset, MediaPost } from "@/types";

export default async function MediaPostsPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");
  const [{ data: posts }, { data: assets }] = await Promise.all([
    supabase.from("media_posts").select("*").order("event_date", { ascending: true }).order("sort_order", { ascending: true }),
    supabase.from("media_assets").select("*").order("created_at", { ascending: false }).limit(200),
  ]);
  return <><AdminPageHeader eyebrow="1759 MEDIA" title="Posts" description="Create the homepage feature and weekly event stream." /><MediaPostDesk initialPosts={(posts || []) as MediaPost[]} assets={(assets || []) as MediaAsset[]} /></>;
}