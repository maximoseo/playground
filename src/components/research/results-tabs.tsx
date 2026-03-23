"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { exportCsv, exportJson, exportXlsx } from "@/lib/export";
import { DerivedKeyword, ResearchResponse, SavedList } from "@/lib/types";
import { ResultsTable } from "./results-table";

const tabs = ["Overview", "Related Keywords", "Long-Tail Keywords", "PASF", "Questions", "Clusters", "Favorites / Saved Lists", "Export / Reports", "Settings"] as const;

function downloadBlob(filename: string, data: BlobPart, type: string) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ResultsTabs({ research, savedLists, onSaveList, apiConnected }: { research: ResearchResponse; savedLists: SavedList[]; onSaveList: (name: string, rows: DerivedKeyword[]) => void; apiConnected: boolean; }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");
  const [favorites, setFavorites] = useState<DerivedKeyword[]>([]);

  const favoriteNames = useMemo(() => favorites.map((item) => item.keyword), [favorites]);
  const toggleFavorite = (item: DerivedKeyword) => {
    setFavorites((current) => current.some((entry) => entry.keyword === item.keyword) ? current.filter((entry) => entry.keyword !== item.keyword) : [...current, item]);
  };

  return (
    <section className="space-y-4">
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-2 rounded-3xl border border-white/10 bg-white/70 p-2 shadow-lg dark:bg-slate-900/70">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-2xl px-4 py-2 text-sm ${activeTab === tab ? "bg-slate-950 text-white dark:bg-sky-500 dark:text-slate-950" : "text-slate-600 dark:text-slate-300"}`}>{tab}</button>
          ))}
        </div>
      </div>

      {activeTab === "Overview" && (
        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold">Opportunity by cluster</h3>
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={research.tabs.clusters}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" hide={false} interval={0} angle={-18} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgOpportunity" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold">Field policy</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li><strong>Raw:</strong> volume, CPC, competition, trend</li>
              <li><strong>Derived:</strong> intent, relevance, opportunity, cluster</li>
              <li><strong>App insight:</strong> best balanced keyword, dominant intent, credit note</li>
            </ul>
            <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-950">{research.meta.creditEstimate}</p>
          </div>
        </div>
      )}

      {activeTab === "Related Keywords" && <ResultsTable rows={research.tabs.related} onToggleFavorite={toggleFavorite} favorites={favoriteNames} />}
      {activeTab === "Long-Tail Keywords" && <ResultsTable rows={research.tabs.longTail} onToggleFavorite={toggleFavorite} favorites={favoriteNames} />}
      {activeTab === "PASF" && <ResultsTable rows={research.tabs.pasf} onToggleFavorite={toggleFavorite} favorites={favoriteNames} />}
      {activeTab === "Questions" && <ResultsTable rows={research.tabs.questions} onToggleFavorite={toggleFavorite} favorites={favoriteNames} />}

      {activeTab === "Clusters" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {research.tabs.clusters.map((cluster) => (
            <article key={cluster.label} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h4 className="font-semibold">{cluster.label}</h4>
              <p className="mt-2 text-sm text-slate-500">{cluster.count} keywords</p>
              <p className="mt-4 text-2xl font-semibold">{cluster.avgOpportunity}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Avg. opportunity</p>
            </article>
          ))}
        </div>
      )}

      {activeTab === "Favorites / Saved Lists" && (
        <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Current favorites</h3>
              <button className="rounded-2xl bg-slate-950 px-4 py-2 text-sm text-white dark:bg-sky-500 dark:text-slate-950" onClick={() => onSaveList(`List ${savedLists.length + 1}`, favorites)}>Save as list</button>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {favorites.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-slate-500 dark:bg-slate-950">No favorites yet. Save keywords from any results tab.</p> : favorites.map((item) => <div key={item.keyword} className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">{item.keyword}</div>)}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold">Saved lists</h3>
            <div className="mt-4 space-y-3 text-sm">
              {savedLists.map((list) => (
                <article key={list.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <p className="font-medium">{list.name}</p>
                  <p className="text-slate-500">{list.keywords.length} keywords</p>
                </article>
              ))}
              {savedLists.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-slate-500 dark:bg-slate-950">No saved lists yet.</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Export / Reports" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold">Export current research</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-2xl border px-4 py-2 text-sm" onClick={() => downloadBlob(`keyword-research-${research.meta.seedKeyword}.csv`, exportCsv(research, research.allKeywords), "text/csv")}>Export CSV</button>
            <button className="rounded-2xl border px-4 py-2 text-sm" onClick={() => downloadBlob(`keyword-research-${research.meta.seedKeyword}.json`, exportJson(research, research.allKeywords), "application/json")}>Export JSON</button>
            <button className="rounded-2xl border px-4 py-2 text-sm" onClick={() => downloadBlob(`keyword-research-${research.meta.seedKeyword}.xlsx`, exportXlsx(research, research.allKeywords), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")}>Export XLSX</button>
          </div>
        </div>
      )}

      {activeTab === "Settings" && (
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold">API connectivity</h3>
            <p className="mt-3 text-sm text-slate-500">{apiConnected ? "Connected. Server-side env var detected." : "Missing KEYWORDS_EVERYWHERE_API_KEY. Research will fail until it is configured."}</p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold">Request policy</h3>
            <p className="mt-3 text-sm text-slate-500">No fetch on keypress, no duplicate tab refetch, identical requests are served from server cache when fresh.</p>
          </article>
        </div>
      )}
    </section>
  );
}
