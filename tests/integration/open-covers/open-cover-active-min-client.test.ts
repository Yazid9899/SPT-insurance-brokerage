import { describe, expect, it } from "vitest";

import { openCoverUpsertSchema } from "@/lib/validations";

describe("open cover active minimum linked-client rule", () => {
  it("rejects active open cover when no clients are linked", () => {
    const parsed = openCoverUpsertSchema.safeParse({
      reference: "OC-2026-100",
      clientName: "Client",
      clientCompany: "Company",
      insurerName: "Insurer",
      insurerId: "cmaaaaaaaaaaaaaaaaaaaaaa2",
      clientIds: [],
      isActive: true,
      productLine: "CARGO",
      cargoProduct: "CPO",
      transportMode: "MARINE",
      currency: "USD",
      insurerRate: 0.1,
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
    });

    expect(parsed.success).toBe(false);
  });
});
