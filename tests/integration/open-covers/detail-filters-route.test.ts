import { describe, expect, it } from "vitest";

import { caseListFilterSchema } from "@/lib/validations";

describe("open cover declaration filter schema", () => {
  it("supports caseStatus query via case list filtering primitives", () => {
    const parsed = caseListFilterSchema.safeParse({ page: "1", pageSize: "10", status: "DRAFT" });
    expect(parsed.success).toBe(true);
  });
});
