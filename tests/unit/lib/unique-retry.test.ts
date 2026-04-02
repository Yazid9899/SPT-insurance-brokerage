import { describe, expect, it } from "vitest";

import { withUniqueRetry } from "@/lib/unique-retry";

describe("withUniqueRetry", () => {
  it("retries when matching P2002 target appears", async () => {
    let attempts = 0;
    const result = await withUniqueRetry(
      async () => {
        attempts += 1;
        if (attempts < 3) {
          throw { code: "P2002", meta: { target: ["caseNumber"] } };
        }
        return "ok";
      },
      { fields: ["caseNumber"], maxRetries: 5, minDelayMs: 0, maxDelayMs: 0 },
    );

    expect(result).toBe("ok");
    expect(attempts).toBe(3);
  });

  it("does not retry for non-matching unique targets", async () => {
    let attempts = 0;

    await expect(
      withUniqueRetry(
        async () => {
          attempts += 1;
          throw { code: "P2002", meta: { target: ["reference"] } };
        },
        { fields: ["caseNumber"], maxRetries: 3, minDelayMs: 0, maxDelayMs: 0 },
      ),
    ).rejects.toEqual({ code: "P2002", meta: { target: ["reference"] } });

    expect(attempts).toBe(1);
  });
});
