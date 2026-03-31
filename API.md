# CargoShield API Documentation

This document describes all API routes implemented under `src/app/api`.

## Base URL

- Local: `http://localhost:3000`
- All endpoints are relative to this base URL.

## Authentication

- API routes (except NextAuth handlers) require a valid authenticated session.
- Auth is managed by NextAuth Credentials provider via `/api/auth/[...nextauth]`.

## Common Error Shape

Most route handlers return errors in this shape:

```json
{
  "error": "Validation failed",
  "details": {
    "issues": { "field": ["message"] }
  }
}
```

Common status codes: `400`, `401`, `404`, `409`, `500`.

---

## 1) Authentication

### GET/POST `/api/auth/[...nextauth]`

- Managed by NextAuth.
- Used for login/session/callback flows.
- Request/response follow NextAuth conventions.

---

## 2) Foundation

### GET `/api/foundation/bootstrap`

Returns shell/bootstrap metadata for authenticated users.

Response `200`

```json
{
  "appName": "CargoShield",
  "user": { "name": "Case Maker", "email": "casemaker@cargoshield.local" },
  "navigation": [{ "key": "dashboard", "label": "Dashboard", "href": "/dashboard" }],
  "defaultRoute": "/dashboard"
}
```

Errors: `401 Unauthorized`

```bash
curl -X GET "http://localhost:3000/api/foundation/bootstrap"
```

### GET `/api/foundation/references`

Returns reference enums used by UI forms.

Response `200`

```json
{
  "productLines": ["CARGO", "PROPERTY", "MARINE_HULL", "UTILITY"],
  "cargoSubProducts": ["CPO", "BIODIESEL", "SHORTENING"],
  "caseLifecycle": ["DRAFT", "DOCUMENTATION", "UNDERWRITING", "ACTIVE", "BILLING", "SETTLING", "CLOSED"]
}
```

Errors: `401 Unauthorized`

```bash
curl -X GET "http://localhost:3000/api/foundation/references"
```

---

## 3) Cases

### GET `/api/cases`

List cases with filters.

Query params:

- `page` (int, default `1`)
- `pageSize` (must be `20`)
- `q` (search in case number/client name)
- `status` (comma-separated lifecycle statuses)
- `productLine`, `cargoProduct`, `coverType`
- `clientId`, `insurerId`
- `sortBy` (`caseNumber|clientName|productLine|cargoProduct|coverType|status|sumInsured|brokerCommission|createdAt`)
- `sortDir` (`asc|desc`)

Response `200`

```json
{
  "items": [
    {
      "id": "cuid",
      "caseNumber": "BRK-2026-0001",
      "status": "DRAFT",
      "productLine": "CARGO",
      "cargoProduct": "CPO",
      "coverType": "OPEN_COVER",
      "clientName": "PT Sawit Nusantara",
      "clientId": "cuid",
      "insurerId": "cuid",
      "insurerName": "Nusantara Insurance",
      "sumInsured": "100000.00",
      "brokerCommission": "100.00",
      "currency": "USD",
      "createdAt": "2026-03-01T00:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

Errors: `400 Invalid query`, `401 Unauthorized`

```bash
curl -G "http://localhost:3000/api/cases" --data-urlencode "page=1" --data-urlencode "pageSize=20" --data-urlencode "status=DRAFT,ACTIVE"
```

### POST `/api/cases`

Create a case.

Body (high-level):

- Required: `productLine`, `clientName`, `currency`, `sumInsured`, `clientRate`, `insurerRate`
- Cargo-specific: `cargoProduct`, `coverType`, `transportMode`
- `OPEN_COVER`: requires `openCoverId` + `clientId`
- Non-open-cover flow: requires `clientId` + `insurerId`
- Optional: shipment fields (`origin`, `destination`, `vessel`, `quantity`, `etd`, `eta`), contact fields, `notes`

Example body:

```json
{
  "productLine": "CARGO",
  "cargoProduct": "CPO",
  "coverType": "OPEN_COVER",
  "transportMode": "MARINE",
  "openCoverId": "cuid",
  "clientId": "cuid",
  "clientName": "PT Sawit Nusantara",
  "currency": "USD",
  "sumInsured": 100000,
  "clientRate": 0.25,
  "insurerRate": 0.15
}
```

Response `201`: created case summary.

Errors: `400 Validation failed`, `401 Unauthorized`, `404 Open cover/client not found`, `409 business rule conflict`

```bash
curl -X POST "http://localhost:3000/api/cases" -H "Content-Type: application/json" -d '{"productLine":"CARGO","cargoProduct":"CPO","coverType":"OPEN_COVER","transportMode":"MARINE","openCoverId":"cuid","clientId":"cuid","clientName":"PT Sawit Nusantara","currency":"USD","sumInsured":100000,"clientRate":0.25,"insurerRate":0.15}'
```

### GET `/api/cases/{id}`

Get case detail (includes status history).

Path params:

- `id` (case id)

Response `200`: case detail object including financials + `statusHistory[]`.

Errors: `401`, `404 Case not found`

```bash
curl -X GET "http://localhost:3000/api/cases/case_id"
```

### PUT `/api/cases/{id}`

Update a case.

Path params:

- `id` (case id)

Body: same schema as case create.

Rules:

- Only editable when status is `DRAFT`, `DOCUMENTATION`, or `UNDERWRITING`.

Response `200`: updated case detail.

Errors: `400`, `401`, `404`, `409`

```bash
curl -X PUT "http://localhost:3000/api/cases/case_id" -H "Content-Type: application/json" -d '{"productLine":"CARGO","cargoProduct":"CPO","coverType":"OPEN_COVER","transportMode":"MARINE","openCoverId":"cuid","clientId":"cuid","clientName":"PT Sawit Nusantara","currency":"USD","sumInsured":125000,"clientRate":0.25,"insurerRate":0.15}'
```

### DELETE `/api/cases/{id}`

Soft-delete a case.

Rules:

- Only `DRAFT` cases can be deleted.

Response `204` (no body).

Errors: `401`, `404`, `409 Only DRAFT cases can be deleted`

```bash
curl -X DELETE "http://localhost:3000/api/cases/case_id"
```

### POST `/api/cases/{id}/status`

Transition case status.

Body:

```json
{
  "toStatus": "BILLING",
  "note": "Ready for invoicing",
  "debitNoteAcknowledged": true
}
```

Response `200`: updated case summary.

Errors: `400 Validation/invalid transition`, `401`, `404`, `409 transition precondition failed`

```bash
curl -X POST "http://localhost:3000/api/cases/case_id/status" -H "Content-Type: application/json" -d '{"toStatus":"BILLING","note":"Ready for billing"}'
```

### GET `/api/cases/{id}/documents`

List documents for a case.

Response `200`

```json
{
  "items": [
    {
      "id": "cuid",
      "caseId": "cuid",
      "name": "invoice.pdf",
      "type": "COMMERCIAL_INVOICE",
      "mimeType": "application/pdf",
      "fileSize": 12345,
      "note": null,
      "uploadedAt": "2026-03-01T10:00:00.000Z",
      "isShared": false,
      "bulkUploadId": null,
      "downloadUrl": "/uploads/file.pdf"
    }
  ]
}
```

Errors: `401`, `404`

```bash
curl -X GET "http://localhost:3000/api/cases/case_id/documents"
```

### POST `/api/cases/{id}/documents`

Upload a document (multipart form).

Form fields:

- `file` (required)
- `documentType` (required, one of document enums)
- `note` (optional)

Response `201`: created document item.

Errors: `400 Validation/file type/size`, `401`, `404`

```bash
curl -X POST "http://localhost:3000/api/cases/case_id/documents" -F "file=@./sample.pdf" -F "documentType=POLICY_DOCUMENT" -F "note=Initial policy"
```

### DELETE `/api/cases/{id}/documents/{docId}`

Delete a document. If it is a shared bulk document, linked copies are deleted together.

Response `200`

```json
{ "deleted": true, "deletedCount": 1 }
```

Errors: `401`, `404 Document not found`, `409 storage delete failure`

```bash
curl -X DELETE "http://localhost:3000/api/cases/case_id/documents/doc_id"
```

### GET `/api/cases/{id}/emails`

List case email logs.

Response `200`

```json
{
  "items": [
    {
      "id": "cuid",
      "caseId": "cuid",
      "templateId": "new-case-notification",
      "templateName": "New Case Notification",
      "to": "ops@client.com",
      "cc": null,
      "subject": "Case Update",
      "body": "...",
      "sentAt": "2026-03-01T11:00:00.000Z"
    }
  ]
}
```

Errors: `401`, `404`

```bash
curl -X GET "http://localhost:3000/api/cases/case_id/emails"
```

### POST `/api/cases/{id}/emails`

Create/send-log an email entry.

Body:

```json
{
  "templateId": "new-case-notification",
  "to": "ops@client.com",
  "cc": "team@broker.com",
  "subject": "Subject",
  "body": "Email body"
}
```

Response `201`

```json
{
  "message": "Email logged (sending disabled in dev mode).",
  "item": { "id": "cuid", "caseId": "cuid" }
}
```

Errors: `400`, `401`, `404 Case/template not found`

```bash
curl -X POST "http://localhost:3000/api/cases/case_id/emails" -H "Content-Type: application/json" -d '{"templateId":"new-case-notification","to":"ops@client.com","subject":"Subject","body":"Body"}'
```

### POST `/api/cases/bulk-upload/temp-documents`

Upload temporary files used by bulk upload wizard.

Form fields:

- `draftId` (required)
- `files` (one or more files)

Response `201`

```json
{
  "items": [
    {
      "tempDocId": "temp_123",
      "fileName": "shared.pdf",
      "mimeType": "application/pdf",
      "fileSize": 12345
    }
  ]
}
```

Errors: `400`, `401`

```bash
curl -X POST "http://localhost:3000/api/cases/bulk-upload/temp-documents" -F "draftId=draft_1" -F "files=@./shared.pdf"
```

### POST `/api/cases/bulk-upload`

Create multiple draft cases from reviewed rows and optional temporary shared documents.

Body (key fields):

- `openCoverId` (cuid)
- `clientRate` (number)
- `mappings[]` (`targetField`, `sourceHeader`, `sourceColumnIndex`, `mappingSource`)
- `rows[]` (`rowIndex`, `origin`, `destination`, `vessel`, `quantity`, `sumInsured`, `etd`, `eta`, `notes`)
- `tempDocumentIds[]` (optional)

Response `201`

```json
{
  "bulkUploadId": "bulk_1710000000000",
  "caseCount": 2,
  "caseIds": ["cuid1", "cuid2"],
  "redirectTo": "/cases?bulkUploadId=bulk_1710000000000",
  "totals": {
    "sumInsured": "200000.00",
    "clientPremium": "500.00",
    "insurerPremium": "300.00",
    "brokerCommission": "200.00"
  }
}
```

Errors: `400`, `401`, `404 Open cover not found`, `409 open cover inactive/temp docs invalid`

```bash
curl -X POST "http://localhost:3000/api/cases/bulk-upload" -H "Content-Type: application/json" -d '{"openCoverId":"cuid","clientRate":0.25,"mappings":[{"targetField":"origin","sourceHeader":"Origin","sourceColumnIndex":0,"mappingSource":"manual"}],"rows":[{"rowIndex":1,"origin":"Jakarta","destination":"Surabaya","vessel":"MV A","quantity":100,"sumInsured":100000,"etd":"2026-03-01"}],"tempDocumentIds":[]}'
```

---

## 4) Open Covers

### GET `/api/open-covers`

List open cover agreements.

Query params:

- `page`, `pageSize`
- `q`
- `status` (`ACTIVE|EXPIRED|ALL`)
- `activeOnly` (`true|false`)

Response `200`

```json
{
  "items": [
    {
      "id": "cuid",
      "reference": "OC-2026-001",
      "clientName": "PT Sawit Nusantara",
      "clientCompany": "PT Sawit Nusantara",
      "clientIds": ["cuid"],
      "cargoProduct": "CPO",
      "insurerName": "Nusantara Insurance",
      "insurerId": "cuid",
      "insurerRate": "0.150000",
      "effectiveFrom": "2026-01-01T00:00:00.000Z",
      "effectiveTo": "2026-12-31T00:00:00.000Z",
      "status": "ACTIVE",
      "declarationCount": 3
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

Errors: `400`, `401`

```bash
curl -G "http://localhost:3000/api/open-covers" --data-urlencode "status=ACTIVE"
```

### POST `/api/open-covers`

Create open cover agreement.

Body:

```json
{
  "reference": "OC-2026-001",
  "clientName": "PT Sawit Nusantara",
  "clientCompany": "PT Sawit Nusantara",
  "insurerName": "Nusantara Insurance",
  "insurerId": "cuid",
  "clientIds": ["cuid"],
  "productLine": "CARGO",
  "cargoProduct": "CPO",
  "transportMode": "MARINE",
  "currency": "USD",
  "insurerRate": 0.15,
  "effectiveFrom": "2026-01-01",
  "effectiveTo": "2026-12-31",
  "notes": "optional",
  "isActive": true
}
```

Response `201`: created agreement object.

Errors: `400`, `401`, `409 duplicate reference / inactive insurer/client`

```bash
curl -X POST "http://localhost:3000/api/open-covers" -H "Content-Type: application/json" -d '{"reference":"OC-2026-001","clientName":"PT Sawit Nusantara","clientCompany":"PT Sawit Nusantara","insurerName":"Nusantara Insurance","insurerId":"cuid","clientIds":["cuid"],"productLine":"CARGO","cargoProduct":"CPO","transportMode":"MARINE","currency":"USD","insurerRate":0.15,"effectiveFrom":"2026-01-01","effectiveTo":"2026-12-31","isActive":true}'
```

### GET `/api/open-covers/{id}`

Get open cover details and declarations.

Path params: `id`

Query params (optional):

- `caseStatus`
- `from` (date)
- `to` (date)

Response `200`

```json
{
  "agreement": { "id": "cuid", "reference": "OC-2026-001" },
  "declarations": [{ "id": "cuid", "caseNumber": "BRK-2026-0001" }]
}
```

Errors: `401`, `404`

```bash
curl -G "http://localhost:3000/api/open-covers/open_cover_id" --data-urlencode "caseStatus=ACTIVE"
```

### PUT `/api/open-covers/{id}`

Update open cover agreement.

Path params: `id`

Body: same schema as create.

Rules:

- Effective period cannot exclude existing declaration dates.
- Active open cover must keep at least one linked active client.

Response `200`: updated agreement object.

Errors: `400`, `401`, `404`, `409`, `500`

```bash
curl -X PUT "http://localhost:3000/api/open-covers/open_cover_id" -H "Content-Type: application/json" -d '{"reference":"OC-2026-001","clientName":"PT Sawit Nusantara","clientCompany":"PT Sawit Nusantara","insurerName":"Nusantara Insurance","insurerId":"cuid","clientIds":["cuid"],"productLine":"CARGO","cargoProduct":"CPO","transportMode":"MARINE","currency":"USD","insurerRate":0.15,"effectiveFrom":"2026-01-01","effectiveTo":"2026-12-31","isActive":true}'
```

---

## 5) Email Templates

### GET `/api/email-templates`

List system templates.

Response `200`

```json
{
  "items": [
    {
      "templateId": "new-case-notification",
      "name": "New Case Notification",
      "description": "...",
      "subjectTemplate": "...",
      "bodyTemplate": "...",
      "variables": ["caseNumber", "clientName"]
    }
  ]
}
```

Errors: `401`

```bash
curl -X GET "http://localhost:3000/api/email-templates"
```

### POST `/api/email-templates/preview`

Preview rendered template content.

Body:

```json
{
  "templateId": "new-case-notification",
  "vars": {
    "caseNumber": "BRK-2026-0001",
    "clientName": "PT Sawit Nusantara"
  }
}
```

Response `200`

```json
{
  "subject": "...rendered subject...",
  "body": "...rendered body..."
}
```

Errors: `400`, `401`, `404 template not found`

```bash
curl -X POST "http://localhost:3000/api/email-templates/preview" -H "Content-Type: application/json" -d '{"templateId":"new-case-notification","vars":{"caseNumber":"BRK-2026-0001","clientName":"PT Sawit Nusantara"}}'
```

---

## 6) Settlements

### GET `/api/settlements`

List settlements.

Query params:

- `period` (`YYYY-MM`)
- `insurer` (string contains match)
- `status` (`DRAFT|CONFIRMED|PAID`)

Response `200`

```json
{
  "items": [
    {
      "id": "cuid",
      "settlementNumber": "STL-2026-03-001",
      "period": "2026-03",
      "insurerName": "Nusantara Insurance",
      "status": "DRAFT",
      "caseCount": 5,
      "totalInsurerPremium": "1000.00",
      "totalBrokerCommission": "250.00"
    }
  ]
}
```

Errors: `400`, `401`

```bash
curl -G "http://localhost:3000/api/settlements" --data-urlencode "period=2026-03"
```

### POST `/api/settlements`

Create draft settlement.

Body:

```json
{
  "insurerName": "Nusantara Insurance",
  "period": "2026-03"
}
```

Response `201`: settlement detail.

Errors: `400`, `401`, `409`

```bash
curl -X POST "http://localhost:3000/api/settlements" -H "Content-Type: application/json" -d '{"insurerName":"Nusantara Insurance","period":"2026-03"}'
```

### GET `/api/settlements/{id}`

Get settlement detail (including items).

Path params: `id`

Response `200`: settlement detail object.

Errors: `401`, `404`

```bash
curl -X GET "http://localhost:3000/api/settlements/settlement_id"
```

### PUT `/api/settlements/{id}`

Update settlement item matching.

Path params: `id`

Body:

```json
{
  "items": [
    { "caseId": "cuid", "matched": true },
    { "caseId": "cuid2", "matched": false }
  ]
}
```

Response `200`: updated settlement detail.

Errors: `400`, `401`, `404`, `409`

```bash
curl -X PUT "http://localhost:3000/api/settlements/settlement_id" -H "Content-Type: application/json" -d '{"items":[{"caseId":"cuid","matched":true}]}'
```

### POST `/api/settlements/{id}/confirm`

Confirm settlement (moves matched cases into settlement flow).

Path params: `id`

Body:

```json
{
  "note": "optional"
}
```

Response `200`: updated settlement detail.

Errors: `400`, `401`, `404`, `409`

```bash
curl -X POST "http://localhost:3000/api/settlements/settlement_id/confirm" -H "Content-Type: application/json" -d '{"note":"Confirmed by ops"}'
```

### POST `/api/settlements/{id}/pay`

Mark settlement paid.

Path params: `id`

Body:

```json
{
  "paymentDate": "2026-03-31",
  "bankTransferReference": "TRX-20260331-001",
  "note": "optional"
}
```

Response `200`: updated settlement detail.

Errors: `400`, `401`, `404`, `409`

```bash
curl -X POST "http://localhost:3000/api/settlements/settlement_id/pay" -H "Content-Type: application/json" -d '{"paymentDate":"2026-03-31","bankTransferReference":"TRX-20260331-001"}'
```

---

## 7) Reports

All report endpoints accept the same validated query model (`src/lib/validations.ts`):

- Date range: `dateFrom`, `dateTo` (`YYYY-MM-DD`)
- Dimensions: `status`, `productLine`, `cargoProduct`, `coverType`
- Party filters: `clientId`, `insurerId`
- Search/sort/pagination: `search`, `sortBy`, `sortDirection`, `page`, `pageSize`

### GET `/api/reports/summary`

Returns dashboard + report summary payload.

Response `200`

```json
{
  "dashboard": {
    "totalCases": 108,
    "activeCases": 30,
    "pendingBillingCount": 22
  },
  "reports": {
    "totalCases": 108,
    "totalSumInsured": "123456.00",
    "monthlyCaseVolume": [{ "month": "2026-03", "value": "27" }]
  }
}
```

Errors: `400`, `401`, `500`

```bash
curl -G "http://localhost:3000/api/reports/summary" --data-urlencode "dateFrom=2026-01-01" --data-urlencode "dateTo=2026-03-31"
```

### GET `/api/reports/cases`

Returns paginated report rows.

Response `200`

```json
{
  "items": [
    {
      "caseNumber": "BRK-2026-0001",
      "clientName": "PT Sawit Nusantara",
      "insurerName": "Nusantara Insurance",
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 108,
    "totalPages": 6
  }
}
```

Errors: `400`, `401`, `500`

```bash
curl -G "http://localhost:3000/api/reports/cases" --data-urlencode "status=ACTIVE,BILLING" --data-urlencode "page=1" --data-urlencode "pageSize=20"
```

### GET `/api/reports/commission`

Returns commission breakdown by insurer + month.

Response `200`

```json
{
  "byInsurer": [
    { "insurerName": "Nusantara Insurance", "totalBrokerCommission": "39415.76", "caseCount": 35 }
  ],
  "monthlyCommission": [
    { "month": "2026-03", "value": "25766.46" }
  ]
}
```

Errors: `400`, `401`, `500`

```bash
curl -G "http://localhost:3000/api/reports/commission" --data-urlencode "dateFrom=2026-01-01" --data-urlencode "dateTo=2026-03-31"
```

### GET `/api/reports/export`

Returns CSV export of report rows.

Response `200`

- Content-Type: `text/csv; charset=utf-8`
- Content-Disposition: `attachment; filename="reports-YYYY-MM-DD.csv"`

Errors: `400`, `401`, `500` (JSON error body)

```bash
curl -G "http://localhost:3000/api/reports/export" --data-urlencode "dateFrom=2026-01-01" --data-urlencode "dateTo=2026-03-31" -o reports.csv
```

---

## Notes

- Input validation is enforced with Zod schemas in `src/lib/validations.ts`.
- Core business-side behavior is implemented in:
  - `src/lib/status-transitions.ts`
  - `src/lib/settlement-service.ts`
  - `src/lib/reports-service.ts`
- Route-level docs here are intentionally concise and reflect current handlers in `src/app/api`.
