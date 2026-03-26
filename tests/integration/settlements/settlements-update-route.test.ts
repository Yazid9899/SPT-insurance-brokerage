import { describe, expect, it } from "vitest";

import { settlementMatchingUpdateSchema } from "@/lib/validations";

describe("PUT /api/settlements/[id]", () => {
  it("accepts matching update payload", () => {
    const parsed = settlementMatchingUpdateSchema.safeParse({
      items: [{ caseId: "ck1234567890123456789012", matched: true }],
    });
    expect(parsed.success).toBe(true);
  });
});

