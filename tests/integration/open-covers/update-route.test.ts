import { describe, expect, it } from "vitest";

import { openCoverUpsertSchema } from "@/lib/validations";

describe("PUT /api/open-covers/[id] update contract", () => {
  it("accepts linked-client ids and insurer id", () => {
    const parsed = openCoverUpsertSchema.safeParse({
      reference: "OC-2026-001",
      clientName: "Client",
      clientCompany: "Company",
      insurerName: "Insurer",
      insurerId: "cmaaaaaaaaaaaaaaaaaaaaaa2",
      clientIds: ["cmaaaaaaaaaaaaaaaaaaaaaa1"],
      isActive: true,
      productLine: "CARGO",
      cargoProduct: "CPO",
      transportMode: "MARINE",
      currency: "USD",
      insurerRate: 0.15,
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
    });

    expect(parsed.success).toBe(true);
  });
});
