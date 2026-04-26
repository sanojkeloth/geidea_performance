const config = require('./config');

const store = new Map();

function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

function set(key, value, ttlSeconds = config.cacheTtlSeconds) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

async function memoize(key, fn, ttlSeconds) {
  const hit = get(key);
  if (hit !== undefined) return hit;
  const value = await fn();
  set(key, value, ttlSeconds);
  return value;
}

function clear() {
  store.clear();
}

module.exports = { get, set, memoize, clear };
