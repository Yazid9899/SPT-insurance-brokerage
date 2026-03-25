import { describe, expect, it } from "vitest";

describe("session route contract", () => {
  it("supports nullable session payload", () => {
    const payload: null | { user: { email: string } } = null;
    expect(payload).toBeNull();
  });
});
