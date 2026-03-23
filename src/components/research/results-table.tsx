"use client";

import { useMemo, useState } from "react";
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { DerivedKeyword } from "@/lib/types";

export function ResultsTable({ rows, onToggleFavorite, favorites }: { rows: DerivedKeyword[]; onToggleFavorite: (row: DerivedKeyword) => void; favorites: string[]; }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "opportunityScore", desc: true }]);
  const columns = useMemo<ColumnDef<DerivedKeyword>[]>(() => [
    { accessorKey: "keyword", header: "Keyword" },
    { accessorKey: "volume", header: "Search Volume" },
    { accessorKey: "cpc", header: "CPC" },
    { accessorKey: "competition", header: "Competition" },
    { accessorKey: "intent", header: "Intent" },
    { accessorKey: "relevanceScore", header: "Relevance" },
    { accessorKey: "opportunityScore", header: "Opportunity" },
    { accessorKey: "cluster", header: "Cluster" },
    { accessorKey: "sourceType", header: "Source Type" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button className="rounded-full border px-3 py-1 text-xs" onClick={() => navigator.clipboard.writeText(row.original.keyword)}>Copy</button>
          <button className="rounded-full border px-3 py-1 text-xs" onClick={() => onToggleFavorite(row.original)}>{favorites.includes(row.original.keyword) ? "Saved" : "Save"}</button>
        </div>
      ),
    },
  ], [favorites, onToggleFavorite]);

  const table = useReactTable({ data: rows, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  return (
    <>
      <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left font-medium text-slate-500">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-top">{cell.column.columnDef.cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : String(cell.getValue() ?? "—")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid gap-3 lg:hidden">
        {rows.map((row) => (
          <article key={row.keyword} className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold">{row.keyword}</h4>
                <p className="mt-1 text-xs text-slate-500">{row.intent} · {row.cluster} · {row.sourceType}</p>
              </div>
              <button className="rounded-full border px-3 py-1 text-xs" onClick={() => onToggleFavorite(row)}>{favorites.includes(row.keyword) ? "Saved" : "Save"}</button>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-slate-500">Volume</dt><dd>{row.volume ?? "—"}</dd></div>
              <div><dt className="text-slate-500">CPC</dt><dd>{row.cpc ?? "—"}</dd></div>
              <div><dt className="text-slate-500">Competition</dt><dd>{row.competition ?? "—"}</dd></div>
              <div><dt className="text-slate-500">Opportunity</dt><dd>{row.opportunityScore}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
