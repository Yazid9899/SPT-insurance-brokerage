import { describe, expect, it } from "vitest";

import { caseStatusTransitionSchema } from "@/lib/validations";

describe("POST /api/cases/[id]/status transition route", () => {
  it("accepts valid transition payload", () => {
    const parsed = caseStatusTransitionSchema.safeParse({ toStatus: "DOCUMENTATION", note: "docs complete" });
    expect(parsed.success).toBe(true);
  });

  it("rejects malformed transition payload", () => {
    const parsed = caseStatusTransitionSchema.safeParse({ toStatus: "INVALID" });
    expect(parsed.success).toBe(false);
  });
});
