<!--
Sync Impact Report
- Version change: template-placeholder -> 1.0.0
- Modified principles:
  - Template Principle 1 -> I. Documentation Separation of Concerns (NON-NEGOTIABLE)
  - Template Principle 2 -> II. Insurance Domain Integrity
  - Template Principle 3 -> III. Simplicity and Pragmatism
  - Template Principle 4 -> IV. Data Integrity (NON-NEGOTIABLE)
  - Template Principle 5 -> V. Test Discipline
  - Added: VI. Task-Based Commit Strategy (NON-NEGOTIABLE)
  - Added: VII. Code Quality Standards
  - Added: VIII. User Experience Consistency
- Added sections:
  - Implementation Guardrails
  - Delivery Workflow and Review Gates
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/spec-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - ⚠ pending: .specify/templates/commands/*.md (directory not present in repository)
- Deferred TODOs:
  - None
-->
# CargoShield Constitution

## Core Principles

### I. Documentation Separation of Concerns (NON-NEGOTIABLE)
`spec.md` MUST contain only WHAT and WHY: user stories, business requirements, and
acceptance criteria. `plan.md` MUST contain all HOW decisions: stack, architecture,
data model, API design, and file structure. If a statement describes expected system
behavior ("the system should..."), it belongs in `spec.md`. If it describes a
technical approach ("we will use Next.js with..."), it belongs in `plan.md`.
Rationale: this separation keeps requirements stable while implementation can evolve.

### II. Insurance Domain Integrity
Financial calculations MUST use Decimal types and MUST NOT use floating-point math.
Currency amounts MUST always be stored with explicit currency codes. Premium
calculations MUST preserve the dual-rate broker model (Client Rate and Insurer Rate)
as distinct values that MUST NOT be mixed. Case numbers MUST follow
`BRK-YYYY-NNNN`, generated server-side only. Status transitions MUST be validated by
an explicit state machine with no arbitrary jumps. Rationale: insurance data must be
auditable, deterministic, and contract-safe.

### III. Simplicity and Pragmatism
Implementations MUST start with the simplest approach that satisfies requirements.
The project MUST favor convention over configuration and follow Next.js App Router
conventions. Teams SHOULD prefer established libraries (Prisma, shadcn/ui, Zod)
instead of custom frameworks unless a clear gap is documented. Phase 1 scope MUST
remain single-role (Case Maker) and MUST NOT include multi-tenancy, RBAC, or
microservices. Rationale: reducing optional complexity improves delivery speed and
maintainability.

### IV. Data Integrity (NON-NEGOTIABLE)
All writes that affect multiple tables MUST run in transactions. Cascading deletes
MUST be explicitly declared in schema definitions. Every status transition MUST write
to `CaseStatusHistory`; silent state mutation is forbidden. Settlement batch
operations MUST be atomic, meaning all targeted cases transition or none transition.
Open Cover insurer rates are fixed per agreement and MUST be enforced by the system.
Rationale: consistency and auditability are mandatory for regulated financial flows.

### V. Test Discipline
Every API route MUST include at least one happy-path integration test. Financial
calculation functions (premium computation, settlement totals) MUST have unit tests
covering edge cases including zero values, currency mismatches, and invalid rates.
Status transition logic MUST be tested for both valid and invalid transitions. Bulk
upload parsing MUST be tested against malformed XLS inputs. Rationale: test coverage
must protect high-risk business logic and integration points.

### VI. Task-Based Commit Strategy (NON-NEGOTIABLE)
Each completed task (`T001`, `T002`, etc.) MUST be committed separately. Commit
messages MUST follow `feat(scope): T00X - description`. Teams MUST commit when
completing each task and when moving between task categories. Rationale: traceable,
small commits improve review quality and rollback safety.

### VII. Code Quality Standards
TypeScript strict mode is mandatory. `any` MUST NOT be used except for documented
edge cases where alternatives are infeasible. All form inputs MUST be validated by
Zod schemas on both client and server. API responses MUST use the consistent error
shape `{ error: string, details?: object }`. Business logic MUST reside in `lib/` or
server actions, not React components. Rationale: consistent validation and separation
of concerns reduce defects and maintenance cost.

### VIII. User Experience Consistency
All table UIs MUST use the shared DataTable component with consistent sorting,
filtering, and pagination behavior. Status badges MUST use a single shared color
mapping across views. Destructive actions (delete or status transition) MUST require
confirmation dialogs. Financial figures MUST display currency symbols and thousand
separators. Loading states MUST use skeleton loaders rather than spinners. Rationale:
consistent UX reduces user error and training effort.

## Implementation Guardrails

- Canonical stack for this project is Next.js App Router, Prisma, shadcn/ui, and Zod.
- Domain entities and APIs MUST preserve currency code, client/insurer rate separation,
  case numbering format, and explicit status state-machine constraints.
- Any intentional deviation from constitution principles MUST be documented in
  `plan.md` under complexity/deviation tracking with explicit justification.

## Delivery Workflow and Review Gates

- Planning gate: `spec.md` MUST remain technology-agnostic and `plan.md` MUST contain
  all implementation decisions before task generation starts.
- Implementation gate: task lists MUST include required test work for APIs, financial
  calculations, status transitions, and malformed XLS parsing.
- Review gate: code review MUST verify transaction use, state-history logging,
  settlement atomicity, schema-level cascade declarations, and UI consistency rules.
- Commit gate: reviewers MUST reject changes that bundle multiple completed task IDs
  into one commit without documented exception.

## Governance

This constitution supersedes other project practices. Amendments require explicit
documentation of the changed clauses, rationale, impact to templates, and migration
steps for in-flight work. Versioning follows semantic rules: MAJOR for incompatible
principle removals/redefinitions, MINOR for new principles or materially expanded
guidance, PATCH for wording clarifications. Compliance checks are mandatory during
planning, task generation, implementation, and code review. Any approved deviation
MUST be recorded with justification and owner.

**Version**: 1.0.0 | **Ratified**: 2026-03-25 | **Last Amended**: 2026-03-25

