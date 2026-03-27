import { describe, expect, it } from "vitest";

import { PartyBackfillService } from "@/lib/party-backfill-service";

describe("party-backfill-service", () => {
  it("returns matched when unique normalized candidates are found", async () => {
    const db = {
      case: {
        findUnique: async () => ({
          clientName: "Client A",
          clientCompany: "Company A",
          openCover: { insurerName: "Insurer A" },
        }),
      },
      client: {
        findMany: async () => [{ id: "client-1" }],
      },
      insurer: {
        findMany: async () => [{ id: "insurer-1" }],
      },
    };

    const service = new PartyBackfillService(db as never);
    const result = await service.classifyCaseSnapshot("case-1");
    expect(result).toEqual({ kind: "matched", clientId: "client-1", insurerId: "insurer-1" });
  });

  it("returns ambiguous when multiple matches are found", async () => {
    const db = {
      case: {
        findUnique: async () => ({
          clientName: "Client A",
          clientCompany: "Company A",
          openCover: { insurerName: "Insurer A" },
        }),
      },
      client: {
        findMany: async () => [{ id: "client-1" }, { id: "client-2" }],
      },
      insurer: {
        findMany: async () => [{ id: "insurer-1" }],
      },
    };

    const service = new PartyBackfillService(db as never);
    const result = await service.classifyCaseSnapshot("case-1");
    expect(result.kind).toBe("ambiguous");
  });
});

