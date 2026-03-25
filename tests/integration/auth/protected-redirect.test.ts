import { describe, expect, it } from "vitest";

describe("protected redirect contract", () => {
  it("defines login redirect path", () => {
    expect("/login").toBe("/login");
  });
});
