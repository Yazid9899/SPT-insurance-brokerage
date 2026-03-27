import { PrismaClient } from "@prisma/client";

type GovernanceAction = "MERGE" | "SPLIT";
type GovernanceTarget = "CLIENT" | "INSURER";

type RecordGovernanceInput = {
  targetType: GovernanceTarget;
  action: GovernanceAction;
  sourceIds: string[];
  destinationId: string | null;
  requestedById: string;
  approvedById: string;
  reason: string;
};

export class PartyGovernanceService {
  constructor(private readonly db: PrismaClient) {}

  async record(input: RecordGovernanceInput) {
    if (!input.approvedById) {
      throw new Error("Supervisor approval is required");
    }

    return this.db.partyMergeAudit.create({
      data: {
        targetType: input.targetType,
        action: input.action,
        sourceIds: input.sourceIds,
        destinationId: input.destinationId,
        requestedById: input.requestedById,
        approvedById: input.approvedById,
        reason: input.reason,
      },
    });
  }
}

