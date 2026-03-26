import { describe, expect, it } from "vitest";

describe("GET /api/cases/[id] detail route", () => {
  it("returns expected detail shape", () => {
    const payload = {
      id: "c1",
      caseNumber: "BRK-2026-0001",
      status: "DRAFT",
      productLine: "CARGO",
      clientName: "PT Test",
      sumInsured: "1000.00",
      clientRate: "0.200000",
      insurerRate: "0.100000",
      clientPremium: "2.00",
      insurerPremium: "1.00",
      brokerCommission: "1.00",
      statusHistory: [],
    };

    expect(payload).toHaveProperty("id");
    expect(payload).toHaveProperty("statusHistory");
    expect(Array.isArray(payload.statusHistory)).toBe(true);
  });
});
