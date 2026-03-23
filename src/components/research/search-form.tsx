"use client";

import { countryOptions, languageOptions } from "@/lib/shared";
import { QueryOptions } from "@/lib/types";

type Props = {
  value: QueryOptions;
  onChange: (patch: Partial<QueryOptions>) => void;
  onSubmit: () => void;
  loading: boolean;
};

export function SearchForm({ value, onChange, onSubmit, loading }: Props) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/80 p-4 shadow-2xl shadow-slate-950/5 backdrop-blur md:p-6 dark:bg-slate-900/80">
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,2.2fr)_repeat(3,minmax(0,1fr))]">
          <input
            value={value.seedKeyword}
            onChange={(event) => onChange({ seedKeyword: event.target.value })}
            placeholder="Enter a seed keyword"
            className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-0 transition focus:border-sky-500 dark:border-slate-700 dark:bg-slate-950"
          />
          <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950" value={value.country} onChange={(event) => onChange({ country: event.target.value })}>
            {countryOptions().map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950" value={value.language} onChange={(event) => onChange({ language: event.target.value })}>
            {languageOptions().map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950" value={value.resultCount} onChange={(event) => onChange({ resultCount: Number(event.target.value) as QueryOptions['resultCount'] })}>
            {[50, 100, 200].map((count) => <option key={count} value={count}>{count} results</option>)}
          </select>
        </div>

        <details className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/70">
          <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-200">Advanced filters</summary>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Include terms (comma-separated)" value={value.includeTerms ?? ""} onChange={(e) => onChange({ includeTerms: e.target.value })} />
            <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" placeholder="Exclude terms" value={value.excludeTerms ?? ""} onChange={(e) => onChange({ excludeTerms: e.target.value })} />
            <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" value={value.sortBy} onChange={(e) => onChange({ sortBy: e.target.value as QueryOptions['sortBy'] })}>
              <option value="opportunity">Sort by opportunity</option>
              <option value="volume">Sort by volume</option>
              <option value="competition">Sort by competition</option>
              <option value="cpc">Sort by CPC</option>
              <option value="relevance">Sort by relevance</option>
            </select>
            <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" type="number" placeholder="Min search volume" value={value.minSearchVolume ?? ""} onChange={(e) => onChange({ minSearchVolume: e.target.value ? Number(e.target.value) : undefined })} />
            <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" type="number" step="0.01" placeholder="Max competition (0-1)" value={value.maxCompetition ?? ""} onChange={(e) => onChange({ maxCompetition: e.target.value ? Number(e.target.value) : undefined })} />
            <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900" type="number" step="0.01" placeholder="Min CPC" value={value.minCpc ?? ""} onChange={(e) => onChange({ minCpc: e.target.value ? Number(e.target.value) : undefined })} />
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
              <label className="flex items-center gap-2"><input type="checkbox" checked={value.questionOnly ?? false} onChange={(e) => onChange({ questionOnly: e.target.checked })} /> Questions only</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={value.longTailOnly ?? false} onChange={(e) => onChange({ longTailOnly: e.target.checked })} /> Long-tail only</label>
            </div>
          </div>
        </details>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">Credit preservation: explicit Run Research only, server TTL cache, request dedupe and no refetch on tab switch.</p>
          <button onClick={onSubmit} disabled={loading || !value.seedKeyword.trim()} className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400">
            {loading ? "Running research…" : "Run Research"}
          </button>
        </div>
      </div>
    </section>
  );
}
