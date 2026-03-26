import { describe, expect, it } from "vitest";

import { validateBatchSize } from "@/lib/bulk-upload/validators";

describe("bulk upload performance smoke", () => {
  it("supports max 10 rows envelope", () => {
    const rows = new Array(10).fill({
      rowIndex: 1,
      origin: "A",
      destination: "B",
      vessel: "V",
      quantity: 1,
      sumInsured: 1,
      etd: "2026-01-01",
    });
    expect(validateBatchSize(rows)).toBeNull();
  });
});

