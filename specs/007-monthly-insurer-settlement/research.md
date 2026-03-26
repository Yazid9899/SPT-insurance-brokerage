# Research: Monthly Insurer Settlement

## Decision 1: Confirm and pay transaction pattern
- Decision: Use one Prisma `$transaction` per lifecycle action (`confirm`, `pay`) with strict precondition checks and set-based updates inside the same transaction.
- Rationale: Ensures all targeted case status changes, history writes, and settlement status updates either fully commit or fully rollback.
- Alternatives considered:
  - Per-case updates outside transaction: rejected due to partial-transition risk.
  - Nested transactions per case: rejected for unnecessary complexity and reduced throughput.

## Decision 2: Concurrency guard for double-settling
- Decision: Enforce uniqueness and stale-state guards by:
  1) reserving each case in at most one open settlement (`DRAFT`/`CONFIRMED`), and
  2) validating current case status before transition (`BILLING` for confirm, `SETTLING` for pay).
- Rationale: Prevents duplicate inclusion and race-condition induced double payment.
- Alternatives considered:
  - Optimistic update without reservation checks: rejected because conflicts are detected too late.
  - Global application lock: rejected as heavy and unnecessary for internal low-concurrency usage.

## Decision 3: Settlement number generation
- Decision: Generate settlement reference server-side using `STL-YYYY-MM-NNN` and a transaction-safe sequence query scoped by period prefix.
- Rationale: Maintains deterministic numbering and avoids collisions under concurrent create requests.
- Alternatives considered:
  - UUID-only references: rejected due to business readability requirements.
  - Client-side number generation: rejected due to collision/audit risk.

## Decision 4: Decimal-safe totals
- Decision: Compute totals from selected `SettlementItem` values using Decimal-safe operations for insurer premium and broker commission, both during draft edit and detail rendering.
- Rationale: Aligns with insurance domain integrity and avoids floating-point drift.
- Alternatives considered:
  - JavaScript number arithmetic: rejected for precision loss risk.
  - Storing only pre-aggregated totals without recomputation: rejected because editability in DRAFT needs deterministic recalculation.

## Decision 5: Payment reference uniqueness enforcement
- Decision: Enforce globally unique bank transfer reference at pay time; reject duplicates before status transitions.
- Rationale: Strong reconciliation control and clear audit trail.
- Alternatives considered:
  - Uniqueness by insurer-period only: rejected because cross-period duplicates still create operational ambiguity.
  - Warning-only policy: rejected due to financial control risk.

