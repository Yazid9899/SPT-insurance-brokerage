"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  defaultFrom?: string;
  defaultTo?: string;
};

export function ReportsFilterBar({ defaultFrom, defaultTo }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dateFrom, setDateFrom] = useState(defaultFrom ?? searchParams.get("dateFrom") ?? "");
  const [dateTo, setDateTo] = useState(defaultTo ?? searchParams.get("dateTo") ?? "");

  const exportHref = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return `/api/reports/export?${params.toString()}`;
  }, [dateFrom, dateTo, searchParams]);

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    if (dateFrom) params.set("dateFrom", dateFrom);
    else params.delete("dateFrom");

    if (dateTo) params.set("dateTo", dateTo);
    else params.delete("dateTo");

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <section className="rounded border bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold">Report Filters</h3>
      <div className="grid gap-3 md:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>Date From</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="rounded border px-2 py-1"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>Date To</span>
          <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="rounded border px-2 py-1" />
        </label>
        <div className="flex items-end gap-2 md:col-span-2">
          <button type="button" onClick={applyFilters} className="rounded border px-3 py-2 text-sm font-medium">
            Apply
          </button>
          <a href={exportHref} className="rounded border px-3 py-2 text-sm font-medium">
            Export CSV
          </a>
        </div>
      </div>
    </section>
  );
}
