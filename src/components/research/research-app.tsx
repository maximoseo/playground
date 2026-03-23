"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ResultsTabs } from "@/components/research/results-tabs";
import { SearchForm } from "@/components/research/search-form";
import { SummaryCards } from "@/components/research/summary-cards";
import { QueryOptions, ResearchResponse, SavedList } from "@/lib/types";

const defaults: QueryOptions = {
  seedKeyword: "keyword research tool",
  country: "us",
  language: "en",
  resultCount: 50,
  includeTerms: "",
  excludeTerms: "",
  sortBy: "opportunity",
  questionOnly: false,
  longTailOnly: false,
};

async function fetchSettingsStatus() {
  const response = await fetch("/api/settings/status");
  return response.json() as Promise<{ apiConnected: boolean }>;
}

async function fetchLists() {
  const response = await fetch("/api/lists");
  return response.json() as Promise<SavedList[]>;
}

export function ResearchApp() {
  const [form, setForm] = useState<QueryOptions>(defaults);
  const [research, setResearch] = useState<ResearchResponse | null>(null);
  const queryClient = useQueryClient();

  const settingsStatus = useQuery({ queryKey: ["settings-status"], queryFn: fetchSettingsStatus });
  const savedLists = useQuery({ queryKey: ["saved-lists"], queryFn: fetchLists });

  const runResearch = useMutation({
    mutationFn: async (payload: QueryOptions) => {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Research failed");
      return json as ResearchResponse;
    },
    onSuccess: (data) => setResearch(data),
  });

  const saveList = useMutation({
    mutationFn: async ({ name, rows }: { name: string; rows: SavedList["keywords"] }) => {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, keywords: rows }),
      });
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-lists"] }),
  });

  const emptyState = useMemo(() => (
    <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-lg dark:border-slate-700 dark:bg-slate-900/60">
      <p className="text-sm uppercase tracking-[0.2em] text-sky-600 dark:text-sky-400">Premium keyword intelligence</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Research keywords, cluster intent, save opportunities, and export reports.</h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400">Designed for explicit credit-aware research only. No wasted fetches, no client-side secret leakage, and no fabricated rows.</p>
    </section>
  ), []);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 xl:px-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sky-600 dark:text-sky-400">Playground · Keyword Research SaaS</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">Premium keyword opportunity workspace</h1>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
            <strong>Connectivity:</strong> {settingsStatus.data?.apiConnected ? "API ready" : "Missing env var"}
          </div>
        </div>
        <SearchForm value={form} onChange={(patch) => setForm((current) => ({ ...current, ...patch }))} onSubmit={() => runResearch.mutate(form)} loading={runResearch.isPending} />
      </header>

      {runResearch.error && (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {(runResearch.error as Error).message}
        </section>
      )}

      {!research && emptyState}

      {research && (
        <>
          <SummaryCards research={research} />
          <ResultsTabs research={research} apiConnected={Boolean(settingsStatus.data?.apiConnected)} savedLists={savedLists.data ?? []} onSaveList={(name, rows) => saveList.mutate({ name, rows })} />
        </>
      )}
    </div>
  );
}
