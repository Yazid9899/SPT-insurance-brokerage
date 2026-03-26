export const BULK_UPLOAD_HEADERS = [
  "Origin",
  "Destination",
  "Vessel/Fleet",
  "Quantity (MT)",
  "Sum Insured",
  "ETD",
  "ETA",
  "Notes",
];

export const BULK_UPLOAD_SAMPLE_ROWS = [
  ["Belawan", "Port Klang", "MV Nusa", 1000, 250000, "2026-02-01", "2026-02-07", "Shipment 1"],
  ["Dumai", "Singapore", "MV Ocean Star", 800, 190000, "2026-02-03", "2026-02-10", ""],
];

export const BULK_UPLOAD_MIXED_CELL_ROWS = [
  ["Belawan", "Port Klang", "MV Nusa", "1,000", "USD 250,000.00", 45323, 45328, "Excel serial date"],
];

