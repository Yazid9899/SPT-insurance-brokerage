"use client";

import { useMemo, useState } from "react";

type Column<T> = {
  key: keyof T;
  label: string;
};

export function DataTable<T extends Record<string, string | number>>({
  rows,
  columns,
}: {
  rows: T[];
  columns: Column<T>[];
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [query, rows]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

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
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.map((row, idx) => (
            <tr key={idx}>
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
