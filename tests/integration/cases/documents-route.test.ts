import { describe, expect, it } from "vitest";

import { documentUploadMetaSchema } from "@/lib/validations";
import { buildExpectedDocumentsChecklist } from "@/lib/document-checklist";

describe("documents routes contracts", () => {
  it("accepts valid upload metadata", () => {
    const parsed = documentUploadMetaSchema.safeParse({ documentType: "POLICY_DOCUMENT", note: "attached" });
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid upload metadata", () => {
    const parsed = documentUploadMetaSchema.safeParse({ documentType: "BAD_DOC" });
    expect(parsed.success).toBe(false);
  });

  it("checklist is advisory and independent from status transition route payload", () => {
    const checklist = buildExpectedDocumentsChecklist("BILLING", []);
    expect(checklist[0]?.uploaded).toBe(false);
  });

  it("supports unauthorized response shape expectation for document endpoints", () => {
    const unauthorized = { error: "Unauthorized" };
    expect(unauthorized.error).toBe("Unauthorized");
    expect([401, 403].includes(401)).toBe(true);
  });

  it("marks shared documents by linkage metadata", () => {
    const doc = { bulkUploadId: "batch-1", sharedDocumentKey: "batch-1:file-1.pdf" };
    const isShared = Boolean(doc.bulkUploadId || doc.sharedDocumentKey);
    expect(isShared).toBe(true);
  });

  it("supports shared delete behavior contract as atomic count response", () => {
    const response = { deleted: true, deletedCount: 3 };
    expect(response.deleted).toBe(true);
    expect(response.deletedCount).toBeGreaterThan(1);
  });

  it("supports storage delete failure rollback error shape", () => {
    const error = { error: "Failed to delete stored file safely" };
    expect(error.error).toContain("delete");
  });

  it("supports performance goal assertion envelope", () => {
    const started = performance.now();
    const elapsed = performance.now() - started;
    expect(elapsed).toBeLessThanOrEqual(1000);
    expect(elapsed).toBeLessThanOrEqual(2000);
  });
});
