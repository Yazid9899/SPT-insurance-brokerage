# Research: Dashboard and Operational Reports

## Decision 1: CSV export pattern in App Router
- Decision: Build CSV using server-side streaming response (`text/csv`) generated from the same validated filter object used by report table queries.
- Rationale: Streaming avoids large in-memory buffers for bigger result sets and guarantees export/table parity by reusing one filter path.
- Alternatives considered:
  - Generate full CSV string in memory before response: rejected due to memory growth risk.
  - Client-side CSV generation from current table page: rejected because it breaks all-filtered-row parity and pagination independence.

## Decision 2: Prisma aggregation strategy
- Decision: Use dedicated aggregate/group queries per dataset (summary, status distribution, product breakdown, monthly trend, insurer commission) with shared `where` builder.
- Rationale: Split query intents keep SQL simple, debuggable, and index-friendly while preserving consistent filters through a single predicate builder.
- Alternatives considered:
  - One monolithic raw SQL query for all widgets: rejected due to maintenance and correctness risk.
  - Client-side aggregation from full case list: rejected for payload and performance inefficiency.

## Decision 3: Decimal-safe financial rollups and conversion order
- Decision: Aggregate monetary values in Decimal form first, then apply currency conversion to USD exposure using fixed rates (IDR/16000, SGD/1.35, MYR/4.7); exclude unsupported currencies and return excluded count.
- Rationale: Preserves financial precision and enforces explicit conversion semantics required by spec clarifications.
- Alternatives considered:
  - Convert each value with floating-point math: rejected due to precision drift.
  - Include unsupported currencies as USD 1:1: rejected because it distorts exposure totals.

## Decision 4: URL search params as report filter source of truth
- Decision: Canonicalize report filters from URL search params (date range, status, product line, cargo product, cover type, search/sort) and share this canonical filter object across table and export endpoints.
- Rationale: Ensures deep-linkable reports and deterministic parity between visible filtered data and downloaded CSV.
- Alternatives considered:
  - Store filters only in client state: rejected because export endpoint cannot reliably mirror current state.
  - Separate filter parsing logic per endpoint: rejected due to drift and parity bugs.

## Decision 5: Recent cases performance shape
- Decision: Fetch latest 5 cases with a narrow select projection (only fields required by widget and row navigation).
- Rationale: Reduces query and serialization overhead for dashboard initial load.
- Alternatives considered:
  - Reuse full report case DTO: rejected due to unnecessary payload.
  - Fetch recent cases from client after dashboard render: rejected because server-rendered dashboard should provide immediate operational snapshot.
