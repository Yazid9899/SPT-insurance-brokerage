import fs from "node:fs";
import path from "node:path";

const inputPath = process.argv[2] ?? "specs/006-bulk-draft-upload/evidence/first-attempt-log.csv";
const resolved = path.resolve(process.cwd(), inputPath);

if (!fs.existsSync(resolved)) {
  console.error(`Input not found: ${resolved}`);
  process.exit(1);
}

const raw = fs.readFileSync(resolved, "utf8").trim();
const lines = raw.split(/\r?\n/);
if (lines.length <= 1) {
  console.error("No attempt rows found.");
  process.exit(1);
}

const headers = lines[0].split(",");
const successIdx = headers.indexOf("first_attempt_success");
if (successIdx < 0) {
  console.error("CSV must include column: first_attempt_success");
  process.exit(1);
}

let total = 0;
let success = 0;
for (const line of lines.slice(1)) {
  if (!line.trim()) continue;
  const cols = line.split(",");
  const value = (cols[successIdx] ?? "").trim().toUpperCase();
  if (!value) continue;
  total += 1;
  if (value === "Y") success += 1;
}

if (total === 0) {
  console.error("No scored attempts found.");
  process.exit(1);
}

const rate = (success / total) * 100;
const passed = rate >= 95 && total >= 20;

console.log(JSON.stringify({ total_attempts: total, first_attempt_successes: success, success_rate_pct: Number(rate.toFixed(2)), pass: passed }, null, 2));
process.exit(passed ? 0 : 2);

