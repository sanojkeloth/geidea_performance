const config = require('./config');
const { runQuery } = require('./bigquery');
const { buildWhere, withFb } = require('./filters');
const { SEGMENT_SQL, CITY_SQL, brandSql } = require('./segments');

const T = config.fullTable;

// --------------------------------------------------------------------
// KPIs

async function getKpis(filters) {
  const { where, params } = buildWhere(filters);
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
  const rows = await runQuery(sql, params);
  return rows[0] || {};
}

// --------------------------------------------------------------------
// F&B revenue split (for the combined Food/Beverage KPI tile)

async function getFbSplit(filters) {
  // Force F&B even if the global segment chip is set elsewhere.
  const { where, params } = buildWhere(withFb(filters));
  const sql = `
    SELECT
      ${SEGMENT_SQL} AS segment,
      COALESCE(SUM(total), 0) AS revenue,
      COALESCE(SUM(qty), 0)   AS items,
      COUNT(DISTINCT txn_number) AS transactions
    FROM ${T}
    ${where}
    GROUP BY segment
  `;
  return runQuery(sql, params);
}

// --------------------------------------------------------------------
// Sales over time

const GRANULARITY = {
  day: 'DAY',
  week: 'WEEK(MONDAY)',
  month: 'MONTH',
};

async function getSalesOverTime(filters, granularity = 'day') {
  const trunc = GRANULARITY[granularity] || GRANULARITY.day;
  const { where, params } = buildWhere(filters);
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
  return runQuery(sql, params);
}

// --------------------------------------------------------------------
// Top dimensions

// Real columns are listed by name; virtual dimensions (brand, segment)
// resolve to a SQL expression. Anything not in this map is rejected.
function dimensionExpr(dimension) {
  const real = {
    store:        'store',
    category:     'category',
    product_name: 'product_name',
    sku:          'sku',
    event_name:   'event_name',
  };
  if (real[dimension]) return real[dimension];
  if (dimension === 'brand')   return brandSql();
  if (dimension === 'segment') return SEGMENT_SQL;
  return null;
}

async function getTopByDimension(filters, dimension, limit = 10) {
  const expr = dimensionExpr(dimension);
  if (!expr) throw new Error(`Invalid dimension: ${dimension}`);
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const { where, params } = buildWhere(filters);
  const sql = `
    SELECT
      ${expr} AS label,
      COALESCE(SUM(total), 0)        AS revenue,
      COALESCE(SUM(net_sales), 0)    AS net_sales,
      COALESCE(SUM(qty), 0)          AS items,
      COUNT(DISTINCT txn_number)     AS transactions
    FROM ${T}
    ${where}
    GROUP BY label
    HAVING label IS NOT NULL
    ORDER BY revenue DESC
    LIMIT ${safeLimit}
  `;
  return runQuery(sql, params);
}

// Top stores restricted to F&B (food + beverage) regardless of global filter.
async function getTopFbStores(filters, limit = 10) {
  return getTopByDimension(withFb(filters), 'store', limit);
}

// --------------------------------------------------------------------
// Top products

async function getTopProducts(filters, limit = 20) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 200);
  const { where, params } = buildWhere(filters);
  const sql = `
    SELECT
      sku,
      ANY_VALUE(product_name) AS product_name,
      ANY_VALUE(category)     AS category,
      COALESCE(SUM(qty), 0)              AS items,
      COALESCE(SUM(net_sales), 0)        AS net_sales,
      COALESCE(SUM(total), 0)            AS revenue,
      COUNT(DISTINCT txn_number)         AS transactions
    FROM ${T}
    ${where}
    GROUP BY sku
    HAVING sku IS NOT NULL
    ORDER BY revenue DESC
    LIMIT ${safeLimit}
  `;
  return runQuery(sql, params);
}

// --------------------------------------------------------------------
// Day of week heatmap

async function getDayOfWeekHeatmap(filters) {
  const { where, params } = buildWhere(filters);
  const sql = `
    SELECT
      EXTRACT(DAYOFWEEK FROM transaction_date) AS dow,
      COALESCE(SUM(total), 0)                  AS revenue,
      COUNT(DISTINCT txn_number)               AS transactions
    FROM ${T}
    ${where}
    GROUP BY dow
    ORDER BY dow
  `;
  return runQuery(sql, params);
}

// --------------------------------------------------------------------
// Filter dropdown options + date bounds

async function getFilterOptions() {
  const sql = `
    SELECT
      ARRAY(
        SELECT brand FROM (
          SELECT DISTINCT ${brandSql()} AS brand
          FROM ${T}
          WHERE store IS NOT NULL
        )
        WHERE brand IS NOT NULL
        ORDER BY brand
      ) AS brands,
      ARRAY(SELECT DISTINCT category   FROM ${T} WHERE category   IS NOT NULL ORDER BY category)   AS categories,
      ARRAY(SELECT DISTINCT event_name FROM ${T} WHERE event_name IS NOT NULL ORDER BY event_name) AS events,
      ARRAY(
        SELECT city FROM (
          SELECT DISTINCT ${CITY_SQL} AS city FROM ${T}
        )
        WHERE city IS NOT NULL
        ORDER BY
          CASE city WHEN 'Other' THEN 1 ELSE 0 END,
          city
      ) AS cities,
      (SELECT MIN(transaction_date) FROM ${T}) AS min_date,
      (SELECT MAX(transaction_date) FROM ${T}) AS max_date
  `;
  const rows = await runQuery(sql, {}, 60 * 30); // 30 min cache
  return rows[0] || {};
}

module.exports = {
  getKpis,
  getFbSplit,
  getSalesOverTime,
  getTopByDimension,
  getTopFbStores,
  getTopProducts,
  getDayOfWeekHeatmap,
  getFilterOptions,
};
