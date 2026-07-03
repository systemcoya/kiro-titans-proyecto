#!/usr/bin/env node
'use strict';

/**
 * Mock server that serves realistic data from the Showback simulation Excel
 * for the "Venta de Pólizas de Autos" application.
 * Runs standalone without PostgreSQL — perfect for frontend testing.
 *
 * Usage: node backend/src/mock/mock-server.js
 * Serves on port 3000 (matches frontend default VITE_API_URL)
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// ============================================================================
// DATA FROM EXCEL: Costos de Infra
// ============================================================================

const INFRA_COSTS = [
  { mes: '2026-01', proveedor: 'AWS', servicio: 'EC2 Cómputo', costo: 600, producto: 'Autos verde', cc: '5100' },
  { mes: '2026-01', proveedor: 'AWS', servicio: 'RDS Base de Datos', costo: 400, producto: 'Autos verde', cc: '5100' },
  { mes: '2026-01', proveedor: 'GCP', servicio: 'Cloud Storage', costo: 150, producto: 'Autos verde', cc: '5100' },
  { mes: '2026-01', proveedor: 'AWS', servicio: 'EC2 Cómputo', costo: 400, producto: 'Autos ligeros', cc: '5101' },
  { mes: '2026-01', proveedor: 'AWS', servicio: 'RDS Base de Datos', costo: 300, producto: 'Autos ligeros', cc: '5101' },
  { mes: '2026-01', proveedor: 'GCP', servicio: 'Cloud Storage', costo: 120, producto: 'Autos ligeros', cc: '5101' },
  { mes: '2026-01', proveedor: 'AWS', servicio: 'EC2 Cómputo', costo: 200, producto: 'Vehiculos pesados', cc: '5102' },
  { mes: '2026-01', proveedor: 'AWS', servicio: 'RDS Base de Datos', costo: 100, producto: 'Vehiculos pesados', cc: '5102' },
  { mes: '2026-01', proveedor: 'GCP', servicio: 'BigQuery Analítica', costo: 600, producto: 'Corporativo', cc: 'General' },
];

// More months of infra (summarized per month for brevity — totals match Excel)
const INFRA_MONTHLY_TOTALS = {
  '2026-01': 2870, '2026-02': 3010, '2026-03': 3270, '2026-04': 3380,
  '2026-05': 3500, '2026-06': 3670, '2026-07': 3570, '2026-08': 3770,
  '2026-09': 3880, '2026-10': 4060, '2026-11': 4180, '2026-12': 4460,
};

// ============================================================================
// DATA FROM EXCEL: Costos AI
// ============================================================================

const AI_COSTS = [
  { mes: '2026-01', proveedor: 'AWS', servicio: 'Bedrock (Claude 3)', cc: '5100', producto: 'Autos verde', llamadas: 32000, tokens: 96000000, costo: 960 },
  { mes: '2026-01', proveedor: 'GCP', servicio: 'Vertex AI (Gemini Flash)', cc: '5101', producto: 'Autos ligeros', llamadas: 50000, tokens: 150000000, costo: 450 },
  { mes: '2026-01', proveedor: 'GCP', servicio: 'Vertex AI (Gemini Pro)', cc: '5102', producto: 'Vehículos pesados', llamadas: 11000, tokens: 44000000, costo: 660 },
  { mes: '2026-06', proveedor: 'AWS', servicio: 'Bedrock (Claude 3)', cc: '5100', producto: 'Autos verde', llamadas: 45000, tokens: 135000000, costo: 1350 },
  { mes: '2026-06', proveedor: 'GCP', servicio: 'Vertex AI (Gemini Flash)', cc: '5101', producto: 'Autos ligeros', llamadas: 65000, tokens: 195000000, costo: 585 },
  { mes: '2026-06', proveedor: 'GCP', servicio: 'Vertex AI (Gemini Pro)', cc: '5102', producto: 'Vehículos pesados', llamadas: 15000, tokens: 60000000, costo: 900 },
];

// Historical AI data for trends
const AI_HISTORICAL = [
  { mes: '2024-01', proveedor: 'AWS', servicio: 'Bedrock (Claude 3)', costo: 450, tokens: 45000000, llamadas: 15000 },
  { mes: '2024-06', proveedor: 'AWS', servicio: 'Bedrock (Claude 3)', costo: 540, tokens: 54000000, llamadas: 18000 },
  { mes: '2024-12', proveedor: 'AWS', servicio: 'Bedrock (Claude 3)', costo: 660, tokens: 66000000, llamadas: 22000 },
  { mes: '2025-01', proveedor: 'AWS', servicio: 'Bedrock (Claude 3)', costo: 720, tokens: 72000000, llamadas: 24000 },
  { mes: '2025-06', proveedor: 'AWS', servicio: 'Bedrock (Claude 3)', costo: 780, tokens: 78000000, llamadas: 26000 },
  { mes: '2025-12', proveedor: 'AWS', servicio: 'Bedrock (Claude 3)', costo: 900, tokens: 90000000, llamadas: 30000 },
  { mes: '2026-01', proveedor: 'AWS', servicio: 'Bedrock (Claude 3)', costo: 960, tokens: 96000000, llamadas: 32000 },
  { mes: '2026-06', proveedor: 'AWS', servicio: 'Bedrock (Claude 3)', costo: 1350, tokens: 135000000, llamadas: 45000 },
];

// ============================================================================
// DATA FROM EXCEL: Otros Costos (SaaS)
// ============================================================================

const SAAS_COSTS_2026_01 = [
  { proveedor: 'Twilio', servicio: 'Notificaciones SMS y WhatsApp', costo: 580, unidades: 58000 },
  { proveedor: 'Stripe', servicio: 'Pasarela de Pagos', costo: 1530, unidades: 1500 },
  { proveedor: 'Datadog', servicio: 'Observabilidad y Monitoreo', costo: 520, unidades: 1 },
  { proveedor: 'Cloudflare', servicio: 'WAF y Seguridad DDoS', costo: 200, unidades: 1 },
  { proveedor: 'Mati / KYC', servicio: 'Validación de Identidad', costo: 750, unidades: 1500 },
];

const SAAS_COSTS_2026_06 = [
  { proveedor: 'Twilio', servicio: 'Notificaciones SMS y WhatsApp', costo: 1000, unidades: 100000 },
  { proveedor: 'Stripe', servicio: 'Pasarela de Pagos', costo: 2790, unidades: 2800 },
  { proveedor: 'Datadog', servicio: 'Observabilidad y Monitoreo', costo: 650, unidades: 1 },
  { proveedor: 'Cloudflare', servicio: 'WAF y Seguridad DDoS', costo: 250, unidades: 1 },
  { proveedor: 'Mati / KYC', servicio: 'Validación de Identidad', costo: 1400, unidades: 2800 },
];

// ============================================================================
// DATA FROM EXCEL: Pólizas emitidas
// ============================================================================

const POLIZAS = [
  { mes: '2026-01', producto: 'Autos verde', cc: '5100', polizas: 800, primas: 24000 },
  { mes: '2026-01', producto: 'Autos ligeros', cc: '5101', polizas: 500, primas: 15000 },
  { mes: '2026-01', producto: 'Vehiculos pesados', cc: '5102', polizas: 200, primas: 6000 },
  { mes: '2026-06', producto: 'Autos verde', cc: '5100', polizas: 1500, primas: 45000 },
  { mes: '2026-06', producto: 'Autos ligeros', cc: '5101', polizas: 1000, primas: 30000 },
  { mes: '2026-06', producto: 'Vehiculos pesados', cc: '5102', polizas: 300, primas: 9000 },
  { mes: '2026-12', producto: 'Autos verde', cc: '5100', polizas: 2100, primas: 63000 },
  { mes: '2026-12', producto: 'Autos ligeros', cc: '5101', polizas: 1400, primas: 42000 },
  { mes: '2026-12', producto: 'Vehiculos pesados', cc: '5102', polizas: 500, primas: 15000 },
];

// Teams / Centros de costo
const TEAMS = [
  { id: '5100', name: 'Autos verde', budget: 3000 },
  { id: '5101', name: 'Autos ligeros', budget: 2500 },
  { id: '5102', name: 'Vehículos pesados', budget: 1500 },
  { id: 'General', name: 'Corporativo', budget: null },
];

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), mode: 'mock' });
});

// --- AI Spend (Req 1) ---
app.get('/api/v1/costs/ai-spend', (req, res) => {
  const allCosts = [...AI_COSTS, ...AI_HISTORICAL];
  const grouped = {};
  allCosts.forEach((c) => {
    const key = c.servicio;
    if (!grouped[key]) grouped[key] = { name: key, costUsd: 0, tokens: 0, inferences: 0, gpuHours: 0 };
    grouped[key].costUsd += c.costo;
    grouped[key].tokens += c.tokens;
    grouped[key].inferences += c.llamadas;
  });
  const items = Object.values(grouped);
  const totalCost = items.reduce((s, i) => s + i.costUsd, 0);
  const breakdown = items.map((i) => ({
    ...i,
    percentage: parseFloat(((i.costUsd / totalCost) * 100).toFixed(1)),
    gpuHours: parseFloat((i.costUsd * 0.01).toFixed(2)),
    groupBy: 'service',
  }));

  res.json({ totalCost, breakdown, filters: { startDate: '2024-01-01', endDate: '2026-06-30' } });
});

app.post('/api/v1/costs/ai-spend/advance', (req, res) => {
  res.status(201).json({ message: 'Temporal advance completed', recordsCreated: 3, simulatedTime: new Date().toISOString() });
});

// --- Unit Economics (Req 2) ---
app.get('/api/v1/costs/unit-economics', (req, res) => {
  const polizasJun = POLIZAS.filter((p) => p.mes === '2026-06');
  const aiJun = AI_COSTS.filter((c) => c.mes === '2026-06');
  const data = aiJun.map((ai, i) => {
    const pol = polizasJun[i] || { polizas: 0 };
    const unitCost = pol.polizas > 0 ? parseFloat((ai.costo / pol.polizas).toFixed(4)) : null;
    return {
      serviceName: ai.servicio,
      useCase: `Cotización ${ai.producto}`,
      totalCostUsd: ai.costo,
      transactionsProcessed: pol.polizas,
      unitCostUsd: unitCost,
      weeklyTrend: [0.8, 0.85, 0.82, 0.9, 0.88, 0.92, 0.95, unitCost || 0.9],
      trendDirection: 'up',
    };
  });
  res.json({ data, period: { startDate: '2026-06-01', endDate: '2026-06-30' } });
});

// --- Showback (Req 3) ---
app.get('/api/v1/costs/showback', (req, res) => {
  const teams = TEAMS.map((t) => {
    const aiCost = AI_COSTS.filter((c) => c.mes === '2026-06' && c.cc === t.id).reduce((s, c) => s + c.costo, 0);
    const infraCost = INFRA_COSTS.filter((c) => c.cc === t.id).reduce((s, c) => s + c.costo, 0);
    const saasCost = t.id === 'General' ? SAAS_COSTS_2026_06.reduce((s, c) => s + c.costo, 0) : 0;
    const totalCost = parseFloat((aiCost + infraCost + saasCost).toFixed(2));
    const budgetPercentage = t.budget ? parseFloat(((totalCost / t.budget) * 100).toFixed(1)) : null;
    const efficiencyRatio = t.budget ? parseFloat((totalCost / t.budget).toFixed(2)) : null;
    return {
      teamName: t.name,
      cloudCost: infraCost,
      aiCost,
      saasCost,
      totalCost,
      budget: t.budget,
      budgetPercentage,
      efficiencyRatio,
      overBudget: budgetPercentage !== null && budgetPercentage > 100,
    };
  });
  const ranking = teams.filter((t) => t.budget !== null).sort((a, b) => a.efficiencyRatio - b.efficiencyRatio);
  res.json({ teams, ranking });
});

// --- Alerts (Req 4) ---
app.get('/api/v1/alerts/active', (req, res) => {
  res.json({
    alerts: [
      { id: uuidv4(), ruleId: 'r1', service: 'Bedrock (Claude 3)', threshold: 1000, actualValue: 1350, severity: 'critical', triggeredAt: '2026-06-28T10:00:00Z' },
      { id: uuidv4(), ruleId: 'r2', service: 'EC2 Cómputo', threshold: 700, actualValue: 800, severity: 'critical', triggeredAt: '2026-06-27T14:30:00Z' },
      { id: uuidv4(), ruleId: 'r3', service: 'Vertex AI (Gemini Pro)', threshold: 800, actualValue: 700, severity: 'warning', triggeredAt: '2026-06-26T09:00:00Z' },
    ],
    total: 3,
  });
});

app.get('/api/v1/alerts/rules', (req, res) => {
  res.json([
    { id: 'r1', service: 'Bedrock (Claude 3)', threshold: 1000, recipient: 'finops@segurosbolivar.com', createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' },
    { id: 'r2', service: 'EC2 Cómputo', threshold: 700, recipient: 'infra@segurosbolivar.com', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'r3', service: 'Vertex AI (Gemini Pro)', threshold: 800, recipient: 'finops@segurosbolivar.com', createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z' },
  ]);
});

app.post('/api/v1/alerts/rules', (req, res) => { res.status(201).json({ id: uuidv4(), ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); });
app.delete('/api/v1/alerts/rules/:id', (req, res) => { res.status(204).send(); });
app.get('/api/v1/alerts/history', (req, res) => { res.json({ alerts: [], total: 0, page: 1 }); });

// --- MegaBill (Req 5) ---
app.get('/api/v1/costs/megabill', (req, res) => {
  const cloudTotal = 3670; // Jun 2026 infra total
  const saasTotal = SAAS_COSTS_2026_06.reduce((s, c) => s + c.costo, 0);
  const aiTotal = AI_COSTS.filter((c) => c.mes === '2026-06').reduce((s, c) => s + c.costo, 0);
  const total = cloudTotal + saasTotal + aiTotal;
  res.json({
    totalCost: total,
    categories: [
      { category: 'cloud', totalCost: cloudTotal, percentage: parseFloat(((cloudTotal / total) * 100).toFixed(1)) },
      { category: 'saas', totalCost: saasTotal, percentage: parseFloat(((saasTotal / total) * 100).toFixed(1)) },
      { category: 'licenses', totalCost: aiTotal, percentage: parseFloat(((aiTotal / total) * 100).toFixed(1)) },
    ],
  });
});

app.get('/api/v1/costs/megabill/:category', (req, res) => {
  const { category } = req.params;
  if (category === 'cloud') {
    res.json({ category, totalCost: 3670, services: [
      { serviceName: 'EC2 Cómputo', billedCost: 800, usageQuantity: 48, provider: 'AWS' },
      { serviceName: 'RDS Base de Datos', billedCost: 490, usageQuantity: 12, provider: 'AWS' },
      { serviceName: 'Cloud Storage', billedCost: 210, usageQuantity: 2500, provider: 'GCP' },
      { serviceName: 'BigQuery Analítica', billedCost: 720, usageQuantity: 500, provider: 'GCP' },
      { serviceName: 'EC2 Ligeros', billedCost: 540, usageQuantity: 36, provider: 'AWS' },
      { serviceName: 'RDS Ligeros', billedCost: 370, usageQuantity: 8, provider: 'AWS' },
      { serviceName: 'EC2 Pesados', billedCost: 260, usageQuantity: 12, provider: 'AWS' },
      { serviceName: 'RDS Pesados', billedCost: 120, usageQuantity: 4, provider: 'AWS' },
      { serviceName: 'Cloud Storage Ligeros', billedCost: 160, usageQuantity: 1500, provider: 'GCP' },
    ]});
  } else if (category === 'saas') {
    res.json({ category, totalCost: 6090, services: SAAS_COSTS_2026_06.map((s) => ({
      serviceName: s.servicio, billedCost: s.costo, usageQuantity: s.unidades, provider: s.proveedor,
    }))});
  } else {
    res.json({ category, totalCost: 2835, services: AI_COSTS.filter((c) => c.mes === '2026-06').map((c) => ({
      serviceName: c.servicio, billedCost: c.costo, usageQuantity: c.llamadas, provider: c.proveedor,
    }))});
  }
});

// --- Simulator (Req 6) ---
app.post('/api/v1/simulator/projection', (req, res) => {
  const { incrementPercentage = 50 } = req.body;
  const baseCost = 1350; // Bedrock Claude 3 Jun 2026
  const factor = 1 + incrementPercentage / 100;
  res.json({
    projections: [
      { month: 1, optimistic: Math.round(baseCost * factor * 0.85), base: Math.round(baseCost * factor), pessimistic: Math.round(baseCost * factor * 1.2) },
      { month: 3, optimistic: Math.round(baseCost * factor * 3 * 0.85), base: Math.round(baseCost * factor * 3), pessimistic: Math.round(baseCost * factor * 3 * 1.2) },
      { month: 6, optimistic: Math.round(baseCost * factor * 6 * 0.85), base: Math.round(baseCost * factor * 6), pessimistic: Math.round(baseCost * factor * 6 * 1.2) },
    ],
    historicalBase: [450, 540, 660, 720, 780, 900, 960, 1350],
  });
});

// --- Governance (Req 7) ---
app.get('/api/v1/governance/rules', (req, res) => {
  res.json([
    { id: 'g1', resource: 'EC2 i-0a1b2c (Autos verde)', metric: 'cpu', operator: 'lt', value: 15, evaluationPeriodDays: 14 },
    { id: 'g2', resource: 'RDS db-prod-01', metric: 'memory', operator: 'lt', value: 20, evaluationPeriodDays: 7 },
    { id: 'g3', resource: 'GKE cluster-dev', metric: 'cpu', operator: 'lt', value: 10, evaluationPeriodDays: 30 },
  ]);
});

app.get('/api/v1/governance/recommendations', (req, res) => {
  res.json({
    recommendations: [
      { id: 'rec1', resourceId: 'EC2 i-0a1b2c', ruleName: 'CPU < 15% por 14 días', estimatedSavingsUsd: 280, suggestedAction: 'resize', status: 'active' },
      { id: 'rec2', resourceId: 'RDS db-dev-02', ruleName: 'Memoria < 20% por 7 días', estimatedSavingsUsd: 180, suggestedAction: 'delete', status: 'active' },
      { id: 'rec3', resourceId: 'GKE cluster-dev', ruleName: 'CPU < 10% por 30 días', estimatedSavingsUsd: 450, suggestedAction: 'delete', status: 'active' },
      { id: 'rec4', resourceId: 'EC2 i-old-legacy', ruleName: 'CPU < 15% por 14 días', estimatedSavingsUsd: 320, suggestedAction: 'reserve', status: 'implemented', implementedAt: '2026-05-15T00:00:00Z' },
    ],
    totalEstimatedSavings: 910,
  });
});

app.patch('/api/v1/governance/recommendations/:id/implement', (req, res) => { res.json({ status: 'implemented' }); });

// --- Self-Funding (Req 8) ---
app.get('/api/v1/self-funding', (req, res) => {
  const investment = AI_COSTS.filter((c) => c.mes === '2026-06').reduce((s, c) => s + c.costo, 0); // 2835
  const savings = 910 + 1230; // governance + cost avoidance
  const ratio = parseFloat(((savings / investment) * 100).toFixed(2));
  res.json({ investmentUsd: investment, savingsUsd: savings, selfFundingRatio: ratio, period: req.query.period || 'total' });
});

// --- Cost Avoidance (Req 9) ---
app.get('/api/v1/cost-avoidance', (req, res) => {
  const actions = [
    { id: uuidv4(), resource: 'EC2 i-dev-unused-01', actionType: 'revisión arquitectónica', date: '2026-06-10', estimatedSavingsUsd: 480 },
    { id: uuidv4(), resource: 'RDS staging-oversized', actionType: 'rightsizing preventivo', date: '2026-06-15', estimatedSavingsUsd: 350 },
    { id: uuidv4(), resource: 'GKE cluster-test-02', actionType: 'eliminación de propuesta', date: '2026-06-20', estimatedSavingsUsd: 400 },
  ];
  res.json({ actions, totalSavings: actions.reduce((s, a) => s + a.estimatedSavingsUsd, 0) });
});

app.post('/api/v1/cost-avoidance', (req, res) => { res.status(201).json({ id: uuidv4(), ...req.body }); });

// --- Executive Dashboard (Req 10) ---
app.get('/api/v1/executive/dashboard', (req, res) => {
  const currentMonth = 3670 + 2835 + 6090; // infra + AI + SaaS Jun 2026
  const previousMonth = 3500 + 2070 + 4200; // approx May 2026
  const variation = parseFloat((((currentMonth - previousMonth) / previousMonth) * 100).toFixed(1));
  res.json({
    currentMonthSpend: currentMonth,
    previousMonthSpend: previousMonth,
    variationPercentage: variation,
    top5Services: [
      { name: 'Bedrock (Claude 3)', cost: 1350 },
      { name: 'Stripe Pagos', cost: 2790 },
      { name: 'Mati / KYC', cost: 1400 },
      { name: 'Vertex AI (Gemini Pro)', cost: 900 },
      { name: 'EC2 Cómputo (Autos verde)', cost: 800 },
    ],
    avgCostPerTransaction: parseFloat((currentMonth / 2800).toFixed(2)),
    criticalAlertsCount: 2,
    monthlyTrend: [
      { month: 'Ene 2026', amount: 2870 + 2070 + 3580 },
      { month: 'Feb 2026', amount: 3010 + 2070 + 3600 },
      { month: 'Mar 2026', amount: 3270 + 2070 + 3700 },
      { month: 'Abr 2026', amount: 3380 + 2070 + 3800 },
      { month: 'May 2026', amount: 3500 + 2070 + 4200 },
      { month: 'Jun 2026', amount: currentMonth },
    ],
  });
});

app.get('/api/v1/executive/export-pdf', (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=dashboard-ejecutivo.pdf');
  res.send(Buffer.from('PDF mock content'));
});

// --- Tagging (Req 11) ---
app.get('/api/v1/tagging/resources', (req, res) => {
  res.json([
    { id: '1', resourceId: 'EC2 i-0a1b2c (Autos verde)', team: 'Autos verde', project: 'Venta de Pólizas', environment: 'producción', aiUseCase: 'Cotización automática' },
    { id: '2', resourceId: 'RDS db-prod-01', team: 'Autos verde', project: 'Venta de Pólizas', environment: 'producción', aiUseCase: null },
    { id: '3', resourceId: 'GKE cluster-dev', team: 'Autos ligeros', project: 'Cotizador Ligeros', environment: 'desarrollo', aiUseCase: 'Gemini Flash' },
    { id: '4', resourceId: 'BigQuery analytics', team: null, project: 'Analytics', environment: 'producción', aiUseCase: null },
    { id: '5', resourceId: 'Cloud Storage backup', team: 'Vehículos pesados', project: 'Backup', environment: 'producción', aiUseCase: 'Gemini Pro' },
  ]);
});

app.get('/api/v1/tagging/compliance', (req, res) => {
  res.json({ compliancePercentage: 60.0, totalResources: 5, compliantResources: 3 });
});

// --- Anomalies (Req 12) ---
app.get('/api/v1/anomalies', (req, res) => {
  res.json([
    { id: uuidv4(), serviceName: 'Bedrock (Claude 3)', currentAmountUsd: 1350, expectedAmountUsd: 960, standardDeviations: 3.2, severity: 'critical', startDate: '2026-06-25' },
    { id: uuidv4(), serviceName: 'Stripe Pagos', currentAmountUsd: 2790, expectedAmountUsd: 1530, standardDeviations: 2.8, severity: 'warning', startDate: '2026-06-20' },
  ]);
});

// ============================================================================
// ALIAS ROUTES — /sheets/* → same data as /costs/* (for Google Sheets hooks)
// ============================================================================

app.get('/api/v1/sheets/ai-costs', (req, res) => {
  const allCosts = [...AI_COSTS, ...AI_HISTORICAL];
  res.json({ data: allCosts.map(c => ({ mes: c.mes, proveedor: c.proveedor, servicioAI: c.servicio, centroCostos: c.cc, producto: c.producto, llamadasApi: c.llamadas || 0, tokensConsumidos: c.tokens || 0, costoAiUsd: c.costo, aplicacion: 'Venta de Pólizas de Autos' })), count: allCosts.length });
});

app.get('/api/v1/sheets/infra-costs', (req, res) => {
  res.json({ data: INFRA_COSTS.map(c => ({ mes: c.mes, proveedor: c.proveedor, servicio: c.servicio, costoInfraUsd: c.costo, aplicacion: 'Venta de Pólizas de Autos', producto: c.producto, centroCostos: c.cc })), count: INFRA_COSTS.length });
});

app.get('/api/v1/sheets/megabill', (req, res) => {
  const ai = AI_COSTS.map(c => ({ mes: c.mes, serviceName: c.servicio, provider: c.proveedor, category: 'ai', billedCostUsd: c.costo, producto: c.producto, centroCostos: c.cc }));
  const cloud = INFRA_COSTS.map(c => ({ mes: c.mes, serviceName: c.servicio, provider: c.proveedor, category: 'cloud', billedCostUsd: c.costo, producto: c.producto, centroCostos: c.cc }));
  const saas = SAAS_COSTS_2026_06.map(c => ({ mes: '2026-06', serviceName: c.concepto, provider: c.proveedor, category: 'saas', billedCostUsd: c.costo, producto: c.producto, centroCostos: c.cc }));
  const all = [...ai, ...cloud, ...saas];
  res.json({ data: all, count: all.length });
});

app.get('/api/v1/sheets/unit-economics', (req, res) => {
  const polizas = POLIZAS;
  const result = polizas.map(p => {
    const aiCost = AI_COSTS.filter(c => c.mes === p.mes && c.cc === (p.producto === 'Autos verde' ? '5100' : p.producto === 'Autos ligeros' ? '5101' : '5102')).reduce((s, c) => s + c.costo, 0);
    const unitCost = p.polizas > 0 ? parseFloat((aiCost / p.polizas).toFixed(4)) : null;
    return { mes: p.mes, producto: p.producto, totalCostAiUsd: aiCost, polizasEmitidas: p.polizas, primasEmitidasUsd: p.primas, costoPorPolizaUsd: unitCost, costoPorPolizaCop: unitCost !== null ? Math.round(unitCost * 4200) : null };
  });
  res.json({ data: result, count: result.length });
});

app.get('/api/v1/sheets/sync', (req, res) => {
  res.json({
    aiCosts: AI_COSTS.map(c => ({ mes: c.mes, proveedor: c.proveedor, costoAiUsd: c.costo, tokensConsumidos: c.tokens || 0, llamadasApi: c.llamadas || 0, servicioAI: c.servicio, producto: c.producto })),
    infraCosts: INFRA_COSTS.map(c => ({ mes: c.mes, proveedor: c.proveedor, costoInfraUsd: c.costo, servicio: c.servicio, producto: c.producto })),
    otherCosts: SAAS_COSTS_2026_06.map(c => ({ mes: '2026-06', proveedor: c.proveedor, costoTotalUsd: c.costo, conceptoGasto: c.concepto, producto: c.producto })),
    policies: POLIZAS.map(p => ({ mes: p.mes, producto: p.producto, polizasEmitidas: p.polizas, primasEmitidasUsd: p.primas })),
    syncedAt: new Date().toISOString()
  });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Mock server running at http://localhost:${PORT}/api/v1`);
  console.log(`   Data: Simulación Showback — Venta de Pólizas de Autos`);
  console.log(`   Frontend: http://localhost:5173\n`);
});
