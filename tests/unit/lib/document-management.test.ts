import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DocumentList } from "@/components/cases/document-list";
import { buildExpectedDocumentsChecklist, getExpectedDocuments } from "@/lib/document-checklist";
import { validateDocumentFile } from "@/lib/validations";

describe("document management validation/checklist", () => {
  it("builds expected checklist for Documentation status", () => {
    const checklist = buildExpectedDocumentsChecklist("DOCUMENTATION", ["BILL_OF_LADING"]);
    expect(checklist).toHaveLength(3);
    expect(checklist.find((item) => item.type === "BILL_OF_LADING")?.uploaded).toBe(true);
    expect(checklist.find((item) => item.type === "COMMERCIAL_INVOICE")?.uploaded).toBe(false);
  });

  it("returns no expected docs for non-mapped status", () => {
    expect(getExpectedDocuments("DRAFT")).toEqual([]);
  });

  it("accepts valid document file", () => {
    const file = new File([Buffer.from("pdf")], "sample.pdf", { type: "application/pdf" });
    const error = validateDocumentFile(file);
    expect(error).toBeNull();
  });

  it("rejects oversize file", () => {
    const content = new Uint8Array(10 * 1024 * 1024 + 1);
    const file = new File([content], "large.pdf", { type: "application/pdf" });
    const error = validateDocumentFile(file);
    expect(error).toContain("File exceeds max size");
  });

  it("rejects unsupported extension", () => {
    const file = new File([Buffer.from("abc")], "sample.txt", { type: "text/plain" });
    const error = validateDocumentFile(file);
    expect(error).toContain("Unsupported file extension");
  });

  it("renders empty state for document list", () => {
    render(React.createElement(DocumentList, { items: [], onDeleted: async () => undefined }));
    expect(screen.getByText("No documents uploaded yet.")).toBeInTheDocument();
  });
});
