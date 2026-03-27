# SPT-insurance-brokerage Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-27

## Active Technologies
- TypeScript (strict mode), Node.js 20 LTS, Next.js App Router + Next.js, React, Prisma, Zod, react-hook-form, `@hookform/resolvers`, NextAuth.js, Tailwind CSS (002-open-cover-management)
- PostgreSQL via Prisma models (`OpenCover`, `Case`, `CaseStatusHistory`) (002-open-cover-management)
- PostgreSQL via Prisma (`OpenCover`, `Case`, `CaseStatusHistory`) (002-open-cover-management)
- TypeScript (strict), Node.js 20 LTS + Next.js App Router, React, Prisma, Zod, react-hook-form, @hookform/resolvers, NextAuth.js, decimal.js (003-case-management-core)
- PostgreSQL via Prisma models (`Case`, `CaseStatusHistory`, related `OpenCover`, `CaseDocument`) (003-case-management-core)
- PostgreSQL via Prisma (`Case`, `CaseDocument`) + local filesystem under `/public/uploads` for development (abstraction-ready for S3-compatible storage) (004-document-management)
- TypeScript (strict), Node.js 20 LTS + Next.js App Router, React, Prisma, Zod, react-hook-form, NextAuth.js (005-email-template-system)
- PostgreSQL via Prisma (`CaseEmail`, `Case`, `Settlement`, `User`) + system-defined template catalog in application domain layer (005-email-template-system)
- TypeScript (strict), Node.js 20 LTS + Next.js App Router, React, Prisma, Zod, react-hook-form, `@hookform/resolvers`, SheetJS (`xlsx`), NextAuth.js (006-bulk-draft-upload)
- PostgreSQL via Prisma (`Case`, `OpenCover`, `CaseDocument`) + local file storage in development for shared documents (006-bulk-draft-upload)
- TypeScript (strict mode), Node.js 20 LTS + Next.js App Router, React, Prisma, Zod, NextAuth.js, decimal.js (007-monthly-insurer-settlement)
- PostgreSQL via Prisma (`Settlement`, `SettlementItem`, `Case`, `CaseStatusHistory`) (007-monthly-insurer-settlement)
- TypeScript (strict mode), Node.js 20 LTS + Next.js App Router, React, Prisma, Zod, NextAuth.js, decimal.js, recharts (008-dashboard-operational-reports)
- PostgreSQL via Prisma (`Case`, `OpenCover`, `Settlement`) (008-dashboard-operational-reports)

- TypeScript (strict mode), Node.js 20 LTS, Next.js 14+ App Router + Next.js, React, NextAuth.js (credentials), Prisma, `@prisma/client`, bcrypt, Zod, react-hook-form, shadcn/ui, Tailwind CSS, SheetJS (`xlsx`), recharts, date-fns, Resend (001-foundation-auth-shell)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript (strict mode), Node.js 20 LTS, Next.js 14+ App Router: Follow standard conventions

## Recent Changes
- 008-dashboard-operational-reports: Added TypeScript (strict mode), Node.js 20 LTS + Next.js App Router, React, Prisma, Zod, NextAuth.js, decimal.js, recharts
- 007-monthly-insurer-settlement: Added TypeScript (strict mode), Node.js 20 LTS + Next.js App Router, React, Prisma, Zod, NextAuth.js, decimal.js
- 006-bulk-draft-upload: Added TypeScript (strict), Node.js 20 LTS + Next.js App Router, React, Prisma, Zod, react-hook-form, `@hookform/resolvers`, SheetJS (`xlsx`), NextAuth.js


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
