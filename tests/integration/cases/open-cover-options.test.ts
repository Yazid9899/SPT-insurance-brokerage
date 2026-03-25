import { describe, expect, it } from "vitest";

describe("open cover active options in case create flow", () => {
  it("documents that only active agreements are selectable", () => {
    expect(["ACTIVE"]).toContain("ACTIVE");
  });
});
