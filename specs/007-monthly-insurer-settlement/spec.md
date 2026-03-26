# Feature Specification: Monthly Insurer Settlement

**Feature Branch**: `[007-monthly-insurer-settlement]`  
**Created**: 2026-03-26  
**Status**: Draft  
**Input**: User description: "Feature 007: Monthly Insurer Settlement."

## Constitution Alignment *(mandatory)*

- Keep this document technology-agnostic: describe only WHAT and WHY.
- Do not include implementation details such as frameworks, libraries, architecture,
  API transport design, or file/folder structure.
- If implementation detail is required for feasibility, note it as a clarification need
  and move final technical decisions to `plan.md`.

## Clarifications

### Session 2026-03-26

- Q: Which BILLING cases are eligible when insurer identity is missing on a case? -> A: Only include BILLING cases linked to an open cover so insurer identity is derived and explicit.
- Q: Should payment transfer reference be unique? -> A: Payment transfer reference must be unique across all settlements.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Create Monthly Settlement Draft (Priority: P1)

A case maker creates a settlement batch by selecting insurer and period (month/year), then reviews all eligible BILLING cases for that insurer as a checklist with live totals.

**Why this priority**: This creates the core monthly payable batch and gives immediate financial visibility before committing transitions.

**Independent Test**: Can be fully tested by creating a new settlement, viewing eligible cases list, checking/unchecking entries, and confirming totals update correctly without changing case statuses yet.

**Acceptance Scenarios**:

1. **Given** cases in BILLING exist for a selected insurer and period, **When** the case maker creates a settlement, **Then** the system creates a DRAFT settlement and loads eligible cases with initial totals.
2. **Given** a DRAFT settlement with eligible cases, **When** the case maker checks/unchecks cases, **Then** included case count, total insurer premium, and total broker commission update immediately.
3. **Given** a DRAFT settlement with no selected cases, **When** the case maker views summary, **Then** totals are zero and settlement remains editable.

---

### User Story 2 - Confirm Settlement And Lock Case Selection (Priority: P1)

The case maker confirms a prepared DRAFT settlement so included cases move from BILLING to SETTLING and the settlement becomes immutable for case matching.

**Why this priority**: This is the operational handoff from preparation to committed settlement processing.

**Independent Test**: Can be tested by confirming a DRAFT settlement and verifying status changes for included cases plus lock behavior on the settlement checklist.

**Acceptance Scenarios**:

1. **Given** a DRAFT settlement with selected cases, **When** the case maker clicks Confirm, **Then** settlement status becomes CONFIRMED and selected cases move to SETTLING.
2. **Given** a CONFIRMED settlement, **When** the case maker attempts to add or remove cases, **Then** the system blocks changes.
3. **Given** a DRAFT settlement, **When** confirmation fails for any selected case transition, **Then** no selected case transitions and settlement remains DRAFT.

---

### User Story 3 - Mark Settlement As Paid And Close Cases (Priority: P1)

The case maker records payment details and marks a CONFIRMED settlement as PAID so all matched SETTLING cases close together with status history and closure timestamps.

**Why this priority**: This completes the financial lifecycle and ensures case closure integrity for audit/reporting.

**Independent Test**: Can be tested by marking a CONFIRMED settlement as PAID and verifying all included SETTLING cases transition to CLOSED atomically.

**Acceptance Scenarios**:

1. **Given** a CONFIRMED settlement with matched SETTLING cases, **When** payment date and transfer reference are recorded and Mark as Paid is clicked, **Then** settlement becomes PAID and all matched cases become CLOSED.
2. **Given** a CONFIRMED settlement, **When** payment details are missing, **Then** the system rejects marking it PAID.
3. **Given** a CONFIRMED settlement, **When** any matched case cannot transition from SETTLING to CLOSED, **Then** settlement stays CONFIRMED and no matched case is closed.

---

### Edge Cases

- No eligible BILLING cases exist for the selected insurer and period.
- A case appears eligible at draft creation time but is moved out of BILLING before confirmation.
- A user attempts to confirm or pay an already finalized settlement.
- Duplicate payment reference is entered for any other settlement.
- Partial transition failure occurs during confirm or paid actions.
- A settlement contains previously unchecked cases only and later gets paid.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a case maker to create a settlement by selecting insurer and settlement period (month + year).
- **FR-002**: System MUST auto-generate settlement reference numbers in the format `STL-YYYY-MM-NNN`.
- **FR-003**: System MUST set new settlements to `DRAFT` status.
- **FR-004**: System MUST automatically load eligible cases for the selected insurer in `BILLING` status only when insurer identity is explicitly available from the case's linked open cover.
- **FR-005**: System MUST present eligible cases as a selectable checklist and support include/exclude actions in DRAFT.
- **FR-006**: System MUST show running totals in DRAFT for included case count, total insurer premium, and total broker commission.
- **FR-007**: System MUST show settlement detail fields: reference, period, insurer name, status, total insurer premium, total broker commission, and total number of included cases.
- **FR-008**: System MUST prevent modification of included/excluded cases after settlement becomes `CONFIRMED`.
- **FR-009**: System MUST transition all included cases from `BILLING` to `SETTLING` when a DRAFT settlement is confirmed.
- **FR-010**: System MUST block settlement confirmation if zero cases are included.
- **FR-011**: System MUST require payment date and bank transfer reference before allowing `Mark as Paid`.
- **FR-011a**: System MUST reject `Mark as Paid` when the provided bank transfer reference has already been used by any settlement.
- **FR-012**: System MUST transition all included cases from `SETTLING` to `CLOSED` atomically when settlement is marked `PAID`.
- **FR-013**: System MUST write a status history entry for each case transitioned by settlement confirm/pay actions, including timestamp and actor.
- **FR-014**: System MUST set `closedAt` for each case closed via settlement payment.
- **FR-015**: System MUST list settlements with columns: Reference, Period, Insurer, # Cases, Total Insurer Premium, Total Commission, and Status.
- **FR-016**: System MUST determine period eligibility using the date a case first transitions into `BILLING` status.
- **FR-017**: System MUST reserve each case to at most one open settlement (`DRAFT` or `CONFIRMED`) at a time to prevent duplicate inclusion.

### Key Entities *(include if feature involves data)*

- **Settlement Batch**: Monthly payable batch identified by reference, insurer, period, status, payment metadata, and aggregate totals.
- **Settlement Case Item**: Link between a settlement and an included case, including matched/included state and financial amounts used in totals.
- **Case**: Existing insurance case participating in settlement lifecycle transitions (`BILLING` -> `SETTLING` -> `CLOSED`).
- **Case Status History Record**: Immutable audit entry for each status transition made during settlement confirm/pay actions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of settlement drafts are created (insurer + period selected, eligible cases loaded) in under 1 minute.
- **SC-002**: 100% of confirmed settlements lock case selection and preserve unchanged included-case totals thereafter.
- **SC-003**: 100% of successful `Mark as Paid` actions close all included cases in a single batch with no partial closure.
- **SC-004**: 100% of cases closed via settlement payment have both a closure timestamp and matching status history entry.

## Assumptions

- Phase 1 has a single internal role (case maker) with permission to create, confirm, and pay settlements.
- Each settlement batch is for one insurer and one month-year period only.
- Financial totals are computed from included case values already stored on each case at billing stage.
- Cases eligible for matching must already be in BILLING status at the time of draft selection.
- Cases without explicit insurer identity (for example, no linked open cover) are excluded from settlement eligibility.
- Settlement period membership is based on the case's first BILLING transition timestamp.
- A case already reserved by another open settlement is not eligible for selection.
- Reversing a PAID settlement is out of scope for this feature.

