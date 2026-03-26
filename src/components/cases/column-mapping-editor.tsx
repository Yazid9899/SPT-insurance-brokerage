"use client";

import { BULK_UPLOAD_TARGET_FIELDS, type BulkUploadTargetField } from "@/lib/bulk-upload/header-aliases";
import type { BulkUploadColumnMapping } from "@/types";

const FIELD_LABELS: Record<BulkUploadTargetField, string> = {
  origin: "Origin",
  destination: "Destination",
  vessel: "Vessel/Fleet",
  quantity: "Quantity (MT)",
  sumInsured: "Sum Insured",
  etd: "ETD",
  eta: "ETA",
  notes: "Notes",
};

export function ColumnMappingEditor({
  headers,
  mappings,
  unresolvedRequiredFields,
  onChange,
}: {
  headers: string[];
  mappings: BulkUploadColumnMapping[];
  unresolvedRequiredFields: BulkUploadTargetField[];
  onChange: (targetField: BulkUploadTargetField, header: string) => void;
}) {
  function getCurrentHeader(targetField: BulkUploadTargetField): string {
    return mappings.find((m) => m.targetField === targetField)?.sourceHeader ?? "";
  }

  return (
    <div className="rounded border p-3">
      <p className="text-sm font-medium">Column Mapping</p>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {BULK_UPLOAD_TARGET_FIELDS.map((field) => (
          <label key={field} className="space-y-1">
            <span className="text-sm">
              {FIELD_LABELS[field]}{" "}
              {unresolvedRequiredFields.includes(field) ? <span className="text-red-600">(Required mapping)</span> : null}
            </span>
            <select
              className="w-full rounded border px-2 py-1"
              value={getCurrentHeader(field)}
              onChange={(event) => onChange(field, event.target.value)}
            >
              <option value="">Not mapped</option>
              {headers.map((header) => (
                <option key={`${field}-${header}`} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}

