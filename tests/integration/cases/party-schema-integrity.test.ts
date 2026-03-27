import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("party schema integrity", () => {
  it("includes required party models and case/open-cover links", () => {
    const schemaPath = path.resolve(process.cwd(), "prisma/schema.prisma");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    expect(schema).toContain("model Client");
    expect(schema).toContain("model Insurer");
    expect(schema).toContain("model OpenCoverClientLink");
    expect(schema).toContain("model PartyMergeAudit");
    expect(schema).toContain("clientId");
    expect(schema).toContain("insurerId");
  });
});

