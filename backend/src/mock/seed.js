#!/usr/bin/env node
'use strict';

/**
 * Seed script for AI Cost Tracker FinOps — Strategy Cockpit.
 * Generates realistic mock data for 6 months of cost history.
 * Idempotent: truncates all tables before inserting.
 *
 * Usage: node backend/src/mock/seed.js
 */

const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Load environment variables from backend/.env if available
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { pool } = require('../config/db');

// =============================================================================
// CONFIGURATION — Mock Data Definitions
// =============================================================================

/** @type {Array<{name: string, budgetMonthly: number|null, department: string}>} */
const TEAMS = [
  { name: 'Célula Vida Digital', budgetMonthly: 25000, department: 'Vida' },
  { name: 'Célula Auto Express', budgetMonthly: 18000, department: 'Autos' },
  { name: 'Célula Siniestros AI', budgetMonthly: 30000, department: 'Siniestros' },
  { name: 'Célula Core Bancario', budgetMonthly: null, department: 'Banca' },
  { name: 'Célula Atención Cliente', budgetMonthly: 15000, department: 'Servicio' },
];

/** AI service definitions with base cost and consumption profiles */
const AI_SERVICES = [
  { name: 'Amazon Titan', provider: 'AWS Bedrock', baseCostDay: 45, tokensPerDay: 120000, inferencesPerDay: 850, gpuHoursPerDay: 0.5 },
  { name: 'Claude (Bedrock)', provider: 'AWS Bedrock', baseCostDay: 72, tokensPerDay: 200000, inferencesPerDay: 1200, gpuHoursPerDay: 0.8 },
  { name: 'GPT-4', provider: 'OpenAI', baseCostDay: 95, tokensPerDay: 350000, inferencesPerDay: 2000, gpuHoursPerDay: 1.2 },
  { name: 'DALL-E 3', provider: 'OpenAI', baseCostDay: 38, tokensPerDay: 0, inferencesPerDay: 500, gpuHoursPerDay: 2.0 },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', baseCostDay: 85, tokensPerDay: 280000, inferencesPerDay: 1800, gpuHoursPerDay: 1.0 },
  { name: 'Haiku', provider: 'Anthropic', baseCostDay: 22, tokensPerDay: 90000, inferencesPerDay: 3000, gpuHoursPerDay: 0.3 },
];

/** Cloud, SaaS, and license services for MegaBill */
const MEGABILL_SERVICES = [
  // Cloud — AWS
  { name: 'EC2 Instances', provider: 'AWS', category: 'cloud', baseCostDay: 180, usageBase: 48 },
  { name: 'S3 Storage', provider: 'AWS', category: 'cloud', baseCostDay: 35, usageBase: 2500 },
  { name: 'Lambda Functions', provider: 'AWS', category: 'cloud', baseCostDay: 28, usageBase: 150000 },
  // Cloud — Azure
  { name: 'Azure VMs', provider: 'Azure', category: 'cloud', baseCostDay: 155, usageBase: 36 },
  { name: 'Azure SQL', provider: 'Azure', category: 'cloud', baseCostDay: 65, usageBase: 12 },
  // Cloud — GCP
  { name: 'GKE Clusters', provider: 'GCP', category: 'cloud', baseCostDay: 120, usageBase: 8 },
  { name: 'BigQuery', provider: 'GCP', category: 'cloud', baseCostDay: 42, usageBase: 500 },
  // SaaS
  { name: 'Datadog', provider: 'Datadog', category: 'saas', baseCostDay: 55, usageBase: 100 },
  { name: 'Confluent Kafka', provider: 'Confluent', category: 'saas', baseCostDay: 48, usageBase: 200 },
  // Licenses
  { name: 'Oracle DB Enterprise', provider: 'Oracle', category: 'licenses', baseCostDay: 95, usageBase: 4 },
  { name: 'ServiceNow Platform', provider: 'ServiceNow', category: 'licenses', baseCostDay: 72, usageBase: 250 },
];

/** Business use cases for unit economics */
const USE_CASES = [
  { name: 'Cotización de póliza', transactionsPerDay: 1200 },
  { name: 'Análisis de siniestro', transactionsPerDay: 350 },
  { name: 'Atención al cliente', transactionsPerDay: 800 },
];

/** Governance rules for mock recommendations */
const GOVERNANCE_RULES_DATA = [
  { resource: 'ec2-i-0a1b2c3d4e5f', metric: 'cpu', operator: 'lt', value: 15, evaluationPeriodDays: 14 },
  { resource: 'azure-vm-prod-001', metric: 'memory', operator: 'lt', value: 20, evaluationPeriodDays: 7 },
  { resource: 'gke-cluster-dev-01', metric: 'cpu', operator: 'lt', value: 10, evaluationPeriodDays: 30 },
  { resource: 'ec2-i-9f8e7d6c5b4a', metric: 'network', operator: 'lt', value: 5, evaluationPeriodDays: 14 },
];

/** Cost avoidance actions */
const AVOIDANCE_ACTIONS = [
  { resource: 'ec2-i-dev-unused-01', actionType: 'revisión arquitectónica', savings: 2400 },
  { resource: 'azure-vm-staging-03', actionType: 'rightsizing preventivo', savings: 1800 },
  { resource: 'gke-node-oversized-02', actionType: 'rightsizing preventivo', savings: 3200 },
  { resource: 's3-bucket-legacy-data', actionType: 'eliminación de propuesta', savings: 950 },
  { resource: 'rds-instance-test-env', actionType: 'revisión arquitectónica', savings: 4100 },
];

/** Resource tags for tagging compliance */
const RESOURCE_TAGS_DATA = [
  { resourceId: 'ec2-i-0a1b2c3d4e5f', team: 'Célula Vida Digital', project: 'Cotizador Web', environment: 'producción', aiUseCase: 'Cotización de póliza' },
  { resourceId: 'azure-vm-prod-001', team: 'Célula Auto Express', project: 'App Móvil Autos', environment: 'producción', aiUseCase: null },
  { resourceId: 'gke-cluster-dev-01', team: 'Célula Siniestros AI', project: 'Análisis Imágenes', environment: 'desarrollo', aiUseCase: 'Análisis de siniestro' },
  { resourceId: 'lambda-chatbot-prod', team: 'Célula Atención Cliente', project: 'Chatbot IA', environment: 'producción', aiUseCase: 'Atención al cliente' },
  { resourceId: 'ec2-i-9f8e7d6c5b4a', team: null, project: null, environment: 'staging', aiUseCase: null },
  { resourceId: 's3-bucket-legacy-data', team: 'Célula Core Bancario', project: 'Migración Core', environment: 'producción', aiUseCase: null },
  { resourceId: 'rds-instance-test-env', team: null, project: 'Testing', environment: 'desarrollo', aiUseCase: null },
  { resourceId: 'bigquery-analytics-01', team: 'Célula Vida Digital', project: 'Analytics', environment: 'producción', aiUseCase: 'Cotización de póliza' },
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generates a date range from startDate to endDate (inclusive).
 * @param {Date} startDate - Start of range
 * @param {Date} endDate - End of range
 * @returns {Date[]} Array of dates
 */
const generateDateRange = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

/**
 * Adds realistic variation to a base value with trend and seasonality.
 * @param {number} baseValue - Base daily cost
 * @param {number} dayIndex - Day number in the range (0-based)
 * @param {number} totalDays - Total days in range
 * @param {object} options - Configuration options
 * @param {number} options.trendFactor - Monthly growth rate (e.g., 0.03 for 3%)
 * @param {number} options.volatility - Random noise factor (0-1)
 * @param {boolean} options.weekendDip - Whether weekends have lower usage
 * @returns {number} Realistic cost for the day
 */
const generateRealisticCost = (baseValue, dayIndex, totalDays, options = {}) => {
  const { trendFactor = 0.03, volatility = 0.15, weekendDip = true } = options;

  // Growth trend over time (compound monthly growth)
  const monthsElapsed = dayIndex / 30;
  const trend = Math.pow(1 + trendFactor, monthsElapsed);

  // Weekly seasonality (lower on weekends)
  const dayOfWeek = (dayIndex % 7);
  let seasonality = 1.0;
  if (weekendDip && (dayOfWeek === 5 || dayOfWeek === 6)) {
    seasonality = 0.6 + (Math.random() * 0.15);
  }

  // Random daily noise
  const noise = 1 + (Math.random() * 2 - 1) * volatility;

  return Math.max(0.01, baseValue * trend * seasonality * noise);
};

/**
 * Injects anomaly spikes into a cost array at random positions.
 * Creates spikes > 2σ above mean for anomaly detection testing.
 * @param {number[]} costs - Array of daily costs
 * @param {number} spikeCount - Number of spikes to inject
 * @returns {number[]} Modified cost array with spikes
 */
const injectAnomalySpikes = (costs, spikeCount) => {
  const result = [...costs];
  const mean = result.reduce((a, b) => a + b, 0) / result.length;
  const variance = result.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / result.length;
  const stddev = Math.sqrt(variance);

  for (let i = 0; i < spikeCount; i++) {
    // Place spikes in the last 60 days (recent data) for meaningful detection
    const minIndex = Math.max(0, result.length - 60);
    const index = minIndex + Math.floor(Math.random() * (result.length - minIndex));
    // Spike between 2.5σ and 4σ above mean
    const spikeMultiplier = 2.5 + (Math.random() * 1.5);
    result[index] = mean + (stddev * spikeMultiplier);
  }

  return result;
};

/**
 * Calculates rolling mean over a window.
 * @param {number[]} values - Data array
 * @param {number} index - Current index
 * @param {number} window - Window size
 * @returns {number|null} Rolling mean or null if insufficient data
 */
const rollingMean = (values, index, window) => {
  if (index < window - 1) return null;
  const slice = values.slice(index - window + 1, index + 1);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
};

/**
 * Calculates rolling standard deviation over a window.
 * @param {number[]} values - Data array
 * @param {number} index - Current index
 * @param {number} window - Window size
 * @returns {number|null} Rolling stddev or null if insufficient data
 */
const rollingStddev = (values, index, window) => {
  if (index < window - 1) return null;
  const slice = values.slice(index - window + 1, index + 1);
  const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
  const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / slice.length;
  return Math.sqrt(variance);
};

/**
 * Formats a Date to ISO date string (YYYY-MM-DD).
 * @param {Date} date
 * @returns {string}
 */
const toDateStr = (date) => date.toISOString().split('T')[0];

// =============================================================================
// SEED FUNCTIONS
// =============================================================================

/**
 * Inserts team records into the database.
 * @param {import('pg').PoolClient} client
 * @returns {Promise<string[]>} Array of team UUIDs
 */
const seedTeams = async (client) => {
  const teamIds = [];
  for (const team of TEAMS) {
    const id = uuidv4();
    teamIds.push(id);
    await client.query(
      'INSERT INTO teams (id, name, budget_monthly, department) VALUES ($1, $2, $3, $4)',
      [id, team.name, team.budgetMonthly, team.department]
    );
  }
  console.log(`  ✓ Inserted ${teamIds.length} teams`);
  return teamIds;
};

/**
 * Generates and inserts AI cost records for 6 months.
 * @param {import('pg').PoolClient} client
 * @param {string[]} teamIds - Array of team UUIDs
 * @param {Date[]} dates - Array of dates to generate data for
 * @returns {Promise<Map<string, number[]>>} Map of service name to daily costs
 */
const seedAICosts = async (client, teamIds, dates) => {
  const serviceCosts = new Map();
  let totalRecords = 0;

  for (const service of AI_SERVICES) {
    const dailyCosts = [];

    for (let i = 0; i < dates.length; i++) {
      const cost = generateRealisticCost(service.baseCostDay, i, dates.length, {
        trendFactor: 0.04,
        volatility: 0.2,
        weekendDip: true,
      });

      dailyCosts.push(cost);

      const teamId = teamIds[Math.floor(Math.random() * teamIds.length)];
      const tokens = service.tokensPerDay > 0
        ? Math.round(service.tokensPerDay * (0.7 + Math.random() * 0.6))
        : 0;
      const inferences = Math.round(service.inferencesPerDay * (0.7 + Math.random() * 0.6));
      const gpuHours = parseFloat((service.gpuHoursPerDay * (0.5 + Math.random() * 1.0)).toFixed(2));

      await client.query(
        `INSERT INTO ai_costs (id, service_name, provider, team_id, cost_usd, tokens, inferences, gpu_hours, cost_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [uuidv4(), service.name, service.provider, teamId, cost.toFixed(2), tokens, inferences, gpuHours, toDateStr(dates[i])]
      );
      totalRecords++;
    }

    // Inject 2-3 anomaly spikes per service for anomaly detection testing
    const spikedCosts = injectAnomalySpikes(dailyCosts, 2 + Math.floor(Math.random() * 2));
    serviceCosts.set(service.name, spikedCosts);
  }

  console.log(`  ✓ Inserted ${totalRecords} AI cost records`);
  return serviceCosts;
};

/**
 * Generates and inserts MegaBill cost records for 6 months.
 * @param {import('pg').PoolClient} client
 * @param {Date[]} dates - Array of dates to generate data for
 */
const seedMegabillCosts = async (client, dates) => {
  let totalRecords = 0;

  for (const service of MEGABILL_SERVICES) {
    for (let i = 0; i < dates.length; i++) {
      const cost = generateRealisticCost(service.baseCostDay, i, dates.length, {
        trendFactor: 0.02,
        volatility: 0.12,
        weekendDip: service.category === 'cloud',
      });
      const usage = Math.round(service.usageBase * (0.8 + Math.random() * 0.4));

      await client.query(
        `INSERT INTO megabill_costs (id, service_name, billed_cost, usage_quantity, provider, category, cost_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), service.name, cost.toFixed(2), usage, service.provider, service.category, toDateStr(dates[i])]
      );
      totalRecords++;
    }
  }

  console.log(`  ✓ Inserted ${totalRecords} MegaBill cost records`);
};

/**
 * Generates and inserts daily cost stats with rolling mean/stddev.
 * Uses the spiked costs from AI cost generation.
 * @param {import('pg').PoolClient} client
 * @param {Map<string, number[]>} serviceCosts - Map of service to daily costs (with spikes)
 * @param {Date[]} dates - Array of dates
 */
const seedDailyCostStats = async (client, serviceCosts, dates) => {
  let totalRecords = 0;
  const WINDOW = 28;

  for (const [serviceName, costs] of serviceCosts.entries()) {
    for (let i = 0; i < costs.length; i++) {
      const mean28d = rollingMean(costs, i, WINDOW);
      const stddev28d = rollingStddev(costs, i, WINDOW);

      await client.query(
        `INSERT INTO daily_cost_stats (id, service_name, stat_date, daily_cost, mean_28d, stddev_28d)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [uuidv4(), serviceName, toDateStr(dates[i]), costs[i].toFixed(2), mean28d ? mean28d.toFixed(4) : null, stddev28d ? stddev28d.toFixed(4) : null]
      );
      totalRecords++;
    }
  }

  console.log(`  ✓ Inserted ${totalRecords} daily cost stats records`);
};

/**
 * Generates and inserts unit economics records (weekly periods).
 * @param {import('pg').PoolClient} client
 * @param {Date[]} dates - Array of dates
 */
const seedUnitEconomics = async (client, dates) => {
  let totalRecords = 0;

  // Generate weekly periods for the last 6 months
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];
  const current = new Date(startDate);

  while (current < endDate) {
    const periodEnd = new Date(current);
    periodEnd.setDate(periodEnd.getDate() + 6);
    if (periodEnd > endDate) break;

    for (const useCase of USE_CASES) {
      // Pair each use case with 2 AI services
      const serviceIndex = USE_CASES.indexOf(useCase) * 2;
      const service = AI_SERVICES[serviceIndex % AI_SERVICES.length];

      const weekIndex = Math.floor((current - startDate) / (7 * 24 * 60 * 60 * 1000));
      const weeklyCost = generateRealisticCost(service.baseCostDay * 7, weekIndex, 26, {
        trendFactor: 0.03,
        volatility: 0.1,
        weekendDip: false,
      });
      const transactions = Math.round(
        useCase.transactionsPerDay * 7 * (0.8 + Math.random() * 0.4)
      );

      await client.query(
        `INSERT INTO unit_economics (id, service_name, use_case, total_cost_usd, transactions_processed, period_start, period_end)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), service.name, useCase.name, weeklyCost.toFixed(2), transactions, toDateStr(current), toDateStr(periodEnd)]
      );
      totalRecords++;
    }

    current.setDate(current.getDate() + 7);
  }

  console.log(`  ✓ Inserted ${totalRecords} unit economics records`);
};

/**
 * Seeds alert rules and generates some alert history.
 * @param {import('pg').PoolClient} client
 */
const seedAlerts = async (client) => {
  const userId = uuidv4();
  const ruleIds = [];

  const alertRules = [
    { service: 'GPT-4', threshold: 2800, recipient: 'finops@segurosbolivar.com' },
    { service: 'Claude 3.5 Sonnet', threshold: 2500, recipient: 'finops@segurosbolivar.com' },
    { service: 'EC2 Instances', threshold: 5500, recipient: 'infra@segurosbolivar.com' },
    { service: 'Datadog', threshold: 1700, recipient: 'observability@segurosbolivar.com' },
  ];

  for (const rule of alertRules) {
    const id = uuidv4();
    ruleIds.push({ id, ...rule });
    await client.query(
      `INSERT INTO alert_rules (id, user_id, service, threshold, recipient)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, userId, rule.service, rule.threshold, rule.recipient]
    );
  }

  // Generate some historical alerts (last 30 days)
  let historyCount = 0;
  for (const rule of ruleIds) {
    const alertCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < alertCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const triggeredAt = new Date();
      triggeredAt.setDate(triggeredAt.getDate() - daysAgo);
      const exceeds = rule.threshold * (1.0 + Math.random() * 0.3);
      const severity = exceeds >= rule.threshold ? 'critical' : 'warning';

      await client.query(
        `INSERT INTO alert_history (id, rule_id, service, threshold, actual_value, severity, triggered_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), rule.id, rule.service, rule.threshold, exceeds.toFixed(2), severity, triggeredAt.toISOString()]
      );
      historyCount++;
    }
  }

  console.log(`  ✓ Inserted ${ruleIds.length} alert rules and ${historyCount} alert history records`);
};

/**
 * Seeds governance rules and recommendations.
 * @param {import('pg').PoolClient} client
 */
const seedGovernance = async (client) => {
  const ruleIds = [];

  for (const rule of GOVERNANCE_RULES_DATA) {
    const id = uuidv4();
    ruleIds.push(id);
    await client.query(
      `INSERT INTO governance_rules (id, resource, metric, operator, value, evaluation_period_days, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, rule.resource, rule.metric, rule.operator, rule.value, rule.evaluationPeriodDays, true]
    );
  }

  // Generate recommendations for each rule
  const recommendations = [
    { ruleIndex: 0, resourceId: 'ec2-i-0a1b2c3d4e5f', ruleName: 'CPU underutilized EC2', savings: 450, action: 'resize', status: 'active' },
    { ruleIndex: 1, resourceId: 'azure-vm-prod-001', ruleName: 'Memory underused Azure VM', savings: 320, action: 'resize', status: 'active' },
    { ruleIndex: 2, resourceId: 'gke-cluster-dev-01', ruleName: 'Idle GKE dev cluster', savings: 890, action: 'delete', status: 'active' },
    { ruleIndex: 3, resourceId: 'ec2-i-9f8e7d6c5b4a', ruleName: 'Low network EC2', savings: 280, action: 'reserve', status: 'active' },
    { ruleIndex: 0, resourceId: 'ec2-i-old-instance-02', ruleName: 'CPU underutilized EC2', savings: 520, action: 'resize', status: 'implemented' },
  ];

  for (const rec of recommendations) {
    const implementedAt = rec.status === 'implemented' ? new Date().toISOString() : null;
    await client.query(
      `INSERT INTO recommendations (id, rule_id, resource_id, rule_name, estimated_savings_usd, suggested_action, status, implemented_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [uuidv4(), ruleIds[rec.ruleIndex], rec.resourceId, rec.ruleName, rec.savings, rec.action, rec.status, implementedAt]
    );
  }

  console.log(`  ✓ Inserted ${ruleIds.length} governance rules and ${recommendations.length} recommendations`);
};

/**
 * Seeds resource tags.
 * @param {import('pg').PoolClient} client
 */
const seedResourceTags = async (client) => {
  for (const tag of RESOURCE_TAGS_DATA) {
    await client.query(
      `INSERT INTO resource_tags (id, resource_id, team, project, environment, ai_use_case)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [uuidv4(), tag.resourceId, tag.team, tag.project, tag.environment, tag.aiUseCase]
    );
  }
  console.log(`  ✓ Inserted ${RESOURCE_TAGS_DATA.length} resource tags`);
};

/**
 * Seeds cost avoidance actions across the last 4 months.
 * @param {import('pg').PoolClient} client
 */
const seedCostAvoidance = async (client) => {
  let totalRecords = 0;

  for (const action of AVOIDANCE_ACTIONS) {
    // Distribute actions across last 4 months
    const monthsAgo = Math.floor(Math.random() * 4);
    const dayInMonth = 1 + Math.floor(Math.random() * 27);
    const actionDate = new Date();
    actionDate.setMonth(actionDate.getMonth() - monthsAgo);
    actionDate.setDate(dayInMonth);

    await client.query(
      `INSERT INTO cost_avoidance (id, resource, action_type, action_date, estimated_savings_usd)
       VALUES ($1, $2, $3, $4, $5)`,
      [uuidv4(), action.resource, action.actionType, toDateStr(actionDate), action.savings]
    );
    totalRecords++;
  }

  console.log(`  ✓ Inserted ${totalRecords} cost avoidance records`);
};

// =============================================================================
// MAIN SEED EXECUTION
// =============================================================================

/**
 * Truncates all tables to ensure idempotent seeding.
 * @param {import('pg').PoolClient} client
 */
const truncateAllTables = async (client) => {
  await client.query(`
    TRUNCATE TABLE
      alert_history,
      recommendations,
      alert_rules,
      governance_rules,
      ai_costs,
      megabill_costs,
      daily_cost_stats,
      unit_economics,
      cost_avoidance,
      resource_tags,
      teams
    CASCADE
  `);
  console.log('  ✓ All tables truncated');
};

/**
 * Main seed function — orchestrates all data generation.
 * Runs within a transaction for atomicity.
 */
const seed = async () => {
  console.log('\n🌱 Starting AI Cost Tracker FinOps seed...\n');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Step 1: Clean slate
    console.log('[1/8] Truncating existing data...');
    await truncateAllTables(client);

    // Step 2: Date range — last 6 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    const dates = generateDateRange(startDate, endDate);
    console.log(`\n[2/8] Date range: ${toDateStr(startDate)} to ${toDateStr(endDate)} (${dates.length} days)\n`);

    // Step 3: Teams
    console.log('[3/8] Seeding teams...');
    const teamIds = await seedTeams(client);

    // Step 4: AI Costs (+ generates cost data for daily_cost_stats)
    console.log('\n[4/8] Seeding AI costs (6 services × ~180 days)...');
    const serviceCosts = await seedAICosts(client, teamIds, dates);

    // Step 5: MegaBill Costs
    console.log('\n[5/8] Seeding MegaBill costs (11 services × ~180 days)...');
    await seedMegabillCosts(client, dates);

    // Step 6: Daily Cost Stats (with rolling statistics)
    console.log('\n[6/8] Seeding daily cost stats with rolling mean/stddev...');
    await seedDailyCostStats(client, serviceCosts, dates);

    // Step 7: Unit Economics
    console.log('\n[7/8] Seeding unit economics (weekly periods)...');
    await seedUnitEconomics(client, dates);

    // Step 8: Supporting data
    console.log('\n[8/8] Seeding alerts, governance, tags, cost avoidance...');
    await seedAlerts(client);
    await seedGovernance(client);
    await seedResourceTags(client);
    await seedCostAvoidance(client);

    await client.query('COMMIT');
    console.log('\n✅ Seed completed successfully!\n');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Seed failed, transaction rolled back:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Execute seed
seed().catch((error) => {
  console.error('Fatal seed error:', error.message);
  process.exit(1);
});
