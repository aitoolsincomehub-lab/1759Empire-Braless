import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import MediaUploader from "@/components/MediaUploader";

export default async function MediaUploadPage({ searchParams }: { searchParams: Promise<{ section?: string; replaceId?: string }> }) {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const query = await searchParams;
  const validSections = ["hero", "rooms", "club", "events", "food", "gallery", "venue", "braless", "media", "tv", "dj", "conversation", "fm"] as const;
  const section = validSections.includes(query.section as typeof validSections[number]) ? query.section as typeof validSections[number] : "hero";
  return <MediaUploader initialSection={section} replaceId={query.replaceId || ""} />;
}
