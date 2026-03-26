"use client";

import { DataTable } from "@/components/shared/data-table";
import type { BulkUploadRowDraft } from "@/types";

type EditableField = "origin" | "destination" | "vessel" | "quantity" | "sumInsured" | "etd" | "eta" | "notes";

export function BulkUploadPreviewTable({
  rows,
  onCellChange,
}: {
  rows: BulkUploadRowDraft[];
  onCellChange: (rowIndex: number, field: EditableField, value: string) => void;
}) {
  const tableRows = rows.map((row) => ({
    row: row.rowIndex,
    origin: (
      <input className="w-full rounded border px-2 py-1" value={row.origin ?? ""} onChange={(e) => onCellChange(row.rowIndex, "origin", e.target.value)} />
    ),
    destination: (
      <input className="w-full rounded border px-2 py-1" value={row.destination ?? ""} onChange={(e) => onCellChange(row.rowIndex, "destination", e.target.value)} />
    ),
    vessel: (
      <input className="w-full rounded border px-2 py-1" value={row.vessel ?? ""} onChange={(e) => onCellChange(row.rowIndex, "vessel", e.target.value)} />
    ),
    quantity: (
      <input className="w-full rounded border px-2 py-1" value={row.quantity ?? ""} onChange={(e) => onCellChange(row.rowIndex, "quantity", e.target.value)} />
    ),
    sumInsured: (
      <input className="w-full rounded border px-2 py-1" value={row.sumInsured ?? ""} onChange={(e) => onCellChange(row.rowIndex, "sumInsured", e.target.value)} />
    ),
    etd: <input className="w-full rounded border px-2 py-1" value={row.etd ?? ""} onChange={(e) => onCellChange(row.rowIndex, "etd", e.target.value)} />,
    eta: <input className="w-full rounded border px-2 py-1" value={row.eta ?? ""} onChange={(e) => onCellChange(row.rowIndex, "eta", e.target.value)} />,
    notes: <input className="w-full rounded border px-2 py-1" value={row.notes ?? ""} onChange={(e) => onCellChange(row.rowIndex, "notes", e.target.value)} />,
    clientPremium: row.clientPremium,
    insurerPremium: row.insurerPremium,
    brokerCommission: row.brokerCommission,
    errors: row.errors.length > 0 ? <span className="text-red-600">{row.errors.join(", ")}</span> : <span className="text-emerald-600">OK</span>,
  }));

  return (
    <DataTable
      rows={tableRows}
      columns={[
        { key: "row", label: "Row" },
        { key: "origin", label: "Origin" },
        { key: "destination", label: "Destination" },
        { key: "vessel", label: "Vessel/Fleet" },
        { key: "quantity", label: "Quantity" },
        { key: "sumInsured", label: "Sum Insured" },
        { key: "etd", label: "ETD" },
        { key: "eta", label: "ETA" },
        { key: "notes", label: "Notes" },
        { key: "clientPremium", label: "Client Premium" },
        { key: "insurerPremium", label: "Insurer Premium" },
        { key: "brokerCommission", label: "Broker Commission" },
        { key: "errors", label: "Errors" },
      ]}
      pageSize={10}
      emptyState="No parsed rows"
      getRowKey={(row) => String(row.row)}
    />
  );
}

