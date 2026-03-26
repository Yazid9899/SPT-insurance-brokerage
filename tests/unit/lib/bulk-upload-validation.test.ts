import { describe, expect, it } from "vitest";

import { validateBatchSize, validateShipmentRow } from "@/lib/bulk-upload/validators";

describe("bulk upload validators", () => {
  it("rejects out-of-range batch size", () => {
    expect(validateBatchSize([])).toBeTruthy();
    expect(validateBatchSize(new Array(11).fill({} as never))).toBeTruthy();
  });

  it("validates one shipment row and computes premiums", () => {
    const row = validateShipmentRow(
      {
        rowIndex: 1,
        origin: "Belawan",
        destination: "Port Klang",
        vessel: "MV Nusa",
        quantity: 100,
        sumInsured: 100000,
        etd: "2026-02-01",
        eta: "2026-02-07",
        notes: null,
      },
      { clientRate: 0.2, insurerRate: 0.1 },
    );

    expect(row.errors).toHaveLength(0);
    expect(row.clientPremium).toBe("200.00");
    expect(row.insurerPremium).toBe("100.00");
    expect(row.brokerCommission).toBe("100.00");
  });
});

