# CargoShield — Insurance Brokerage Case Management System

## Product Requirements Document (PRD) — v2.1 (Spec-Kit Ready)

---

> **How to use this document:** This is the reference PRD for CargoShield. It contains business requirements, data models, and technical specifications. When working with spec-kit, this file lives in the project root and is referenced by `$speckit-specify` and `$speckit-plan` prompts. Business requirements go into `spec.md`, technical decisions go into `plan.md`.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User & Roles](#2-user--roles)
3. [Tech Stack & Architecture](#3-tech-stack--architecture)
4. [Data Model & Database Schema](#4-data-model--database-schema)
5. [Case Lifecycle & State Machine](#5-case-lifecycle--state-machine)
6. [Financial Model — Dual Rates & Settlement](#6-financial-model--dual-rates--settlement)
7. [Bulk Draft Upload](#7-bulk-draft-upload)
8. [Feature Specifications](#8-feature-specifications)
9. [API Endpoints](#9-api-endpoints)
10. [Page-by-Page UI Specs](#10-page-by-page-ui-specs)
11. [Email Template System](#11-email-template-system)

---

## 1. Product Overview

### What
A web-based Case Management System for an insurance brokerage. It manages the full lifecycle of insurance cases — from initial draft through documentation, underwriting, active coverage, billing, insurer settlement, and closure.

### Who
**Case Makers** — brokerage staff who create, track, and manage insurance cases. Single user role in Phase 1.

### Product Lines

The system supports multiple insurance product lines. **Cargo Insurance** is fully specified in Phase 1. Other products are label-only placeholders for future expansion.

#### Cargo Insurance (Phase 1 — Full Spec)

| Product | Transport Mode | Typical Cover | Notes |
|---|---|---|---|
| **Crude Palm Oil (CPO)** | Marine vessel | Open Cover (primary), Single Shipment | Bulk commodity, high volume |
| **Biodiesel** | Road / truck | Open Cover (primary), Single Shipment | Domestic routes, fleet-based |
| **Shortening (Export/Import)** | Marine vessel | Open Cover or Single Shipment | Processed goods, international |

#### Other Products (Phase 1 — Label Only, Future Spec)

| Product Line | Phase 1 Scope |
|---|---|
| **Property Insurance** | Product label + generic case workflow only |
| **Marine Hull** | Product label + generic case workflow only |
| **Utility Insurance** | Product label + generic case workflow only |

> These future product lines use the same case status flow but will have unique fields, documents, and business rules specified later. In Phase 1, cases created under these products use only the generic case fields (client, status, sum insured, dates, notes).

### Cover Types (Cargo Insurance Only)
- **Open Cover Agreement** (primary) — Standing agreement with an underwriter covering multiple shipments. Each shipment is "declared" under the open cover. The **insurer rate is fixed** per open cover agreement.
- **Single Shipment** — One-off policy for a specific voyage/transport. Works across marine (mainly CPO) and trucking (mainly Biodiesel).

### Key Insurance Terms
- **Sum Insured** — Total value being insured (cargo value + freight + markup).
- **Client Rate (Insured Rate)** — Percentage charged to the client by the broker.
- **Insurer Rate** — Percentage the broker pays to the insurer. Fixed per open cover agreement.
- **Broker Commission** — Difference between client rate and insurer rate. `(Client Rate - Insurer Rate) × Sum Insured / 100`.
- **Client Premium** — What the client pays. `Sum Insured × Client Rate / 100`.
- **Insurer Premium** — What the broker owes the insurer. `Sum Insured × Insurer Rate / 100`.
- **Open Cover Reference** — Master agreement number under which declarations are made.
- **Declaration** — Notification to the underwriter of a specific shipment under an open cover.
- **Debit Note** — Invoice issued to the client for premium payment.
- **Settlement** — Monthly batch payment from broker to insurer for all cases due that period.

---

## 2. User & Roles

### Phase 1: Single Role

| Role | Description | Permissions |
|---|---|---|
| **Case Maker** | Brokerage staff member | Full CRUD on cases, documents, emails. View all reports. Manage settlements. |

### Future Roles (Out of Scope)
- Supervisor, Client Portal, Underwriter View

### Authentication (Phase 1)
- Email + password (simple credentials)
- No multi-tenancy needed

---

## 3. Tech Stack & Architecture

### Core Stack
```
Framework:    Next.js 14+ (App Router)
Language:     TypeScript (strict mode)
Database:     PostgreSQL 15+
ORM:          Prisma
Styling:      Tailwind CSS
UI Library:   shadcn/ui
Auth:         NextAuth.js (credentials provider)
Email:        React Email + Resend (or Nodemailer for dev)
File Parsing: xlsx (SheetJS) for bulk XLS upload
Deployment:   Vercel (frontend) + Supabase or Neon (DB)
```

### Project Structure
```
cargoshield/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Sidebar + header shell
│   │   │   ├── page.tsx                # Dashboard
│   │   │   ├── cases/
│   │   │   │   ├── page.tsx            # Case list
│   │   │   │   ├── new/page.tsx        # Create case
│   │   │   │   ├── bulk-upload/page.tsx # Bulk draft upload
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Case detail
│   │   │   │       └── edit/page.tsx
│   │   │   ├── settlements/
│   │   │   │   ├── page.tsx            # Settlement list
│   │   │   │   └── [id]/page.tsx       # Settlement detail
│   │   │   ├── open-covers/
│   │   │   │   └── page.tsx            # Open cover agreements list
│   │   │   ├── reports/page.tsx
│   │   │   └── emails/page.tsx
│   │   ├── api/
│   │   │   ├── cases/
│   │   │   │   ├── route.ts
│   │   │   │   ├── bulk-upload/route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── documents/route.ts
│   │   │   │       ├── emails/route.ts
│   │   │   │       └── status/route.ts
│   │   │   ├── settlements/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── open-covers/route.ts
│   │   │   ├── reports/route.ts
│   │   │   └── auth/[...nextauth]/route.ts
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                         # shadcn components
│   │   ├── cases/
│   │   │   ├── case-form.tsx
│   │   │   ├── case-table.tsx
│   │   │   ├── case-detail.tsx
│   │   │   ├── status-badge.tsx
│   │   │   ├── case-filters.tsx
│   │   │   └── bulk-upload-wizard.tsx
│   │   ├── documents/
│   │   │   ├── document-list.tsx
│   │   │   └── document-upload.tsx
│   │   ├── emails/
│   │   │   ├── email-composer.tsx
│   │   │   └── template-selector.tsx
│   │   ├── settlements/
│   │   │   ├── settlement-table.tsx
│   │   │   ├── settlement-detail.tsx
│   │   │   └── settlement-matching.tsx
│   │   ├── reports/
│   │   │   ├── stats-cards.tsx
│   │   │   ├── status-chart.tsx
│   │   │   └── product-breakdown.tsx
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   └── shared/
│   │       ├── data-table.tsx
│   │       ├── page-header.tsx
│   │       └── currency-input.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   ├── constants.ts
│   │   ├── validations.ts
│   │   ├── email-templates.ts
│   │   └── bulk-upload-parser.ts       # XLS parsing logic
│   └── types/
│       └── index.ts
├── public/
├── .env.local
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Data Model & Database Schema

### Entity Relationship

```
User (Case Maker)
  │
  ├── creates ──► Case
  │                 │
  │                 ├── belongs to ──► OpenCover (if coverType = OPEN_COVER)
  │                 ├── has many ──► CaseDocument
  │                 ├── has many ──► CaseEmail
  │                 ├── has many ──► CaseStatusHistory
  │                 └── included in ──► SettlementItem ──► Settlement
  │
  └── manages ──► Settlement (monthly batch)
                    └── has many ──► SettlementItem (one per case)
```

### Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum CaseStatus {
  DRAFT
  DOCUMENTATION
  UNDERWRITING
  ACTIVE
  BILLING
  SETTLING
  CLOSED
}

enum ProductLine {
  CARGO
  PROPERTY
  MARINE_HULL
  UTILITY
}

enum CargoProduct {
  CPO
  BIODIESEL
  SHORTENING
}

enum CoverType {
  OPEN_COVER
  SINGLE_SHIPMENT
}

enum TransportMode {
  MARINE
  TRUCKING
}

enum Currency {
  IDR
  USD
  SGD
  MYR
}

enum DocumentType {
  POLICY_DOCUMENT
  BILL_OF_LADING
  COMMERCIAL_INVOICE
  PACKING_LIST
  CERTIFICATE_OF_INSURANCE
  SURVEY_REPORT
  CLAIM_FORM
  ENDORSEMENT
  DEBIT_NOTE
  CREDIT_NOTE
  OTHER
}

enum SettlementStatus {
  DRAFT
  CONFIRMED
  PAID
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  cases         Case[]
  sentEmails    CaseEmail[]
  settlements   Settlement[]
}

model OpenCover {
  id              String       @id @default(cuid())
  reference       String       @unique
  clientName      String
  clientCompany   String?
  insurerName     String
  cargoProduct    CargoProduct
  transportMode   TransportMode
  insurerRate     Decimal      @db.Decimal(8, 6)
  currency        Currency     @default(IDR)
  effectiveFrom   DateTime
  effectiveTo     DateTime
  isActive        Boolean      @default(true)
  notes           String?      @db.Text
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  cases           Case[]
  @@index([clientName])
  @@index([isActive])
}

model Case {
  id              String        @id @default(cuid())
  caseNumber      String        @unique
  productLine     ProductLine   @default(CARGO)
  cargoProduct    CargoProduct?
  coverType       CoverType?
  transportMode   TransportMode?
  clientName      String
  clientEmail     String?
  clientPhone     String?
  clientCompany   String?
  openCover       OpenCover?    @relation(fields: [openCoverId], references: [id])
  openCoverId     String?
  status          CaseStatus    @default(DRAFT)
  currency        Currency      @default(IDR)
  sumInsured      Decimal       @default(0)   @db.Decimal(20, 2)
  clientRate      Decimal       @default(0)   @db.Decimal(8, 6)
  insurerRate     Decimal       @default(0)   @db.Decimal(8, 6)
  clientPremium   Decimal       @default(0)   @db.Decimal(20, 2)
  insurerPremium  Decimal       @default(0)   @db.Decimal(20, 2)
  brokerCommission Decimal      @default(0)   @db.Decimal(20, 2)
  origin          String?
  destination     String?
  vessel          String?
  quantity        Decimal?      @db.Decimal(12, 2)
  etd             DateTime?
  eta             DateTime?
  notes           String?       @db.Text
  bulkUploadId    String?
  createdBy       User          @relation(fields: [createdById], references: [id])
  createdById     String
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  closedAt        DateTime?
  documents       CaseDocument[]
  emails          CaseEmail[]
  statusHistory   CaseStatusHistory[]
  settlementItems SettlementItem[]
  @@index([status])
  @@index([productLine])
  @@index([cargoProduct])
  @@index([clientName])
  @@index([createdAt])
  @@index([openCoverId])
  @@index([bulkUploadId])
}

model CaseDocument {
  id            String       @id @default(cuid())
  case          Case         @relation(fields: [caseId], references: [id], onDelete: Cascade)
  caseId        String
  name          String
  type          DocumentType
  fileName      String
  filePath      String
  fileSize      Int?
  mimeType      String?
  notes         String?
  uploadedAt    DateTime     @default(now())
  @@index([caseId])
  @@index([type])
}

model CaseEmail {
  id            String    @id @default(cuid())
  case          Case      @relation(fields: [caseId], references: [id], onDelete: Cascade)
  caseId        String
  templateId    String?
  to            String
  cc            String?
  subject       String
  body          String    @db.Text
  sentBy        User      @relation(fields: [sentById], references: [id])
  sentById      String
  sentAt        DateTime  @default(now())
  @@index([caseId])
}

model CaseStatusHistory {
  id            String     @id @default(cuid())
  case          Case       @relation(fields: [caseId], references: [id], onDelete: Cascade)
  caseId        String
  fromStatus    CaseStatus?
  toStatus      CaseStatus
  changedAt     DateTime   @default(now())
  changedBy     String
  note          String?
  @@index([caseId])
  @@index([changedAt])
}

model Settlement {
  id              String           @id @default(cuid())
  settlementNumber String          @unique
  insurerName     String
  period          String
  currency        Currency         @default(IDR)
  totalInsurerPremium Decimal      @db.Decimal(20, 2)
  totalBrokerCommission Decimal    @db.Decimal(20, 2)
  status          SettlementStatus @default(DRAFT)
  confirmedAt     DateTime?
  paidAt          DateTime?
  paymentRef      String?
  notes           String?          @db.Text
  createdBy       User             @relation(fields: [createdById], references: [id])
  createdById     String
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  items           SettlementItem[]
  @@index([status])
  @@index([period])
  @@index([insurerName])
}

model SettlementItem {
  id              String     @id @default(cuid())
  settlement      Settlement @relation(fields: [settlementId], references: [id], onDelete: Cascade)
  settlementId    String
  case            Case       @relation(fields: [caseId], references: [id])
  caseId          String
  insurerPremium  Decimal    @db.Decimal(20, 2)
  brokerCommission Decimal   @db.Decimal(20, 2)
  matched         Boolean    @default(false)
  @@unique([settlementId, caseId])
  @@index([settlementId])
  @@index([caseId])
}
```

### Auto-Generated Numbers

```typescript
// Case Number: BRK-YYYY-NNNN
async function generateCaseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `BRK-${year}-`;
  const lastCase = await prisma.case.findFirst({
    where: { caseNumber: { startsWith: prefix } },
    orderBy: { caseNumber: 'desc' },
  });
  const nextNum = lastCase ? parseInt(lastCase.caseNumber.split('-')[2]) + 1 : 1;
  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}

// Settlement Number: STL-YYYY-MM-NNN
async function generateSettlementNumber(period: string): Promise<string> {
  const prefix = `STL-${period}-`;
  const last = await prisma.settlement.findFirst({
    where: { settlementNumber: { startsWith: prefix } },
    orderBy: { settlementNumber: 'desc' },
  });
  const nextNum = last ? parseInt(last.settlementNumber.split('-').pop()!) + 1 : 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}
```

---

## 5. Case Lifecycle & State Machine

### Status Flow

```
  ┌───────────┐
  │   DRAFT   │  ← Case created (manually or via bulk upload)
  └─────┬─────┘
        │ "Submit for Documentation"
        ▼
  ┌───────────────┐
  │ DOCUMENTATION │  ← Collecting required documents
  └───────┬───────┘
          │ "Submit for Underwriting"
          ▼
  ┌───────────────┐
  │ UNDERWRITING  │  ← Waiting for underwriter confirmation
  └───────┬───────┘
          │ "Confirm Coverage"
          ▼
  ┌───────────┐
  │  ACTIVE   │  ← Coverage live, shipment in transit
  └─────┬─────┘
        │ "Generate Bill"
        ▼
  ┌───────────┐
  │  BILLING  │  ← Client invoiced, awaiting client payment
  └─────┬─────┘
        │ "Include in Settlement" (from Settlement page)
        ▼                              ┌─────────────────────┐
  ┌───────────┐                        │   SETTLEMENT FLOW   │
  │ SETTLING  │  ← Included in a  ────►│ (separate entity)   │
  └─────┬─────┘    monthly batch       │ Draft → Confirmed   │
        │                              │ → Paid              │
        │ (auto: when settlement       └─────────────────────┘
        │  status = PAID)
        ▼
  ┌───────────┐
  │  CLOSED   │  ← Settlement paid, case complete
  └───────────┘
```

### Allowed Transitions

```typescript
export const STATUS_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  DRAFT:          ['DOCUMENTATION'],
  DOCUMENTATION:  ['UNDERWRITING', 'DRAFT'],
  UNDERWRITING:   ['ACTIVE', 'DOCUMENTATION'],
  ACTIVE:         ['BILLING'],
  BILLING:        ['SETTLING'],
  SETTLING:       ['CLOSED'],
  CLOSED:         [],
};
```

### Transition Validation Rules

| Transition | Validation |
|---|---|
| DRAFT → DOCUMENTATION | Client name, product line required. If cargo: cargoProduct, coverType required. |
| DOCUMENTATION → UNDERWRITING | At least 1 document uploaded. Origin + destination required (cargo). |
| UNDERWRITING → ACTIVE | Sum insured > 0, client rate > 0, insurer rate > 0. Client rate >= insurer rate. |
| ACTIVE → BILLING | Auto-calculate premiums. Prompt to attach debit note. |
| BILLING → SETTLING | Done from Settlement page, not case detail. |
| SETTLING → CLOSED | Automatic when parent Settlement is marked PAID. |
| Any transition | Log to CaseStatusHistory with timestamp and user. |

### Open Cover Rate Inheritance

When a case is linked to an Open Cover:
- insurerRate auto-populates from OpenCover.insurerRate and is LOCKED (read-only).
- clientRate is set per case by the case maker.
- Changing the Open Cover selection auto-updates the insurer rate.

---

## 6. Financial Model — Dual Rates & Settlement

### Rate Structure Per Case

```
┌──────────────────────────────────────────────────────┐
│                    Sum Insured                       │
│                  IDR 15,000,000,000                  │
├──────────────────┬───────────────────────────────────┤
│  Client Rate     │  0.20%                            │
│  Client Premium  │  IDR 30,000,000  (client pays)    │
├──────────────────┼───────────────────────────────────┤
│  Insurer Rate    │  0.15%  (fixed from Open Cover)   │
│  Insurer Premium │  IDR 22,500,000  (broker owes)    │
├──────────────────┼───────────────────────────────────┤
│  Broker Commission│ IDR 7,500,000   (difference)     │
└──────────────────┴───────────────────────────────────┘
```

### Premium Calculation

```typescript
function calculatePremiums(sumInsured: number, clientRate: number, insurerRate: number) {
  const clientPremium = sumInsured * clientRate / 100;
  const insurerPremium = sumInsured * insurerRate / 100;
  const brokerCommission = clientPremium - insurerPremium;
  return { clientPremium, insurerPremium, brokerCommission };
}
```

### Monthly Settlement Flow

```
Step 1: INSURER sends list of cases expecting payment

Step 2: CASE MAKER creates Settlement for the period
        - Select insurer + period (e.g., "2026-03")
        - System pulls all BILLING cases for that insurer

Step 3: MATCHING — compare system list vs insurer list
        - Mark each case as "matched" or flag discrepancy

Step 4: CONFIRM → settlement CONFIRMED
        - Cases move BILLING → SETTLING

Step 5: PAY → settlement PAID (record payment ref)
        - Cases auto-move SETTLING → CLOSED
        - closedAt set on each case
```

---

## 7. Bulk Draft Upload

### Use Case
Clients send 1–10 shipment declarations at once (retroactive, 1–3 days after arrival) with an XLS file + shipping docs. All rows share the same client, product, and open cover.

### XLS Expected Columns

| Column | Maps To | Required |
|---|---|---|
| Vessel / Fleet | vessel | Yes |
| Origin / Loading Port | origin | Yes |
| Destination / Discharge Port | destination | Yes |
| Quantity (MT) | quantity | Yes |
| Sum Insured | sumInsured | Yes |
| ETD / Departure Date | etd | Yes |
| ETA / Arrival Date | eta | No |
| B/L Number | notes / doc ref | No |
| Notes / Remarks | notes | No |

### 4-Step Wizard

**Step 1: Select Open Cover** — pick OC, auto-fill client/product/insurer rate, enter client rate + currency.

**Step 2: Upload XLS** — parse file, show auto-detected column mapping (editable).

**Step 3: Review & Edit** — table of parsed rows, inline editing, error highlighting, validation summary.

**Step 4: Upload Documents** — optional supporting docs linked to ALL cases in batch. Create N draft cases.

### Processing Logic

```typescript
const HEADER_ALIASES: Record<string, string[]> = {
  vessel:      ['vessel', 'vessel name', 'ship', 'fleet', 'truck', 'fleet id'],
  origin:      ['origin', 'loading port', 'port of loading', 'from', 'pol'],
  destination: ['destination', 'discharge port', 'port of discharge', 'to', 'pod'],
  quantity:    ['quantity', 'qty', 'quantity (mt)', 'mt', 'weight', 'tonnage'],
  sumInsured:  ['sum insured', 'insured value', 'value', 'si', 'amount'],
  etd:         ['etd', 'departure', 'departure date', 'sailing date', 'date'],
  eta:         ['eta', 'arrival', 'arrival date'],
  notes:       ['notes', 'remarks', 'remark', 'description'],
  blNumber:    ['bl', 'b/l', 'bl number', 'bill of lading', 'bl no'],
};

// On submit (transaction):
// - All cases share: openCoverId, client, product, coverType=OPEN_COVER,
//   clientRate, insurerRate (from OC), currency, bulkUploadId (UUID)
// - Each case: unique caseNumber, vessel, origin, destination, qty, sumInsured, etd, eta
// - Premiums auto-calculated per case
// - All start as DRAFT
// - Documents linked to all cases
```

---

## 8. Feature Specifications

### 8.1 Case Tracking & Making
- Single case creation with product line selector (Cargo shows full fields, others show generic)
- Bulk upload wizard (Section 7)
- Case list with filters, search, pagination, bulk upload indicator
- Case detail with tabs, dual rate financial breakdown, status transitions

### 8.2 Open Cover Management
- CRUD for open cover agreements
- Fixed insurer rate per agreement
- View all cases under an open cover

### 8.3 Document Management
- Per-case upload with type classification
- Advisory expected-document checklist per status
- Bulk upload docs linked to all cases in batch

### 8.4 Operational Reporting
- Dashboard: 6 stat cards, status chart, product breakdown, monthly commission, recent cases
- Reports page: date range filter, commission by insurer, CSV export

### 8.5 Settlement Management
- Create monthly settlement batches per insurer
- Match cases against insurer's list
- Confirm → Pay → auto-close cases

### 8.6 Email Automation
- 7 templates: New Case, Doc Request, OC Declaration, Billing, Closure, Bulk Declaration, Settlement Confirmation
- Composer with variable auto-population from case data
- Phase 1: log only (no actual send)

---

## 9. API Endpoints

### Cases
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/cases | List (filterable, paginated) |
| POST | /api/cases | Create single case |
| POST | /api/cases/bulk-upload | Bulk create from XLS |
| GET | /api/cases/[id] | Detail with relations |
| PUT | /api/cases/[id] | Update |
| DELETE | /api/cases/[id] | Delete (DRAFT only) |
| POST | /api/cases/[id]/status | Transition status |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/cases/[id]/documents | List |
| POST | /api/cases/[id]/documents | Upload |
| DELETE | /api/cases/[id]/documents/[docId] | Delete |

### Emails
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/cases/[id]/emails | List sent |
| POST | /api/cases/[id]/emails | Send |
| GET | /api/email-templates | List templates |

### Open Covers
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/open-covers | List |
| POST | /api/open-covers | Create |
| GET | /api/open-covers/[id] | Detail with cases |
| PUT | /api/open-covers/[id] | Update |

### Settlements
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/settlements | List |
| POST | /api/settlements | Create |
| GET | /api/settlements/[id] | Detail with items |
| PUT | /api/settlements/[id] | Update (add/remove/match) |
| POST | /api/settlements/[id]/confirm | Confirm → cases SETTLING |
| POST | /api/settlements/[id]/pay | Pay → cases CLOSED |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/reports/summary | Dashboard stats |
| GET | /api/reports/cases | Filtered data |
| GET | /api/reports/commission | By period/insurer |
| GET | /api/reports/export | CSV download |

---

## 10. Page-by-Page UI Specs

### 10.1 Layout Shell
- Sidebar (220px): Logo, nav (Dashboard, Cases, Open Covers, Settlements, Reports, Email Templates), user info
- Main content: page header + scrollable content

### 10.2 Dashboard (/)
```
┌─────────────────────────────────────────────────────────┐
│  Dashboard                                               │
├──────┬──────┬──────┬──────┬───────────┬────────────────┤
│Total │Active│Billing│Expo- │Commission │ Unsettled      │
│Cases │Cases │Pend. │sure  │(this mo.) │ Amount         │
│ 24   │ 12   │  4   │$2.1M │ $45,000   │ $180,000      │
├──────┴──────┴──────┴──────┴───────────┴────────────────┤
│ Cases by Status (bar) │ Cases by Product (breakdown)    │
│ Monthly Commission    │ Recent Cases (last 5)           │
└─────────────────────────────────────────────────────────┘
```

### 10.3 Cases List (/cases)
```
┌─────────────────────────────────────────────────────────┐
│  Cases                    [Bulk Upload]  [+ New Case]   │
├─────────────────────────────────────────────────────────┤
│  Search + Filters: Status, Product Line, Cargo, Cover   │
├─────────────────────────────────────────────────────────┤
│  Case # │Client │Product│Status │Client Prem│Insurer Pr│
│  BRK-01 │PT Saw │CPO    │Active │IDR 30M   │IDR 22M   │
│  BRK-10 │PT Saw │CPO    │Draft📦│IDR 20M   │IDR 15M   │
└─────────────────────────────────────────────────────────┘
```

### 10.4 Case Detail (/cases/[id])
```
┌─────────────────────────────────────────────────────────┐
│  ← Cases    BRK-2026-0001              [Edit] [Delete]  │
│             PT Sawit Nusantara                           │
│             ● Active    CARGO · CPO · Open Cover         │
│             OC: OC-2026-001                              │
│  [ Move to Billing → ]                                   │
├─────────────────────────────────────────────────────────┤
│  [Details] [Documents] [Emails] [History]                │
├─────────────────────────────────────────────────────────┤
│  Client Info │ Shipment Details │ Financial Breakdown    │
│              │                  │ Sum Insured: IDR 15B   │
│              │                  │ Client Rate: 0.20%     │
│              │                  │ Client Prem: IDR 30M   │
│              │                  │ Insurer Rate: 0.15% 🔒 │
│              │                  │ Insurer Prem: IDR 22.5M│
│              │                  │ Commission: IDR 7.5M   │
└─────────────────────────────────────────────────────────┘
```

### 10.5 Bulk Upload (/cases/bulk-upload)
4-step wizard (see Section 7).

### 10.6 Open Covers (/open-covers)
Table: Reference, Client, Product, Insurer, Rate, Period, Active, Cases count.

### 10.7 Settlements (/settlements)
Table: STL #, Insurer, Period, Total Insurer Premium, Commission, Status.

### 10.8 Settlement Detail (/settlements/[id])
```
┌─────────────────────────────────────────────────────────┐
│  STL-2026-03-001 · PT Asuransi XYZ · March 2026        │
│  ● DRAFT                                                │
├─────────────────────────────────────────────────────────┤
│  Summary: 6 cases │ Matched: 5/6                        │
│  Total Insurer Premium: IDR 150M                         │
│  Total Commission: IDR 45M                               │
├─────────────────────────────────────────────────────────┤
│  ☑ BRK-0001 │ CPO │ IDR 22.5M │ ✓ matched              │
│  ☑ BRK-0002 │ Bio │ IDR 2.0M  │ ✓ matched              │
│  ☐ BRK-0006 │ Bio │ IDR 2.6M  │ ✗ not matched          │
├─────────────────────────────────────────────────────────┤
│  [Add Cases] [Remove] [Confirm Settlement →]             │
│  After CONFIRMED: [Mark as Paid] Payment Ref: [____]    │
│  After PAID: ✓ Paid 31 Mar · 6 cases closed             │
└─────────────────────────────────────────────────────────┘
```

### 10.9 Reports (/reports)
Date range + CSV export + summary stats + charts + full table.

### 10.10 Email Templates (/emails)
7 template cards with preview and variable list.

---

## 11. Email Template System

### Templates

| # | Name | Use Case |
|---|---|---|
| 1 | New Case Notification | Case created → client |
| 2 | Documentation Request | Missing docs → client |
| 3 | Open Cover Declaration | Declare shipment → underwriter |
| 4 | Billing / Premium Notice | Debit note → client |
| 5 | Case Closure Notice | Case closed → client |
| 6 | Bulk Declaration | Multiple shipments → underwriter |
| 7 | Settlement Confirmation | Settlement details → insurer |

### Variables

```
{{caseNumber}}        {{clientName}}         {{clientEmail}}
{{product}}           {{coverType}}          {{currency}}
{{sumInsured}}        {{clientRate}}         {{insurerRate}}
{{clientPremium}}     {{insurerPremium}}     {{brokerCommission}}
{{origin}}            {{destination}}        {{vessel}}
{{quantity}}          {{etd}}                {{eta}}
{{openCoverRef}}      {{insurerName}}        {{brokerName}}
{{today}}             {{settlementNumber}}   {{settlementPeriod}}
{{totalInsurerPremium}}  {{caseCount}}
```

### Rendering

```typescript
export function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => vars[key] ?? match);
}
```

---

## Appendix A: Constants

```typescript
export const PRODUCT_LINES = [
  { value: 'CARGO', label: 'Cargo Insurance' },
  { value: 'PROPERTY', label: 'Property Insurance' },
  { value: 'MARINE_HULL', label: 'Marine Hull' },
  { value: 'UTILITY', label: 'Utility Insurance' },
] as const;

export const CARGO_PRODUCTS = [
  { value: 'CPO', label: 'Crude Palm Oil (CPO)', defaultTransport: 'MARINE' },
  { value: 'BIODIESEL', label: 'Biodiesel', defaultTransport: 'TRUCKING' },
  { value: 'SHORTENING', label: 'Shortening (Export/Import)', defaultTransport: 'MARINE' },
] as const;

export const CURRENCIES = [
  { value: 'IDR', label: 'IDR', symbol: 'Rp', usdRate: 16000 },
  { value: 'USD', label: 'USD', symbol: '$', usdRate: 1 },
  { value: 'SGD', label: 'SGD', symbol: 'S$', usdRate: 1.35 },
  { value: 'MYR', label: 'MYR', symbol: 'RM', usdRate: 4.7 },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'slate', DOCUMENTATION: 'amber', UNDERWRITING: 'violet',
  ACTIVE: 'emerald', BILLING: 'blue', SETTLING: 'orange', CLOSED: 'gray',
};
```

## Appendix B: Glossary

| Term | Definition |
|---|---|
| **Open Cover** | Standing agreement, fixed insurer rate, multiple shipments |
| **Single Shipment** | One-off policy (marine or trucking) |
| **Client Rate** | Rate charged to client by broker (%) |
| **Insurer Rate** | Rate broker pays insurer (%), fixed per open cover |
| **Client Premium** | Sum Insured × Client Rate / 100 |
| **Insurer Premium** | Sum Insured × Insurer Rate / 100 |
| **Broker Commission** | Client Premium − Insurer Premium |
| **Settlement** | Monthly batch payment broker → insurer |
| **Bulk Upload** | Creating multiple drafts from one XLS file |
| **CPO** | Crude Palm Oil |
| **MT** | Metric Ton |
| **ETD / ETA** | Estimated Departure / Arrival |

---

*v2.1 | March 2026 | Spec-Kit Ready — Agent prompts removed, use GUIDE.md for workflow*
