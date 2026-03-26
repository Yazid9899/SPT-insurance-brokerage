import { describe, expect, it } from "vitest";

import { caseListFilterSchema } from "@/lib/validations";
import { buildCaseListQuery } from "@/../tests/integration/cases/helpers";

describe("GET /api/cases list route", () => {
  it("parses filter and pagination query", () => {
    const query = new URLSearchParams(
      buildCaseListQuery({
        q: "BRK-2026",
        status: ["DRAFT", "ACTIVE"],
        productLine: "CARGO",
        page: 2,
        pageSize: 20,
        sortBy: "createdAt",
        sortDir: "desc",
      }),
    );

    const parsed = caseListFilterSchema.safeParse(Object.fromEntries(query.entries()));
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toEqual(["DRAFT", "ACTIVE"]);
      expect(parsed.data.page).toBe(2);
      expect(parsed.data.pageSize).toBe(20);
    }
  });
});
