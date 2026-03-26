import { describe, expect, it } from "vitest";

import { canTransition, getAllowedTransitions, STATUS_TRANSITIONS, validateTransitionInput } from "@/lib/status-transitions";

describe("status transitions", () => {
  it("exposes the expected transition map", () => {
    expect(STATUS_TRANSITIONS.DRAFT).toEqual(["DOCUMENTATION"]);
    expect(getAllowedTransitions("DOCUMENTATION")).toEqual(["UNDERWRITING", "DRAFT"]);
    expect(getAllowedTransitions("CLOSED")).toEqual([]);
  });

  it("validates valid and invalid transitions", () => {
    expect(canTransition("DRAFT", "DOCUMENTATION")).toBe(true);
    expect(canTransition("DRAFT", "ACTIVE")).toBe(false);
    expect(canTransition("CLOSED", "ACTIVE")).toBe(false);
  });

  it("enforces debit note and backward-note rules", () => {
    const activeBilling = validateTransitionInput({
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
    expect(activeBilling).toContain("Debit note");

    const backward = validateTransitionInput({
      fromStatus: "UNDERWRITING",
      toStatus: "DOCUMENTATION",
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
      note: "",
    });
    expect(backward).toContain("note");
  });
});
