import { describe, expect, it } from "vitest";

import { canTransition, getAllowedTransitions, STATUS_TRANSITIONS } from "@/lib/status-transitions";

describe("status transitions", () => {
  it("exposes the expected transition map", () => {
    expect(STATUS_TRANSITIONS.DRAFT).toEqual(["DOCUMENTATION"]);
    expect(getAllowedTransitions("SETTLING")).toEqual(["CLOSED"]);
    expect(getAllowedTransitions("CLOSED")).toEqual([]);
  });

  it("validates valid and invalid transitions", () => {
    expect(canTransition("DRAFT", "DOCUMENTATION")).toBe(true);
    expect(canTransition("DRAFT", "ACTIVE")).toBe(false);
    expect(canTransition("CLOSED", "ACTIVE")).toBe(false);
  });
});
