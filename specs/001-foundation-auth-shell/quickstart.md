# Quickstart: Foundation Application Shell

## Prerequisites

- Node.js 20+
- npm/pnpm/yarn
- PostgreSQL 15+

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

Create `.env.local` with minimum values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/cargoshield"
NEXTAUTH_SECRET="replace-with-strong-secret"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_placeholder_for_dev"
```

## 3. Prepare database

```bash
npm run db:migrate -- --name foundation_init
npm run db:seed
```

## 4. Start development server

```bash
npm run dev
```

## 5. Sign in with seeded user

Use seeded credentials from `prisma/seed.ts`.
Recommended foundation default:

- Email: `casemaker@cargoshield.local`
- Password: `ChangeMe123!`

## 6. Verify foundation flows

1. Visit a protected route directly while signed out, confirm redirect to login.
2. Sign in with valid credentials, confirm redirect to Dashboard placeholder.
3. Confirm sidebar appears on authenticated pages with:
   - CargoShield app name
   - navigation links (Dashboard, Cases, Open Covers, Settlements, Reports, Email Templates)
   - logged-in user name and email
4. Confirm invalid credentials show generic error message.
5. Confirm authenticated visit to `/login` redirects to Dashboard.

## 7. Validate foundation reference data

- Product lines: Cargo, Property, Marine Hull, Utility.
- Cargo sub-products: CPO, Biodiesel, Shortening.
- Lifecycle statuses: Draft, Documentation, Underwriting, Active, Billing, Settling, Closed.

## 8. Test commands (planned baseline)

```bash
npm run test
npm run test:integration
npm run test:e2e
```

SC-003 note: sidebar-navigation speed remains a manual QA guideline for Feature 001.
