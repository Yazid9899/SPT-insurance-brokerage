import { describe, expect, it } from "vitest";

import { apiError } from "@/lib/api-error";

describe("settlement routes error shape", () => {
  it("uses consistent error payload", () => {
    expect(apiError("oops")).toEqual({ error: "oops" });
    expect(apiError("oops", { reason: "x" })).toEqual({ error: "oops", details: { reason: "x" } });
  });
});

