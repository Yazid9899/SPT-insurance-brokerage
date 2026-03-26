import { formatFinancialValue } from "@/lib/utils";
import type { ReportsDashboardSummary } from "@/types";

type Props = {
  summary: ReportsDashboardSummary;
};

export function DashboardStatsCards({ summary }: Props) {
  const items = [
    { label: "Total Cases", value: summary.totalCases.toLocaleString() },
    { label: "Active Cases", value: summary.activeCases.toLocaleString() },
    { label: "Pending Billing", value: summary.pendingBillingCount.toLocaleString() },
    { label: "Total Exposure (USD)", value: formatFinancialValue(summary.totalExposureUsd, "USD") },
    { label: "Monthly Commission", value: formatFinancialValue(summary.monthlyCommission, "USD") },
    { label: "Unsettled Amount", value: formatFinancialValue(summary.unsettledAmount, "USD") },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item.label} className="rounded border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">{item.label}</p>
          <p className="mt-1 text-xl font-semibold">{item.value}</p>
        </article>
      ))}
      {summary.excludedCurrencyCount > 0 ? (
        <article className="rounded border border-amber-300 bg-amber-50 p-4 md:col-span-2 xl:col-span-3">
          <p className="text-sm text-amber-800">
            {summary.excludedCurrencyCount} case(s) were excluded from USD exposure due to unsupported currency.
          </p>
        </article>
      ) : null}
    </section>
  );
}
