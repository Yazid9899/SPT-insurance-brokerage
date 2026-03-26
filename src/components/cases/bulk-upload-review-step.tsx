"use client";

import { ColumnMappingEditor } from "@/components/cases/column-mapping-editor";
import { BulkUploadPreviewTable } from "@/components/cases/bulk-upload-preview-table";
import type { BulkUploadTargetField } from "@/lib/bulk-upload/header-aliases";
import type { BulkUploadColumnMapping, BulkUploadRowDraft } from "@/types";

export function BulkUploadReviewStep({
  headers,
  mappings,
  unresolvedRequiredFields,
  rows,
  totals,
  onMappingChange,
  onRowCellChange,
}: {
  headers: string[];
  mappings: BulkUploadColumnMapping[];
  unresolvedRequiredFields: BulkUploadTargetField[];
  rows: BulkUploadRowDraft[];
  totals: {
    sumInsured: string;
    clientPremium: string;
    insurerPremium: string;
    brokerCommission: string;
  };
  onMappingChange: (targetField: BulkUploadTargetField, header: string) => void;
  onRowCellChange: (
    rowIndex: number,
    field: "origin" | "destination" | "vessel" | "quantity" | "sumInsured" | "etd" | "eta" | "notes",
    value: string,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <ColumnMappingEditor
        headers={headers}
        mappings={mappings}
        unresolvedRequiredFields={unresolvedRequiredFields}
        onChange={onMappingChange}
      />

      <BulkUploadPreviewTable rows={rows} onCellChange={onRowCellChange} />

      <div className="rounded border bg-slate-50 p-3 text-sm">
        <p><strong>Total Sum Insured:</strong> {totals.sumInsured}</p>
        <p><strong>Total Client Premium:</strong> {totals.clientPremium}</p>
        <p><strong>Total Insurer Premium:</strong> {totals.insurerPremium}</p>
        <p className="font-semibold"><strong>Total Broker Commission:</strong> {totals.brokerCommission}</p>
      </div>
    </div>
  );
}

