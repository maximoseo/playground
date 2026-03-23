export type ResultCount = 50 | 100 | 200;

export type QueryOptions = {
  seedKeyword: string;
  country: string;
  language: string;
  resultCount: ResultCount;
  includeTerms?: string;
  excludeTerms?: string;
  sortBy?: "opportunity" | "volume" | "competition" | "cpc" | "relevance";
  minSearchVolume?: number;
  maxCompetition?: number;
  minCpc?: number;
  maxCpc?: number;
  intentType?: string;
  questionOnly?: boolean;
  longTailOnly?: boolean;
};

export type RawKeywordMetric = {
  keyword: string;
  volume: number | null;
  cpc: number | null;
  competition: number | null;
  trend?: number[] | null;
  monthlySearches?: number[] | null;
  sourceType: "related" | "pasf" | "derived-question" | "derived-long-tail";
};

export type DerivedKeyword = RawKeywordMetric & {
  intent: string;
  relevanceScore: number;
  opportunityScore: number;
  cluster: string;
  longTail: boolean;
  question: boolean;
  modifiers: string[];
  rawFieldCount: number;
  derivedFieldCount: number;
};

export type SummaryInsight = {
  totalKeywords: number;
  averageVolume: number;
  averageCpc: number;
  averageCompetition: number;
  topVolumeKeyword: string | null;
  lowestCompetitionKeyword: string | null;
  bestBalancedKeyword: string | null;
  dominantIntentBucket: string | null;
  trendHighlight: string;
};

export type ResearchResponse = {
  meta: {
    seedKeyword: string;
    country: string;
    language: string;
    resultCount: number;
    generatedAt: string;
    apiSourceLabel: string;
    cacheHit: boolean;
    creditEstimate: string;
    tabsUsingRawData: string[];
    tabsUsingDerivedData: string[];
  };
  overview: SummaryInsight;
  allKeywords: DerivedKeyword[];
  tabs: {
    related: DerivedKeyword[];
    longTail: DerivedKeyword[];
    pasf: DerivedKeyword[];
    questions: DerivedKeyword[];
    clusters: Array<{ label: string; count: number; avgOpportunity: number }>;
  };
};

export type SavedList = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  keywords: DerivedKeyword[];
};

export type AppSettings = {
  theme: "system" | "light" | "dark";
  defaultCountry: string;
  defaultLanguage: string;
  defaultResultCount: ResultCount;
  cacheEnabled: boolean;
  density: "comfortable" | "compact";
};
