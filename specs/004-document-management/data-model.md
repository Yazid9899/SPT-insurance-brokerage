# Data Model: Document Management

## Entity: CaseDocument
- Purpose: Metadata record for files uploaded in a case context and shown in the case Documents tab.
- Identity:
  - `id` (system identifier)
- Ownership and linkage:
  - `caseId` (required; owning case)
  - `bulkUploadId` (optional; populated for shared documents originating from bulk draft creation)
  - `sharedDocumentKey` (optional; common key across all copied rows representing the same shared file)
- File metadata:
  - `name` (display/original filename)
  - `fileName` (stored filename)
  - `filePath` (storage key/path managed by server)
  - `mimeType`
  - `fileSize`
- Business metadata:
  - `type` (DocumentType enum)
  - `notes` (optional)
  - `uploadedAt`
- Derived flags (read-model):
  - `isShared = bulkUploadId != null`
- Validation rules:
  - Allowed types: PDF, DOCX, XLSX, JPG, PNG
  - Max file size: 10 MB
  - `type` is required for every upload

## Entity: Case (dependency)
- Purpose: Source context for document management and checklist status evaluation.
- Relevant fields:
  - `id`, `status`, `bulkUploadId`, `documents[]`
- Invariants:
  - Documents checklist is advisory only and does not constrain status transitions.
  - Any case maker with access to the case may upload/delete case documents.

## Entity: ExpectedDocumentRule (derived domain rule)
- Purpose: Defines expected document types per case status for advisory checklist rendering.
- Mapping:
  - `DOCUMENTATION`: BILL_OF_LADING, COMMERCIAL_INVOICE, PACKING_LIST
  - `UNDERWRITING`: POLICY_DOCUMENT, CERTIFICATE_OF_INSURANCE
  - `BILLING`: DEBIT_NOTE
- Notes:
  - This is computed behavior, not persisted table data.

## Relationships
- One `Case` to many `CaseDocument`.
- Shared bulk documents are represented by many `CaseDocument` rows linked by `bulkUploadId` + `sharedDocumentKey`.

## Lifecycle and Operations
- Upload:
  - Validate payload and metadata.
  - Save file to storage backend.
  - Persist metadata row.
- List:
  - Return all rows for `caseId`, newest first.
  - Include `isShared` marker in response projection.
- Delete:
  - Non-shared: delete single metadata row + file.
  - Shared: delete all rows with same `sharedDocumentKey` (or equivalent shared linkage) and remove underlying file once.

## Integrity and Safety Constraints
- API must never trust client-supplied file paths for download/delete operations.
- Delete operation must remove both DB records and stored file safely with failure handling to avoid dangling metadata.
- Shared delete must be atomic for all linked rows to prevent partial visibility across cases.
