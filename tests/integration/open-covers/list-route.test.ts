import { describe, expect, it } from "vitest";

import { openCoverListFilterSchema } from "@/lib/validations";

describe("GET /api/open-covers list contract", () => {
  it("accepts pagination and status filters", () => {
    const parsed = openCoverListFilterSchema.safeParse({ page: "1", pageSize: "20", status: "ACTIVE" });
    expect(parsed.success).toBe(true);
  });
});
