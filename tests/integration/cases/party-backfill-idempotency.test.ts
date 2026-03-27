import { describe, expect, it } from "vitest";

import { makeClientIdentityKey } from "@/lib/party-normalization";

describe("party backfill idempotency", () => {
  it("produces stable identity keys across repeated runs", () => {
    const first = makeClientIdentityKey("PT Test", "PT Company");
    const second = makeClientIdentityKey("PT Test", "PT Company");
    expect(first).toBe(second);
  });
});
