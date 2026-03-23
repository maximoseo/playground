import { NextRequest, NextResponse } from "next/server";
import { runKeywordResearch } from "@/lib/keywords-everywhere";
import { researchRequestSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const payload = await request.json();
    const parsed = researchRequestSchema.parse({
      ...payload,
      minSearchVolume: payload.minSearchVolume ? Number(payload.minSearchVolume) : undefined,
      maxCompetition: payload.maxCompetition !== undefined && payload.maxCompetition !== "" ? Number(payload.maxCompetition) : undefined,
      minCpc: payload.minCpc ? Number(payload.minCpc) : undefined,
      maxCpc: payload.maxCpc ? Number(payload.maxCpc) : undefined,
      resultCount: Number(payload.resultCount ?? 50),
    });

    console.info("research.start", {
      seedKeyword: parsed.seedKeyword,
      country: parsed.country,
      resultCount: parsed.resultCount,
    });

    const response = await runKeywordResearch(parsed);

    console.info("research.success", {
      seedKeyword: parsed.seedKeyword,
      durationMs: Date.now() - startedAt,
      cacheHit: response.meta.cacheHit,
      returnedKeywords: response.allKeywords.length,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("research.failure", {
      durationMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : "Unknown error",
      type: error instanceof Error ? error.name : "Unknown",
    });
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
