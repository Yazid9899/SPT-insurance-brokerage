# Data Model: Monthly Insurer Settlement

## Entity: Settlement
- Purpose: Represents one monthly insurer payment batch.
- Core fields:
  - `id`
  - `settlementNumber` (`STL-YYYY-MM-NNN`, unique)
  - `insurerName`
  - `period` (month-year key)
  - `currency`
  - `totalInsurerPremium`
  - `totalBrokerCommission`
  - `status` (`DRAFT`, `CONFIRMED`, `PAID`)
  - `confirmedAt` (nullable)
  - `paidAt` (nullable)
  - `paymentRef` (nullable, globally unique once paid)
  - `createdById`
- Invariants:
  - Created as `DRAFT`.
  - Membership editable only in `DRAFT`.
  - `PAID` requires `paidAt` and `paymentRef`.

## Entity: SettlementItem
- Purpose: Membership link between settlement and selected case.
- Core fields:
  - `id`
  - `settlementId`
  - `caseId`
  - `insurerPremium`
  - `brokerCommission`
  - `matched` (included/excluded checkbox state in DRAFT)
- Invariants:
  - `(settlementId, caseId)` unique.
  - Each case reserved to at most one open settlement (`DRAFT` or `CONFIRMED`).
  - Financial amounts are copied from case values at selection time for deterministic totals.

## Entity: Case (existing)
- Used fields:
  - `id`
  - `status` (`BILLING`, `SETTLING`, `CLOSED`)
  - `insurerPremium`
  - `brokerCommission`
  - `closedAt`
  - insurer identity via linked open cover
- Invariants for this feature:
  - Eligibility for settlement draft: status `BILLING`, insurer identity explicit, and not reserved by another open settlement.
  - Confirm transition guard: all selected cases still `BILLING`.
  - Pay transition guard: all selected cases still `SETTLING`.

## Entity: CaseStatusHistory (existing)
- Purpose: Immutable audit record per transition.
- Required write events for this feature:
  - `BILLING -> SETTLING` during confirm.
  - `SETTLING -> CLOSED` during pay.
- Required attributes:
  - `caseId`
  - `fromStatus`
  - `toStatus`
  - `changedAt`
  - `changedBy`
  - `note` (optional contextual message)

## Relationships
- One `Settlement` -> many `SettlementItem`.
- One `SettlementItem` -> one `Case`.
- One `Case` -> many `CaseStatusHistory`.

## Lifecycle & State Transitions

### Settlement
1. `DRAFT`: created with insurer+period and candidate BILLING cases.
2. `CONFIRMED`: selected cases transitioned to `SETTLING`; membership locked.
3. `PAID`: payment metadata recorded; selected cases transitioned to `CLOSED` atomically.

### Case via settlement flow
1. `BILLING -> SETTLING` (confirm transaction).
2. `SETTLING -> CLOSED` (pay transaction, with `closedAt` set).

## Validation Rules
- Confirm requires settlement status `DRAFT`.
- Confirm requires at least one selected (`matched=true`) settlement item.
- Pay requires settlement status `CONFIRMED`.
- Pay requires `paymentDate` and `bankTransferReference`.
- `bankTransferReference` must be unique across settlements.
- Atomic failure behavior:
  - If any selected case fails precondition during confirm/pay, no case transitions and settlement status remains unchanged.

## Consistency Rules
- Totals derive from selected settlement items using Decimal-safe aggregation.
- Status history is mandatory for each case moved by settlement actions.
- `closedAt` set only when case reaches `CLOSED`.

