import type { ReportCaseRow } from "@/lib/reports-service";

export const REPORT_EXPORT_COLUMNS = [
  "caseNumber",
  "clientName",
  "productLine",
  "cargoProduct",
  "coverType",
  "status",
  "currency",
  "sumInsured",
  "clientRate",
  "insurerRate",
  "clientPremium",
  "insurerPremium",
  "brokerCommission",
  "origin",
  "destination",
  "vessel",
  "quantity",
  "etd",
  "eta",
  "openCoverRef",
  "createdAt",
  "closedAt",
] as const;

function escapeCsvValue(value: string | null | undefined) {
  if (value == null) {
    return "";
  }
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function serializeReportCsv(rows: ReportCaseRow[]) {
  const header = REPORT_EXPORT_COLUMNS.join(",");
  const body = rows.map((row) =>
    REPORT_EXPORT_COLUMNS.map((column) => escapeCsvValue((row[column as keyof ReportCaseRow] ?? "").toString())).join(","),
  );
  return [header, ...body].join("\n");
}
