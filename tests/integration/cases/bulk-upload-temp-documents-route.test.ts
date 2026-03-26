import { describe, expect, it } from "vitest";

import { bulkUploadTempDocumentSchema } from "@/lib/validations";

describe("POST /api/cases/bulk-upload/temp-documents", () => {
  it("requires draftId payload field", () => {
    const parsed = bulkUploadTempDocumentSchema.safeParse({ draftId: "draft-1" });
    expect(parsed.success).toBe(true);
  });
});

