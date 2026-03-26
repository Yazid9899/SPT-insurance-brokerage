"use client";

import Link from "next/link";

import { DataTable } from "@/components/shared/data-table";
import type { SettlementListItem } from "@/types";

function statusClass(status: SettlementListItem["status"]) {
  switch (status) {
    case "DRAFT":
      return "bg-slate-100 text-slate-700";
    case "CONFIRMED":
      return "bg-amber-100 text-amber-700";
    case "PAID":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-zinc-100 text-zinc-700";
  }
}

export function SettlementsTable({ rows }: { rows: SettlementListItem[] }) {
  const tableRows = rows.map((row) => ({
    reference: (
      <Link href={`/settlements/${row.id}`} className="font-medium hover:underline">
        {row.settlementNumber}
      </Link>
    ),
    period: row.period,
    insurer: row.insurerName,
    cases: row.caseCount,
    insurerPremium: row.totalInsurerPremium,
    commission: row.totalBrokerCommission,
    status: <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClass(row.status)}`}>{row.status}</span>,
  }));

  return (
    <DataTable
      rows={tableRows}
      columns={[
        { key: "reference", label: "Reference" },
        { key: "period", label: "Period" },
        { key: "insurer", label: "Insurer" },
        { key: "cases", label: "# Cases" },
        { key: "insurerPremium", label: "Total Insurer Premium" },
        { key: "commission", label: "Total Commission" },
        { key: "status", label: "Status" },
      ]}
      pageSize={20}
      emptyState="No settlements found."
      getRowKey={(row) => String(row.reference)}
    />
  );
}

