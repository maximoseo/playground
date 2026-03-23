import { z } from "zod";

export const researchRequestSchema = z.object({
  seedKeyword: z.string().trim().min(1, "Seed keyword is required").max(120),
  country: z.string().trim().min(2).max(8).default("us"),
  language: z.string().trim().min(2).max(8).default("en"),
  resultCount: z.union([z.literal(50), z.literal(100), z.literal(200)]).default(50),
  includeTerms: z.string().optional().default(""),
  excludeTerms: z.string().optional().default(""),
  sortBy: z.enum(["opportunity", "volume", "competition", "cpc", "relevance"]).default("opportunity"),
  minSearchVolume: z.number().min(0).optional(),
  maxCompetition: z.number().min(0).max(1).optional(),
  minCpc: z.number().min(0).optional(),
  maxCpc: z.number().min(0).optional(),
  intentType: z.string().optional().default(""),
  questionOnly: z.boolean().optional().default(false),
  longTailOnly: z.boolean().optional().default(false),
});

export const keywordMetricSchema = z.object({
  keyword: z.string(),
  vol: z.number().nullable().optional(),
  cpc: z.number().nullable().optional(),
  competition: z.number().nullable().optional(),
  monthly: z.array(z.number()).nullable().optional(),
  trend: z.array(z.number()).nullable().optional(),
});

export function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}
