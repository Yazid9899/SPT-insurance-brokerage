import { describe, expect, it } from "vitest";

import { validateTransitionInput } from "@/lib/status-transitions";

describe("ACTIVE -> BILLING debit note prompt", () => {
  it("fails without debitNoteAcknowledged", () => {
    const error = validateTransitionInput({
      fromStatus: "ACTIVE",
      toStatus: "BILLING",
      caseData: {
        productLine: "CARGO",
        clientName: "PT Test",
        cargoProduct: "CPO",
        coverType: "SINGLE_SHIPMENT",
        origin: "A",
        destination: "B",
        sumInsured: 1000,
        clientRate: 1,
        insurerRate: 0.5,
      },
      debitNoteAcknowledged: false,
    });

    expect(error).toContain("Debit note");
  });
});
