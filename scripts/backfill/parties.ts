import path from "node:path";

import { PrismaClient } from "@prisma/client";

import { PartyBackfillService } from "../../src/lib/party-backfill-service";
import { writeBackfillReport } from "./party-report-writer";

const prisma = new PrismaClient();

async function run() {
  const dryRun = process.argv.includes("--dry-run");
  const service = new PartyBackfillService(prisma);

  const rows = await prisma.case.findMany({
    select: { id: true, clientId: true, insurerId: true },
  });

  const ambiguous: Array<{ caseId: string; reason: string }> = [];
  const unmatched: Array<{ caseId: string; reason: string }> = [];
  let linked = 0;

  for (const row of rows) {
    if (row.clientId || row.insurerId) {
      continue;
    }

    const result = await service.classifyCaseSnapshot(row.id);

    if (result.kind === "matched") {
      linked += 1;
      if (!dryRun) {
        await prisma.case.update({
          where: { id: row.id },
          data: {
            clientId: result.clientId ?? null,
            insurerId: result.insurerId ?? null,
          },
        });
      }
      continue;
    }

    if (result.kind === "ambiguous") {
      ambiguous.push({ caseId: row.id, reason: result.reason ?? "ambiguous" });
      continue;
    }

    unmatched.push({ caseId: row.id, reason: result.reason ?? "unmatched" });
  }

  const reportPath = await writeBackfillReport(
    path.resolve(process.cwd(), "specs/009-client-insurer-entities"),
    {
      generatedAt: new Date().toISOString(),
      ambiguous,
      unmatched,
    },
  );

  const summary = {
    dryRun,
    scanned: rows.length,
    linked,
    ambiguous: ambiguous.length,
    unmatched: unmatched.length,
    reportPath,
  };

  console.log(JSON.stringify(summary, null, 2));
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
