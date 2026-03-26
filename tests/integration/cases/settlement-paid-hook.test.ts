import { describe, expect, it } from "vitest";

import { validateTransitionInput } from "@/lib/status-transitions";

describe("settlement-paid hook transition", () => {
  it("requires settlement paid for settling to closed", () => {
    const blocked = validateTransitionInput({
      fromStatus: "SETTLING",
      toStatus: "CLOSED",
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
      settlementPaid: false,
    });

    const allowed = validateTransitionInput({
      fromStatus: "SETTLING",
      toStatus: "CLOSED",
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
      settlementPaid: true,
    });

    expect(blocked).toContain("paid settlement");
    expect(allowed).toBeNull();
  });
});
