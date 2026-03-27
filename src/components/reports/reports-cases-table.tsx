"use client";

import { DataTable } from "@/components/shared/data-table";
import { formatFinancialValue } from "@/lib/utils";
import type { ReportsCaseRow } from "@/types";

type Props = {
  rows: ReportsCaseRow[];
};

export function ReportsCasesTable({ rows }: Props) {
  const data = rows.map((row) => ({
    caseNumber: row.caseNumber,
    clientName: row.clientName,
    insurerName: row.insurerName ?? "-",
    productLine: row.productLine,
    cargoProduct: row.cargoProduct ?? "-",
    coverType: row.coverType ?? "-",
    status: row.status,
    currency: row.currency,
    sumInsured: formatFinancialValue(row.sumInsured, row.currency),
    clientRate: row.clientRate,
    insurerRate: row.insurerRate,
    clientPremium: formatFinancialValue(row.clientPremium, row.currency),
    insurerPremium: formatFinancialValue(row.insurerPremium, row.currency),
    brokerCommission: formatFinancialValue(row.brokerCommission, row.currency),
    origin: row.origin ?? "-",
    destination: row.destination ?? "-",
    vessel: row.vessel ?? "-",
    quantity: row.quantity ?? "-",
    etd: row.etd ? new Date(row.etd).toLocaleDateString() : "-",
    eta: row.eta ? new Date(row.eta).toLocaleDateString() : "-",
    openCoverRef: row.openCoverRef ?? "-",
    createdAt: new Date(row.createdAt).toLocaleDateString(),
    closedAt: row.closedAt ? new Date(row.closedAt).toLocaleDateString() : "-",
  }));

  return (
    <section className="rounded border bg-white p-4">
      <h3 className="mb-2 text-sm font-semibold">Cases</h3>
      <DataTable
        rows={data}
        pageSize={20}
        columns={[
          { key: "caseNumber", label: "Case #" },
          { key: "clientName", label: "Client" },
          { key: "insurerName", label: "Insurer" },
          { key: "productLine", label: "Product Line" },
          { key: "cargoProduct", label: "Cargo Product" },
          { key: "coverType", label: "Cover Type" },
          { key: "status", label: "Status" },
          { key: "currency", label: "Currency" },
          { key: "sumInsured", label: "Sum Insured" },
          { key: "clientRate", label: "Client Rate" },
          { key: "insurerRate", label: "Insurer Rate" },
          { key: "clientPremium", label: "Client Premium" },
          { key: "insurerPremium", label: "Insurer Premium" },
          { key: "brokerCommission", label: "Broker Commission" },
          { key: "origin", label: "Origin" },
          { key: "destination", label: "Destination" },
          { key: "vessel", label: "Vessel/Fleet" },
          { key: "quantity", label: "Quantity" },
          { key: "etd", label: "ETD" },
          { key: "eta", label: "ETA" },
          { key: "openCoverRef", label: "Open Cover Ref" },
          { key: "createdAt", label: "Created" },
          { key: "closedAt", label: "Closed" },
        ]}
        emptyState="No cases found for selected filters."
      />
    </section>
  );
}
