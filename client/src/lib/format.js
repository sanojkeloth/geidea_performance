const numberFmt = new Intl.NumberFormat('en-US');

export function n(v, digits = 0) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(v));
}

export function money(v, currency = 'SAR', digits = 0) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number(v));
}

export function compact(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(v));
}

export function compactMoney(v, currency = 'SAR') {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Number(v));
}

export function pct(v, digits = 1) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—';
  return `${Number(v).toFixed(digits)}%`;
}

export const fmt = { n, money, compact, compactMoney, pct, numberFmt };
