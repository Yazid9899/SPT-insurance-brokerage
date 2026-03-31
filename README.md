# CargoShield

CargoShield is an internal insurance brokerage operations app for managing case workflows end-to-end: open cover agreements, case processing, document and email logs, monthly settlements, and operational reporting.

## Features

- Secure credentials-based authentication with protected dashboard routes.
- Open cover management with insurer/client linkage and declaration visibility.
- Case lifecycle management (`DRAFT -> DOCUMENTATION -> UNDERWRITING -> ACTIVE -> BILLING -> SETTLING -> CLOSED`).
- Case document upload/list/delete, including bulk-shared documents from upload batches.
- Case email templates, preview, and send-log tracking.
- Bulk draft upload wizard (XLS parsing, column mapping, validation, transactional case creation).
- Monthly insurer settlement flow (draft, matching, confirm, pay).
- Dashboard and reports with CSV export.

## Tech Stack

- Framework: Next.js App Router (TypeScript, strict mode)
- Runtime: Node.js 20 LTS
- Database: PostgreSQL
- ORM: Prisma
- Auth: NextAuth.js (Credentials provider)
- Validation: Zod
- UI: React, Tailwind CSS, shadcn/ui
- Data/Reporting libs: decimal.js, recharts, xlsx
- Testing: Vitest, Playwright

## Project Structure

```text
prisma/
  schema.prisma
  migrations/
  seed.ts
src/
  app/
    (auth)/
    (dashboard)/
    api/
  components/
  lib/
  types/
public/
tests/
```

## Installation

### Prerequisites

- Node.js 20+
- PostgreSQL 15+

### Setup

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
```

## Usage

### Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

### Seed login

- Email: `casemaker@cargoshield.local`
- Password: `ChangeMe123!`

### Useful commands

```bash
npm run build
npm run lint
npm test
npm run test:integration
npm run test:e2e
npm run backfill:parties
```

## Environment Variables

From `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cargoshield?schema=public"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Notes:

- `DATABASE_URL` is required for Prisma and app runtime.
- `NEXTAUTH_SECRET` is required for stable auth sessions.
- `NEXTAUTH_URL` is recommended for local callback/session behavior.

## API Documentation

Detailed API reference (all endpoints, request/response examples, errors):

- [API.md](./API.md)

## Deployment

Current repository is configured for local/dev-first workflow. Typical production deployment pattern:

1. Deploy app to Vercel (or equivalent Node-compatible platform).
2. Provision PostgreSQL (Neon/Supabase/Postgres service).
3. Set production env vars (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).
4. Run migrations and (optionally) seed:

```bash
npm run db:migrate
npm run db:seed
```

## Contributing

1. Create a feature branch.
2. Make focused changes with tests.
3. Run lint/tests before opening a PR:

```bash
npm run lint
npm test
```

4. Open a PR with:
- What changed
- Why it changed
- How to test

## Additional References

- Product requirements: `PRD.md`
- Data model: `prisma/schema.prisma`
- Validation contracts: `src/lib/validations.ts`
- Integration tests: `tests/integration`
