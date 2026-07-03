#!/usr/bin/env node
'use strict';

/**
 * Mock server that serves data from Google Sheets for frontend testing.
 * Uses the service account: hackathon@gestion-estrategica-ti.iam.gserviceaccount.com
 * Spreadsheet: Simulación Showback — Venta de Pólizas de Autos
 *
 * Usage: node backend/src/mock/mock-server.js
 * Serves on port 3000 (matches frontend default VITE_API_URL)
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const sheetsData = require('../services/sheets-data.service');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Skip auth for mock server
app.use((req, res, next) => {
  req.correlationId = uuidv4();
  next();
});

// ============================================================================
// HEALTH
// ============================================================================

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), mode: 'google-sheets', source: 'Spreadsheet 12dLt8HxxVYp7eM-hXZO4gdfaoraN4HL9AxVSq0akOMM' });
});

// ============================================================================
// AI SPEND (Req 1)
// ============================================================================

app.get('/api/v1/costs/ai-spend', async (req, res) => {
  try {
    const result = await sheetsData.getAISpend(req.query.month || '2026-06');
    res.json(result);
  } catch (err) {
    console.error('[ai-spend]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/costs/ai-spend/advance', (req, res) => {
  res.status(201).json({ message: 'Temporal advance completed', recordsCreated: 3, simulatedTime: new Date().toISOString() });
});

// ============================================================================
// UNIT ECONOMICS (Req 2)
// ============================================================================

app.get('/api/v1/costs/unit-economics', async (req, res) => {
  try {
    const result = await sheetsData.getUnitEconomics(req.query.period === 'month' ? '2026-06' : req.query.startDate);
    res.json(result);
  } catch (err) {
    console.error('[unit-economics]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// SHOWBACK (Req 3)
// ============================================================================

app.get('/api/v1/costs/showback', async (req, res) => {
  try {
    const result = await sheetsData.getShowback(req.query.month || '2026-06');
    res.json(result);
  } catch (err) {
    console.error('[showback]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// MEGABILL (Req 5)
// ============================================================================

app.get('/api/v1/costs/megabill', async (req, res) => {
  try {
    const result = await sheetsData.getMegaBill(req.query.month || '2026-06');
    res.json(result);
  } catch (err) {
    console.error('[megabill]', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/v1/costs/megabill/:category', async (req, res) => {
  try {
    const { infra, ai, otros } = await sheetsData.loadAllData();
    const mes = '2026-06';
    const { category } = req.params;

    let services = [];
    if (category === 'cloud') {
      const filtered = infra.filter((r) => r.Mes === mes);
      services = filtered.map((r) => ({
        serviceName: r.Servicio, billedCost: parseFloat(r.Costo_Infraestructura_USD || 0),
        usageQuantity: 1, provider: r.Proveedor,
      }));
    } else if (category === 'ai') {
      const filtered = ai.filter((r) => r.Mes === mes);
      services = filtered.map((r) => ({
        serviceName: r.Servicio_AI, billedCost: parseFloat(r.Costo_AI_USD || 0),
        usageQuantity: parseInt(r.Llamadas_API || 0, 10), provider: r.Proveedor,
      }));
    } else {
      const filtered = otros.filter((r) => r.Mes === mes);
      services = filtered.map((r) => ({
        serviceName: r.Concepto_Gasto, billedCost: parseFloat(r.Costo_Total_USD || 0),
        usageQuantity: parseInt(r.Consumo_Cantidad || 0, 10), provider: r['Proveedor/Plataforma'],
      }));
    }

    const totalCost = services.reduce((s, svc) => s + svc.billedCost, 0);
    res.json({ category, totalCost, services });
  } catch (err) {
    console.error('[megabill-drilldown]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// ALERTS (Req 4)
// ============================================================================

app.get('/api/v1/alerts/active', (req, res) => {
  res.json({
    alerts: [
      { id: uuidv4(), ruleId: 'r1', service: 'Bedrock (Claude 3)', threshold: 1000, actualValue: 1350, severity: 'critical', triggeredAt: '2026-06-28T10:00:00Z' },
      { id: uuidv4(), ruleId: 'r2', service: 'EC2 Cómputo (CC 5100)', threshold: 700, actualValue: 800, severity: 'critical', triggeredAt: '2026-06-27T14:30:00Z' },
      { id: uuidv4(), ruleId: 'r3', service: 'Vertex AI (Gemini Pro)', threshold: 800, actualValue: 900, severity: 'warning', triggeredAt: '2026-06-26T09:00:00Z' },
    ],
    total: 3,
  });
});

app.get('/api/v1/alerts/rules', (req, res) => {
  res.json([
    { id: 'r1', service: 'Bedrock (Claude 3)', threshold: 1000, recipient: 'finops@segurosbolivar.com', createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' },
    { id: 'r2', service: 'EC2 Cómputo (CC 5100)', threshold: 700, recipient: 'infra@segurosbolivar.com', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'r3', service: 'Vertex AI (Gemini Pro)', threshold: 800, recipient: 'finops@segurosbolivar.com', createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z' },
  ]);
});

app.post('/api/v1/alerts/rules', (req, res) => { res.status(201).json({ id: uuidv4(), ...req.body, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }); });
app.delete('/api/v1/alerts/rules/:id', (req, res) => { res.status(204).send(); });
app.get('/api/v1/alerts/history', (req, res) => { res.json({ alerts: [], total: 0, page: 1 }); });

// ============================================================================
// SIMULATOR (Req 6)
// ============================================================================

app.post('/api/v1/simulator/projection', async (req, res) => {
  try {
    const { incrementPercentage = 50 } = req.body;
    const { ai } = await sheetsData.loadAllData();
    const latest = ai.filter((r) => r.Mes === '2026-06');
    const baseCost = latest.reduce((s, r) => s + parseFloat(r.Costo_AI_USD || 0), 0);
    const factor = 1 + incrementPercentage / 100;
    res.json({
      projections: [
        { month: 1, optimistic: Math.round(baseCost * factor * 0.85), base: Math.round(baseCost * factor), pessimistic: Math.round(baseCost * factor * 1.2) },
        { month: 3, optimistic: Math.round(baseCost * factor * 3 * 0.85), base: Math.round(baseCost * factor * 3), pessimistic: Math.round(baseCost * factor * 3 * 1.2) },
        { month: 6, optimistic: Math.round(baseCost * factor * 6 * 0.85), base: Math.round(baseCost * factor * 6), pessimistic: Math.round(baseCost * factor * 6 * 1.2) },
      ],
      historicalBase: ai.map((r) => parseFloat(r.Costo_AI_USD || 0)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// GOVERNANCE (Req 7)
// ============================================================================

app.get('/api/v1/governance/rules', (req, res) => {
  res.json([
    { id: 'g1', resource: 'EC2 i-0a1b (Autos Verde)', metric: 'cpu', operator: 'lt', value: 15, evaluationPeriodDays: 14 },
    { id: 'g2', resource: 'RDS db-prod-01', metric: 'memory', operator: 'lt', value: 20, evaluationPeriodDays: 7 },
  ]);
});

app.get('/api/v1/governance/recommendations', (req, res) => {
  res.json({
    recommendations: [
      { id: 'rec1', resourceId: 'EC2 i-0a1b', ruleName: 'CPU < 15% por 14 días', estimatedSavingsUsd: 280, suggestedAction: 'resize', status: 'active' },
      { id: 'rec2', resourceId: 'RDS db-dev', ruleName: 'Memoria < 20% por 7 días', estimatedSavingsUsd: 180, suggestedAction: 'delete', status: 'active' },
    ],
    totalEstimatedSavings: 460,
  });
});

app.patch('/api/v1/governance/recommendations/:id/implement', (req, res) => { res.json({ status: 'implemented' }); });

// ============================================================================
// SELF-FUNDING (Req 8), COST AVOIDANCE (Req 9), EXECUTIVE (Req 10)
// ============================================================================

app.get('/api/v1/self-funding', async (req, res) => {
  try {
    const megabill = await sheetsData.getMegaBill('2026-06');
    const investment = megabill.categories.find((c) => c.category === 'ai')?.totalCost || 0;
    const savings = 460 + 1230; // governance + cost avoidance
    const ratio = investment > 0 ? parseFloat(((savings / investment) * 100).toFixed(2)) : 0;
    res.json({ investmentUsd: investment, savingsUsd: savings, selfFundingRatio: ratio, period: req.query.period || 'total' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/v1/cost-avoidance', (req, res) => {
  const actions = [
    { id: uuidv4(), resource: 'EC2 i-dev-unused-01', actionType: 'revisión arquitectónica', date: '2026-06-10', estimatedSavingsUsd: 480 },
    { id: uuidv4(), resource: 'RDS staging-oversized', actionType: 'rightsizing preventivo', date: '2026-06-15', estimatedSavingsUsd: 350 },
    { id: uuidv4(), resource: 'GKE cluster-test', actionType: 'eliminación de propuesta', date: '2026-06-20', estimatedSavingsUsd: 400 },
  ];
  res.json({ actions, totalSavings: actions.reduce((s, a) => s + a.estimatedSavingsUsd, 0) });
});
app.post('/api/v1/cost-avoidance', (req, res) => { res.status(201).json({ id: uuidv4(), ...req.body }); });

app.get('/api/v1/executive/dashboard', async (req, res) => {
  try {
    const result = await sheetsData.getExecutiveDashboard();
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/v1/executive/export-pdf', (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.send(Buffer.from('PDF mock'));
});

// ============================================================================
// TAGGING (Req 11), ANOMALIES (Req 12)
// ============================================================================

app.get('/api/v1/tagging/resources', (req, res) => {
  res.json([
    { id: '1', resourceId: 'EC2 i-0a1b (Autos Verde)', team: 'Autos Verde', project: 'Venta Pólizas', environment: 'producción', aiUseCase: 'Cotización Claude 3' },
    { id: '2', resourceId: 'RDS db-prod-01', team: 'Autos Verde', project: 'Venta Pólizas', environment: 'producción', aiUseCase: null },
    { id: '3', resourceId: 'Vertex AI (Gemini Flash)', team: 'Autos Ligeros', project: 'Cotizador', environment: 'producción', aiUseCase: 'Gemini Flash' },
    { id: '4', resourceId: 'BigQuery Analítica', team: null, project: 'Analytics', environment: 'producción', aiUseCase: null },
    { id: '5', resourceId: 'Vertex AI (Gemini Pro)', team: 'Vehículos Pesados', project: 'Evaluación', environment: 'producción', aiUseCase: 'Gemini Pro' },
  ]);
});
app.get('/api/v1/tagging/compliance', (req, res) => { res.json({ compliancePercentage: 60.0, totalResources: 5, compliantResources: 3 }); });

app.get('/api/v1/anomalies', async (req, res) => {
  try {
    const { ai } = await sheetsData.loadAllData();
    const jun = ai.filter((r) => r.Mes === '2026-06');
    const ene = ai.filter((r) => r.Mes === '2026-01');
    const anomalies = jun.map((j) => {
      const prev = ene.find((e) => e.Servicio_AI === j.Servicio_AI);
      const current = parseFloat(j.Costo_AI_USD || 0);
      const expected = prev ? parseFloat(prev.Costo_AI_USD || 0) : current;
      const deviation = expected > 0 ? parseFloat(((current - expected) / expected * 3).toFixed(1)) : 0;
      const severity = deviation > 3 ? 'critical' : deviation > 2 ? 'warning' : null;
      if (!severity) return null;
      return { id: uuidv4(), serviceName: j.Servicio_AI, currentAmountUsd: current, expectedAmountUsd: expected, standardDeviations: deviation, severity, startDate: '2026-06-25' };
    }).filter(Boolean);
    res.json(anomalies);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================================
// START
// ============================================================================

const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`\n🚀 Mock server running at http://localhost:${PORT}/api/v1`);
  console.log(`   Source: Google Sheets (Simulación Showback — Venta de Pólizas de Autos)`);
  console.log(`   Frontend: http://localhost:5173\n`);
  // Pre-load data from Sheets
  try {
    await sheetsData.loadAllData();
    console.log('   ✅ Data loaded from Google Sheets successfully\n');
  } catch (err) {
    console.log(`   ⚠️  Could not load from Sheets: ${err.message}`);
    console.log('   Falling back to cached/hardcoded data\n');
  }
});
