import { describe, expect, it } from "vitest";

import { apiError } from "@/lib/api-error";

describe("open cover route error shape", () => {
  it("returns the shared error envelope", () => {
    expect(apiError("Unauthorized")).toEqual({ error: "Unauthorized" });
    expect(apiError("Validation failed", { issues: [] })).toEqual({
      error: "Validation failed",
      details: { issues: [] },
    });
  });
});
