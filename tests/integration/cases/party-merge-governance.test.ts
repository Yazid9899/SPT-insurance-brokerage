import { describe, expect, it } from "vitest";

import { PartyGovernanceService } from "@/lib/party-governance-service";

describe("party merge governance", () => {
  it("requires supervisor approval", async () => {
    const db = {
      partyMergeAudit: {
        create: async ({ data }: { data: unknown }) => data,
      },
    };
    const service = new PartyGovernanceService(db as never);

    await expect(
      service.record({
        targetType: "CLIENT",
        action: "MERGE",
        sourceIds: ["a", "b"],
        destinationId: "c",
        requestedById: "req",
        approvedById: "",
        reason: "dedupe",
      }),
    ).rejects.toThrow("Supervisor approval is required");
  });
});
