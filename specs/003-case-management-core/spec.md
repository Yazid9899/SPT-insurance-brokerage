# Feature Specification: Case Management Core

**Feature Branch**: `[003-case-management-core]`  
**Created**: 2026-03-26  
**Status**: Draft  
**Input**: User description: "$speckit-specify Read the PRD at PRD.md. This is Feature 002: Case Management the core of the system. A case maker needs to create, view, edit, and track insurance cases through their full lifecycle."

## Constitution Alignment *(mandatory)*

- This specification describes the business behavior needed to manage insurance cases from creation through closure.
- It avoids implementation design and focuses on user outcomes, process rules, and measurable results.
- Technical delivery decisions are deferred to planning.

## Clarifications

### Session 2026-03-26

- Q: Which statuses allow case editing? -> A: Full edits allowed only in Draft, Documentation, and Underwriting.
- Q: How should concurrent case edits be resolved? -> A: Last save wins automatically.
- Q: Who can edit, delete Draft, and transition status? -> A: Any authorized case maker or operations staff can edit, delete Draft, and transition status.
- Q: How should Draft deletion be implemented? -> A: Soft-delete Draft cases (hidden from normal lists, retained for audit).
- Q: When should transition notes be mandatory? -> A: Notes required only for backward transitions.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Prepare a Case (Priority: P1)

A case maker creates a new insurance case with the correct fields shown for the selected product line, captures client and financial data, and saves the case as Draft with an auto-generated case number.

**Why this priority**: Case creation is the entry point for all downstream work; without accurate draft creation, no lifecycle progression is possible.

**Independent Test**: Can be fully tested by creating cargo and non-cargo cases, confirming field visibility rules, auto-calculations, required data checks, and Draft creation with generated case number.

**Acceptance Scenarios**:

1. **Given** a case maker starts a new case, **When** they save a valid cargo draft, **Then** the system generates a unique case number in `BRK-YYYY-NNNN` format and sets status to Draft.
2. **Given** product line is Cargo and cover type is Open Cover, **When** the case maker selects an open cover agreement, **Then** client name, insurer rate, and default client rate are auto-filled from the agreement.
3. **Given** product line is Cargo and cover type is Single Shipment, **When** the case maker enters rates, **Then** both client rate and insurer rate are entered manually and validated.
4. **Given** product line is Property, Marine Hull, or Utility, **When** the case maker views the form, **Then** only shared sections are shown and cargo-only shipment fields are hidden.
5. **Given** sum insured and both rates are provided, **When** values change, **Then** client premium, insurer premium, and broker commission are recalculated using the defined formulas.
6. **Given** client rate is lower than insurer rate, **When** the case maker attempts to save or transition requiring valid rates, **Then** the system blocks the action and explains the rate rule.

---

### User Story 2 - Find and Review Cases (Priority: P2)

A case maker can quickly locate cases from the list, open a case detail page, and review complete information including financial summary, linked open cover reference, and related tabs.

**Why this priority**: Daily operations require rapid retrieval and review of cases to maintain throughput and reduce handling errors.

**Independent Test**: Can be fully tested by loading a mixed dataset, using search/filter/sort/pagination, opening details from table rows, and verifying displayed sections and links.

**Acceptance Scenarios**:

1. **Given** multiple cases exist, **When** the case maker opens the list, **Then** the table includes Case #, Client, Product Line, Cargo Product, Cover Type, Status, Sum Insured, Broker Commission, and Created Date.
2. **Given** a case maker enters a case number or client name, **When** search is applied, **Then** only matching cases are shown.
3. **Given** filters are selected for status (multi-select), product line, cargo product, and cover type, **When** the list refreshes, **Then** only records matching all selected filters are displayed.
4. **Given** the user sorts by any visible column, **When** sort is toggled, **Then** results reorder correctly and remain consistent with active filters.
5. **Given** more than 20 matching records exist, **When** the user navigates pages, **Then** the list paginates at 20 records per page.
6. **Given** a case row is clicked, **When** detail opens, **Then** the page shows full case data, financial summary emphasis, open cover link when applicable, and tabs for Details, Documents, Emails, and History.

---

### User Story 3 - Progress and Control Case Lifecycle (Priority: P3)

A case maker edits cases, deletes drafts, and advances case statuses only through valid transitions with validation checks, confirmation, and audit logging.

**Why this priority**: Controlled progression and traceability protect underwriting quality, billing accuracy, and settlement integrity.

**Independent Test**: Can be fully tested by attempting allowed and disallowed transitions at each status, verifying required prerequisites, capturing notes, and validating audit history entries.

**Acceptance Scenarios**:

1. **Given** a case is in Draft, **When** required fields are complete, **Then** the status transition control offers Documentation and allows confirmation with optional note.
2. **Given** a case is in Documentation with no uploaded document, **When** the user tries to move to Underwriting, **Then** the transition is blocked with a requirement message.
3. **Given** a case is in Underwriting with valid sum insured and rates, **When** the user confirms transition, **Then** status changes to Active and an audit record is stored.
4. **Given** a case is in Active, **When** it moves to Billing, **Then** premiums are recalculated and the user is prompted to attach a debit note.
5. **Given** a case is in Billing, **When** viewing case detail transition actions, **Then** direct move to Settling is unavailable there because it must occur from settlement processing.
6. **Given** a case is in Draft, **When** delete is requested and user confirms via confirmation dialog, **Then** deletion is allowed; **and Given** status is not Draft, **When** delete is requested, **Then** deletion is blocked.
7. **Given** any successful status change, **When** history is viewed, **Then** it includes from-status, to-status, timestamp, actor, and optional note.
8. **Given** a case is in Settling and its parent settlement becomes paid, **When** settlement payment is confirmed, **Then** case status automatically changes to Closed.

---

### Edge Cases

- Case number generation near year-end: first case created in a new year must restart sequence at `0001` without duplicating existing numbers for that year.
- Search and filters combined with sorting and pagination: result counts and page navigation must remain accurate when criteria change rapidly.
- Cargo/non-cargo product line switches during editing: previously entered cargo-only fields must not produce invalid required-field errors for non-cargo records.
- Open cover selection change after manual edits: insurer rate must follow selected open cover while preserving transparent recalculation of financial values.
- Transition attempts by multiple users at nearly the same time: only one valid transition may apply, and history must reflect the final committed change sequence.
- Settlement-linked cases: users cannot manually force Billing to Settling from case detail even if they have edit access.
- Soft-deleted Draft records: normal list views and standard search results must exclude them to avoid accidental reuse, while authorized audit access can still retrieve their history.
- Delete confirmation: all Draft deletion actions must present a confirmation dialog before executing, consistent with constitution rules for destructive actions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow case makers to create a case using sections for Product Classification, Client Information, Financial Details, Shipment Details (cargo only), and Notes.
- **FR-002**: System MUST show product-specific form behavior: Cargo requires cargo product, cover type, and transport mode; non-cargo lines (Property, Marine Hull, Utility) show only shared fields.
- **FR-003**: System MUST support cargo products CPO, Biodiesel, and Shortening for cargo cases.
- **FR-004**: System MUST support cargo cover types Open Cover and Single Shipment.
- **FR-005**: When Open Cover is selected, system MUST require selecting an existing open cover and auto-fill client name, insurer rate, and a default client rate from that agreement.
- **FR-006**: When Single Shipment is selected, system MUST require manual entry of both insurer rate and client rate.
- **FR-007**: System MUST enforce dual-rate financial rules: client rate and insurer rate are required positive values for activation, and client rate MUST be greater than or equal to insurer rate.
- **FR-008**: System MUST calculate and display client premium, insurer premium, and broker commission using: `Client Premium = Sum Insured × Client Rate / 100`, `Insurer Premium = Sum Insured × Insurer Rate / 100`, `Broker Commission = Client Premium - Insurer Premium`.
- **FR-009**: For cargo cases, system MUST capture shipment details: origin, destination, vessel or fleet identifier, quantity in metric tons, estimated departure date, and estimated arrival date.
- **FR-010**: System MUST auto-generate unique case numbers using `BRK-YYYY-NNNN`; users MUST NOT enter case numbers manually.
- **FR-011**: System MUST create every new case in Draft status.
- **FR-012**: System MUST provide a case list with columns: Case #, Client, Product Line, Cargo Product, Cover Type, Status, Sum Insured, Broker Commission, and Created Date.
- **FR-013**: System MUST support list search by case number or client name.
- **FR-014**: System MUST support list filtering by one or more statuses, product line, cargo product, and cover type.
- **FR-015**: System MUST support sorting by any displayed list column.
- **FR-016**: System MUST paginate list results at 20 cases per page.
- **FR-017**: System MUST open case detail when a list row is selected.
- **FR-018**: Case detail MUST show full case data and a prominent financial summary with sum insured, client rate with client premium, insurer rate with insurer premium, and broker commission.
- **FR-019**: If a case is linked to open cover, case detail MUST display the open cover reference as a selectable link to that agreement.
- **FR-020**: Case detail MUST provide tabs for Details, Documents, Emails, and History.
- **FR-021**: System MUST allow full case editing only while status is Draft, Documentation, or Underwriting; editing MUST be blocked for Active, Billing, Settling, and Closed.
- **FR-022**: System MUST allow deletion only when case status is Draft; deletion MUST be blocked for all other statuses. Draft deletion MUST be a soft-delete that hides records from normal case lists while retaining them for audit history. Deletion MUST require user confirmation via a confirmation dialog before executing.
- **FR-023**: System MUST enforce lifecycle transitions exactly as follows: Draft -> Documentation; Documentation -> Underwriting or Draft; Underwriting -> Active or Documentation; Active -> Billing; Billing -> Settling; Settling -> Closed; Closed has no next status.
- **FR-024**: Transition to Documentation from Draft MUST require client name and product line; cargo cases MUST also include cargo product and cover type.
- **FR-025**: Transition to Underwriting from Documentation MUST require at least one uploaded document; cargo cases MUST also include origin and destination.
- **FR-026**: Transition to Active from Underwriting MUST require sum insured greater than zero, client rate greater than zero, insurer rate greater than zero, and client rate greater than or equal to insurer rate.
- **FR-027**: Transition to Billing from Active MUST trigger premium recalculation and present a prompt for debit note attachment. The prompt MUST be displayed in the transition confirmation flow and allow the user to acknowledge or attach a debit note document before completing the transition.
- **FR-028**: Transition from Billing to Settling MUST be triggered only from settlement processing, not from case detail transitions.
- **FR-029**: Transition from Settling to Closed MUST occur automatically when the parent settlement is marked paid. This feature MUST provide the integration hook point (status transition function accepting settlement-paid trigger) that the Settlement feature (Feature 007) will invoke; the actual settlement workflow is out of scope for this feature.
- **FR-030**: Case detail transition control MUST show only valid next statuses for the current status.
- **FR-031**: Initiating a transition from case detail MUST show a confirmation step. Transition note MUST be required for backward transitions (Documentation -> Draft, Underwriting -> Documentation) and optional for other allowed transitions.
- **FR-032**: Every status transition MUST be recorded with from status, to status, timestamp, actor, and optional note.
- **FR-033**: When concurrent edits occur on the same case, system MUST apply a last-save-wins rule for editable case fields.
- **FR-034**: Case edit, Draft deletion, and status transition actions MUST be available to any authorized case maker or authorized operations staff.

### Key Entities *(include if feature involves data)*

- **Case**: Core business record for an insurance placement, including case number, client details, product classification, cargo attributes when applicable, financial inputs/outputs, linked open cover (optional), current status, and created date.
- **Open Cover Agreement**: Pre-existing agreement used by cargo cases that provides insurer rate and default client rate context and acts as a selectable reference for linked cases.
- **Case Status Transition Record**: Immutable history entry for each lifecycle change, storing previous status, new status, actor identity, timestamp, and optional note.
- **Case Document**: Uploaded file associated with a case, used to satisfy documentation requirements and support transitions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 95% of valid case creation submissions are completed by case makers in under 4 minutes from opening a new form to saved Draft.
- **SC-002**: 100% of created cases receive a unique case number following `BRK-YYYY-NNNN` format with no duplicates within the same year.
- **SC-003**: At least 95% of list retrieval tasks (searching for a known case or filtering to a target subset) are completed by users within 30 seconds.
- **SC-004**: 100% of disallowed lifecycle transitions are blocked with clear feedback, and 100% of allowed transitions create a corresponding history record.
- **SC-005**: Financial summary values on case detail match defined formulas in 100% of audited test cases across cargo and non-cargo records.
- **SC-006**: Delete attempts on non-Draft cases are blocked in 100% of test cases, and all Draft deletions require confirmation before executing.

## Assumptions

- Only authenticated internal case makers and authorized operations staff interact with this feature.
- Authorization policy grants both authorized case makers and authorized operations staff permission to edit cases, delete Draft cases, and perform allowed transitions.
- Currency formatting and rounding follow existing system-wide financial display rules.
- Open cover agreements are already maintained in the system and available for selection when creating cargo open cover cases.
- Settlement workflows exist as a separate feature, and this feature only enforces that Billing to Settling cannot be completed from case detail. This feature provides the integration hook for settlement-paid triggers but does not implement the settlement workflow itself.
- Date and time stamps in history use the system standard timezone handling and are visible to users in their configured locale.
- Transition notes are mandatory for backward transitions (Documentation -> Draft, Underwriting -> Documentation) per FR-031, and optional for all other allowed transitions.