// Build a BigQuery WHERE clause + params from optional dashboard filters.
// All filter inputs are passed as named query parameters — never concatenated
// into SQL — so this is safe from injection.

const { BigQuery } = require('@google-cloud/bigquery');
const { SEGMENT_SQL, brandSql, SEGMENT_VALUES } = require('./segments');

const bq = new BigQuery();

// Filters that map directly to a real column.
const COLUMN_FILTERS = ['category', 'event_name'];

function parseFilters(query) {
  const f = {
    from: query.from || null,
    to: query.to || null,
    segment: (query.segment && SEGMENT_VALUES[query.segment]) ? query.segment : null,
    brand: query.brand && query.brand.trim() !== '' ? query.brand.trim() : null,
  };
  for (const k of COLUMN_FILTERS) {
    f[k] = query[k] && query[k].trim() !== '' ? query[k].trim() : null;
  }
  return f;
}

// Apply F&B-only restriction on top of whatever the caller already passed.
function withFb(filters) {
  return { ...filters, segment: 'fb' };
}

function buildWhere(filters) {
  const conditions = [];
  const params = {};

  if (filters.from) {
    conditions.push('transaction_date >= @from');
    params.from = bq.date(filters.from);
  }
  if (filters.to) {
    conditions.push('transaction_date <= @to');
    params.to = bq.date(filters.to);
  }

  if (filters.segment && SEGMENT_VALUES[filters.segment]) {
    conditions.push(`(${SEGMENT_SQL}) IN UNNEST(@segment_values)`);
    params.segment_values = SEGMENT_VALUES[filters.segment];
  }

  if (filters.brand) {
    conditions.push(`(${brandSql()}) = @brand`);
    params.brand = filters.brand;
  }

  for (const k of COLUMN_FILTERS) {
    if (filters[k]) {
      conditions.push(`${k} = @${k}`);
      params[k] = filters[k];
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

module.exports = { parseFilters, buildWhere, withFb, COLUMN_FILTERS };
