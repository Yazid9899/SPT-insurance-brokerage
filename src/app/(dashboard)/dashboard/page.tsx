import { CasesByProductChart } from "@/components/reports/cases-by-product-chart";
import { CasesByStatusChart } from "@/components/reports/cases-by-status-chart";
import { DashboardStatsCards } from "@/components/reports/dashboard-stats-cards";
import { MonthlyCommissionChart } from "@/components/reports/monthly-commission-chart";
import { RecentCasesTable } from "@/components/reports/recent-cases-table";
import { PageHeader } from "@/components/shared/page-header";
import { getDashboardSummary } from "@/lib/reports-service";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" description="Operational snapshot across all insurance cases" />
      <DashboardStatsCards summary={summary} />
      <div className="grid gap-4 xl:grid-cols-2">
        <CasesByStatusChart items={summary.statusDistribution} />
        <CasesByProductChart items={summary.productDistribution} />
        <MonthlyCommissionChart items={summary.monthlyCommissionTrend} />
        <RecentCasesTable rows={summary.recentCases} />
      </div>
    </div>
  );
}
