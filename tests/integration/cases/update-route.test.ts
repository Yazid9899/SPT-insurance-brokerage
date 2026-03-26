import { describe, expect, it } from "vitest";

import { validateTransitionInput } from "@/lib/status-transitions";

describe("PUT /api/cases/[id] editable statuses", () => {
  it("keeps non-transition validation green for editable states", () => {
    const error = validateTransitionInput({
      fromStatus: "DRAFT",
      toStatus: "DOCUMENTATION",
      caseData: {
        productLine: "CARGO",
        clientName: "PT Test",
        cargoProduct: "CPO",
        coverType: "SINGLE_SHIPMENT",
        origin: "Dumai",
        destination: "Jakarta",
        sumInsured: 100,
        clientRate: 1,
        insurerRate: 0.5,
      },
      documentCount: 0,
    });

    expect(error).toBeNull();
  });
});
