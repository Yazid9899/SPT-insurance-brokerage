# Data Model: Bulk Draft Upload

## Entity: BulkUploadDraftState (server-side wizard draft)
- Purpose: Persist in-progress wizard state across setup/review/confirm steps.
- Key fields:
  - `draftId` (session-scoped ID)
  - `openCoverId`
  - `clientRate`
  - `xlsFileRef`
  - `columnMapping` (targetField -> sourceColumn)
  - `rows` (normalized shipment candidates)
  - `sharedTempDocumentRefs[]`
  - `updatedAt`
- Invariants:
  - One draft ties to one open cover.
  - One draft contains 1-10 rows before confirmation.
  - Draft cannot finalize if required target fields remain unmapped.

## Entity: ShipmentCandidateRow (derived during review)
- Purpose: Represent each XLS row as one draft case candidate.
- Key fields:
  - `rowIndex`
  - `origin` (required)
  - `destination` (required)
  - `vessel` (required)
  - `quantity` (required, >0)
  - `sumInsured` (required, >0)
  - `etd` (required)
  - `eta` (optional)
  - `notes` (optional)
  - `clientPremium` (derived)
  - `insurerPremium` (derived)
  - `brokerCommission` (derived)
  - `errors[]`
- Invariants:
  - Calculations use selected batch `clientRate` + selected open-cover `insurerRate`.
  - Any unresolved error blocks final confirmation.

## Entity: ColumnMapping
- Purpose: Resolve XLS headers to canonical shipment fields.
- Structure:
  - `targetField` (origin, destination, vessel, quantity, sumInsured, etd, eta, notes)
  - `sourceHeader`
  - `sourceColumnIndex`
  - `mappingSource` (`auto` | `manual`)
- Invariants:
  - Required target fields must be mapped before confirmation.
  - Ambiguous alias matches produce unmapped targets until manual selection.

## Entity: TempSharedDocument
- Purpose: Hold optional uploaded documents before final case creation.
- Key fields:
  - `tempDocId`
  - `originalName`
  - `mimeType`
  - `size`
  - `tempPath` (or storage key)
  - `uploadedBy`
  - `expiresAt`
- Invariants:
  - Temp document is not linked to permanent cases until final confirm.
  - Temp refs must belong to the same user/session draft context.

## Persisted Entities (existing Prisma)

### Case
- Existing fields used for this feature:
  - `caseNumber` (server-generated)
  - `status = DRAFT`
  - `openCoverId`
  - `bulkUploadId`
  - shipment fields (`origin`, `destination`, `vessel`, `quantity`, `etd`, `eta`, `notes`)
  - financial fields (`sumInsured`, `clientRate`, `insurerRate`, `clientPremium`, `insurerPremium`, `brokerCommission`)

### CaseDocument
- Existing fields used for shared linkage:
  - `caseId`
  - `name`
  - `type`
  - `fileName`
  - `filePath`
  - `fileSize`
  - `mimeType`
  - `notes`
  - `bulkUploadId`
  - `sharedDocumentKey`

### OpenCover
- Existing fields used for context lock:
  - `id`
  - `reference`
  - `clientName`
  - `clientCompany`
  - `cargoProduct`
  - `insurerRate`
  - `currency`
  - active date range

## Relationships
- One `OpenCover` -> many created `Case` records for one batch.
- One `bulkUploadId` -> many created `Case` records (1..10 expected).
- One batch’s `TempSharedDocument` refs -> many `CaseDocument` links across all created cases.

## State and Lifecycle
1. Setup creates/updates `BulkUploadDraftState` with open cover + file refs.
2. Review materializes `ShipmentCandidateRow[]`, mapping, validation, and totals.
3. Confirm submits final payload to server.
4. Server re-validates all rows and mappings.
5. Server transaction writes all `Case` and shared `CaseDocument` links or writes nothing.
6. Response returns `bulkUploadId` for redirect query filter.

## Validation Rules
- Row count must be between 1 and 10.
- Required fields must be present and valid per row.
- `sumInsured > 0`, `quantity > 0`, `clientRate > 0`, `insurerRate > 0`, `clientRate >= insurerRate`.
- Selected open cover must still be active and valid at confirmation time.
- Confirmation blocked if any row has unresolved errors.

## Consistency Rules
- All created rows in one confirmation share one `openCoverId` and one `bulkUploadId`.
- Case creation and shared document linking happen in one transaction.
- Redirect query uses exact `bulkUploadId` returned from successful transaction.
