# Feature Specification: Dashboard and Operational Reports

**Feature Branch**: `008-dashboard-operational-reports`  
**Created**: 2026-03-26  
**Status**: Draft  
**Input**: User description: "Feature 008: Dashboard and Operational Reports"

## Constitution Alignment *(mandatory)*

- This specification defines business outcomes and user-visible behavior only.
- Technical design and implementation choices are intentionally excluded and will be defined during planning.

## Clarifications

### Session 2026-03-26

- Q: How is "Unsettled Amount" defined for dashboard totals? → A: Sum of insurer premium for cases not yet CLOSED.
- Q: How are date-range boundaries applied for reports filtering? → A: Include both start and end dates.
- Q: How should unsupported currencies be handled in USD-converted exposure totals? → A: Exclude from converted totals and show warning/count.
- Q: Should CSV export include only current page rows or all filtered rows? → A: Export all rows matching active filters regardless of pagination.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Monitor Operations on Dashboard (Priority: P1)

A case maker opens the dashboard and immediately sees current operational health through summary cards, status and product distributions, commission trend, and recent case activity.

**Why this priority**: This is the operational entry point used daily to decide where attention is needed.

**Independent Test**: Open the dashboard with representative case data and verify all six summary cards, both breakdown sections, monthly commission trend, and the 5-row recent cases table render accurate values and allow navigation to case detail.

**Acceptance Scenarios**:

1. **Given** existing cases in mixed statuses and currencies, **When** the user opens the dashboard, **Then** the six summary cards show accurate values including required USD-converted exposure and unsettled amount.
2. **Given** cases across all lifecycle statuses, **When** the user views "Cases by Status", **Then** all seven statuses are shown with distinct color-coded bars and correct counts.
3. **Given** cases with multiple product lines and cargo products, **When** the user views "Cases by Product", **Then** counts are grouped correctly by product line and cargo product.
4. **Given** recently created cases exist, **When** the user views "Recent Cases", **Then** only the latest five are shown and selecting a row opens that case detail.

---

### User Story 2 - Analyze Period Performance on Reports Page (Priority: P1)

A case maker selects a date range and reviews aggregated period performance, trends, insurer commission distribution, and a full sortable/filterable case table.

**Why this priority**: Period-based reporting is required for month-end reviews and management visibility.

**Independent Test**: Open reports, set a custom date range, and verify all summary totals, monthly volume trend, commission-by-insurer view, and full table all update consistently using the same filtered dataset.

**Acceptance Scenarios**:

1. **Given** cases created across multiple months, **When** the user applies a date range, **Then** all report sections reflect only cases created in that period.
2. **Given** the selected period includes cases from multiple insurers, **When** the user views commission breakdown, **Then** each insurer's broker commission total is shown and totals reconcile with period summary.
3. **Given** the full case table is displayed, **When** the user sorts or filters table columns, **Then** the table updates while staying within the selected date range.

---

### User Story 3 - Export Filtered Operational Data (Priority: P2)

A case maker exports the currently filtered report dataset to CSV for reconciliation, audit support, or external analysis.

**Why this priority**: Teams need portable, consistent data extracts for offline processing and stakeholder sharing.

**Independent Test**: Apply date and table filters, export CSV, and verify the file contains all filtered rows and exactly the required columns in the required order.

**Acceptance Scenarios**:

1. **Given** a filtered report result set, **When** the user clicks "Export CSV", **Then** a CSV file is downloaded containing all filtered cases.
2. **Given** the export is generated, **When** the file is opened, **Then** columns appear in this exact order: `caseNumber, clientName, productLine, cargoProduct, coverType, status, currency, sumInsured, clientRate, insurerRate, clientPremium, insurerPremium, brokerCommission, origin, destination, vessel, quantity, etd, eta, openCoverRef, createdAt, closedAt`.

---

### Edge Cases

- No cases exist in the selected period: dashboard/report visuals still render with zero values and empty-state messaging.
- Date range start is after end: system prevents or rejects the invalid range and preserves prior valid results.
- Cases have unsupported or missing currency codes: exposure conversion excludes those records from converted totals and shows a warning with excluded case count.
- A case has no cargo product or no open cover reference: table and export include blank values without breaking sort/filter/export behavior.
- Recent cases contain deleted or inaccessible cases: those rows are excluded from the recent list shown to the current user.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dashboard home view with six summary cards: Total Cases, Active Cases, Pending Billing Count, Total Exposure (USD), Monthly Commission, and Unsettled Amount.
- **FR-002**: System MUST compute USD exposure conversion using fixed rates: IDR/16000, SGD/1.35, MYR/4.7.
- **FR-003**: System MUST provide a "Cases by Status" chart that includes all seven case statuses and displays status-specific color coding with counts.
- **FR-004**: System MUST provide a "Cases by Product" breakdown that reports counts by product line and cargo product.
- **FR-005**: System MUST provide a "Monthly Commission" chart showing broker commission totals by recent month.
- **FR-006**: System MUST provide a "Recent Cases" table with the 5 most recently created cases and allow users to open case detail from a row.
- **FR-007**: System MUST provide a reports page with a date range filter based on case creation date.
- **FR-008**: System MUST show period summary values for: Total Cases, Total Sum Insured, Total Client Premium, Total Insurer Premium, and Total Broker Commission.
- **FR-009**: System MUST provide a monthly case volume visualization for the selected date range.
- **FR-010**: System MUST provide a commission breakdown by insurer for the selected date range.
- **FR-011**: System MUST provide a full case table that supports sorting and filtering across the available columns while respecting the selected date range.
- **FR-012**: System MUST provide CSV export of all currently filtered case rows from reports.
- **FR-013**: System MUST generate CSV exports with the exact required columns and order specified in the feature request.
- **FR-014**: System MUST ensure all dashboard and report aggregations are internally consistent for the same filter context.
- **FR-015**: System MUST define "Unsettled Amount" as the sum of insurer premium for all cases whose status is not `CLOSED`.
- **FR-016**: System MUST apply report date range boundaries inclusively for both start and end dates when filtering by case creation date.
- **FR-017**: System MUST exclude cases with unsupported currency codes from USD-converted totals and display a warning that includes the count of excluded cases.
- **FR-018**: System MUST enforce FR-012 as full filtered-dataset export, meaning all rows matching active date range and filters are exported regardless of current table pagination or visible page.

### Key Entities *(include if feature involves data)*

- **Dashboard Summary Snapshot**: Aggregated operational metrics shown on home dashboard, including counts and monetary totals.
- **Report Filter Context**: User-selected date range and table filter/sort state that defines the active reporting dataset.
- **Report Case Row**: Case record projected for reporting/export, including policy, financial, shipment, and lifecycle fields.
- **Commission Breakdown Entry**: Aggregated broker commission total grouped by insurer for a selected period.
- **Monthly Trend Point**: Aggregated value for a specific month (case count or commission) used by trend charts.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of dashboard summary cards match values independently recomputed from the same underlying case set during acceptance testing.
- **SC-002**: For a selected date range, all report sections (summary, charts, table, export) reconcile to the same filtered case count in 100% of validation checks.
- **SC-003**: Users can complete a standard reporting workflow (set date range, review metrics, export CSV) in under 2 minutes in usability testing.
- **SC-004**: At least 95% of CSV exports generated during UAT contain all required columns in the exact specified order with no missing headers.
- **SC-005**: In UAT scenarios with empty datasets, users can still complete report review and export actions without blocking errors in 100% of attempts.

## Assumptions

- Dashboard and reports are available to authenticated internal operational users who already have permission to view case data.
- Date range filtering applies to case creation date only, as specified.
- Date range filtering includes cases created on both selected boundary dates.
- "Monthly Commission" and "Monthly case volume" use calendar months.
- "Unsettled Amount" is calculated as insurer premium for cases not yet closed.
- If a case currency is already USD, no conversion is applied.
- Export includes all rows matching the active filters, not just rows currently visible in a paged table view.
