import { PageHeader } from "@/components/shared/page-header";
import { CommissionByInsurerChart } from "@/components/reports/commission-by-insurer-chart";
import { MonthlyCaseVolumeChart } from "@/components/reports/monthly-case-volume-chart";
import { ReportsCasesTable } from "@/components/reports/reports-cases-table";
import { ReportsFilterBar } from "@/components/reports/reports-filter-bar";
import { getCommissionBreakdown, getReportCases, getReportSummary, parseReportFilters } from "@/lib/reports-service";
import { formatFinancialValue } from "@/lib/utils";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const filters = parseReportFilters(resolved);
  const [summary, cases, commission] = await Promise.all([
    getReportSummary(filters),
    getReportCases(filters),
    getCommissionBreakdown(filters),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" description="Operational reporting by date range and filters" />
      <ReportsFilterBar
        defaultFrom={typeof resolved.dateFrom === "string" ? resolved.dateFrom : undefined}
        defaultTo={typeof resolved.dateTo === "string" ? resolved.dateTo : undefined}
      />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Total Cases</p>
          <p className="mt-1 text-xl font-semibold">{summary.totalCases.toLocaleString()}</p>
        </article>
        <article className="rounded border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Total Sum Insured</p>
          <p className="mt-1 text-xl font-semibold">{formatFinancialValue(summary.totalSumInsured, "USD")}</p>
        </article>
        <article className="rounded border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Total Client Premium</p>
          <p className="mt-1 text-xl font-semibold">{formatFinancialValue(summary.totalClientPremium, "USD")}</p>
        </article>
        <article className="rounded border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Total Insurer Premium</p>
          <p className="mt-1 text-xl font-semibold">{formatFinancialValue(summary.totalInsurerPremium, "USD")}</p>
        </article>
        <article className="rounded border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Total Broker Commission</p>
          <p className="mt-1 text-xl font-semibold">{formatFinancialValue(summary.totalBrokerCommission, "USD")}</p>
        </article>
      </section>
      <div className="grid gap-4 xl:grid-cols-2">
        <MonthlyCaseVolumeChart items={summary.monthlyCaseVolume} />
        <CommissionByInsurerChart items={commission.byInsurer} />
      </div>
      <ReportsCasesTable rows={cases.items} />
    </div>
  );
}
