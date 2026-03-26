# SPT-insurance-brokerage Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-26

## Active Technologies
- TypeScript (strict mode), Node.js 20 LTS, Next.js App Router + Next.js, React, Prisma, Zod, react-hook-form, `@hookform/resolvers`, NextAuth.js, Tailwind CSS (002-open-cover-management)
- PostgreSQL via Prisma models (`OpenCover`, `Case`, `CaseStatusHistory`) (002-open-cover-management)
- PostgreSQL via Prisma (`OpenCover`, `Case`, `CaseStatusHistory`) (002-open-cover-management)
- TypeScript (strict), Node.js 20 LTS + Next.js App Router, React, Prisma, Zod, react-hook-form, @hookform/resolvers, NextAuth.js, decimal.js (003-case-management-core)
- PostgreSQL via Prisma models (`Case`, `CaseStatusHistory`, related `OpenCover`, `CaseDocument`) (003-case-management-core)
- PostgreSQL via Prisma (`Case`, `CaseDocument`) + local filesystem under `/public/uploads` for development (abstraction-ready for S3-compatible storage) (004-document-management)

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
- 004-document-management: Added TypeScript (strict), Node.js 20 LTS + Next.js App Router, React, Prisma, Zod, react-hook-form, @hookform/resolvers, NextAuth.js
- 003-case-management-core: Added TypeScript (strict), Node.js 20 LTS + Next.js App Router, React, Prisma, Zod, react-hook-form, @hookform/resolvers, NextAuth.js, decimal.js
- 002-open-cover-management: Added TypeScript (strict mode), Node.js 20 LTS, Next.js App Router + Next.js, React, Prisma, Zod, react-hook-form, `@hookform/resolvers`, NextAuth.js, Tailwind CSS


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
