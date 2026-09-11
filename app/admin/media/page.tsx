import fs from "node:fs";
import path from "node:path";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import ProprietorMediaDesk from "@/components/ProprietorMediaDesk";
import { AdminPageHeader } from "@/components/AdminShell";
import type { MediaAsset } from "@/types";

const PRODUCTION_ASSET_DIRS = ["brand", "hero", "rooms", "club-klass", "events", "food", "drinks", "gallery", "viewing-centre", "braless", "venue", "nightlife"];
const EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|svg|avif)$/i;

function collectProductionAssets() {
  const root = path.join(process.cwd(), "public", "assets");
  const assets: string[] = [];
  for (const directory of PRODUCTION_ASSET_DIRS) {
    const absolute = path.join(root, directory);
    if (!fs.existsSync(absolute)) continue;
    for (const name of fs.readdirSync(absolute).sort()) {
      const full = path.join(absolute, name);
      if (fs.statSync(full).isFile() && EXTENSIONS.test(name)) assets.push(`/assets/${directory}/${name}`);
    }
  }
  return assets;
}

export default async function MediaAdminPage() {
  const supabase = await getSupabaseServer();
  if (!supabase) redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") redirect("/admin/login");

  const { data: media } = await supabase.from("media_assets").select("*").order("display_order", { ascending: true }).order("created_at", { ascending: false }).limit(120);
  return <>
    <AdminPageHeader eyebrow="MARKETING · CONTENT" title="Media" description="Keep the pictures on 1759 fresh." />
    <ProprietorMediaDesk
      initialMedia={(media || []) as MediaAsset[]}
      staticImages={collectProductionAssets()}
    />
  </>;
}
