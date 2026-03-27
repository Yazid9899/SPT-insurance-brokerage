import { PrismaClient } from "@prisma/client";

import { makeClientIdentityKey, makeInsurerIdentityKey, normalizeCompany, normalizeName } from "@/lib/party-normalization";

type ResolveClientInput = {
  displayName: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
};

type ResolveInsurerInput = {
  displayName: string;
  email?: string | null;
  phone?: string | null;
};

export class PartyService {
  constructor(private readonly db: PrismaClient) {}

  async resolveOrCreateClient(input: ResolveClientInput) {
    const normalizedName = normalizeName(input.displayName);
    const normalizedCompany = normalizeCompany(input.company);
    const identityKey = makeClientIdentityKey(input.displayName, input.company);

    return this.db.client.upsert({
      where: { identityKey },
      create: {
        displayName: input.displayName,
        company: input.company ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
        normalizedName,
        normalizedCompany,
        identityKey,
      },
      update: {
        displayName: input.displayName,
        company: input.company ?? null,
        email: input.email ?? null,
        phone: input.phone ?? null,
      },
    });
  }

  async resolveOrCreateInsurer(input: ResolveInsurerInput) {
    const normalizedName = normalizeName(input.displayName);
    const identityKey = makeInsurerIdentityKey(input.displayName);

    return this.db.insurer.upsert({
      where: { identityKey },
      create: {
        displayName: input.displayName,
        email: input.email ?? null,
        phone: input.phone ?? null,
        normalizedName,
        identityKey,
      },
      update: {
        displayName: input.displayName,
        email: input.email ?? null,
        phone: input.phone ?? null,
      },
    });
  }

  async assertOpenCoverClientMembership(openCoverId: string, clientId: string) {
    const link = await this.db.openCoverClientLink.findUnique({
      where: {
        openCoverId_clientId: {
          openCoverId,
          clientId,
        },
      },
      include: {
        client: {
          select: { status: true },
        },
      },
    });

    if (!link) {
      return { ok: false as const, reason: "not-linked" as const };
    }

    if (link.client.status !== "ACTIVE") {
      return { ok: false as const, reason: "inactive-client" as const };
    }

    return { ok: true as const };
  }
}

