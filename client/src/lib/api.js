async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function qs(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, v);
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

export const api = {
  me: () => request('/api/me'),
  login: (username, password) =>
    request('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request('/api/logout', { method: 'POST' }),

  filters: () => request('/api/filters'),
  kpis: (f) => request(`/api/kpis${qs(f)}`),
  salesOverTime: (f, granularity) =>
    request(`/api/sales-over-time${qs({ ...f, granularity })}`),
  topByDimension: (dimension, f, limit) =>
    request(`/api/top/${dimension}${qs({ ...f, limit })}`),
  topProducts: (f, limit) => request(`/api/top-products${qs({ ...f, limit })}`),
  dowHeatmap: (f) => request(`/api/dow-heatmap${qs(f)}`),
};
