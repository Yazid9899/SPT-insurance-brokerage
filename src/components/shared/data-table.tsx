"use client";

import React from "react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

type Column<T> = {
  key: keyof T;
  label: string;
};

type SortDirection = "asc" | "desc";

type PrimitiveCell = string | number | null | undefined;

export function DataTable<T extends Record<string, ReactNode | PrimitiveCell>>({
  rows,
  columns,
  pageSize = 10,
  emptyState = "No rows found.",
  getRowKey,
}: {
  rows: T[];
  columns: Column<T>[];
  pageSize?: number;
  emptyState?: ReactNode;
  getRowKey?: (row: T, index: number) => string;
}) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<keyof T>(columns[0]?.key);
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((value) =>
        typeof value === "string" || typeof value === "number"
          ? String(value).toLowerCase().includes(normalized)
          : false,
      ),
    );
  }, [query, rows]);

  const sorted = useMemo(() => {
    if (!sortBy) {
      return filtered;
    }
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      const va = typeof av === "number" || typeof av === "string" ? av : "";
      const vb = typeof bv === "number" || typeof bv === "string" ? bv : "";
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [filtered, sortBy, sortDir]);

  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(column: keyof T) {
    if (sortBy !== column) {
      setSortBy(column);
      setSortDir("asc");
      return;
    }
    setSortDir((current) => (current === "asc" ? "desc" : "asc"));
  }

  return (
    <div className="space-y-3 rounded border bg-white p-3">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter"
        className="w-full rounded border px-2 py-1"
      />
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className="border-b px-2 py-1 text-left">
                <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort(column.key)}>
                  {column.label}
                  {sortBy === column.key ? (sortDir === "asc" ? "▲" : "▼") : null}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-2 py-4 text-center text-slate-500">
                {emptyState}
              </td>
            </tr>
          ) : null}
          {paged.map((row, idx) => (
            <tr key={getRowKey ? getRowKey(row, idx) : idx}>
              {columns.map((column) => (
                <td key={String(column.key)} className="border-b px-2 py-1">
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          className="rounded border px-2 py-1 disabled:opacity-40"
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button
          type="button"
          disabled={page * pageSize >= filtered.length}
          onClick={() => setPage((current) => current + 1)}
          className="rounded border px-2 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
