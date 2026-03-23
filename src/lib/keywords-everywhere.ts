import { assignCluster, dedupeRawKeywords, summarizeClusters } from "@/lib/clustering";
import { getCachedPayload, makeCacheKey, setCachedPayload } from "@/lib/cache";
import { getKeywordsEverywhereApiKey } from "@/lib/env";
import { enrichKeyword } from "@/lib/scoring";
import { QueryOptions, RawKeywordMetric, ResearchResponse } from "@/lib/types";

const BASE_URL = "https://api.keywordseverywhere.com/v1";

function buildDerivedQuestions(seedKeyword: string, related: RawKeywordMetric[]) {
  const starters = ["how", "what", "why", "when", "where", "who", "best", "can"];
  return related
    .filter((item) => starters.some((starter) => item.keyword.toLowerCase().startsWith(`${starter} `)))
    .map((item) => ({ ...item, sourceType: "derived-question" as const }));
}

function buildDerivedLongTail(seedKeyword: string, related: RawKeywordMetric[]) {
  return related
    .filter((item) => item.keyword.split(/\s+/).length >= 4 || item.keyword.toLowerCase().includes(seedKeyword.toLowerCase()))
    .map((item) => ({ ...item, sourceType: "derived-long-tail" as const }));
}

function normalizeKeyword(item: Record<string, unknown>, sourceType: RawKeywordMetric["sourceType"]): RawKeywordMetric | null {
  const keyword = String(item.keyword ?? item.text ?? item.searchTerm ?? "").trim();
  if (!keyword) return null;
  return {
    keyword,
    volume: typeof item.vol === "number" ? item.vol : typeof item.searchVolume === "number" ? item.searchVolume : typeof item.volume === "number" ? item.volume : null,
    cpc: typeof item.cpc === "number" ? item.cpc : null,
    competition: typeof item.competition === "number" ? item.competition : null,
    trend: Array.isArray(item.trend) ? (item.trend as number[]) : null,
    monthlySearches: Array.isArray(item.monthly) ? (item.monthly as number[]) : null,
    sourceType,
  };
}

async function callEndpoint(endpoint: string, payload: Record<string, unknown>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getKeywordsEverywhereApiKey()}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Keywords Everywhere ${endpoint} failed (${response.status}): ${text.slice(0, 240)}`);
    }

    return response.json() as Promise<Record<string, unknown>>;
  } finally {
    clearTimeout(timeout);
  }
}

function pickArrayPayload(response: Record<string, unknown>) {
  const candidates = [response.data, response.keywords, response.results, response.related_keywords, response.pasf_keywords];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as Record<string, unknown>[];
  }
  return [];
}

function applyFilters(items: ReturnType<typeof enrichKeyword>[], options: QueryOptions) {
  return items.filter((item) => {
    if (options.includeTerms && !options.includeTerms.toLowerCase().split(",").some((term) => item.keyword.toLowerCase().includes(term.trim()))) return false;
    if (options.excludeTerms && options.excludeTerms.toLowerCase().split(",").some((term) => term.trim() && item.keyword.toLowerCase().includes(term.trim()))) return false;
    if (options.minSearchVolume && (item.volume ?? 0) < options.minSearchVolume) return false;
    if (options.maxCompetition !== undefined && (item.competition ?? 1) > options.maxCompetition) return false;
    if (options.minCpc && (item.cpc ?? 0) < options.minCpc) return false;
    if (options.maxCpc !== undefined && (item.cpc ?? 0) > options.maxCpc) return false;
    if (options.intentType && item.intent !== options.intentType) return false;
    if (options.questionOnly && !item.question) return false;
    if (options.longTailOnly && !item.longTail) return false;
    return true;
  });
}

function sortKeywords(items: ReturnType<typeof enrichKeyword>[], sortBy: QueryOptions["sortBy"]) {
  const sorted = [...items];
  const key = sortBy ?? "opportunity";
  sorted.sort((a, b) => {
    switch (key) {
      case "volume":
        return (b.volume ?? 0) - (a.volume ?? 0);
      case "competition":
        return (a.competition ?? 1) - (b.competition ?? 1);
      case "cpc":
        return (b.cpc ?? 0) - (a.cpc ?? 0);
      case "relevance":
        return b.relevanceScore - a.relevanceScore;
      default:
        return b.opportunityScore - a.opportunityScore;
    }
  });
  return sorted;
}

function summarize(keywords: ReturnType<typeof enrichKeyword>[]) {
  const withVolume = keywords.filter((item) => item.volume !== null);
  const withCpc = keywords.filter((item) => item.cpc !== null);
  const withCompetition = keywords.filter((item) => item.competition !== null);
  const topVolume = [...keywords].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))[0];
  const lowCompetition = [...keywords].sort((a, b) => (a.competition ?? 1) - (b.competition ?? 1))[0];
  const bestBalanced = [...keywords].sort((a, b) => b.opportunityScore - a.opportunityScore)[0];
  const intentCounts = keywords.reduce<Record<string, number>>((acc, item) => {
    acc[item.intent] = (acc[item.intent] ?? 0) + 1;
    return acc;
  }, {});
  const dominantIntentBucket = Object.entries(intentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    totalKeywords: keywords.length,
    averageVolume: withVolume.length ? Math.round(withVolume.reduce((sum, item) => sum + (item.volume ?? 0), 0) / withVolume.length) : 0,
    averageCpc: withCpc.length ? Number((withCpc.reduce((sum, item) => sum + (item.cpc ?? 0), 0) / withCpc.length).toFixed(2)) : 0,
    averageCompetition: withCompetition.length ? Number((withCompetition.reduce((sum, item) => sum + (item.competition ?? 0), 0) / withCompetition.length).toFixed(2)) : 0,
    topVolumeKeyword: topVolume?.keyword ?? null,
    lowestCompetitionKeyword: lowCompetition?.keyword ?? null,
    bestBalancedKeyword: bestBalanced?.keyword ?? null,
    dominantIntentBucket,
    trendHighlight: keywords.some((item) => item.trend?.length) ? "Trend data available for part of the returned set." : "No trend history returned by the upstream payload.",
  };
}

export async function runKeywordResearch(options: QueryOptions): Promise<ResearchResponse> {
  const cacheKey = makeCacheKey(options);
  const cached = await getCachedPayload<ResearchResponse>(cacheKey);
  if (cached) {
    return {
      ...cached,
      meta: { ...cached.meta, cacheHit: true },
    };
  }

  const commonPayload = {
    keywords: [options.seedKeyword],
    country: options.country.toUpperCase(),
    currency: "USD",
    dataSource: "gkp",
  };

  const [relatedRes, pasfRes] = await Promise.allSettled([
    callEndpoint("get_related_keywords", commonPayload),
    callEndpoint("get_PASF_keywords", commonPayload),
  ]);

  const relatedRaw = relatedRes.status === "fulfilled" ? pickArrayPayload(relatedRes.value).map((item) => normalizeKeyword(item, "related")).filter(Boolean) as RawKeywordMetric[] : [];
  const pasfRaw = pasfRes.status === "fulfilled" ? pickArrayPayload(pasfRes.value).map((item) => normalizeKeyword(item, "pasf")).filter(Boolean) as RawKeywordMetric[] : [];

  const keywordPool = dedupeRawKeywords([
    ...relatedRaw,
    ...pasfRaw,
    ...buildDerivedQuestions(options.seedKeyword, relatedRaw),
    ...buildDerivedLongTail(options.seedKeyword, relatedRaw),
  ]).slice(0, options.resultCount);

  const enriched = sortKeywords(
    applyFilters(
      keywordPool.map((item) => enrichKeyword(options.seedKeyword, item, assignCluster(item.keyword))),
      options,
    ),
    options.sortBy,
  );

  const response: ResearchResponse = {
    meta: {
      seedKeyword: options.seedKeyword,
      country: options.country,
      language: options.language,
      resultCount: options.resultCount,
      generatedAt: new Date().toISOString(),
      apiSourceLabel: "Keywords Everywhere API",
      cacheHit: false,
      creditEstimate: pasfRaw.length ? "Related + PASF may consume paid credits. Cache identical queries to avoid duplicate spend." : "Related keywords query may consume paid credits. PASF unavailable or not enabled.",
      tabsUsingRawData: ["Overview", "Related Keywords", "PASF"],
      tabsUsingDerivedData: ["Long-Tail Keywords", "Questions", "Clusters"],
    },
    overview: summarize(enriched),
    allKeywords: enriched,
    tabs: {
      related: enriched.filter((item) => item.sourceType === "related"),
      longTail: enriched.filter((item) => item.longTail),
      pasf: enriched.filter((item) => item.sourceType === "pasf"),
      questions: enriched.filter((item) => item.question),
      clusters: summarizeClusters(enriched),
    },
  };

  await setCachedPayload(cacheKey, response);
  return response;
}

export function countryOptions() {
  return [
    { value: "us", label: "United States" },
    { value: "gb", label: "United Kingdom" },
    { value: "ca", label: "Canada" },
    { value: "au", label: "Australia" },
    { value: "il", label: "Israel" },
  ];
}

export function languageOptions() {
  return [
    { value: "en", label: "English" },
    { value: "he", label: "Hebrew" },
  ];
}

export function sourceLegend() {
  return [
    { label: "Raw API", description: "Search volume, CPC, competition, trend data returned directly by Keywords Everywhere." },
    { label: "Derived", description: "Intent, cluster, long-tail classification, relevance and opportunity scores derived by deterministic app logic." },
    { label: "App Insight", description: "Summary cards such as best balanced opportunity and dominant intent bucket." },
  ];
}
