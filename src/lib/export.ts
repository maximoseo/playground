import * as XLSX from "xlsx";
import { DerivedKeyword, ResearchResponse } from "@/lib/types";

function rowsFromKeywords(keywords: DerivedKeyword[]) {
  return keywords.map((item) => ({
    Keyword: item.keyword,
    Volume: item.volume,
    CPC: item.cpc,
    Competition: item.competition,
    Trend: item.trend?.join("|") ?? "",
    Intent: item.intent,
    RelevanceScore: item.relevanceScore,
    OpportunityScore: item.opportunityScore,
    Cluster: item.cluster,
    SourceType: item.sourceType,
    RawFields: "keyword,volume,cpc,competition,trend",
    DerivedFields: "intent,relevanceScore,opportunityScore,cluster,longTail,question",
  }));
}

export function exportJson(research: ResearchResponse, keywords: DerivedKeyword[]) {
  return JSON.stringify({ meta: research.meta, overview: research.overview, keywords }, null, 2);
}

export function exportCsv(research: ResearchResponse, keywords: DerivedKeyword[]) {
  const sheet = XLSX.utils.json_to_sheet(rowsFromKeywords(keywords));
  return XLSX.utils.sheet_to_csv(sheet);
}

export function exportXlsx(research: ResearchResponse, keywords: DerivedKeyword[]) {
  const workbook = XLSX.utils.book_new();
  const keywordSheet = XLSX.utils.json_to_sheet(rowsFromKeywords(keywords));
  const metaSheet = XLSX.utils.json_to_sheet([
    { key: "seedKeyword", value: research.meta.seedKeyword },
    { key: "country", value: research.meta.country },
    { key: "language", value: research.meta.language },
    { key: "generatedAt", value: research.meta.generatedAt },
    { key: "sortState", value: "Client managed" },
  ]);
  XLSX.utils.book_append_sheet(workbook, keywordSheet, "Keywords");
  XLSX.utils.book_append_sheet(workbook, metaSheet, "Meta");
  return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
}
