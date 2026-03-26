# Data Model: Case Management Core

## Entity: Case
- Purpose: Primary insurance case record spanning intake through closure.
- Identity:
  - `id` (system identifier)
  - `caseNumber` (unique, `BRK-YYYY-NNNN`, server-generated)
- Classification:
  - `productLine` (CARGO, PROPERTY, MARINE_HULL, UTILITY)
  - `cargoProduct` (required for cargo transitions where applicable)
  - `coverType` (OPEN_COVER or SINGLE_SHIPMENT for cargo)
  - `transportMode` (MARINE or TRUCKING for cargo)
- Client fields:
  - `clientName` (required for Draft -> Documentation)
  - contact/company fields (optional by business rule unless specified later)
- Open cover linkage:
  - `openCoverId` (required if coverType is OPEN_COVER)
- Financial fields (Decimal + currency):
  - `currency`
  - `sumInsured`
  - `clientRate`
  - `insurerRate`
  - `clientPremium`
  - `insurerPremium`
  - `brokerCommission`
- Shipment fields (cargo-only business requirement):
  - `origin`, `destination`, `vessel`, `quantity`, `etd`, `eta`
- Lifecycle:
  - `status` (DRAFT, DOCUMENTATION, UNDERWRITING, ACTIVE, BILLING, SETTLING, CLOSED)
  - `closedAt`
- Audit metadata:
  - `createdById`, `createdAt`, `updatedAt`
- Deletion model:
  - Soft-delete marker field(s) added in implementation (e.g., `deletedAt`) for Draft-only delete behavior.

## Entity: CaseStatusHistory
- Purpose: Immutable audit record for every status change.
- Fields:
  - `caseId`
  - `fromStatus` (nullable for creation edge if needed)
  - `toStatus`
  - `changedAt`
  - `changedBy`
  - `note` (required for backward transitions only)
- Invariant: Every persisted status change must have a paired history row in same transaction.

## Entity: OpenCover (dependency)
- Purpose: Source of inherited insurer rate and default client context for open-cover case creation.
- Relevant fields:
  - `id`, `reference`, `clientName`, `insurerRate`, `cargoProduct`, `transportMode`, `currency`, `isActive`
- Invariant: Insurer rate inherited from open cover remains system-enforced for linked cases.

## Entity: CaseDocument (dependency)
- Purpose: Uploaded documentation attached to a case.
- Invariant: At least one document required for Documentation -> Underwriting.

## Relationships
- One `Case` to many `CaseStatusHistory`.
- One `Case` to many `CaseDocument`.
- Optional many `Case` to one `OpenCover`.

## Derived Calculations
- `clientPremium = sumInsured * clientRate / 100`
- `insurerPremium = sumInsured * insurerRate / 100`
- `brokerCommission = clientPremium - insurerPremium`
- Invariant: `clientRate >= insurerRate` when transitioning to Active.

## Lifecycle Rules
- Allowed transitions:
  - Draft -> Documentation
  - Documentation -> Underwriting or Draft
  - Underwriting -> Active or Documentation
  - Active -> Billing
  - Billing -> Settling (triggered from settlement flow)
  - Settling -> Closed (automatic on settlement paid)
- Validation matrix:
  - Draft -> Documentation: requires client name + product line; cargo additionally needs cargoProduct + coverType.
  - Documentation -> Underwriting: requires >=1 document; cargo requires origin + destination.
  - Underwriting -> Active: requires positive sumInsured and rates, and clientRate >= insurerRate.
  - Active -> Billing: recalculates premiums and prompts debit note attachment.

## Concurrency & Integrity
- Editable statuses: Draft, Documentation, Underwriting.
- Concurrency rule: last-save-wins for concurrent updates on editable fields.
- Multi-table writes (status + history) are transactional.
- Soft-deleted Draft cases excluded from standard list/search queries.
