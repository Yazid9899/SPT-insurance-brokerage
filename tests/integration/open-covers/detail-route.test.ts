import { describe, expect, it } from "vitest";

import { apiError } from "@/lib/api-error";

describe("GET /api/open-covers/[id] detail contract", () => {
  it("uses standard error shape helper", () => {
    expect(apiError("Open cover not found")).toEqual({ error: "Open cover not found" });
  });
});
