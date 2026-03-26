# Feature Specification: Bulk Draft Upload

**Feature Branch**: `006-bulk-draft-upload`  
**Created**: 2026-03-26  
**Status**: Draft  
**Input**: User description: "Feature 004: Bulk Draft Upload"

## Constitution Alignment *(mandatory)*

- This document defines business outcomes for retroactive bulk shipment declarations.
- It describes user behavior and validation expectations without implementation design.
- Technical decisions (parsing approach, storage strategy, APIs) are deferred to planning.

## Clarifications

### Session 2026-03-26

- Q: Should batch creation allow partial success when some rows are invalid? → A: Block creation unless all rows are valid (all-or-nothing).
- Q: How should auto-mapping handle multiple alias matches for the same target field? → A: Do not auto-map that field; require manual mapping.
- Q: How should the post-create batch filter be represented after redirect? → A: Redirect with URL query `bulkUploadId=<newBatchId>`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Setup Bulk Draft Batch (Priority: P1)

A case maker starts a bulk upload wizard, selects one open cover agreement, sets a client rate, uploads one XLS shipment file, and optionally uploads shared shipping documents.

**Why this priority**: Without a valid batch setup, no bulk declaration can be processed.

**Independent Test**: Can be fully tested by opening the wizard, selecting an open cover, uploading one valid XLS, and confirming setup data is accepted.

**Acceptance Scenarios**:

1. **Given** the case maker opens the bulk upload wizard, **When** they select an open cover agreement, **Then** client, cargo product, and insurer rate are auto-filled from that agreement.
2. **Given** setup step is active, **When** the case maker uploads a valid XLS and sets a client rate, **Then** the wizard allows progressing to review.
3. **Given** setup step is active, **When** optional shipping documents are uploaded, **Then** those documents are attached to the batch as shared documents.
4. **Given** setup step inputs are incomplete or invalid, **When** the case maker attempts to continue, **Then** clear validation feedback is shown and progress is blocked.

---

### User Story 2 - Review, Map, And Correct Parsed Shipments (Priority: P1)

A case maker reviews parsed XLS rows, confirms or overrides column mapping, fixes row errors inline, and verifies calculated premiums before creation.

**Why this priority**: Accurate review and correction is the core control point that prevents bad batch case creation.

**Independent Test**: Can be fully tested by uploading a mixed-quality XLS, applying mapping overrides, editing invalid rows inline, and validating corrected totals.

**Acceptance Scenarios**:

1. **Given** an uploaded XLS, **When** review starts, **Then** the system previews rows and auto-detects column mappings using PRD Section 7 header aliases.
2. **Given** auto-detected mappings, **When** the case maker overrides mapping selections, **Then** parsed row values update accordingly.
3. **Given** row-level validation errors, **When** the case maker edits invalid cells inline, **Then** validation status and calculated premiums recalculate for affected rows.
4. **Given** valid mapped data, **When** the review table is displayed, **Then** each row shows parsed values plus client premium, insurer premium, and broker commission, and a summary row shows totals.

---

### User Story 3 - Confirm And Create Draft Cases In Batch (Priority: P1)

A case maker confirms the final batch summary and creates multiple draft cases at once, all linked to one open cover and one bulk upload group.

**Why this priority**: This delivers the core business outcome: fast creation of multiple retroactive draft declarations.

**Independent Test**: Can be fully tested by confirming a valid reviewed batch and verifying created draft cases are grouped, linked, and filterable in the cases list.

**Acceptance Scenarios**:

1. **Given** review step has valid rows, **When** the case maker opens confirm step, **Then** the summary shows count of cases and totals for Sum Insured, Client Premium, Insurer Premium, and Broker Commission under the selected open cover reference.
2. **Given** the case maker confirms creation, **When** processing completes, **Then** one draft case is created per valid row, each linked to the selected open cover and same bulk upload group ID.
3. **Given** shared shipping documents were uploaded in setup, **When** cases are created, **Then** those documents are linked to every case in the created batch.
4. **Given** batch creation succeeds, **When** the wizard finishes, **Then** the user is redirected to the cases list filtered to show only that newly created batch.

---

### Edge Cases

- XLS contains fewer than 1 row or more than 10 shipment rows.
- XLS is missing one or more required columns: Origin, Destination, Vessel/Fleet, Quantity (MT), Sum Insured, ETD.
- XLS includes optional columns ETA and Notes with mixed blank/non-blank values.
- Duplicate or ambiguous header aliases match multiple target fields.
- One or more rows contain invalid numeric values, invalid dates, or negative amounts.
- Case maker tries to create batch while unresolved row errors remain.
- Shared document upload is skipped; cases must still be creatable.
- Open cover becomes unavailable between setup and confirmation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Bulk Upload" entry point from the cases list page.
- **FR-002**: System MUST provide a 3-step wizard flow: Setup, Review & Map, Confirm & Create.
- **FR-003**: Setup step MUST require selection of one open cover agreement.
- **FR-004**: On open cover selection, system MUST auto-fill client name, cargo product, and insurer rate from that agreement.
- **FR-005**: Setup step MUST allow case maker to set client rate for the whole batch.
- **FR-006**: Setup step MUST require upload of one XLS shipment file for parsing.
- **FR-007**: Setup step MUST allow optional upload of multiple shipping documents that are marked for shared batch linking.
- **FR-008**: Review step MUST parse XLS rows and show a preview table.
- **FR-009**: Review step MUST auto-detect source column mapping using common header aliases defined in PRD Section 7.
- **FR-010**: Review step MUST allow case maker to override auto-detected mappings per target field.
- **FR-011**: Review step MUST highlight validation issues at row level and field level.
- **FR-012**: Review step MUST allow inline cell editing to correct row data.
- **FR-013**: Review step MUST calculate and display per-row Client Premium, Insurer Premium, and Broker Commission using batch rates.
- **FR-014**: Review step MUST display summary totals for Sum Insured, Client Premium, Insurer Premium, and Broker Commission.
- **FR-015**: Confirm step MUST display "Creating X draft cases under [open cover reference]" before final submit.
- **FR-016**: On confirmation, system MUST create one Draft case per valid row.
- **FR-017**: All created cases in one submission MUST share the same bulk upload group ID.
- **FR-018**: All created cases in one submission MUST link to the selected open cover.
- **FR-019**: If shared documents were uploaded, system MUST link those documents to every created case in the batch.
- **FR-020**: On successful creation, system MUST redirect to cases list with filtering that shows only the newly created batch.
- **FR-021**: Required shipment fields per row MUST be: Origin, Destination, Vessel/Fleet, Quantity (MT), Sum Insured, ETD.
- **FR-022**: Optional shipment fields per row MUST be: ETA and Notes.
- **FR-023**: System MUST block final confirmation while unresolved validation errors remain.
- **FR-024**: Batch creation MUST be all-or-nothing: if any row is invalid at confirmation time, no cases are created.
- **FR-025**: If multiple source columns match aliases for the same target field, system MUST leave that target field unmapped and require manual selection before confirmation.
- **FR-026**: Post-create redirect MUST include URL query parameter `bulkUploadId=<newBatchId>` to show only the newly created batch.

### Key Entities *(include if feature involves data)*

- **Bulk Upload Batch**: A grouped declaration operation containing one selected open cover, one XLS source, one client rate, optional shared documents, and resulting created draft cases.
- **Shipment Draft Row**: One parsed row from XLS representing one draft case candidate with shipment details, financial inputs, validation state, and calculated premiums.
- **Column Mapping Profile**: Mapping between incoming XLS headers and required/optional shipment fields, including auto-detected and user-overridden assignments.
- **Shared Batch Document**: Optional uploaded shipping document associated with the batch and linked to all created cases in that batch.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid bulk uploads with 1-10 rows create the same number of draft cases as reviewed rows.
- **SC-002**: 100% of created cases from one confirmation share one bulk upload group ID and selected open cover reference.
- **SC-003**: At least 95% of case makers can complete setup-to-create flow for a valid batch on first attempt.
- **SC-004**: 100% of rows with missing required fields or invalid values are flagged before confirmation and prevented from final creation until corrected.
- **SC-005**: 100% of uploaded shared batch documents appear linked across all created cases in that batch.

## Assumptions

- Each upload batch always belongs to one client, one cargo product, and one open cover agreement.
- A single confirmation action creates only draft cases; no status advancement beyond Draft is performed in this feature.
- Premium calculations for each row use the selected batch client rate and selected open cover insurer rate.
- Case maker has permission to create cases under the selected open cover and to attach shared documents.
- Cases list supports filtering by bulk upload group so post-create redirection can show only the new batch.
