# Research: Bulk Draft Upload

## Decision 1: SheetJS parsing for mixed date/currency cells
- Decision: Parse workbook with `xlsx` using `raw: false`, preserve formatted strings, and normalize each target field through explicit coercion rules.
- Rationale: Shipment files often mix numeric serial dates, formatted date strings, and currency-formatted values; explicit normalization avoids silent mis-parsing.
- Alternatives considered:
  - `raw: true` only: rejected because Excel date serials/currency cells become ambiguous for operators.
  - Blind `Number(...)` coercion for amounts/dates: rejected because it breaks localized formats and date text.

## Decision 2: Header alias auto-mapping behavior
- Decision: Use a shared `HEADER_ALIASES` map from PRD Section 7; if multiple columns match a single target field, leave that target unmapped and require manual user mapping.
- Rationale: Matches clarified requirement FR-025 and avoids wrong auto-assignment under ambiguous headers.
- Alternatives considered:
  - First-match wins: rejected due to hidden data quality risk.
  - Hard fail entire parse on ambiguity: rejected as too strict for operational XLS variability.

## Decision 3: Server-safe wizard draft state
- Decision: Persist wizard draft state server-side (session-scoped) between Setup, Review, and Confirm steps, while keeping client-side form responsiveness.
- Rationale: Prevents data loss on refresh/navigation and ensures authoritative state for final server validation.
- Alternatives considered:
  - Client-only state (in-memory): rejected due to high loss risk on refresh.
  - URL-only state: rejected because payload size and document references exceed practical query usage.

## Decision 4: Temporary shared document handling
- Decision: Upload optional shared documents to temporary storage with metadata token references; finalize links to all created cases only inside final transaction.
- Rationale: Supports stepwise wizard UX while preventing orphaned cross-case links before confirmation.
- Alternatives considered:
  - Attach documents directly to placeholder case IDs before creation: rejected because case records do not exist yet.
  - Keep files only in browser until confirm: rejected due to reliability and session-loss risk.

## Decision 5: Final creation transaction scope
- Decision: Final `POST /api/cases/bulk-upload` performs one atomic Prisma transaction:
  1) generate `bulkUploadId`
  2) create N `Case` rows in `DRAFT`
  3) compute premiums per row via `calculatePremiums()`
  4) create case-document links for shared docs across all new cases
- Rationale: Satisfies all-or-nothing requirement (FR-024), preserves audit consistency, and avoids partial batch artifacts.
- Alternatives considered:
  - Per-row transaction loop: rejected due to partial creation risk.
  - Async background job for final creation: rejected for current phase complexity and operator predictability.

## Decision 6: Error model for review and confirm
- Decision: Keep dual-layer validation: client-side immediate row feedback in Review, server-side full batch re-validation before transaction.
- Rationale: Improves UX while preserving data integrity against tampered or stale client state.
- Alternatives considered:
  - Client-side validation only: rejected due to trust boundary issues.
  - Server-only validation after confirm: rejected due to poor user correction experience.
