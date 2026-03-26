"use client";

export function BulkUploadConfirmStep({
  openCoverReference,
  caseCount,
  totals,
}: {
  openCoverReference: string;
  caseCount: number;
  totals: {
    sumInsured: string;
    clientPremium: string;
    insurerPremium: string;
    brokerCommission: string;
  };
}) {
  return (
    <div className="space-y-3 rounded border bg-white p-4">
      <p className="text-sm">
        Creating <strong>{caseCount}</strong> draft cases under <strong>{openCoverReference}</strong>
      </p>
      <div className="rounded border bg-slate-50 p-3 text-sm">
        <p><strong>Total Sum Insured:</strong> {totals.sumInsured}</p>
        <p><strong>Total Client Premium:</strong> {totals.clientPremium}</p>
        <p><strong>Total Insurer Premium:</strong> {totals.insurerPremium}</p>
        <p className="text-base font-semibold"><strong>Total Broker Commission:</strong> {totals.brokerCommission}</p>
      </div>
    </div>
  );
}

