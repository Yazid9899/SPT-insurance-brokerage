import { describe, expect, it } from "vitest";

import { getAllowedTransitions } from "@/lib/status-machine";

describe("status machine", () => {
  it("returns expected transition map", () => {
    expect(getAllowedTransitions("DRAFT")).toEqual(["DOCUMENTATION"]);
    expect(getAllowedTransitions("CLOSED")).toEqual([]);
  });
});
