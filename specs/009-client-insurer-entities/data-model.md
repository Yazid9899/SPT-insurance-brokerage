# Data Model: Client And Insurer Entities

## Overview

This feature introduces normalized party entities and open-cover-to-client many-to-many linkage while preserving legacy snapshot fields for compatibility.

## Entities

## Client
- Purpose: Canonical insured-party identity reused across cases and open covers.
- Fields:
  - `id` (cuid, PK)
  - `name` (required)
  - `company` (optional)
  - `email` (optional)
  - `phone` (optional)
  - `normalizedName` (required, derived)
  - `normalizedCompany` (required, derived default empty string)
  - `isActive` (required, default true)
  - `createdAt`, `updatedAt`
- Uniqueness:
  - unique (`normalizedName`, `normalizedCompany`)

## Insurer
- Purpose: Canonical insurer identity used across open covers and cases.
- Fields:
  - `id` (cuid, PK)
  - `name` (required)
  - `email` (optional)
  - `phone` (optional)
  - `normalizedName` (required, derived)
  - `isActive` (required, default true)
  - `createdAt`, `updatedAt`
- Uniqueness:
  - unique (`normalizedName`)

## OpenCover
- Purpose: Agreement reference used for declarations.
- Fields (new/changed):
  - `insurerId` (required or nullable during migration)
  - existing snapshot fields retained (`clientName`, `clientCompany`, `insurerName`) for backward compatibility
- Rules:
  - one insurer per open cover
  - many clients per open cover via link table
  - active open cover must have at least one linked client

## OpenCoverClientLink (new join entity)
- Purpose: Many-to-many link between open covers and clients.
- Fields:
  - `id`
  - `openCoverId`
  - `clientId`
  - `createdAt`
- Constraints:
  - unique (`openCoverId`, `clientId`)
- Behavior:
  - source of truth for allowed client selection in open-cover case flows

## Case (enhanced)
- Fields (new):
  - `clientId` (nullable FK -> `Client.id`)
  - `insurerId` (nullable FK -> `Insurer.id`)
- Existing fields retained:
  - snapshots (`clientName`, `clientCompany`, `clientEmail`, `clientPhone`)
- Rules:
  - open-cover case path: insurer derived from open cover; client must be linked to selected open cover
  - single-shipment path: explicit client and insurer required
  - inactive clients cannot be selected for new open-cover cases
  - historical linked cases remain readable even if party becomes inactive

## Settlement (unchanged boundary)
- No new settlement FK in this feature.
- Existing name-based behavior retained.

## PartyMergeAudit (governance)
- Purpose: Immutable audit of merge/split actions.
- Fields:
  - `id`, `partyType`, `action`, `sourceIds`, `targetIds`, `requestedBy`, `approvedBy`, `approvedAt`, `reason`, `createdAt`
- Rules:
  - supervisor approval required
  - append-only records

## Validation Rules

- Required names for parties; optional contact data validated when present.
- Open-cover case validation enforces client membership in selected open cover links.
- Active open-cover validation enforces at least one linked client.
- Inactive linked clients are excluded from new open-cover case selection.
- Backfill only auto-links on unique normalized match; ambiguous/unmatched remain unresolved pending review.

## Indexing

- `Case.clientId`
- `Case.insurerId`
- `OpenCover.insurerId`
- `OpenCoverClientLink.openCoverId`
- `OpenCoverClientLink.clientId`
- unique `OpenCoverClientLink(openCoverId, clientId)`
- unique `Client(normalizedName, normalizedCompany)`
- unique `Insurer(normalizedName)`

## Migration States

1. Pre-migration: snapshots only.
2. Schema expansion: new entities/FKs/link table added.
3. Backfill: unique-match auto-linking + ambiguity queue.
4. Dual-write steady state: normalized + snapshot fields kept in sync.
5. Follow-up (out of scope): settlement direct insurer linkage migration.
