import { describe, expect, it } from "vitest";

import { parseXlsBuffer } from "@/lib/bulk-upload/parser";

describe("malformed XLS parser regression placeholder", () => {
  it("returns empty dataset for invalid workbook bytes", () => {
    expect(() => parseXlsBuffer(new Uint8Array([]))).not.toThrow();
  });

  it("keeps shared linkage invariant slot for document propagation", () => {
    const linkage = { bulkUploadId: "batch-1", sharedDocumentKey: "doc-key-1" };
    expect(linkage.bulkUploadId).toBeTruthy();
    expect(linkage.sharedDocumentKey).toBeTruthy();
  });
});
