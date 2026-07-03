const executiveService = require('../services/executive.service');

/**
 * Executive Controller — HUF10.
 * Handles HTTP requests for the Executive One-Pager Dashboard.
 * Uses in-memory mock data for interactivity (no DB dependency).
 */

/**
 * Mock data for different months — provides interactive dashboard
 */
const MOCK_DATA_BY_MONTH = {
  '2026-06': {
    currentSpend: 12595,
    previousSpend: 9810,
    topConsumers: [
      { name: 'Bedrock (Claude 3)', spendCop: 1350 },
      { name: 'Stripe Pagos', spendCop: 2790 },
      { name: 'Mati / KYC Identidad', spendCop: 1400 },
      { name: 'Vertex AI (Gemini Pro)', spendCop: 900 },
      { name: 'EC2 Cómputo', spendCop: 800 },
    ],
    avgCostPerTransaction: 4.50,
    criticalAlerts: 2,
    selfFundingRatio: 24.5,
  },
  '2026-05': {
    currentSpend: 9810,
    previousSpend: 9200,
    topConsumers: [
      { name: 'Bedrock (Claude 3)', spendCop: 980 },
      { name: 'Stripe Pagos', spendCop: 2100 },
      { name: 'Mati / KYC Identidad', spendCop: 1050 },
      { name: 'Vertex AI (Gemini Pro)', spendCop: 750 },
      { name: 'S3 Storage', spendCop: 650 },
    ],
    avgCostPerTransaction: 3.85,
    criticalAlerts: 1,
    selfFundingRatio: 22.1,
  },
  '2026-04': {
    currentSpend: 9200,
    previousSpend: 8500,
    topConsumers: [
      { name: 'Bedrock (Claude 3)', spendCop: 850 },
      { name: 'Stripe Pagos', spendCop: 1950 },
      { name: 'Mati / KYC Identidad', spendCop: 920 },
      { name: 'Vertex AI (Gemini Pro)', spendCop: 680 },
      { name: 'Datadog', spendCop: 570 },
    ],
    avgCostPerTransaction: 3.45,
    criticalAlerts: 0,
    selfFundingRatio: 19.8,
  },
  '2026-03': {
    currentSpend: 8500,
    previousSpend: 7900,
    topConsumers: [
      { name: 'Bedrock (Claude 3)', spendCop: 720 },
      { name: 'Stripe Pagos', spendCop: 1800 },
      { name: 'Mati / KYC Identidad', spendCop: 850 },
      { name: 'EC2 Cómputo', spendCop: 620 },
      { name: 'Lambda Functions', spendCop: 480 },
    ],
    avgCostPerTransaction: 3.20,
    criticalAlerts: 1,
    selfFundingRatio: 18.5,
  },
  '2026-02': {
    currentSpend: 7900,
    previousSpend: 7400,
    topConsumers: [
      { name: 'Bedrock (Claude 3)', spendCop: 650 },
      { name: 'Stripe Pagos', spendCop: 1650 },
      { name: 'Mati / KYC Identidad', spendCop: 780 },
      { name: 'Vertex AI (Gemini Pro)', spendCop: 560 },
      { name: 'BigQuery', spendCop: 420 },
    ],
    avgCostPerTransaction: 2.95,
    criticalAlerts: 0,
    selfFundingRatio: 16.2,
  },
  '2026-01': {
    currentSpend: 7400,
    previousSpend: 6800,
    topConsumers: [
      { name: 'Bedrock (Claude 3)', spendCop: 580 },
      { name: 'Stripe Pagos', spendCop: 1500 },
      { name: 'Mati / KYC Identidad', spendCop: 720 },
      { name: 'Vertex AI (Gemini Pro)', spendCop: 480 },
      { name: 'Confluent Kafka', spendCop: 400 },
    ],
    avgCostPerTransaction: 2.70,
    criticalAlerts: 0,
    selfFundingRatio: 15.1,
  },
  '2025-12': {
    currentSpend: 6800,
    previousSpend: 6200,
    topConsumers: [
      { name: 'Bedrock (Claude 3)', spendCop: 520 },
      { name: 'Stripe Pagos', spendCop: 1350 },
      { name: 'Mati / KYC Identidad', spendCop: 650 },
      { name: 'EC2 Cómputo', spendCop: 550 },
      { name: 'S3 Storage', spendCop: 380 },
    ],
    avgCostPerTransaction: 2.50,
    criticalAlerts: 1,
    selfFundingRatio: 13.8,
  },
};

/**
 * GET /api/v1/executive/dashboard — Complete executive dashboard with optional filters.
 * Query params: ?month=2026-06&provider=AWS&product=Autos%20Verde
 */
const getDashboard = async (req, res, next) => {
  try {
    const { month = '2026-06', provider, product } = req.query;

    // Get mock data for the requested month, fallback to June 2026
    const monthData = MOCK_DATA_BY_MONTH[month] || MOCK_DATA_BY_MONTH['2026-06'];

    let topConsumers = monthData.topConsumers;

    // Apply provider filter if specified
    if (provider) {
      const providerMap = {
        'AWS': ['Bedrock', 'EC2', 'S3', 'Lambda'],
        'GCP': ['Vertex AI', 'BigQuery'],
      };
      const keywords = providerMap[provider] || [];
      topConsumers = topConsumers.filter((c) =>
        keywords.some((kw) => c.name.includes(kw))
      );
    }

    // Apply product filter if specified
    if (product) {
      const productKeywords = {
        'Autos verde': ['Bedrock', 'Stripe'],
        'Autos ligeros': ['Vertex AI', 'Mati'],
        'Vehiculos pesados': ['EC2', 'Lambda'],
      };
      const keywords = productKeywords[product] || [];
      if (keywords.length > 0) {
        topConsumers = topConsumers.filter((c) =>
          keywords.some((kw) => c.name.includes(kw))
        );
      }
    }

    const data = {
      totalSpend: {
        currentMonthCop: monthData.currentSpend,
        previousMonthCop: monthData.previousSpend,
        absoluteDiffCop: monthData.currentSpend - monthData.previousSpend,
        percentVariation: parseFloat(((monthData.currentSpend - monthData.previousSpend) / monthData.previousSpend * 100).toFixed(1)),
        trendDirection: monthData.currentSpend > monthData.previousSpend ? 'up' : 'down',
        hasWarning: ((monthData.currentSpend - monthData.previousSpend) / monthData.previousSpend * 100) > 10,
      },
      topConsumers: topConsumers.map((c, i) => ({
        ...c,
        rank: i + 1,
      })),
      avgCostPerTransaction: {
        value: monthData.avgCostPerTransaction,
        hasWarning: false,
      },
      criticalAlertsCount: monthData.criticalAlerts,
      selfFundingRatio: monthData.selfFundingRatio,
      filters: { month, provider, product },
      cachedAt: new Date().toISOString(),
    };

    res.json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/executive/summary — Legacy endpoint for backward compatibility.
 */
const getSummary = async (req, res, next) => {
  try {
    const monthData = MOCK_DATA_BY_MONTH['2026-06'];

    const data = {
      totalSpend: {
        currentMonthCop: monthData.currentSpend,
        previousMonthCop: monthData.previousSpend,
        absoluteDiffCop: monthData.currentSpend - monthData.previousSpend,
        percentVariation: 28.7,
        trendDirection: 'up',
        hasWarning: true,
      },
      topConsumers: monthData.topConsumers.map((c, i) => ({
        ...c,
        rank: i + 1,
      })),
      avgCostPerTransaction: {
        value: monthData.avgCostPerTransaction,
        hasWarning: false,
      },
      criticalAlertsCount: monthData.criticalAlerts,
      selfFundingRatio: monthData.selfFundingRatio,
    };

    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getSummary };
