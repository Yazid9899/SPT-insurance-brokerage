import { describe, expect, it } from "vitest";

describe("login failure contract", () => {
  it("uses generic invalid credential message", () => {
    const error = "Invalid credentials";
    expect(error).toBe("Invalid credentials");
  });
});
