import { describe, expect, it } from "vitest";

import { caseStatusTransitionSchema } from "@/lib/validations";
import { STATUS_TRANSITIONS, validateTransitionInput } from "@/lib/status-transitions";

describe("POST /api/cases/[id]/status transition route", () => {
  it("accepts valid transition payload", () => {
    const parsed = caseStatusTransitionSchema.safeParse({ toStatus: "DOCUMENTATION", note: "docs complete" });
    expect(parsed.success).toBe(true);
  });

  it("requires note for backward transitions", () => {
    const error = validateTransitionInput({
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

    expect(error).toContain("note");
  });

  it("preserves lifecycle transition map for core statuses", () => {
    expect(STATUS_TRANSITIONS.DRAFT).toEqual(["DOCUMENTATION"]);
    expect(STATUS_TRANSITIONS.DOCUMENTATION).toEqual(["UNDERWRITING", "DRAFT"]);
    expect(STATUS_TRANSITIONS.UNDERWRITING).toEqual(["ACTIVE", "DOCUMENTATION"]);
    expect(STATUS_TRANSITIONS.ACTIVE).toEqual(["BILLING"]);
    expect(STATUS_TRANSITIONS.BILLING).toEqual(["SETTLING"]);
    expect(STATUS_TRANSITIONS.SETTLING).toEqual(["CLOSED"]);
    expect(STATUS_TRANSITIONS.CLOSED).toEqual([]);
  });

  it("keeps active to billing validation behavior unchanged", () => {
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
      note: "ready",
      debitNoteAcknowledged: false,
    });

    expect(error?.toLowerCase()).toContain("debit note");
  });
});
