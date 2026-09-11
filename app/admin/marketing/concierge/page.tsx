import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/AdminShell";
import AdminConciergeKnowledgeEditor from "@/components/AdminConciergeKnowledgeEditor";

export default async function ConciergeKnowledgeAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: knowledge } = await supabase
    .from("concierge_knowledge_base")
    .select("content, updated_at")
    .eq("id", "00000000-0000-0000-0000-000000000001")
    .maybeSingle();

  return (
    <>
      <AdminPageHeader
        eyebrow="MARKETING"
        title="Concierge Knowledge Base"
        description="Edit the business knowledge the AI Concierge can use when answering guests. Live catalogue data remains authoritative for current rooms, menu, events, settings and availability."
      />
      <AdminConciergeKnowledgeEditor initialContent={knowledge?.content || ""} initialUpdatedAt={knowledge?.updated_at || null} />
    </>
  );
}
