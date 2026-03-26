import { describe, expect, it } from "vitest";

import { caseUpsertSchema } from "@/lib/validations";
import { sampleCargoCasePayload, sampleNonCargoCasePayload } from "@/../tests/fixtures/cases";

describe("POST /api/cases create route", () => {
  it("accepts cargo payload", () => {
    const parsed = caseUpsertSchema.safeParse(sampleCargoCasePayload);
    expect(parsed.success).toBe(true);
  });

  it("accepts non-cargo payload without cargo-only fields", () => {
    const parsed = caseUpsertSchema.safeParse(sampleNonCargoCasePayload);
    expect(parsed.success).toBe(true);
  });
});
