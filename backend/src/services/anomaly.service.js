'use strict';

const { v4: uuidv4 } = require('uuid');
const anomalyRepository = require('../repositories/anomaly.repository');

/**
 * Classifies anomaly severity based on standard deviations above mean.
 * @param {number} dailyCost - Current day cost
 * @param {number} mean - 28-day rolling mean
 * @param {number} stddev - 28-day rolling standard deviation
 * @returns {{severity: 'critical'|'warning'|null, deviations: number}}
 */
const classifyAnomaly = (dailyCost, mean, stddev) => {
  if (stddev === 0) return { severity: null, deviations: 0 };

  const deviations = (dailyCost - mean) / stddev;

  if (deviations > 3) {
    return { severity: 'critical', deviations: parseFloat(deviations.toFixed(1)) };
  }
  if (deviations > 2) {
    return { severity: 'warning', deviations: parseFloat(deviations.toFixed(1)) };
  }
  return { severity: null, deviations: parseFloat(deviations.toFixed(1)) };
};

/**
 * Detects anomalies across all services using mean + stddev of last 28 days.
 * Excludes services with less than 28 days of data.
 * @returns {Promise<Array<{id: string, serviceName: string, currentAmountUsd: number, expectedAmountUsd: number, standardDeviations: number, severity: 'warning'|'critical', startDate: string}>>}
 */
const detectAnomalies = async () => {
  const result = await anomalyRepository.getLatestStatsWithBaseline();
  const anomalies = [];

  for (const row of result.rows) {
    const dailyCost = parseFloat(row.daily_cost);
    const mean = parseFloat(row.mean_28d);
    const stddev = parseFloat(row.stddev_28d);

    const { severity, deviations } = classifyAnomaly(dailyCost, mean, stddev);

    if (severity) {
      anomalies.push({
        id: uuidv4(),
        serviceName: row.service_name,
        currentAmountUsd: dailyCost,
        expectedAmountUsd: parseFloat(mean.toFixed(2)),
        standardDeviations: deviations,
        severity,
        startDate: row.stat_date instanceof Date
          ? row.stat_date.toISOString().split('T')[0]
          : row.stat_date,
      });
    }
  }

  // Sort by severity descending (critical first)
  anomalies.sort((a, b) => {
    if (a.severity === 'critical' && b.severity === 'warning') return -1;
    if (a.severity === 'warning' && b.severity === 'critical') return 1;
    return b.standardDeviations - a.standardDeviations;
  });

  return anomalies;
};

module.exports = { detectAnomalies, classifyAnomaly };
