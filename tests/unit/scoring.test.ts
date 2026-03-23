import { describe, expect, it } from "vitest";
import { computeOpportunityScore, computeRelevanceScore } from "@/lib/scoring";

describe("scoring", () => {
  it("prefers closer lexical matches", () => {
    expect(computeRelevanceScore("seo tools", "best seo tools")).toBeGreaterThan(computeRelevanceScore("seo tools", "coffee machine"));
  });

  it("rewards stronger commercial opportunities", () => {
    const high = computeOpportunityScore({ keyword: "best seo tool pricing", volume: 4400, cpc: 12, competition: 0.2, sourceType: "related" }, "seo tool");
    const low = computeOpportunityScore({ keyword: "what is seo", volume: 300, cpc: 0.1, competition: 0.9, sourceType: "related" }, "seo tool");
    expect(high).toBeGreaterThan(low);
  });
});
