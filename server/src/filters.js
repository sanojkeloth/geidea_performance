// Build a BigQuery WHERE clause + params from optional dashboard filters.
// All filter inputs are passed as named query parameters — never concatenated
// into SQL — so this is safe from injection.

const { BigQuery } = require('@google-cloud/bigquery');

const bq = new BigQuery();

const FILTER_FIELDS = ['store', 'category', 'terminal', 'cashier', 'event_name'];

function parseFilters(query) {
  const f = {
    from: query.from || null, // YYYY-MM-DD
    to: query.to || null, // YYYY-MM-DD
  };
  for (const k of FILTER_FIELDS) {
    f[k] = query[k] && query[k].trim() !== '' ? query[k].trim() : null;
  }
  return f;
}

function buildWhere(filters) {
  const conditions = [];
  const params = {};

  if (filters.from) {
    conditions.push('transaction_date >= @from');
    params.from = bq.date(filters.from); // BigQueryDate carries DATE type
  }
  if (filters.to) {
    conditions.push('transaction_date <= @to');
    params.to = bq.date(filters.to);
  }

  for (const k of FILTER_FIELDS) {
    if (filters[k]) {
      conditions.push(`${k} = @${k}`);
      params[k] = filters[k]; // plain string → BigQuery infers STRING
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

module.exports = { parseFilters, buildWhere, FILTER_FIELDS };
