# Data Model: Foundation Application Shell

## Overview

Feature 001 introduces the full core relational schema from the PRD so that subsequent
features can be implemented without disruptive schema redesign. Foundation behavior uses
only a subset (auth, shell references, placeholders), but all entities are defined now.

## Enums

### CaseStatus
- DRAFT
- DOCUMENTATION
- UNDERWRITING
- ACTIVE
- BILLING
- SETTLING
- CLOSED

### ProductLine
- CARGO
- PROPERTY
- MARINE_HULL
- UTILITY

### CargoProduct
- CPO
- BIODIESEL
- SHORTENING

### CoverType
- OPEN_COVER
- SINGLE_SHIPMENT

### TransportMode
- MARINE
- TRUCKING

### Currency
- IDR
- USD
- SGD
- MYR

### DocumentType
- POLICY_DOCUMENT
- BILL_OF_LADING
- COMMERCIAL_INVOICE
- PACKING_LIST
- CERTIFICATE_OF_INSURANCE
- SURVEY_REPORT
- CLAIM_FORM
- ENDORSEMENT
- DEBIT_NOTE
- CREDIT_NOTE
- OTHER

### SettlementStatus
- DRAFT
- CONFIRMED
- PAID

## Entities

### User
- Purpose: Authenticated Case Maker identity.
- Fields:
  - `id` (cuid primary key)
  - `email` (unique)
  - `name`
  - `passwordHash`
  - `createdAt`, `updatedAt`
- Relationships:
  - one-to-many `cases`
  - one-to-many `sentEmails`
  - one-to-many `settlements`
- Validation:
  - email required and unique
  - password hash required

### OpenCover
- Purpose: First-class open cover agreement with fixed insurer rate.
- Fields:
  - `id` (cuid primary key)
  - `reference` (unique)
  - `clientName`, `clientCompany`
  - `insurerName`
  - `cargoProduct`, `transportMode`
  - `insurerRate` (`Decimal(8,6)`)
  - `currency`
  - `effectiveFrom`, `effectiveTo`
  - `isActive`
  - `notes`
  - `createdAt`, `updatedAt`
- Relationships:
  - one-to-many `cases`
- Validation:
  - `insurerRate` fixed by agreement and reused by linked declarations

### Case
- Purpose: Core brokerage case record across all product lines.
- Fields:
  - Identity and taxonomy:
    - `id`, `caseNumber` (unique, server-generated pattern `BRK-YYYY-NNNN`)
    - `productLine`, `cargoProduct`, `coverType`, `transportMode`
  - Client data:
    - `clientName`, `clientEmail`, `clientPhone`, `clientCompany`
  - Open cover link:
    - `openCoverId` (nullable foreign key)
  - Lifecycle:
    - `status` (CaseStatus)
    - `closedAt`
  - Financials (all Decimal):
    - `currency`
    - `sumInsured` `Decimal(20,2)`
    - `clientRate` `Decimal(8,6)`
    - `insurerRate` `Decimal(8,6)`
    - `clientPremium` `Decimal(20,2)`
    - `insurerPremium` `Decimal(20,2)`
    - `brokerCommission` `Decimal(20,2)`
  - Shipment:
    - `origin`, `destination`, `vessel`, `quantity` (`Decimal(12,2)`), `etd`, `eta`
  - Metadata:
    - `notes`
    - `bulkUploadId` (groups cases from one XLS upload)
    - `createdById`, `createdAt`, `updatedAt`
- Relationships:
  - many-to-one `createdBy` -> User
  - many-to-one `openCover` -> OpenCover
  - one-to-many `documents`, `emails`, `statusHistory`, `settlementItems`
- Validation:
  - no floating-point persistence
  - explicit `currency` for each financial amount set
  - status changes logged via CaseStatusHistory

### CaseDocument
- Purpose: File metadata attached to a case.
- Fields: `id`, `caseId`, `name`, `type`, `fileName`, `filePath`, `fileSize`, `mimeType`, `notes`, `uploadedAt`
- Relationship: many-to-one `case` with cascade delete.

### CaseEmail
- Purpose: Audit trail of outbound email content and metadata.
- Fields: `id`, `caseId`, `templateId`, `to`, `cc`, `subject`, `body`, `sentById`, `sentAt`
- Relationships: many-to-one `case`; many-to-one `sentBy` -> User.

### CaseStatusHistory
- Purpose: Immutable status transition log.
- Fields: `id`, `caseId`, `fromStatus`, `toStatus`, `changedAt`, `changedBy`, `note`
- Relationship: many-to-one `case` with cascade delete.

### Settlement
- Purpose: Monthly insurer settlement batch header.
- Fields:
  - `id`, `settlementNumber` (unique)
  - `insurerName`, `period`, `currency`
  - `totalInsurerPremium` `Decimal(20,2)`
  - `totalBrokerCommission` `Decimal(20,2)`
  - `status`, `confirmedAt`, `paidAt`, `paymentRef`, `notes`
  - `createdById`, `createdAt`, `updatedAt`
- Relationships:
  - many-to-one `createdBy` -> User
  - one-to-many `items`

### SettlementItem
- Purpose: Case-level membership and matching record within settlement.
- Fields: `id`, `settlementId`, `caseId`, `insurerPremium` `Decimal(20,2)`, `brokerCommission` `Decimal(20,2)`, `matched`
- Relationships:
  - many-to-one `settlement` (cascade delete)
  - many-to-one `case`
- Constraints:
  - unique composite key `(settlementId, caseId)`

## Indexes and Constraints

- Unique:
  - `User.email`
  - `OpenCover.reference`
  - `Case.caseNumber`
  - `Settlement.settlementNumber`
  - `SettlementItem(settlementId, caseId)`
- Operational indexes:
  - Case: `status`, `productLine`, `cargoProduct`, `clientName`, `createdAt`, `openCoverId`, `bulkUploadId`
  - OpenCover: `clientName`, `isActive`
  - CaseDocument: `caseId`, `type`
  - CaseEmail: `caseId`
  - CaseStatusHistory: `caseId`, `changedAt`
  - Settlement: `status`, `period`, `insurerName`
  - SettlementItem: `settlementId`, `caseId`

## Status Lifecycle Baseline

Foundation defines the canonical ordered status set:
`DRAFT -> DOCUMENTATION -> UNDERWRITING -> ACTIVE -> BILLING -> SETTLING -> CLOSED`

Detailed transition validation rules are deferred to Feature 002. However, all transitions
must still be logged in `CaseStatusHistory`.

## Derived Value Rules

- `clientPremium = sumInsured * clientRate / 100`
- `insurerPremium = sumInsured * insurerRate / 100`
- `brokerCommission = clientPremium - insurerPremium`

All calculations must use Decimal operations (no float arithmetic).

## Transaction Requirements

- Multi-table writes (e.g., case + status history, settlement + items + case status changes)
  execute in DB transactions.
- Settlement confirmation/payment transitions remain atomic batch operations.