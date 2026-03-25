# SPT Insurance Brokerage

Current codebase status as of March 25, 2026.

## Overview

CargoShield brokerage web application built with Next.js App Router, Prisma, PostgreSQL, and NextAuth credentials auth.

## Current Development State

Implemented and present in the repository:

- Foundation application shell (auth, protected routes, persistent sidebar navigation, dashboard module pages)
- Foundation APIs (`/api/foundation/bootstrap`, `/api/foundation/references`)
- Open Cover management
- Open Cover CRUD APIs (`/api/open-covers`, `/api/open-covers/[id]`)
- Open Cover list/new/edit/detail dashboard pages
- Declaration filtering on Open Cover detail
- Case creation integration with active Open Cover selection and lock rules
- Case status transition validation API (`/api/cases/[id]/status`)
- Unit, integration, and E2E tests for auth, shell, open covers, and case/open-cover workflows

Feature task completion:

- `specs/001-foundation-auth-shell/tasks.md`: complete
- `specs/002-open-cover-management/tasks.md`: complete

## Tech Stack

- TypeScript (strict mode)
- Node.js 20 LTS
- Next.js (App Router) + React
- NextAuth.js (credentials)
- Prisma + PostgreSQL
- Zod + react-hook-form
- Tailwind CSS + shadcn/ui
- Vitest + Testing Library
- Playwright

## Project Structure

```text
prisma/
specs/
src/
tests/
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables (`.env`) for:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`

3. Run Prisma migration and seed:

```bash
npm run db:migrate
npm run db:seed
```

4. Start development server:

```bash
npm run dev
```

## Validation Commands

```bash
npm test
npm run lint
npm run test:integration
npm run test:e2e
```
