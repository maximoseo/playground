import { describe, expect, it } from "vitest";
import { exportCsv, exportJson } from "@/lib/export";
import { ResearchResponse } from "@/lib/types";

const payload: ResearchResponse = {
  meta: { seedKeyword: "seo tool", country: "us", language: "en", resultCount: 50, generatedAt: new Date().toISOString(), apiSourceLabel: "Keywords Everywhere API", cacheHit: false, creditEstimate: "safe", tabsUsingRawData: [], tabsUsingDerivedData: [] },
  overview: { totalKeywords: 1, averageVolume: 10, averageCpc: 1, averageCompetition: 0.5, topVolumeKeyword: "seo tool", lowestCompetitionKeyword: "seo tool", bestBalancedKeyword: "seo tool", dominantIntentBucket: "Commercial", trendHighlight: "none" },
  allKeywords: [{ keyword: "seo tool", volume: 10, cpc: 1, competition: 0.5, sourceType: "related", intent: "Commercial", relevanceScore: 90, opportunityScore: 80, cluster: "Commercial", longTail: false, question: false, modifiers: [], rawFieldCount: 5, derivedFieldCount: 5 }],
  tabs: { related: [], longTail: [], pasf: [], questions: [], clusters: [] },
};

describe("export", () => {
  it("generates csv", () => {
    expect(exportCsv(payload, payload.allKeywords)).toContain("Keyword");
  });

  it("generates json", () => {
    expect(exportJson(payload, payload.allKeywords)).toContain("seo tool");
  });
});
