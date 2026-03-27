import { describe, expect, it } from "vitest";

import { PartyService } from "@/lib/party-service";

describe("open-cover client membership", () => {
  it("returns not-linked when client is not in the open-cover set", async () => {
    const db = {
      openCoverClientLink: {
        findUnique: async () => null,
      },
    };
    const service = new PartyService(db as never);
    const result = await service.assertOpenCoverClientMembership("oc-1", "client-1");
    expect(result).toEqual({ ok: false, reason: "not-linked" });
  });
});
