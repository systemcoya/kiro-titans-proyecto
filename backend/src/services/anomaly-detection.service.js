/**
 * Anomaly Detection Service — Task 15.1
 * Detects cost anomalies using statistical methods (z-score).
 *
 * Uses daily_cost_stats table which has pre-computed mean_28d and stddev_28d
 * for each service. An anomaly occurs when daily_cost deviates significantly
 * from the 28-day rolling average.
 */

const ANOMALY_THRESHOLDS = {
  warning: 2.0,   // z-score >= 2.0 standard deviations
  critical: 3.0,  // z-score >= 3.0 standard deviations
};

/**
 * Calculate z-score for a daily cost against its rolling stats.
 * @param {number} dailyCost - Today's cost
 * @param {number} mean28d - 28-day rolling mean
 * @param {number} stddev28d - 28-day rolling standard deviation
 * @returns {number} z-score (how many std devs from mean)
 */
const calculateZScore = (dailyCost, mean28d, stddev28d) => {
  if (stddev28d === 0 || stddev28d === null) {
    // No variance — any deviation from mean is notable
    return dailyCost === mean28d ? 0 : dailyCost > mean28d ? 3.0 : -3.0;
  }

  return (dailyCost - mean28d) / stddev28d;
};

/**
 * Classify anomaly severity based on z-score.
 * @param {number} zScore
 * @returns {'none' | 'warning' | 'critical'}
 */
const classifyAnomaly = (zScore) => {
  const absZScore = Math.abs(zScore);

  if (absZScore >= ANOMALY_THRESHOLDS.critical) return 'critical';
  if (absZScore >= ANOMALY_THRESHOLDS.warning) return 'warning';
  return 'none';
};

/**
 * Detect anomalies in a set of daily cost stats.
 * @param {Array<{serviceName: string, statDate: string, dailyCost: number, mean28d: number, stddev28d: number}>} stats
 * @returns {Array<{serviceName: string, statDate: string, dailyCost: number, expectedCost: number, zScore: number, severity: string, deviationPercent: number}>}
 */
const detectAnomalies = (stats) => {
  const anomalies = [];

  for (const stat of stats) {
    const zScore = calculateZScore(stat.dailyCost, stat.mean28d, stat.stddev28d);
    const severity = classifyAnomaly(zScore);

    if (severity !== 'none') {
      const deviationPercent = stat.mean28d > 0
        ? Math.round(((stat.dailyCost - stat.mean28d) / stat.mean28d) * 100 * 100) / 100
        : 0;

      anomalies.push({
        serviceName: stat.serviceName,
        statDate: stat.statDate,
        dailyCost: stat.dailyCost,
        expectedCost: stat.mean28d,
        zScore: Math.round(zScore * 100) / 100,
        severity,
        deviationPercent,
      });
    }
  }

  return anomalies.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
};

/**
 * Summarize anomalies by severity.
 * @param {Array<{severity: string}>} anomalies
 * @returns {{total: number, critical: number, warning: number}}
 */
const summarizeAnomalies = (anomalies) => {
  return {
    total: anomalies.length,
    critical: anomalies.filter((a) => a.severity === 'critical').length,
    warning: anomalies.filter((a) => a.severity === 'warning').length,
  };
};

module.exports = {
  ANOMALY_THRESHOLDS,
  calculateZScore,
  classifyAnomaly,
  detectAnomalies,
  summarizeAnomalies,
};
