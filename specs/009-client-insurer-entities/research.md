# Research: Client And Insurer Entities

## Decision 1: Keep additive dual-read/dual-write compatibility
- Decision: Persist normalized references (`clientId`, `insurerId`) and continue writing legacy snapshot fields.
- Rationale: Enables normalized tracking without breaking existing UI/API/export behavior.
- Alternatives considered:
  - Hard cutover to normalized fields only: rejected due to regression risk.
  - Keep snapshots only: rejected because it fails normalized tracking goals.

## Decision 2: Open cover supports one insurer and many clients
- Decision: Replace single-client open-cover assumption with many-to-many client linkage while keeping one insurer linkage.
- Rationale: Required to reuse the same open cover across multiple clients.
- Alternatives considered:
  - Keep one client per open cover: rejected by clarified business need.
  - Duplicate open covers per client: rejected due to data duplication and operational complexity.

## Decision 3: Active open cover requires at least one linked client
- Decision: Block active state and active workflows when an open cover has zero linked clients.
- Rationale: Prevents dead-end case creation and protects operational consistency.
- Alternatives considered:
  - Allow active with zero clients and block later: rejected as poor UX and late failure.
  - Auto-create ad-hoc clients at case time: rejected as data quality risk.

## Decision 4: Open-cover case client must be from linked client list
- Decision: For open-cover case creation/edit, selected client must belong to that open cover's linked client set.
- Rationale: Enforces contract integrity between cover and declarations.
- Alternatives considered:
  - Allow any client with warning: rejected due to compliance/reconciliation risk.

## Decision 5: Unique-match-only backfill for legacy open covers and cases
- Decision: Auto-link only when there is exactly one normalized match; route ambiguous/unmatched to manual review.
- Rationale: Minimizes identity corruption from aggressive auto-linking.
- Alternatives considered:
  - Always create new client records: rejected due to fragmentation.
  - Manual-only backfill: rejected due to slow rollout and operational load.

## Decision 6: Inactive clients cannot be selected for new open-cover cases
- Decision: Block inactive linked clients for new open-cover case creation while keeping historical linked cases readable.
- Rationale: Maintains current-state data quality without rewriting history.
- Alternatives considered:
  - Allow with warning: rejected due to inconsistent operational controls.
  - Auto-reactivate on selection: rejected due to unintended lifecycle mutation.

## Decision 7: Settlement remains name-based in this feature
- Decision: Settlement records stay name-based; direct settlement insurer FK migration is deferred.
- Rationale: Preserves existing settlement behavior during broader party-model rollout.
- Alternatives considered:
  - Migrate settlement linkage now: rejected due to risk and scope growth.

## Decision 8: Governance requires supervisor-approved merge/split with audit
- Decision: Merge/split actions must be approved and recorded immutably.
- Rationale: Protects financial lineage and accountability.
- Alternatives considered:
  - Case-maker self-service merge/split: rejected due to integrity risk.
  - Offline process without in-system audit: rejected due to weak traceability.
