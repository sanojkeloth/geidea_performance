const { BigQuery } = require('@google-cloud/bigquery');
const config = require('./config');
const cache = require('./cache');

const client = new BigQuery({ projectId: config.projectId });

function cacheKey(sql, params) {
  // Wrapped types like BigQueryDate don't serialize naturally; pull .value out
  // so the key is stable across calls.
  const flat = {};
  for (const k of Object.keys(params || {})) {
    const v = params[k];
    flat[k] = v && typeof v === 'object' && 'value' in v ? v.value : v;
  }
  return `${sql}::${JSON.stringify(flat)}`;
}

// Convert BigQuery wrapper types (BigQueryDate, BigQueryNumeric, etc.) into
// plain JSON-friendly primitives so the frontend can use them directly.
function normalize(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === 'object') {
    if (typeof value.value === 'string') {
      const ctorName = value.constructor && value.constructor.name;
      // Numeric wrappers → plain JS number
      if (
        ctorName === 'BigQueryDecimal'
        || ctorName === 'BigQueryNumeric'
        || ctorName === 'BigQueryBigNumeric'
        || ctorName === 'Big'
      ) {
        const n = Number(value.value);
        return Number.isFinite(n) ? n : value.value;
      }
      // Date / Datetime / Time wrappers → ISO-ish string
      return value.value;
    }
    const out = {};
    for (const k of Object.keys(value)) out[k] = normalize(value[k]);
    return out;
  }
  return value;
}

async function runQuery(sql, params = {}, ttlSeconds) {
  return cache.memoize(cacheKey(sql, params), async () => {
    const [rows] = await client.query({
      query: sql,
      params,
      location: 'US',
    });
    return rows.map(normalize);
  }, ttlSeconds);
}

module.exports = { client, runQuery };
