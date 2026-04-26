const config = require('./config');
const { runQuery } = require('./bigquery');
const { buildWhere } = require('./filters');

const T = config.fullTable;

// --------------------------------------------------------------------
// KPIs

async function getKpis(filters) {
  const { where, params, types } = buildWhere(filters);
  const sql = `
    SELECT
      COALESCE(SUM(total), 0)                                         AS revenue,
      COALESCE(SUM(net_sales), 0)                                     AS net_sales,
      COALESCE(SUM(tax), 0)                                           AS tax,
      COALESCE(SUM(price_without_discount * qty), 0)                  AS list_sales,
      COALESCE(SUM(price_without_discount * qty) - SUM(net_sales), 0) AS discount,
      COALESCE(SUM(qty), 0)                                           AS items,
      COUNT(DISTINCT txn_number)                                      AS transactions,
      COUNT(DISTINCT store)                                           AS stores,
      COUNT(DISTINCT sku)                                             AS products,
      SAFE_DIVIDE(SUM(total), COUNT(DISTINCT txn_number))             AS avg_txn_value
    FROM ${T}
    ${where}
  `;
  const rows = await runQuery(sql, params, types);
  return rows[0] || {};
}

// --------------------------------------------------------------------
// Sales over time

const GRANULARITY = {
  day: 'DATE',
  week: 'WEEK(MONDAY)',
  month: 'MONTH',
};

async function getSalesOverTime(filters, granularity = 'day') {
  const trunc = GRANULARITY[granularity] || GRANULARITY.day;
  const { where, params, types } = buildWhere(filters);
  const sql = `
    SELECT
      DATE_TRUNC(transaction_date, ${trunc}) AS bucket,
      COALESCE(SUM(total), 0)                AS revenue,
      COALESCE(SUM(net_sales), 0)            AS net_sales,
      COALESCE(SUM(qty), 0)                  AS items,
      COUNT(DISTINCT txn_number)             AS transactions
    FROM ${T}
    ${where}
    GROUP BY bucket
    ORDER BY bucket
  `;
  return runQuery(sql, params, types);
}

// --------------------------------------------------------------------
// Top dimensions

async function getTopByDimension(filters, dimension, limit = 10) {
  // Whitelist the dimension column to keep SQL safe.
  const allowed = ['store', 'category', 'terminal', 'cashier', 'product_name', 'sku', 'event_name'];
  if (!allowed.includes(dimension)) {
    throw new Error(`Invalid dimension: ${dimension}`);
  }
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const { where, params, types } = buildWhere(filters);
  const sql = `
    SELECT
      ${dimension} AS label,
      COALESCE(SUM(total), 0)                AS revenue,
      COALESCE(SUM(net_sales), 0)            AS net_sales,
      COALESCE(SUM(qty), 0)                  AS items,
      COUNT(DISTINCT txn_number)             AS transactions
    FROM ${T}
    ${where}
    ${where ? 'AND' : 'WHERE'} ${dimension} IS NOT NULL
    GROUP BY ${dimension}
    ORDER BY revenue DESC
    LIMIT ${safeLimit}
  `;
  return runQuery(sql, params, types);
}

// --------------------------------------------------------------------
// Top products (more columns)

async function getTopProducts(filters, limit = 20) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);
  const { where, params, types } = buildWhere(filters);
  const sql = `
    SELECT
      sku,
      ANY_VALUE(product_name)                AS product_name,
      ANY_VALUE(category)                    AS category,
      COALESCE(SUM(qty), 0)                  AS items,
      COALESCE(SUM(net_sales), 0)            AS net_sales,
      COALESCE(SUM(total), 0)                AS revenue,
      COUNT(DISTINCT txn_number)             AS transactions
    FROM ${T}
    ${where}
    ${where ? 'AND' : 'WHERE'} sku IS NOT NULL
    GROUP BY sku
    ORDER BY revenue DESC
    LIMIT ${safeLimit}
  `;
  return runQuery(sql, params, types);
}

// --------------------------------------------------------------------
// Day of week × store heatmap

async function getDayOfWeekHeatmap(filters) {
  const { where, params, types } = buildWhere(filters);
  const sql = `
    SELECT
      EXTRACT(DAYOFWEEK FROM transaction_date) AS dow, -- 1=Sunday..7=Saturday
      COALESCE(SUM(total), 0)                  AS revenue,
      COUNT(DISTINCT txn_number)               AS transactions
    FROM ${T}
    ${where}
    GROUP BY dow
    ORDER BY dow
  `;
  return runQuery(sql, params, types);
}

// --------------------------------------------------------------------
// Filter dropdown options + date bounds (cached longer because they change less)

async function getFilterOptions() {
  const sql = `
    SELECT
      ARRAY(SELECT DISTINCT store      FROM ${T} WHERE store      IS NOT NULL ORDER BY store)      AS stores,
      ARRAY(SELECT DISTINCT category   FROM ${T} WHERE category   IS NOT NULL ORDER BY category)   AS categories,
      ARRAY(SELECT DISTINCT terminal   FROM ${T} WHERE terminal   IS NOT NULL ORDER BY terminal)   AS terminals,
      ARRAY(SELECT DISTINCT cashier    FROM ${T} WHERE cashier    IS NOT NULL ORDER BY cashier)    AS cashiers,
      ARRAY(SELECT DISTINCT event_name FROM ${T} WHERE event_name IS NOT NULL ORDER BY event_name) AS events,
      (SELECT MIN(transaction_date) FROM ${T}) AS min_date,
      (SELECT MAX(transaction_date) FROM ${T}) AS max_date
  `;
  const rows = await runQuery(sql, {}, {}, 60 * 30); // cache 30 min
  return rows[0] || {};
}

module.exports = {
  getKpis,
  getSalesOverTime,
  getTopByDimension,
  getTopProducts,
  getDayOfWeekHeatmap,
  getFilterOptions,
};
