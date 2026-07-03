const selfFundingService = require('../services/self-funding.service');
const alertsRepository = require('../repositories/alerts.repository');
const selfFundingRepository = require('../repositories/self-funding.repository');

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
    const [alertsData, totalAiInvestment, totalSavings] = await Promise.all([
      alertsRepository.listAlerts(),
      selfFundingRepository.getTotalAiInvestment(12),
      selfFundingRepository.getTotalSavings(12),
    ]);

    // Calculate status from alerts
    const hasCritical = alertsData.some((a) => a.severity === 'critical');
    const hasWarning = alertsData.some((a) => a.severity === 'warning');

    let status = 'healthy';
    if (hasCritical) status = 'critical';
    else if (hasWarning) status = 'warning';

    // Calculate KPI principal
    const { ratio } = selfFundingService.calculateSelfFundingRatio(totalSavings, totalAiInvestment);

    let kpiPrincipal;
    if (totalSavings > 0) {
      kpiPrincipal = { label: 'Self-Funding Ratio', value: ratio, unit: '%' };
    } else {
      const currentSpend = await selfFundingRepository.getCurrentMonthAiSpend();
      kpiPrincipal = { label: 'Total AI Spend', value: currentSpend * 4200, unit: 'COP' };
    }

    // Calculate trend (current ratio vs previous)
    const prevInvestment = await selfFundingRepository.getTotalAiInvestment(13);
    const prevSavings = await selfFundingRepository.getTotalSavings(13);
    const previousRatio = prevInvestment > 0 ? (prevSavings / prevInvestment) * 100 : 0;
    const trend = selfFundingService.calculateTrend(ratio, previousRatio);

    // Count critical alerts
    const alertsCount = alertsData.filter((a) => a.severity === 'critical').length;

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
