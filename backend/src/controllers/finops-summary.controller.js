const selfFundingService = require('../services/self-funding.service');
const alertsService = require('../services/alerts.service');

/**
 * FinOps Summary Controller — RT-10 Integration Contract.
 * GET /api/v1/finops/summary
 *
 * Response schema (strict):
 * { status, kpi_principal: { label, value, unit }, trend, alerts_count }
 */

/**
 * GET /api/v1/finops/summary — Strategy Cockpit integration endpoint.
 */
const getSummary = async (req, res, next) => {
  try {
    let alertsData = [];
    let selfFundingData = { totalAiInvestment: 0, totalSavings: 0, previousRatio: 0 };
    let currentMonthAiSpend = 0;
    let previousMonthAiSpend = 0;

    // Fetch from repositories if available
    if (req.app.locals.alertsRepository) {
      alertsData = await req.app.locals.alertsRepository.listAlerts();
    }
    if (req.app.locals.selfFundingRepository) {
      selfFundingData.totalAiInvestment = await req.app.locals.selfFundingRepository.getTotalAiInvestment();
      selfFundingData.totalSavings = await req.app.locals.selfFundingRepository.getTotalSavings();
      selfFundingData.previousRatio = await req.app.locals.selfFundingRepository.getPreviousMonthRatio();
      currentMonthAiSpend = await req.app.locals.selfFundingRepository.getCurrentMonthAiSpend();
      previousMonthAiSpend = await req.app.locals.selfFundingRepository.getPreviousMonthAiSpend();
    } else {
      // Stub data
      alertsData = [
        { severity: 'critical', isActive: true },
        { severity: 'warning', isActive: true },
        { severity: 'critical', isActive: true },
      ];
      selfFundingData = { totalAiInvestment: 245000000, totalSavings: 179850000, previousRatio: 68.5 };
      currentMonthAiSpend = 42000000;
      previousMonthAiSpend = 38000000;
    }

    // Calculate status from alerts
    const activeAlerts = alertsData.filter((a) => a.isActive);
    const hasCritical = activeAlerts.some((a) => a.severity === 'critical');
    const hasWarning = activeAlerts.some((a) => a.severity === 'warning');

    let status = 'healthy';
    if (hasCritical) status = 'critical';
    else if (hasWarning) status = 'warning';

    // Calculate KPI principal
    const { ratio } = selfFundingService.calculateSelfFundingRatio(
      selfFundingData.totalSavings,
      selfFundingData.totalAiInvestment
    );

    let kpiPrincipal;
    if (selfFundingData.totalSavings > 0) {
      kpiPrincipal = { label: 'Self-Funding Ratio', value: ratio, unit: '%' };
    } else {
      kpiPrincipal = { label: 'Total AI Spend', value: currentMonthAiSpend, unit: 'COP' };
    }

    // Calculate trend
    const trend = selfFundingService.calculateTrend(ratio, selfFundingData.previousRatio);

    // Count critical alerts
    const alertsCount = activeAlerts.filter((a) => a.severity === 'critical').length;

    // Response per RT-10 strict contract
    res.json({
      status,
      kpi_principal: kpiPrincipal,
      trend,
      alerts_count: alertsCount,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary };
