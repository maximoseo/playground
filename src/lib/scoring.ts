import { DerivedKeyword, RawKeywordMetric } from "@/lib/types";

const COMMERCIAL_MODIFIERS = ["best", "buy", "price", "cost", "service", "near me", "agency", "company", "tool", "software"];
const QUESTION_WORDS = ["who", "what", "why", "how", "when", "where", "can", "does", "is", "are"];

function tokenize(text: string) {
  return text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}

export function inferIntent(keyword: string) {
  const lower = keyword.toLowerCase();
  if (QUESTION_WORDS.some((word) => lower.startsWith(`${word} `))) return "Question";
  if (COMMERCIAL_MODIFIERS.some((word) => lower.includes(word))) return "Commercial";
  if (lower.includes("near me") || lower.includes("in ")) return "Local";
  if (lower.includes("vs") || lower.includes("compare")) return "Comparison";
  return "Informational";
}

export function computeRelevanceScore(seedKeyword: string, keyword: string) {
  const seedTokens = tokenize(seedKeyword);
  const keywordTokens = tokenize(keyword);
  const overlap = seedTokens.filter((token) => keywordTokens.includes(token)).length;
  const lexical = overlap / Math.max(seedTokens.length, 1);
  const lengthPenalty = Math.abs(keywordTokens.length - seedTokens.length) * 0.04;
  const exactBoost = keyword.toLowerCase().includes(seedKeyword.toLowerCase()) ? 0.25 : 0;
  return Math.max(0, Math.min(100, Math.round((lexical * 0.65 + exactBoost + (keywordTokens.length >= 3 ? 0.08 : 0) - lengthPenalty) * 100)));
}

/**
 * Deterministic opportunity score:
 * 35% normalized volume + 20% CPC + 20% inverse competition + 15% commercial intent + 10% long-tail bonus.
 * This is transparent by design and intentionally avoids opaque ML scoring.
 */
export function computeOpportunityScore(metric: RawKeywordMetric, seedKeyword: string) {
  const volume = Math.min((metric.volume ?? 0) / 10000, 1);
  const cpc = Math.min((metric.cpc ?? 0) / 20, 1);
  const inverseCompetition = 1 - Math.min(metric.competition ?? 1, 1);
  const keyword = metric.keyword.toLowerCase();
  const longTail = tokenize(metric.keyword).length >= 4 ? 1 : 0;
  const commercialBoost = COMMERCIAL_MODIFIERS.some((word) => keyword.includes(word)) ? 1 : 0;
  const relevanceBoost = computeRelevanceScore(seedKeyword, metric.keyword) / 100;
  return Math.max(
    0,
    Math.min(
      100,
      Math.round((volume * 0.35 + cpc * 0.2 + inverseCompetition * 0.2 + commercialBoost * 0.15 + longTail * 0.1 + relevanceBoost * 0.1) * 100),
    ),
  );
}

export function enrichKeyword(seedKeyword: string, metric: RawKeywordMetric, cluster: string): DerivedKeyword {
  const question = QUESTION_WORDS.some((word) => metric.keyword.toLowerCase().startsWith(`${word} `));
  const modifiers = COMMERCIAL_MODIFIERS.filter((word) => metric.keyword.toLowerCase().includes(word));
  return {
    ...metric,
    intent: inferIntent(metric.keyword),
    relevanceScore: computeRelevanceScore(seedKeyword, metric.keyword),
    opportunityScore: computeOpportunityScore(metric, seedKeyword),
    cluster,
    longTail: tokenize(metric.keyword).length >= 4,
    question,
    modifiers,
    rawFieldCount: 5,
    derivedFieldCount: 5,
  };
}
