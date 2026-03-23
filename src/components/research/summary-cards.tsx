import { ResearchResponse } from "@/lib/types";

export function SummaryCards({ research }: { research: ResearchResponse }) {
  const cards = [
    ["Total keywords", research.overview.totalKeywords],
    ["Avg. volume", research.overview.averageVolume],
    ["Avg. CPC", `$${research.overview.averageCpc}`],
    ["Avg. competition", research.overview.averageCompetition],
    ["Top volume", research.overview.topVolumeKeyword ?? "—"],
    ["Low competition", research.overview.lowestCompetitionKeyword ?? "—"],
    ["Best balanced", research.overview.bestBalancedKeyword ?? "—"],
    ["Dominant intent", research.overview.dominantIntentBucket ?? "—"],
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, value]) => (
        <article key={label} className="rounded-3xl border border-white/10 bg-white/80 p-5 shadow-lg shadow-slate-950/5 dark:bg-slate-900/80">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">{String(value)}</p>
        </article>
      ))}
    </section>
  );
}
