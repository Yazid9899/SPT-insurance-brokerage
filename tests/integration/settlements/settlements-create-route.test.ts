import { describe, expect, it } from "vitest";

import { settlementCreateSchema } from "@/lib/validations";

describe("POST /api/settlements", () => {
  it("accepts valid create payload", () => {
    const parsed = settlementCreateSchema.safeParse({ insurerName: "PT Insurer A", period: "2026-03" });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid period format", () => {
    const parsed = settlementCreateSchema.safeParse({ insurerName: "PT Insurer A", period: "03-2026" });
    expect(parsed.success).toBe(false);
  });
});

