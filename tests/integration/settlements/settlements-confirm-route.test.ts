import { describe, expect, it } from "vitest";

import { STATUS_TRANSITIONS } from "@/lib/status-transitions";
import { settlementConfirmSchema } from "@/lib/validations";

describe("POST /api/settlements/[id]/confirm", () => {
  it("accepts optional note payload", () => {
    const parsed = settlementConfirmSchema.safeParse({ note: "monthly confirm" });
    expect(parsed.success).toBe(true);
  });

  it("uses BILLING to SETTLING transition", () => {
    expect(STATUS_TRANSITIONS.BILLING).toEqual(["SETTLING"]);
  });
});

