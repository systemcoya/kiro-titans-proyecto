const { query } = require('../config/db');

/**
 * Retrieves aggregated cost totals grouped by category for the current month.
 * @returns {Promise<Array<{category: string, total: string, service_count: string}>>}
 */
const getTotalsByCategory = async () => {
  const sql = `
    SELECT
      category,
      COALESCE(SUM(billed_cost), 0) AS total,
      COUNT(DISTINCT service_name) AS service_count
    FROM megabill_costs
    WHERE cost_date >= date_trunc('month', CURRENT_DATE)
      AND cost_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
    GROUP BY category
    ORDER BY category
  `;
  const result = await query(sql);
  return result.rows;
};

/**
 * Retrieves all service records for a specific category in the current month,
 * normalized to FOCUS format.
 * @param {string} category - One of 'cloud', 'saas', 'licenses'
 * @returns {Promise<Array<{service_name: string, billed_cost: string, usage_quantity: string, provider: string, category: string}>>}
 */
const getServicesByCategory = async (category) => {
  const sql = `
    SELECT
      service_name,
      billed_cost,
      usage_quantity,
      provider,
      category
    FROM megabill_costs
    WHERE category = $1
      AND cost_date >= date_trunc('month', CURRENT_DATE)
      AND cost_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
    ORDER BY billed_cost DESC
  `;
  const result = await query(sql, [category]);
  return result.rows;
};

module.exports = { getTotalsByCategory, getServicesByCategory };
