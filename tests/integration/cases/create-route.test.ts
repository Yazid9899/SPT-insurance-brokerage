import { describe, expect, it } from "vitest";

import { caseUpsertSchema } from "@/lib/validations";
import { sampleCargoCasePayload, sampleNonCargoCasePayload } from "@/../tests/fixtures/cases";

describe("POST /api/cases create route", () => {
  it("accepts single-shipment payload with explicit client and insurer ids", () => {
    const parsed = caseUpsertSchema.safeParse(sampleCargoCasePayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.clientId).toBeTypeOf("string");
      expect(parsed.data.insurerId).toBeTypeOf("string");
    }
  });

  it("accepts non-cargo payload without cargo-only fields", () => {
    const parsed = caseUpsertSchema.safeParse(sampleNonCargoCasePayload);
    expect(parsed.success).toBe(true);
  });
});
