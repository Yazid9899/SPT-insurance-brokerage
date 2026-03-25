# Feature Specification: Open Cover Management

**Feature Branch**: `002-open-cover-management`  
**Created**: 2026-03-25  
**Status**: Draft  
**Input**: User description: "Read the PRD at PRD.md. This is Feature 003: Open Cover Management."

## Constitution Alignment *(mandatory)*

- Keep this document technology-agnostic: describe only WHAT and WHY.
- Do not include implementation details such as frameworks, libraries, architecture,
  API transport design, or file/folder structure.
- If implementation detail is required for feasibility, note it as a clarification need
  and move final technical decisions to `plan.md`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Open Cover Agreements (Priority: P1)

As a Case Maker, I can list, create, and edit open cover agreements so the brokerage maintains accurate standing contract records with fixed insurer rates.

**Why this priority**: Open cover records are the source of truth for insurer rate and declaration context; without them, downstream case creation is error-prone.

**Independent Test**: Create a new open cover with valid details, view it in the list with status and declaration count, then edit details and confirm the updated values are shown.

**Acceptance Scenarios**:

1. **Given** open cover agreements exist, **When** the Case Maker opens the open cover list, **Then** each row shows reference number, client name, cargo product, insurer name, insurer rate, effective period, active/expired status, and declaration count.
2. **Given** the Case Maker submits a new agreement with required fields, **When** the data is valid and reference number is unique, **Then** the agreement is created and appears in the list.
3. **Given** the Case Maker submits an agreement with a duplicate reference number, **When** creation is attempted, **Then** the system rejects the request with a clear uniqueness error.
4. **Given** an existing agreement is edited, **When** the update is saved, **Then** the updated details are shown in list and detail views.
5. **Given** insurer rate is changed on an existing agreement, **When** existing declarations are viewed, **Then** their recorded insurer rate remains unchanged and only future cases use the new agreement rate.

---

### User Story 2 - Review Open Cover Details and Declarations (Priority: P1)

As a Case Maker, I can open an agreement and view its full details with a filterable declaration list so I can monitor utilization and shipment history under that contract.

**Why this priority**: Operational tracking of declarations under each standing agreement is required for underwriting coordination and settlement preparation.

**Independent Test**: Open an agreement from the list and verify full detail data and a declarations list that can be filtered by key criteria.

**Acceptance Scenarios**:

1. **Given** the Case Maker selects an agreement from the list, **When** detail view loads, **Then** the full agreement data is displayed.
2. **Given** the agreement has declarations, **When** the Case Maker views detail, **Then** all cases declared under that agreement are listed.
3. **Given** declaration filters are applied, **When** filter criteria are entered, **Then** only matching declarations are shown.

---

### User Story 3 - Use Open Cover in Case Creation (Priority: P2)

As a Case Maker, I can select an active open cover while creating a case so client details and insurer rate are pre-filled consistently while keeping client rate editable.

**Why this priority**: This enforces agreement-based pricing consistency and reduces manual data entry errors in new declarations.

**Independent Test**: Start new case creation with cover type Open Cover, pick an active agreement, and verify required auto-filled and locked fields.

**Acceptance Scenarios**:

1. **Given** the Case Maker chooses cover type Open Cover in case creation, **When** the open cover selector is opened, **Then** only active agreements are available.
2. **Given** an active agreement is selected, **When** the selection is confirmed, **Then** client information and insurer rate are auto-filled from that agreement.
3. **Given** insurer rate is populated from the selected agreement, **When** the Case Maker edits case pricing fields, **Then** insurer rate is read-only and client rate remains editable.

---

### Edge Cases

- Attempting to create or update an agreement where effective-from date is after effective-to date must be rejected.
- Editing an agreement must preserve declaration history and previously recorded insurer rates on existing cases.
- If no active open cover agreements are available, case creation with cover type Open Cover must clearly communicate that no selectable agreements exist.
- If an agreement transitions to expired status, it remains visible in list and detail views but is not available for new open-cover case selection.
- **When an agreement already has declarations, the system MUST block effective-date updates that would place any existing declaration outside the revised agreement period.**

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide an open cover list view for Case Maker users.
- **FR-002**: The open cover list MUST show reference number, client name, cargo product, insurer name, insurer rate, effective period, active/expired status, and declaration count.
- **FR-003**: The system MUST allow Case Maker users to create a new open cover agreement.
- **FR-004**: New open cover creation MUST require a unique reference number, client name, client company, insurer name, product line, cargo product, transport mode, currency, fixed insurer rate, effective-from date, effective-to date, and optional notes.
- **FR-005**: Product line for open cover agreements MUST be constrained to Cargo.
- **FR-006**: The system MUST reject open cover creation when the reference number already exists.
- **FR-007**: The system MUST provide an open cover detail view showing all agreement fields and declarations under that agreement.
- **FR-008**: Open cover detail MUST provide filtering for declarations (cases) under the agreement.
- **FR-009**: The system MUST allow editing open cover details.
- **FR-010**: Changing insurer rate on an open cover MUST NOT retroactively modify existing cases declared under that agreement.
- **FR-011**: Updated insurer rate MUST apply to new cases created under the agreement after the update.
- **FR-012**: In case creation, when cover type is Open Cover, the system MUST provide a selector of active agreements only.
- **FR-013**: Selecting an open cover in case creation MUST auto-fill client information and insurer rate from the agreement.
- **FR-014**: In case creation with open cover selected, insurer rate MUST be read-only and client rate MUST remain editable.
- **FR-015**: Open cover active/expired status MUST be derived consistently from agreement validity.
- **FR-016**: The system MUST prevent invalid effective period ranges (effective-from later than effective-to).
- **FR-017**: When an open cover is selected in case creation, case currency MUST be locked to the agreement currency.

### Key Entities *(include if feature involves data)*

- **Open Cover Agreement**: A standing contract record containing reference, client information, insurer information, cargo-specific attributes, currency, fixed insurer rate, validity period, and notes.
- **Open Cover Declaration**: A case linked to an open cover agreement, representing one shipment declared under that agreement.
- **Open Cover Listing Row**: Summary projection of agreement fields and derived status/count values used for operational list view.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of open cover rows display all required summary fields in user acceptance testing.
- **SC-002**: 100% of attempts to create a duplicate open cover reference are rejected with a clear user-facing error.
- **SC-003**: Case Makers can complete open cover creation with required fields in under 3 minutes during usability testing.
- **SC-004**: 100% of existing cases retain their original insurer rate after an agreement insurer rate update.
- **SC-005**: 100% of new cases created under an updated agreement use the latest insurer rate value.
- **SC-006**: In acceptance testing, selecting an active open cover auto-fills required client data and insurer rate for 100% of new open-cover case attempts.

## Assumptions

- Only Case Maker users are in scope for this feature.
- Open cover management applies only to Cargo product line in this phase.
- Open cover reference format follows brokerage conventions (example: `OC-2026-001`) and uniqueness is mandatory.
- Active/expired status is determined by agreement validity and current date.
- Declaration count includes all cases linked to the agreement regardless of case lifecycle status.
- Existing declaration records are immutable with respect to historical insurer rate values once created.


