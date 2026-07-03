-- =============================================================================
-- AI Cost Tracker FinOps — Database Schema
-- Strategy Cockpit for Seguros Bolívar
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    budget_monthly DECIMAL(12, 2),
    department VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    team_id UUID NOT NULL REFERENCES teams(id),
    cost_usd DECIMAL(12, 2) NOT NULL,
    tokens INTEGER,
    inferences INTEGER,
    gpu_hours DECIMAL(8, 2),
    cost_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS megabill_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(100) NOT NULL,
    billed_cost DECIMAL(12, 2) NOT NULL,
    usage_quantity DECIMAL(12, 2) NOT NULL DEFAULT 0,
    provider VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('cloud', 'saas', 'licenses')),
    cost_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    service VARCHAR(100) NOT NULL,
    threshold DECIMAL(12, 2) NOT NULL CHECK (threshold >= 0.01 AND threshold <= 999999999.99),
    recipient VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL REFERENCES alert_rules(id),
    service VARCHAR(100) NOT NULL,
    threshold DECIMAL(12, 2) NOT NULL,
    actual_value DECIMAL(12, 2) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('warning', 'critical')),
    triggered_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS governance_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource VARCHAR(100) NOT NULL,
    metric VARCHAR(20) NOT NULL CHECK (metric IN ('cpu', 'memory', 'network', 'disk')),
    operator VARCHAR(5) NOT NULL CHECK (operator IN ('gt', 'lt', 'eq', 'gte', 'lte')),
    value DECIMAL(12, 2) NOT NULL,
    evaluation_period_days INTEGER NOT NULL CHECK (evaluation_period_days BETWEEN 1 AND 90),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL REFERENCES governance_rules(id),
    resource_id VARCHAR(100) NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    estimated_savings_usd DECIMAL(12, 2) NOT NULL,
    suggested_action VARCHAR(20) NOT NULL CHECK (suggested_action IN ('resize', 'delete', 'reserve')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'implemented')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    implemented_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resource_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id VARCHAR(100) NOT NULL,
    team VARCHAR(50),
    project VARCHAR(50),
    environment VARCHAR(20) CHECK (environment IN ('desarrollo', 'staging', 'producción')),
    ai_use_case VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cost_avoidance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_date DATE NOT NULL,
    estimated_savings_usd DECIMAL(12, 2) NOT NULL CHECK (estimated_savings_usd >= 0.01 AND estimated_savings_usd <= 999999999.99),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_cost_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(100) NOT NULL,
    stat_date DATE NOT NULL,
    daily_cost DECIMAL(12, 2) NOT NULL,
    mean_28d DECIMAL(12, 4),
    stddev_28d DECIMAL(12, 4)
);

CREATE TABLE IF NOT EXISTS unit_economics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(100) NOT NULL,
    use_case VARCHAR(100) NOT NULL,
    total_cost_usd DECIMAL(12, 2) NOT NULL,
    transactions_processed INTEGER NOT NULL DEFAULT 0,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_ai_costs_date_team ON ai_costs (cost_date, team_id);
CREATE INDEX IF NOT EXISTS idx_ai_costs_provider ON ai_costs (provider, cost_date);
CREATE INDEX IF NOT EXISTS idx_megabill_category ON megabill_costs (category, cost_date);
CREATE INDEX IF NOT EXISTS idx_alert_history_date ON alert_history (triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_status ON recommendations (status, estimated_savings_usd DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_service ON daily_cost_stats (service_name, stat_date);
CREATE INDEX IF NOT EXISTS idx_tags_resource ON resource_tags (resource_id);
