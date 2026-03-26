import { describe, expect, it } from "vitest";

import { apiError } from "@/lib/api-error";

describe("reports routes error shape", () => {
  it("returns consistent apiError payload", () => {
    expect(apiError("Unauthorized")).toEqual({ error: "Unauthorized" });
    expect(apiError("Invalid query", { issues: { dateFrom: ["bad"] } })).toEqual({
      error: "Invalid query",
      details: { issues: { dateFrom: ["bad"] } },
    });
  });
});
