const { BigQuery } = require('@google-cloud/bigquery');
const config = require('./config');
const cache = require('./cache');

const client = new BigQuery({ projectId: config.projectId });

function cacheKey(sql, params) {
  return `${sql}::${JSON.stringify(params)}`;
}

// Convert BigQuery wrapper types (BigQueryDate, BigQueryDecimal, etc.) into
// plain JSON-friendly primitives so the frontend can use them directly.
function normalize(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === 'object') {
    if (typeof value.value === 'string') {
      // BigQueryDate / BigQueryDatetime / BigQueryTime → keep as ISO-ish string
      // BigQueryNumeric / BigQueryBigNumeric → convert to JS number
      const ctorName = value.constructor && value.constructor.name;
      if (ctorName === 'BigQueryDecimal' || ctorName === 'Big') {
        const n = Number(value.value);
        return Number.isFinite(n) ? n : value.value;
      }
      return value.value;
    }
    const out = {};
    for (const k of Object.keys(value)) out[k] = normalize(value[k]);
    return out;
  }
  return value;
}

async function runQuery(sql, params = {}, types = {}, ttlSeconds) {
  return cache.memoize(cacheKey(sql, params), async () => {
    const [rows] = await client.query({
      query: sql,
      params,
      types,
      location: 'US',
    });
    return rows.map(normalize);
  }, ttlSeconds);
}

module.exports = { client, runQuery };
