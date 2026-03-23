import { NextResponse } from "next/server";
import { hasKeywordsEverywhereApiKey } from "@/lib/env";
import { readSettings } from "@/lib/storage";

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json({
    apiConnected: hasKeywordsEverywhereApiKey(),
    settings,
  });
}
