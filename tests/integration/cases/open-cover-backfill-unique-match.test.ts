import { describe, expect, it } from "vitest";

import { PartyBackfillService } from "@/lib/party-backfill-service";

describe("open-cover backfill unique match", () => {
  it("classifies ambiguous when multiple normalized matches exist", async () => {
    const db = {
      case: { findUnique: async () => ({ clientName: "A", clientCompany: "B", openCover: { insurerName: "I" } }) },
      client: { findMany: async () => [{ id: "c1" }, { id: "c2" }] },
      insurer: { findMany: async () => [{ id: "i1" }] },
    };
    const service = new PartyBackfillService(db as never);
    const result = await service.classifyCaseSnapshot("case-1");
    expect(result.kind).toBe("ambiguous");
  });
});
