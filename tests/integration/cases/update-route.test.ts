import { describe, expect, it } from "vitest";

import { caseUpsertSchema } from "@/lib/validations";

describe("PUT /api/cases/[id] editable statuses", () => {
  it("requires clientId and insurerId for single-shipment updates", () => {
    const parsed = caseUpsertSchema.safeParse({
      productLine: "CARGO",
      cargoProduct: "CPO",
      coverType: "SINGLE_SHIPMENT",
      transportMode: "MARINE",
      clientId: null,
      insurerId: null,
      clientName: "PT Test",
      currency: "USD",
      sumInsured: 100,
      clientRate: 1,
      insurerRate: 0.5,
    });

    expect(parsed.success).toBe(false);
  });
});
