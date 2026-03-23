import { DerivedKeyword, RawKeywordMetric } from "@/lib/types";

export function assignCluster(keyword: string) {
  const lower = keyword.toLowerCase();
  if (lower.includes(" vs ") || lower.includes("compare")) return "Comparison";
  if (["who ", "what ", "why ", "how ", "when ", "where "].some((prefix) => lower.startsWith(prefix))) return "Question-based";
  if (lower.includes("near me") || lower.includes(" in ")) return "Local intent";
  if (["best", "buy", "price", "cost", "service", "tool", "software"].some((token) => lower.includes(token))) return "Commercial";
  if (lower.split(/\s+/).length >= 4) return "Long-tail";
  if (lower.includes("brand") || lower.includes("official")) return "Branded";
  return "Informational";
}

export function summarizeClusters(keywords: DerivedKeyword[]) {
  const grouped = keywords.reduce<Record<string, DerivedKeyword[]>>((acc, keyword) => {
    acc[keyword.cluster] ??= [];
    acc[keyword.cluster].push(keyword);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([label, items]) => ({
      label,
      count: items.length,
      avgOpportunity: Math.round(items.reduce((sum, item) => sum + item.opportunityScore, 0) / items.length),
    }))
    .sort((a, b) => b.count - a.count);
}

export function dedupeRawKeywords(metrics: RawKeywordMetric[]) {
  const map = new Map<string, RawKeywordMetric>();
  for (const metric of metrics) {
    const key = metric.keyword.trim().toLowerCase();
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, metric);
      continue;
    }
    const existing = map.get(key)!;
    map.set(key, {
      ...existing,
      volume: existing.volume ?? metric.volume,
      cpc: existing.cpc ?? metric.cpc,
      competition: existing.competition ?? metric.competition,
      trend: existing.trend ?? metric.trend,
      monthlySearches: existing.monthlySearches ?? metric.monthlySearches,
      sourceType: existing.sourceType,
    });
  }
  return [...map.values()];
}
