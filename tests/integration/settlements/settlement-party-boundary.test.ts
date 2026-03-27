import { describe, expect, it } from "vitest";

import { settlementCreateSchema } from "@/lib/validations";

describe("settlement party boundary", () => {
  it("keeps settlement creation name-based", () => {
    const parsed = settlementCreateSchema.safeParse({ insurerName: "Insurer A", period: "2026-03" });
    expect(parsed.success).toBe(true);
  });
});
