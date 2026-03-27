import { PrismaClient } from "@prisma/client";

import { makeClientIdentityKey, makeInsurerIdentityKey } from "@/lib/party-normalization";

export type BackfillMatchResult = {
  kind: "matched" | "ambiguous" | "unmatched";
  clientId?: string;
  insurerId?: string;
  reason?: string;
};

export class PartyBackfillService {
  constructor(private readonly db: PrismaClient) {}

  async classifyCaseSnapshot(caseId: string): Promise<BackfillMatchResult> {
    const row = await this.db.case.findUnique({
      where: { id: caseId },
      select: { clientName: true, clientCompany: true, openCover: { select: { insurerName: true } } },
    });

    if (!row) {
      return { kind: "unmatched", reason: "case-not-found" };
    }

    const clientMatches = await this.db.client.findMany({
      where: { identityKey: makeClientIdentityKey(row.clientName, row.clientCompany) },
      select: { id: true },
    });

    const insurerMatches = await this.db.insurer.findMany({
      where: { identityKey: makeInsurerIdentityKey(row.openCover?.insurerName ?? null) },
      select: { id: true },
    });

    if (clientMatches.length === 1 && insurerMatches.length <= 1) {
      return {
        kind: "matched",
        clientId: clientMatches[0]?.id,
        insurerId: insurerMatches[0]?.id,
      };
    }

    if (clientMatches.length > 1 || insurerMatches.length > 1) {
      return { kind: "ambiguous", reason: "multiple-normalized-matches" };
    }

    return { kind: "unmatched", reason: "no-normalized-match" };
  }
}

