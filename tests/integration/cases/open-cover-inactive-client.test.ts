import { describe, expect, it } from "vitest";

import { PartyService } from "@/lib/party-service";

describe("open-cover inactive linked client", () => {
  it("returns inactive-client when linked client is inactive", async () => {
    const db = {
      openCoverClientLink: {
        findUnique: async () => ({ client: { status: "INACTIVE" } }),
      },
    };
    const service = new PartyService(db as never);
    const result = await service.assertOpenCoverClientMembership("oc-1", "client-1");
    expect(result).toEqual({ ok: false, reason: "inactive-client" });
  });
});
