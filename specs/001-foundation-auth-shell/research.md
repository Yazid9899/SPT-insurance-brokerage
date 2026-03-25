# Research: Foundation Application Shell

## Decision 1: shadcn/ui setup approach for Next.js App Router

- Decision: Use the official `shadcn` CLI with the Next.js template (`shadcn@latest init -t next`) and maintain generated components in-repo (`components/ui`) with new-york style and slate base.
- Rationale: Official docs explicitly provide the Next.js installation flow and component add workflow; this matches our App Router architecture and constitution preference for established libraries.
- Alternatives considered:
  - Manual installation only: valid but slower and easier to misconfigure compared with the official guided init path.
  - Third-party component packs first: rejected for foundation scope; increases variance and review overhead.
- Sources:
  - https://ui.shadcn.com/docs/installation
  - https://ui.shadcn.com/docs/installation/next

## Decision 2: Prisma Decimal handling in TypeScript

- Decision: Model all financial fields as Prisma `Decimal` with explicit precision/scale (`@db.Decimal(...)`), use `Prisma.Decimal` or string-safe inputs in write paths, and serialize Decimal values to strings when crossing JSON boundaries.
- Rationale: Prisma documents that Decimal is backed by Decimal.js, which preserves precision; this aligns with constitution requirements forbidding floating-point financial math. Explicit DB precision/scale avoids ambiguous numeric storage behavior.
- Alternatives considered:
  - JavaScript `number` for premiums/rates: rejected due to precision risk.
  - Database `money` type: rejected for portability and predictability concerns; Decimal with explicit scale is safer and clearer.
- Sources:
  - https://docs.prisma.io/docs/orm/prisma-client/special-fields-and-types
  - https://docs.prisma.io/docs/orm/reference/prisma-schema-reference
  - https://docs.prisma.io/docs/v6/orm/overview/databases/postgresql

## Decision 3: Auth model for foundation

- Decision: Use credentials-based authentication with one predefined seeded user, bcrypt password verification, and JWT session strategy.
- Rationale: Meets feature scope (single internal user, no registration) while keeping authentication implementation simple and extensible.
- Alternatives considered:
  - Database session strategy at foundation stage: deferred to later if operational needs require server-side session invalidation.
  - OAuth/SSO at foundation stage: out of scope for single-user bootstrap.

## Decision 4: Foundation contracts strategy

- Decision: Define explicit foundation API contracts for bootstrap/reference payloads and login/logout/session checks, while relying on built-in auth route behavior for credentials flow.
- Rationale: Provides a clear stable interface for shell rendering and future integration tests without over-specifying future feature endpoints.
- Alternatives considered:
  - No explicit contracts in foundation: rejected; reduces traceability and testability.
  - Full case/open-cover/settlement API contracts now: deferred to corresponding feature plans.