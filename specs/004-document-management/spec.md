# Feature Specification: Document Management

**Feature Branch**: `004-document-management`  
**Created**: 2026-03-26  
**Status**: Draft  
**Input**: User description: "Feature 005: Document Management"

## Constitution Alignment *(mandatory)*

- This specification defines user outcomes and business behavior for case document handling.
- It avoids implementation specifics and focuses on required behavior and constraints.
- Technical design choices will be handled during planning.

## Clarifications

### Session 2026-03-26

- Q: How should deletion of a Shared bulk document behave? -> A: Deleting a Shared document removes it from all cases in the same bulk batch.
- Q: Who is allowed to upload and delete case documents? -> A: Any case maker with access to the case can upload and delete documents.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload And Manage Case Documents (Priority: P1)

A case maker opens a case, uploads one or more supporting documents, classifies each document by type, and can later download or delete uploaded documents.

**Why this priority**: Document collection is required for day-to-day case processing and is the core value of this feature.

**Independent Test**: Can be fully tested by uploading valid files with selected types, then confirming the document list, download action, and delete confirmation flow.

**Acceptance Scenarios**:

1. **Given** a case maker is on a case Documents tab, **When** they upload a valid file up to 10 MB and select a document type, **Then** the document appears in the list with name, type, upload date, and file size.
2. **Given** a listed document, **When** the case maker clicks download, **Then** the original file is downloaded successfully.
3. **Given** a listed document, **When** the case maker confirms deletion, **Then** the document is removed from the list.
4. **Given** an invalid upload (unsupported file type or file over 10 MB), **When** upload is attempted, **Then** the upload is rejected with a clear validation message.

---

### User Story 2 - Track Expected Documents By Case Stage (Priority: P2)

A case maker sees an advisory checklist of commonly expected document types based on the current case status and can quickly identify what is missing.

**Why this priority**: It improves operational completeness and reduces missed documentation without blocking workflow.

**Independent Test**: Can be tested by changing case status and uploading different document types, then verifying checklist marks for present and missing expected items.

**Acceptance Scenarios**:

1. **Given** a case in Documentation status, **When** no expected documents are uploaded, **Then** Bill of Lading, Commercial Invoice, and Packing List appear as missing.
2. **Given** a case in Underwriting status, **When** Policy Document is uploaded, **Then** Policy Document is marked complete and Certificate of Insurance remains missing.
3. **Given** a case in Billing status, **When** Debit Note is uploaded, **Then** Debit Note is marked complete.
4. **Given** any checklist state, **When** expected items are missing, **Then** status transition capability is unchanged because the checklist is advisory only.

---

### User Story 3 - Identify Shared Bulk Documents (Priority: P3)

A case maker can identify documents that came from a bulk draft upload batch and are shared across all cases in that same batch.

**Why this priority**: Shared-document visibility prevents confusion and supports traceability for retroactive bulk declarations.

**Independent Test**: Can be tested by opening two cases from the same batch and confirming the same shared document appears in both with a visible shared indicator.

**Acceptance Scenarios**:

1. **Given** a document attached through bulk draft creation, **When** viewing any case in that batch, **Then** the document is visible and marked as Shared.
2. **Given** a non-bulk case document, **When** viewing the list, **Then** no Shared indicator is shown for that item.

---

### Edge Cases

- Upload attempt with an unsupported file extension must be rejected.
- Upload attempt with file size greater than 10 MB must be rejected.
- Multiple documents with the same type are allowed and all should remain visible.
- If no documents exist for a case, the list should show an empty state.
- Checklist behavior for statuses not mapped to expected documents should show no expected items.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a Documents tab on each case detail page.
- **FR-002**: System MUST allow case makers to upload documents from file picker or drag-and-drop interaction.
- **FR-003**: System MUST accept only these file formats: PDF, DOCX, XLSX, JPG, and PNG.
- **FR-004**: System MUST reject files larger than 10 MB.
- **FR-005**: System MUST require selection of a document type from the predefined list: Policy Document, Bill of Lading, Commercial Invoice, Packing List, Certificate of Insurance, Survey Report, Claim Form, Endorsement, Debit Note, Credit Note, Other.
- **FR-006**: System MUST allow an optional note to be saved with each uploaded document.
- **FR-007**: System MUST display a case document list with document name, type, upload date, file size, and actions for download and delete.
- **FR-008**: System MUST require explicit user confirmation before deleting a document.
- **FR-009**: System MUST present an advisory expected-documents checklist based on case status using this mapping:
Documentation: Bill of Lading, Commercial Invoice, Packing List.
Underwriting: Policy Document, Certificate of Insurance.
Billing: Debit Note.
- **FR-010**: System MUST mark expected document types as complete when at least one uploaded document of that type exists and mark others as missing.
- **FR-011**: System MUST NOT block status transitions based on checklist completeness.
- **FR-012**: System MUST show a Shared indicator for documents linked from bulk draft creation and make those documents visible in each case from the same batch.
- **FR-013**: System MUST keep document metadata and list views consistent across refreshed sessions.
- **FR-014**: System MUST remove a Shared document from all cases in the same bulk batch when deletion is confirmed.
- **FR-015**: System MUST allow any case maker with access to a case to upload and delete that case's documents.

### Key Entities *(include if feature involves data)*

- **Case Document**: A file record linked to one case or to multiple cases in the same bulk batch, including name, type, size, upload timestamp, optional note, and shared flag.
- **Document Type**: A controlled classification label applied to each document for operational grouping and checklist matching.
- **Expected Document Rule**: A status-to-document-type mapping used to render advisory checklist completeness.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of upload attempts for allowed types at or below 10 MB are accepted and listed within one user action cycle.
- **SC-002**: 100% of upload attempts for disallowed types or files over 10 MB are rejected with a clear reason.
- **SC-003**: At least 95% of case makers can upload, classify, and verify one document on first attempt in usability testing.
- **SC-004**: In test scenarios, checklist completion state always matches uploaded document types for Documentation, Underwriting, and Billing statuses.
- **SC-005**: In bulk-batch scenarios, shared documents are visible in all related cases with the Shared indicator in 100% of verified cases.

## Assumptions

- Deleting a shared document removes that shared document from all cases where it is linked.
- Upload date is displayed using the user interface's standard locale formatting.
- This feature covers case-level document management only and does not include document versioning or approval workflows.