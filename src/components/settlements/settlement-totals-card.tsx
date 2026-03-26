import type { SettlementDetail } from "@/types";

export function SettlementTotalsCard({
  totals,
}: {
  totals: Pick<SettlementDetail, "caseCount" | "totalInsurerPremium" | "totalBrokerCommission">;
}) {
  return (
    <div className="rounded border bg-slate-50 p-3 text-sm">
      <p><strong>Included Cases:</strong> {totals.caseCount}</p>
      <p><strong>Total Insurer Premium:</strong> {totals.totalInsurerPremium}</p>
      <p className="text-base font-semibold"><strong>Total Broker Commission:</strong> {totals.totalBrokerCommission}</p>
    </div>
  );
}

