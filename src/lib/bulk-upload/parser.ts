import * as XLSX from "xlsx";

type RawSheetCell = string | number | Date | null;

export type ParsedSheet = {
  headers: string[];
  rows: Record<string, RawSheetCell>[];
};

function toHeader(raw: unknown, index: number): string {
  if (typeof raw === "string" && raw.trim() !== "") {
    return raw.trim();
  }
  return `Column ${index + 1}`;
}

function coerceCell(value: unknown): RawSheetCell {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value === "number" || typeof value === "string") {
    return value;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  return String(value);
}

export function parseXlsBuffer(buffer: Buffer | ArrayBuffer | Uint8Array): ParsedSheet {
  const type: "buffer" | "array" =
    buffer instanceof ArrayBuffer || buffer instanceof Uint8Array ? "array" : "buffer";
  const workbook = XLSX.read(buffer, {
    type,
    raw: false,
    cellDates: true,
  });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { headers: [], rows: [] };
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
    blankrows: false,
    raw: false,
  });

  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = (rows[0] ?? []).map((cell, index) => toHeader(cell, index));
  const dataRows = rows.slice(1).map((row) => {
    const entry: Record<string, RawSheetCell> = {};
    headers.forEach((header, index) => {
      entry[header] = coerceCell(row[index]);
    });
    return entry;
  });

  return { headers, rows: dataRows };
}

export function coerceNumber(value: unknown): number | null {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    if (!cleaned) {
      return null;
    }
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function excelSerialToDate(serial: number): Date | null {
  const parsed = XLSX.SSF.parse_date_code(serial);
  if (!parsed) {
    return null;
  }
  return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
}

export function coerceDate(value: unknown): string | null {
  if (value == null || value === "") {
    return null;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    const fromSerial = excelSerialToDate(value);
    return fromSerial ? fromSerial.toISOString().slice(0, 10) : null;
  }
  if (typeof value === "string") {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString().slice(0, 10);
  }
  return null;
}

export function coerceString(value: unknown): string | null {
  if (value == null) {
    return null;
  }
  const stringified = String(value).trim();
  return stringified === "" ? null : stringified;
}
