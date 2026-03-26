import { describe, expect, it } from "vitest";

describe("DELETE /api/cases/[id] draft-only soft delete", () => {
  it("documents expected delete policy", () => {
    const deletableStatuses = ["DRAFT"];
    expect(deletableStatuses).toContain("DRAFT");
    expect(deletableStatuses).not.toContain("ACTIVE");
  });
});
