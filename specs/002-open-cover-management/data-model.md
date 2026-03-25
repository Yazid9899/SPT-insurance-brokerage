# Data Model: Open Cover Management

## Overview

Feature 003 focuses on open cover agreement lifecycle management and agreement-linked case creation behavior while preserving historical declaration financial integrity.

## Entities

### OpenCover
- Purpose: Standing cargo agreement for multiple declarations over a fixed period.
- Core fields:
  - `id`
  - `reference` (unique)
  - `clientName`, `clientCompany`
  - `insurerName`
  - `productLine` (Cargo only)
  - `cargoProduct`
  - `transportMode`
  - `currency`
  - `insurerRate` (Decimal)
  - `effectiveFrom`, `effectiveTo`
  - `notes`
  - `createdAt`, `updatedAt`
- Derived fields:
  - `status` = Active/Expired from date window
  - `declarationCount` from linked `Case` count
- Relationships:
  - one-to-many `Case` via `openCoverId`

### Case (Open-Cover Slice)
- Purpose: Declaration record linked to selected open cover.
- Relevant fields:
  - `id`, `caseNumber`
  - `productLine`, `coverType`, `openCoverId`
  - `clientName`, `clientCompany`
  - `currency`
  - `sumInsured`, `clientRate`, `insurerRate`
  - `clientPremium`, `insurerPremium`, `brokerCommission`
  - `status`, `createdAt`, `updatedAt`
- Open-cover rules:
  - Must select active agreement when `coverType=OPEN_COVER`.
  - `insurerRate` + `currency` locked to selected agreement.
  - `clientRate` remains editable.
  - Existing cases keep original insurer rate even if agreement rate changes.

### CaseStatusHistory
- Purpose: Immutable record of status transitions.
- Relevance in feature:
  - remains required for status transition endpoint integrity.

## Validation Rules

- Open cover reference uniqueness enforced.
- Effective period must be valid (`effectiveFrom <= effectiveTo`).
- Effective-period edits are blocked if revised range excludes existing declarations.
- Open-cover agreement used in case creation must be Active.
- Case deletion allowed only for Draft cases.

## State/Transition Rules

- Open cover state:
  - Active when today is within effective period (inclusive)
  - Expired otherwise
- Case transitions:
  - server-side validated using `STATUS_TRANSITIONS` map + transition schema checks
  - successful transitions write `CaseStatusHistory`

## Calculation Rules

- `clientPremium = sumInsured * clientRate / 100`
- `insurerPremium = sumInsured * insurerRate / 100`
- `brokerCommission = clientPremium - insurerPremium`

All calculations use decimal-safe logic through shared `calculatePremiums()` on client and server.

## Data Integrity Requirements

- Case create/update with open-cover selection persists agreement-derived locked values atomically.
- Open-cover update validations run in write transaction with declaration consistency checks.
- Historical declaration financial fields are immutable with respect to agreement rate edits.
