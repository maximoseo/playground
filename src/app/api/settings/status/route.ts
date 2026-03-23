import { NextResponse } from "next/server";
import { hasKeywordsEverywhereApiKey } from "@/lib/env";
import { getStorageMode, readSettings } from "@/lib/storage";
import { hasSupabase } from "@/lib/supabase";

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json({
    apiConnected: hasKeywordsEverywhereApiKey(),
    storageMode: await getStorageMode(),
    supabaseConnected: hasSupabase(),
    settings,
  });
}
