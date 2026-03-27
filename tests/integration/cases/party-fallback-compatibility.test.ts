import { describe, expect, it } from "vitest";

import { projectCaseParty } from "@/lib/party-projection";

describe("party fallback compatibility", () => {
  it("uses snapshots when normalized links are absent", () => {
    const projection = projectCaseParty({
      client: null,
      insurer: null,
      clientName: "Legacy Client",
      clientCompany: "Legacy Co",
      clientEmail: null,
      clientPhone: null,
      insurerName: "Legacy Insurer",
    });

    expect(projection.source).toBe("snapshot");
    expect(projection.clientName).toBe("Legacy Client");
  });
});
