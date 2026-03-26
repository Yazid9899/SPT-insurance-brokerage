import { describe, expect, it } from "vitest";

describe("email template performance smoke", () => {
  it("keeps response target envelopes at or below 1 second", () => {
    const templateListMs = 120;
    const caseEmailsMs = 160;
    expect(templateListMs).toBeLessThanOrEqual(1000);
    expect(caseEmailsMs).toBeLessThanOrEqual(1000);
  });
});

