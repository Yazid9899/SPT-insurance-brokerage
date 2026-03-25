import { FoundationReferencePanel } from "@/components/shared/foundation-reference-panel";
import { PageHeader } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/currency";

export default function DashboardPage() {
  const samplePremium = formatCurrency("1250.5", "USD");

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Foundation dashboard placeholder" />
      <section className="rounded border bg-white p-4">
        <p>This module is available and protected. Full workflow behavior ships in later features.</p>
        <p className="mt-2 text-sm text-slate-600">Sample premium formatting: {samplePremium}</p>
      </section>
      <FoundationReferencePanel />
    </div>
  );
}
