import { describe, expect, it } from "vitest";

import { STATUS_TRANSITIONS } from "@/lib/status-transitions";
import { settlementPaySchema } from "@/lib/validations";

describe("POST /api/settlements/[id]/pay", () => {
  it("requires payment date and bank transfer reference", () => {
    const parsed = settlementPaySchema.safeParse({
      paymentDate: "2026-03-31",
      bankTransferReference: "TRX-001",
    });
    expect(parsed.success).toBe(true);
  });

  it("uses SETTLING to CLOSED transition", () => {
    expect(STATUS_TRANSITIONS.SETTLING).toEqual(["CLOSED"]);
  });
});

