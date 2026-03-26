import { describe, expect, it } from "vitest";

import { reportQuerySchema } from "@/lib/validations";

describe("reports performance smoke", () => {
  it("accepts large page size envelope for heavy reporting", () => {
    const parsed = reportQuerySchema.safeParse({
      dateFrom: "2026-01-01",
      dateTo: "2026-12-31",
      page: "1",
      pageSize: "200",
    });
    expect(parsed.success).toBe(true);
  });
});
