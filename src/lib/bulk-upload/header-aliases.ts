export const BULK_UPLOAD_TARGET_FIELDS = [
  "origin",
  "destination",
  "vessel",
  "quantity",
  "sumInsured",
  "etd",
  "eta",
  "notes",
] as const;

export type BulkUploadTargetField = (typeof BULK_UPLOAD_TARGET_FIELDS)[number];

export const BULK_UPLOAD_REQUIRED_FIELDS: readonly BulkUploadTargetField[] = [
  "origin",
  "destination",
  "vessel",
  "quantity",
  "sumInsured",
  "etd",
];

export const HEADER_ALIASES: Record<BulkUploadTargetField, readonly string[]> = {
  origin: ["origin", "from", "port of loading", "load port", "pol"],
  destination: ["destination", "to", "port of discharge", "discharge port", "pod"],
  vessel: ["vessel", "vessel/fleet", "vessel fleet", "fleet", "ship", "truck", "fleet id"],
  quantity: ["quantity", "qty", "qty mt", "quantity mt", "mt", "metric tons", "metric tonnes"],
  sumInsured: ["sum insured", "sum_insured", "si", "insured value", "insured amount", "value insured"],
  etd: ["etd", "estimated departure", "estimated departure date", "departure date"],
  eta: ["eta", "estimated arrival", "estimated arrival date", "arrival date"],
  notes: ["notes", "remark", "remarks", "comment", "comments"],
};

export function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\s/]/g, " ")
    .replace(/\s+/g, " ");
}

