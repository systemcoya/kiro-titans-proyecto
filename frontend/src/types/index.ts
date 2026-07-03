/**
 * TypeScript interfaces for AI Cost Tracker FinOps — Strategy Cockpit.
 * These types mirror the backend API contracts defined in design.md.
 */

/** Filtros comunes para consultas de costos */
export interface CostFilters {
  startDate: string;
  endDate: string;
  team?: string;
  provider?: 'AWS Bedrock' | 'OpenAI' | 'Anthropic';
}

/** Item individual de gasto IA (Req 1) */
export interface AISpendItem {
  name: string;
  costUsd: number;
  percentage: number;
  tokens?: number;
  inferences?: number;
  gpuHours?: number;
  groupBy: 'service' | 'team' | 'provider';
}

/** Respuesta de gasto IA (Req 1) */
export interface AISpendResponse {
  totalCost: number;
  breakdown: AISpendItem[];
  filters: CostFilters;
}

/** Fila de Unit Economics (Req 2) */
export interface UnitEconomicsRow {
  serviceName: string;
  totalCostUsd: number;
  transactionsProcessed: number;
  unitCostUsd: number | null;
  weeklyTrend: number[];
  trendDirection: 'up' | 'down' | 'stable';
}

/** Fila de Showback (Req 3) */
export interface ShowbackRow {
  teamName: string;
  cloudCost: number;
  aiCost: number;
  saasCost: number;
  totalCost: number;
  budget: number | null;
  budgetPercentage: number | null;
  efficiencyRatio: number | null;
}

/** Regla de alerta (Req 4) */
export interface AlertRule {
  id: string;
  service: string;
  threshold: number;
  recipient: string;
  createdAt: string;
  updatedAt: string;
}

/** Alerta activa (Req 4) */
export interface Alert {
  id: string;
  ruleId: string;
  service: string;
  threshold: number;
  actualValue: number;
  severity: 'warning' | 'critical';
  triggeredAt: string;
}

/** Registro FOCUS de MegaBill (Req 5) */
export interface FOCUSRecord {
  serviceName: string;
  billedCost: number;
  usageQuantity: number;
  provider: string;
  category: 'cloud' | 'saas' | 'licenses';
}

/** Request de simulación (Req 6) */
export interface SimulationRequest {
  serviceId: string;
  incrementPercentage: number;
}

/** Respuesta de simulación (Req 6) */
export interface SimulationResponse {
  projections: {
    month: number;
    optimistic: number;
    base: number;
    pessimistic: number;
  }[];
  historicalBase: number[];
}

/** Regla de gobernanza (Req 7) */
export interface GovernanceRule {
  id: string;
  resource: string;
  metric: 'cpu' | 'memory' | 'network' | 'disk';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  evaluationPeriodDays: number;
}

/** Recomendación de gobernanza (Req 7) */
export interface Recommendation {
  id: string;
  resourceId: string;
  ruleName: string;
  estimatedSavingsUsd: number;
  suggestedAction: 'resize' | 'delete' | 'reserve';
  status: 'active' | 'implemented';
  implementedAt?: string;
}

/** Respuesta de self-funding (Req 8) */
export interface SelfFundingResponse {
  investmentUsd: number;
  savingsUsd: number;
  selfFundingRatio: number;
  period: string;
}

/** Acción de cost avoidance (Req 9) */
export interface CostAvoidanceAction {
  id: string;
  resource: string;
  actionType: 'revisión arquitectónica' | 'rightsizing preventivo' | 'eliminación de propuesta';
  date: string;
  estimatedSavingsUsd: number;
}

/** Alerta de anomalía (Req 12) */
export interface AnomalyAlert {
  id: string;
  serviceName: string;
  currentAmountUsd: number;
  expectedAmountUsd: number;
  standardDeviations: number;
  severity: 'warning' | 'critical';
  startDate: string;
}
