"use client";

import Link from "next/link";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import type { CaseLifecycleStatus } from "@/lib/constants";
import type { ReportsDashboardSummary } from "@/types";

type Props = {
  rows: ReportsDashboardSummary["recentCases"];
};

function toCaseLifecycleStatus(value: string): CaseLifecycleStatus {
  if (
    value === "DRAFT" ||
    value === "DOCUMENTATION" ||
    value === "UNDERWRITING" ||
    value === "ACTIVE" ||
    value === "BILLING" ||
    value === "SETTLING" ||
    value === "CLOSED"
  ) {
    return value;
  }
  return "DRAFT";
}

export function RecentCasesTable({ rows }: Props) {
  const data = rows.map((row) => ({
    caseNumber: <Link href={`/cases/${row.id}`}>{row.caseNumber}</Link>,
    clientName: row.clientName,
    productLine: row.productLine,
    status: <StatusBadge status={toCaseLifecycleStatus(row.status)} />,
    createdAt: new Date(row.createdAt).toLocaleDateString(),
  }));

  return (
    <section className="rounded border bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold">Recent Cases</h3>
      <DataTable
        rows={data}
        pageSize={5}
        columns={[
          { key: "caseNumber", label: "Case #" },
          { key: "clientName", label: "Client" },
          { key: "productLine", label: "Product Line" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Created" },
        ]}
        emptyState="No recent cases found."
      />
    </section>
  );
}
