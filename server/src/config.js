require('dotenv').config();

const required = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
};

const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  projectId: required('GCP_PROJECT_ID'),
  dataset: process.env.BQ_DATASET || 'geidea',
  table: process.env.BQ_TABLE || 'geidea_order_items',
  username: required('DASH_USERNAME'),
  password: required('DASH_PASSWORD'),
  sessionSecret: required('SESSION_SECRET'),
  cacheTtlSeconds: parseInt(process.env.QUERY_CACHE_TTL_SECONDS || '300', 10),
};

config.fullTable = `\`${config.projectId}.${config.dataset}.${config.table}\``;

module.exports = config;
