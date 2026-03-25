# Research: Open Cover Management

## Decision: Open Cover CRUD + Declaration Visibility

- Decision: Provide list/create/detail/edit workflows for open cover agreements with declaration counts and filterable declarations per agreement.
- Rationale: Matches operational need for standing agreement management and declaration traceability.
- Alternatives considered:
  - List-only view: rejected due to insufficient maintenance capability.
  - No declaration filter on detail: rejected due to poor operational searchability.

## Decision: Non-Retroactive Insurer-Rate Updates

- Decision: Agreement insurer-rate changes apply only to future cases; existing cases remain unchanged.
- Rationale: Preserves financial audit integrity and matches business rule in feature scope.
- Alternatives considered:
  - Retroactive updates to existing cases: rejected due to settlement/audit inconsistency.

## Decision: Open-Cover Case Creation Coupling

- Decision: Open-cover selection in new-case flow uses active agreements only and auto-fills client info + insurer rate; insurer rate and currency are read-only while client rate remains editable.
- Rationale: Enforces agreement consistency while preserving broker-side client rate control.
- Alternatives considered:
  - Allow inactive agreement selection: rejected due to invalid declaration risk.
  - Editable insurer rate for open-cover cases: rejected due to contract inconsistency.

## Decision: Shared Integrity Utilities

- Decision: Use shared `calculatePremiums()` utility client-side and server-side; validate status transitions server-side with `STATUS_TRANSITIONS` + transition schemas.
- Rationale: Balances UX responsiveness with write-path integrity and deterministic lifecycle controls.
- Alternatives considered:
  - Client-only premium calculation: rejected due to tampering/inconsistency risk.
  - Inline transition logic per handler: rejected due to rule drift.

## Decision: Filtering and Status Consistency

- Decision: Case list and declaration filters use URL search params for server-side filtering; status colors are centralized in constants and reused by shared badge component.
- Rationale: Supports shareable state, deterministic filtering, and UI consistency.
- Alternatives considered:
  - Client-only in-memory filtering: rejected for scalability and URL-state mismatch.
  - Localized status colors by page: rejected due to UX inconsistency.
