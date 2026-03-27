import fs from "node:fs/promises";
import path from "node:path";

type ReportPayload = {
  generatedAt: string;
  ambiguous: Array<{ caseId: string; reason: string }>;
  unmatched: Array<{ caseId: string; reason: string }>;
};

export async function writeBackfillReport(featureDir: string, payload: ReportPayload) {
  const outDir = path.join(featureDir, "reports");
  await fs.mkdir(outDir, { recursive: true });
  const file = path.join(outDir, `party-backfill-${Date.now()}.json`);
  await fs.writeFile(file, JSON.stringify(payload, null, 2), "utf-8");
  return file;
}

