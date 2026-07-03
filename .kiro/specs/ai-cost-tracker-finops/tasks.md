# Implementation Plan: AI Cost Tracker FinOps — Strategy Cockpit

## Overview

Implementación incremental del módulo "Strategy Cockpit" FinOps para Seguros Bolívar. El plan sigue una secuencia de: estructura base → modelos de datos → servicios backend → endpoints API → componentes frontend → integración y validación. Stack: React (Vite + Recharts + Tailwind + Shadcn UI), Express (Node.js), PostgreSQL con datos mock.

## Tasks

- [ ] 1. Set up project structure and shared infrastructure
  - [x] 1.1 Create backend project with Express, pg, Zod, and folder structure
    - Initialize `backend/` with `package.json`, install express, pg, zod, cors, helmet, uuid, dotenv
    - Create folder structure: `src/routes/`, `src/services/`, `src/repositories/`, `src/validators/`, `src/middleware/`, `src/mock/`, `src/config/`, `src/utils/`
    - Create `src/config/db.js` with pg pool configuration (env vars)
    - Create `src/middleware/error-handler.js` with standard APIError format
    - Create `src/middleware/correlation-id.js` for X-Correlation-ID propagation
    - Create `src/middleware/auth.js` with simulated JWT validation
    - Create `src/app.js` with Express setup (helmet, cors, JSON parser, middleware)
    - _Requirements: All (infrastructure base)_

  - [x] 1.2 Create frontend project with Vite, React, Tailwind, Shadcn UI, Recharts
    - Initialize `frontend/` with Vite + React + TypeScript template
    - Install and configure Tailwind CSS 3.x, Shadcn UI, Recharts 2.x, Axios 1.x, React Router 6.x, React Query 5.x, React Hook Form + Zod, Sonner, Lucide React
    - Create folder structure: `src/components/ui/`, `src/components/layout/`, `src/components/charts/`, `src/features/`, `src/services/`, `src/hooks/`, `src/types/`, `src/config/`, `src/lib/`
    - Create `src/types/index.ts` with all TypeScript interfaces from design (CostFilters, AISpendResponse, UnitEconomicsRow, ShowbackRow, AlertRule, Alert, FOCUSRecord, SimulationRequest, SimulationResponse, GovernanceRule, Recommendation, SelfFundingResponse, CostAvoidanceAction, AnomalyAlert)
    - Create `src/services/api-client.ts` with Axios instance (baseURL, interceptors, correlation-id)
    - Create `src/components/layout/Sidebar.tsx` and `src/components/layout/Header.tsx` for app shell
    - _Requirements: All (infrastructure base)_

  - [x] 1.3 Create database schema and seed mock data
    - Create `backend/src/mock/schema.sql` with all tables from design (teams, ai_costs, megabill_costs, alert_rules, alert_history, governance_rules, recommendations, resource_tags, cost_avoidance, daily_cost_stats, unit_economics)
    - Create `backend/src/mock/seed.js` to generate realistic mock data: 3 AI providers (6 services), 5 teams, 3 cloud providers, 2 SaaS, 2 licenses, 3 business use cases, 6 months of daily cost history
    - Include indexes from design for performance
    - _Requirements: 1.5, 2.2, 3.1, 5.4_

- [ ] 2. Implement AI Spend Visualization (Req 1)
  - [ ] 2.1 Implement cost service and repository for AI spend
    - Create `backend/src/repositories/cost.repository.js` with queries for AI spend grouped by service/team/provider, filtered by date/team/provider
    - Create `backend/src/services/cost.service.js` with `getAISpend(filters)` that calculates totals, percentages, and consumption metrics (tokens, inferences, GPU-hours)
    - Create `backend/src/validators/cost.validator.js` with Zod schema for CostFilters (date range max 12 months, valid provider enum, valid team)
    - Create `backend/src/routes/cost.routes.js` with GET `/api/v1/costs/ai-spend` and POST `/api/v1/costs/ai-spend/advance`
    - Implement temporal advance endpoint that generates new mock values for +1 hour
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ] 2.2 Write property test for percentage distribution (Property 1)
    - **Property 1: Percentage distributions sum to 100%**
    - Use fast-check to generate arbitrary cost item arrays and verify sum of percentages equals 100% (±0.1%)
    - **Validates: Requirements 1.1, 5.5**

  - [ ] 2.3 Implement AI Spend dashboard frontend
    - Create `frontend/src/features/ai-spend/AISpendPage.tsx` with filter controls (date range, team, provider)
    - Create `frontend/src/features/ai-spend/components/SpendBreakdown.tsx` with grouped cost display (name, cost USD, percentage)
    - Create `frontend/src/features/ai-spend/components/ConsumptionMetrics.tsx` showing tokens, inferences, GPU-hours per service
    - Create `frontend/src/features/ai-spend/hooks/useAISpend.ts` with React Query integration
    - Implement empty state and error state with retry button (5s timeout)
    - Default view: current month, all providers and teams visible
    - _Requirements: 1.1, 1.6, 1.8, 1.9, 1.10_

  - [ ] 2.4 Write property test for filtering correctness (Property 2)
    - **Property 2: Filtering returns only matching records**
    - Use fast-check to generate datasets with arbitrary filters and verify all returned records match filter conditions and no matching record is excluded
    - **Validates: Requirements 1.2, 1.3, 1.4, 5.2, 9.5**

- [ ] 3. Implement Unit Economics (Req 2)
  - [ ] 3.1 Implement unit economics service and endpoint
    - Create `backend/src/services/unit-economics.service.js` with `getUnitEconomics(period)` calculating cost/transactions per use case
    - Add Zod validation for period parameter (week, month, custom up to 90 days)
    - Add route GET `/api/v1/costs/unit-economics` to cost routes
    - Calculate weekly trend (last 8 weeks) and trend direction (up/down/stable)
    - Handle zero transactions case returning null unit cost
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 3.2 Write property test for unit cost calculation (Property 6)
    - **Property 6: Unit cost calculation correctness**
    - Use fast-check to generate (totalCost, transactionsProcessed) pairs and verify unitCost = totalCost / transactionsProcessed rounded to 4 decimals, or null when transactions = 0
    - **Validates: Requirements 2.1, 2.5**

  - [ ] 3.3 Write property test for trend direction (Property 12)
    - **Property 12: Trend direction correctly reflects cost change**
    - Use fast-check to generate consecutive weekly costs and verify direction is "up" when current > previous, "down" when current < previous, "stable" when equal
    - **Validates: Requirements 2.4**

  - [ ] 3.4 Implement unit economics frontend component
    - Create `frontend/src/features/unit-economics/UnitEconomicsPage.tsx` with period selector (week, month, custom)
    - Create table component with columns: service, cost (2 dec), transactions (int), unit cost (4 dec)
    - Include sparkline per row (last 8 weeks) using Recharts `<Sparkline />`
    - Show directional arrow (colored) for trend and "N/A" for zero-transaction cases
    - _Requirements: 2.1, 2.3, 2.4, 2.5_

- [ ] 4. Implement Showback/Chargeback (Req 3)
  - [ ] 4.1 Implement showback service and endpoint
    - Create `backend/src/services/showback.service.js` with `getShowback(month)` returning per-team breakdown (cloud, AI, SaaS, total), budget percentage, efficiency ranking
    - Handle teams without budget ("Sin presupuesto", excluded from ranking)
    - Add route GET `/api/v1/costs/showback`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 4.2 Write property test for budget percentage (Property 7)
    - **Property 7: Budget percentage calculation correctness**
    - Use fast-check to generate (totalCost, budget) pairs and verify percentage = (totalCost/budget)×100 rounded to 1 decimal; null budget yields exclusion from ranking
    - **Validates: Requirements 3.2, 3.5**

  - [ ] 4.3 Write property test for aggregation totals (Property 5)
    - **Property 5: Aggregated totals equal sum of components**
    - Use fast-check to generate (cloudCost, aiCost, saasCost) tuples and verify totalCost === cloud + AI + SaaS exactly
    - **Validates: Requirements 3.1, 7.5, 9.2**

  - [ ] 4.4 Write property test for budget exceeded flag (Property 13)
    - **Property 13: Budget exceeded flag set correctly**
    - Use fast-check to generate teams with varying budget percentages and verify overBudget flag is true when >100% and false otherwise
    - **Validates: Requirements 3.4**

  - [ ] 4.5 Implement showback frontend component
    - Create `frontend/src/features/showback/ShowbackPage.tsx` with monthly period selector
    - Table with columns: team, cloud cost, AI cost, SaaS cost, total, % budget
    - Highlight rows exceeding 100% budget (red background + alert icon)
    - Efficiency ranking sorted by cost/budget ratio ascending
    - Show "Sin presupuesto" for teams without budget
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Checkpoint - Verify core cost modules
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Alerts System (Req 4)
  - [ ] 6.1 Implement alert service with CRUD and evaluation
    - Create `backend/src/services/alert.service.js` with full CRUD for alert rules (max 50 per user)
    - Create `backend/src/validators/alert.validator.js` with Zod schema: threshold (0.01–999999999.99), service (from catalog), recipient (email format, max 255)
    - Implement alert evaluation: warning at ≥80% threshold, critical at ≥100%, no duplicates
    - Implement alert history with 90-day retention and paginated queries (max 100/page)
    - Create routes: GET/POST/PUT/DELETE `/api/v1/alerts/rules`, GET `/api/v1/alerts/active`, GET `/api/v1/alerts/history`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 6.2 Write property test for alert severity (Property 10)
    - **Property 10: Alert severity correctly assigned at threshold levels**
    - Use fast-check to generate (threshold, currentSpend) pairs and verify: ≥T → critical, ≥0.8T and <T → warning, <0.8T → no alert
    - **Validates: Requirements 4.4**

  - [ ]* 6.3 Write property test for input validation (Property 4)
    - **Property 4: Input validation accepts valid inputs and rejects invalid inputs**
    - Use fast-check to generate valid and invalid alert rule inputs, verify valid inputs accepted, invalid rejected with field-specific errors
    - **Validates: Requirements 4.1, 4.2, 4.3, 6.4, 7.1, 9.1, 11.1, 11.2**

  - [ ] 6.4 Implement alerts frontend
    - Create `frontend/src/features/alerts/AlertsPage.tsx` with tabs: Active Alerts, Rules Management, History
    - Active alerts panel: max 100, sorted by severity (critical first) then date descending
    - Rules CRUD form with validation (React Hook Form + Zod)
    - History view with pagination
    - _Requirements: 4.1, 4.5, 4.7_

- [ ] 7. Implement MegaBill Consolidated View (Req 5)
  - [ ] 7.1 Implement megabill service and endpoints
    - Create `backend/src/services/megabill.service.js` with `getMegaBill()` returning totals by category (cloud, SaaS, licenses) and `getDrillDown(category)` with service details
    - Normalize all data to FOCUS format (ServiceName, BilledCost, UsageQuantity, Provider)
    - Add routes GET `/api/v1/costs/megabill` and GET `/api/v1/costs/megabill/:category`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 7.2 Implement megabill frontend
    - Create `frontend/src/features/megabill/MegaBillPage.tsx` with category totals (cloud, SaaS, licenses)
    - Pie/donut chart showing percentage distribution by category (1 decimal precision)
    - Drill-down on category click showing service list (name, billed cost, usage qty, provider)
    - Empty state and partial data handling
    - _Requirements: 5.1, 5.2, 5.5, 5.6, 5.7_

- [ ] 8. Implement What-If Simulator (Req 6)
  - [ ] 8.1 Implement simulator service and endpoint
    - Create `backend/src/services/simulator.service.js` with `runProjection(serviceId, incrementPercentage)` using last 3 months of historical data
    - Calculate 3 scenarios: optimistic (p25), base (p50), pessimistic (p75) at 1, 3, 6 months
    - Validate input: integer 1–500, service must have ≥3 months of data
    - Add route POST `/api/v1/simulator/projection`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ] 8.2 Write property test for projection ordering (Property 9)
    - **Property 9: Projection scenarios maintain ordering invariant**
    - Use fast-check to generate historical cost arrays and increment percentages, verify optimistic ≤ base ≤ pessimistic for all time horizons
    - **Validates: Requirements 6.1, 6.2**

  - [ ] 8.3 Implement simulator frontend
    - Create `frontend/src/features/simulator/SimulatorPage.tsx` with service selector and increment input (1–500)
    - Line chart with confidence band (area between optimistic/pessimistic) using Recharts
    - Input validation with error message for out-of-range values
    - Auto-recalculate on parameter change
    - Insufficient data message when service lacks 3 months history
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 9. Implement Governance Policies (Req 7)
  - [ ] 9.1 Implement governance service and endpoints
    - Create `backend/src/services/governance.service.js` with CRUD for rules (resource, metric, operator, value, period 1–90 days)
    - Implement recommendation generation logic (sustained violations)
    - Implement `markAsImplemented(id)` moving to history and excluding from active calculations
    - Calculate total estimated savings from active recommendations
    - Add routes: CRUD `/api/v1/governance/rules`, GET `/api/v1/governance/recommendations`, PATCH `/api/v1/governance/recommendations/:id/implement`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

  - [ ]* 9.2 Write property test for governance evaluation (Property 15)
    - **Property 15: Governance rule evaluation generates recommendation only for sustained violations**
    - Use fast-check to generate metric histories with partial/full violations and verify only full-period violations generate recommendations
    - **Validates: Requirements 7.3**

  - [ ]* 9.3 Write property test for recommendation implementation (Property 16)
    - **Property 16: Implementing a recommendation excludes it from active calculations**
    - Use fast-check to generate recommendation lists, implement one, verify it moves to history and total savings decreases by exact amount
    - **Validates: Requirements 7.6**

  - [ ] 9.4 Implement governance frontend
    - Create `frontend/src/features/governance/GovernancePage.tsx` with tabs: Rules, Recommendations
    - Rules CRUD form (React Hook Form + Zod)
    - Recommendations list sorted by savings desc (max 50/page) with "Mark as implemented" action
    - Show total estimated savings
    - _Requirements: 7.1, 7.4, 7.5, 7.6_

- [ ] 10. Checkpoint - Verify alerts, megabill, simulator, governance
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement Self-Funding Comparison (Req 8)
  - [ ] 11.1 Implement self-funding service and endpoint
    - Create `backend/src/services/self-funding.service.js` with `getSelfFunding(period)` calculating investment vs. savings and ratio
    - Handle zero investment (return 0%)
    - Validate period parameter (month, 3months, 6months, year, total)
    - Add route GET `/api/v1/self-funding`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 11.2 Write property test for self-funding ratio (Property 8)
    - **Property 8: Self-funding ratio calculation**
    - Use fast-check to generate (investment, savings) pairs and verify ratio = (savings/investment)×100 rounded to 2 decimals, 0% when investment = 0
    - **Validates: Requirements 8.2, 8.3**

  - [ ] 11.3 Implement self-funding frontend
    - Create `frontend/src/features/self-funding/SelfFundingPage.tsx` with dual dashboard (investment left, savings right)
    - Progress bar showing ratio vs. 100% target
    - Badge "IA completamente autofinanciada" when ratio > 100%
    - Period selector with recalculation on change
    - Empty state for no data
    - _Requirements: 8.1, 8.4, 8.5, 8.6, 8.7_

- [ ] 12. Implement Cost Avoidance Report (Req 9)
  - [ ] 12.1 Implement cost avoidance service and endpoints
    - Create `backend/src/services/cost-avoidance.service.js` with `getReport(month)` and `createAction(data)`
    - Validate action fields: resource (max 100), type (enum), date (ISO-8601), cost (0.01–999999999.99)
    - Add routes GET/POST `/api/v1/cost-avoidance`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 12.2 Write property test for sorted outputs (Property 3)
    - **Property 3: Sorted outputs preserve correct ordering**
    - Use fast-check to generate alert lists, recommendation lists, and avoidance actions, verify each collection maintains its specified sort order
    - **Validates: Requirements 3.3, 4.5, 7.4, 9.3**

  - [ ] 12.3 Implement cost avoidance frontend
    - Create `frontend/src/features/cost-avoidance/CostAvoidancePage.tsx` with monthly selector
    - Show accumulated monthly total (USD formatted)
    - List actions ordered by date desc (resource, type, date, savings)
    - Empty state: $0.00 + message
    - _Requirements: 9.2, 9.3, 9.4_

- [ ] 13. Implement Executive Dashboard (Req 10)
  - [ ] 13.1 Implement executive dashboard service and endpoints
    - Create `backend/src/services/executive.service.js` with `getDashboard()` returning all KPIs (current/previous month spend, variation %, top 5 services, avg cost/transaction, critical alerts count)
    - Implement PDF export with jsPDF (endpoint GET `/api/v1/executive/export-pdf`)
    - Add route GET `/api/v1/executive/dashboard`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ]* 13.2 Write property test for KPI variation flag (Property 17)
    - **Property 17: KPI variation flag for unfavorable cost changes**
    - Use fast-check to generate (currentMonth, previousMonth) spend pairs and verify flag is set when variation > 15%
    - **Validates: Requirements 10.4**

  - [ ] 13.3 Implement executive dashboard frontend
    - Create `frontend/src/features/executive/ExecutivePage.tsx` as single-view without scroll
    - KPI cards: current spend, previous spend, variation %, avg cost/transaction, critical alerts
    - Red highlight for KPIs with >15% unfavorable variation
    - 6-month trend line chart
    - Top 5 services list
    - Alert count with click-through to alerts panel
    - Export PDF button
    - Handle "N/A" when no previous month data
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 14. Implement Resource Tagging (Req 11)
  - [ ] 14.1 Implement tagging service and endpoints
    - Create `backend/src/services/tagging.service.js` with CRUD for resource tags (team max 50, project max 50, environment enum, AI use case max 100)
    - Implement compliance calculation: (resources with 4 fields complete / total) × 100
    - Trigger warning alert when compliance < 80%
    - Validate environment values ("desarrollo", "staging", "producción")
    - Add routes CRUD `/api/v1/tagging/resources`, GET `/api/v1/tagging/compliance`
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 14.2 Write property test for tagging compliance (Property 14)
    - **Property 14: Tagging compliance correctly calculated and alerted**
    - Use fast-check to generate resource sets with varying completeness and verify compliance % and alert trigger at <80%
    - **Validates: Requirements 11.3, 11.4**

  - [ ] 14.3 Implement tagging frontend
    - Create `frontend/src/features/tagging/TaggingPage.tsx` with resource list and CRUD form
    - Compliance percentage gauge/indicator
    - Form validation for all mandatory fields with environment enum constraint
    - Error messages for invalid fields
    - _Requirements: 11.1, 11.3, 11.5, 11.6_

- [ ] 15. Implement Anomaly Detection (Req 12)
  - [ ] 15.1 Implement anomaly detection service and endpoint
    - Create `backend/src/services/anomaly.service.js` with `detectAnomalies()` using mean + stddev of last 28 days per service
    - Classify severity: warning (2–3σ), critical (>3σ)
    - Exclude services with <28 days data
    - Include context: service, current amount, expected (mean), deviations exceeded (1 decimal), start date
    - Add route GET `/api/v1/anomalies`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]* 15.2 Write property test for anomaly classification (Property 11)
    - **Property 11: Anomaly detection classification by standard deviations**
    - Use fast-check to generate (mean, stddev, currentCost) triples and verify: >μ+3σ → critical, >μ+2σ and ≤μ+3σ → warning, ≤μ+2σ → no anomaly; <28 days → excluded
    - **Validates: Requirements 12.1, 12.2, 12.4, 12.5**

  - [ ] 15.3 Implement anomalies frontend
    - Create `frontend/src/features/anomalies/AnomaliesPage.tsx` with dedicated panel
    - Cards/list showing anomalies with severity indicator (warning/critical colored)
    - Details: service, current vs. expected, deviations, start date
    - Sorted by severity descending
    - _Requirements: 12.3, 12.4_

- [ ] 16. Integration, routing, and final wiring
  - [ ] 16.1 Wire all frontend routes and navigation
    - Configure React Router with routes for all 12 feature pages
    - Update Sidebar navigation with all module links and icons (Lucide)
    - Implement page container layout with responsive design
    - _Requirements: All_

  - [ ] 16.2 Wire all backend routes and start server
    - Register all route modules in `src/app.js`
    - Create `src/server.js` entry point with graceful shutdown
    - Implement health check endpoint GET `/api/v1/health`
    - _Requirements: All_

  - [ ]* 16.3 Write integration tests for critical API endpoints
    - Test GET `/api/v1/costs/ai-spend` with various filters
    - Test POST `/api/v1/alerts/rules` CRUD lifecycle
    - Test POST `/api/v1/simulator/projection` with valid/invalid inputs
    - Test GET `/api/v1/executive/dashboard` response shape
    - Use Jest + Supertest with mocked DB
    - _Requirements: 1.1, 4.1, 6.1, 10.1_

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 17 correctness properties defined in the design using fast-check
- Unit tests validate specific examples and edge cases
- All data is mock — no real cloud billing connections required
- Frontend uses approved libraries: Vite, React Query, React Hook Form + Zod, Tailwind, Shadcn UI, Recharts, Axios, Lucide, Sonner
- Backend uses approved libraries: Express, pg, Zod, Helmet, CORS

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["1.3"] },
    { "id": 2, "tasks": ["2.1", "7.1", "12.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "3.1", "4.1", "7.2"] },
    { "id": 4, "tasks": ["3.2", "3.3", "3.4", "4.2", "4.3", "4.4", "4.5", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "6.4", "8.1", "9.1", "12.2", "12.3"] },
    { "id": 6, "tasks": ["8.2", "8.3", "9.2", "9.3", "9.4", "11.1"] },
    { "id": 7, "tasks": ["11.2", "11.3", "13.1", "14.1"] },
    { "id": 8, "tasks": ["13.2", "13.3", "14.2", "14.3", "15.1"] },
    { "id": 9, "tasks": ["15.2", "15.3", "16.1", "16.2"] },
    { "id": 10, "tasks": ["16.3"] }
  ]
}
```
