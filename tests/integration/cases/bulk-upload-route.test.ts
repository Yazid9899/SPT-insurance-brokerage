import { describe, expect, it } from "vitest";

import { bulkUploadCreateSchema } from "@/lib/validations";

describe("POST /api/cases/bulk-upload", () => {
  it("accepts valid all-or-nothing request shape", () => {
    const payload = {
      openCoverId: "ck1234567890123456789012",
      clientRate: 0.2,
      mappings: [
        { targetField: "origin", sourceHeader: "Origin", sourceColumnIndex: 0 },
        { targetField: "destination", sourceHeader: "Destination", sourceColumnIndex: 1 },
        { targetField: "vessel", sourceHeader: "Vessel", sourceColumnIndex: 2 },
        { targetField: "quantity", sourceHeader: "Quantity", sourceColumnIndex: 3 },
        { targetField: "sumInsured", sourceHeader: "Sum Insured", sourceColumnIndex: 4 },
        { targetField: "etd", sourceHeader: "ETD", sourceColumnIndex: 5 },
      ],
      rows: [
        {
          rowIndex: 1,
          origin: "Belawan",
          destination: "Port Klang",
          vessel: "MV Nusa",
          quantity: 1000,
          sumInsured: 250000,
          etd: "2026-02-01",
          eta: "2026-02-07",
          notes: null,
        },
      ],
    };
    expect(bulkUploadCreateSchema.safeParse(payload).success).toBe(true);
  });
});

