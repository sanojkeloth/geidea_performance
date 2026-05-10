// Centralized SQL expressions for derived columns: segment + brand.
//
// Edit the rules here when your taxonomy changes; everything else in the
// dashboard reads these expressions, so the UI updates automatically.

// --------------------------------------------------------------------
// Segment: Food / Beverage / Merch / Glam derived from `category`.
//
// Order matters: the first matching pattern wins. Anything that doesn't
// match falls through to 'food'. Tweak the regex content below to fit
// your real categories.
const SEGMENT_SQL = `
  CASE
    WHEN REGEXP_CONTAINS(LOWER(category), r'bev|drink|coffee|tea|water|juice|soda|pepsi|cola|mocktail|smoothie|shake|latte|americano|espresso') THEN 'beverage'
    WHEN REGEXP_CONTAINS(LOWER(category), r'merch|tee|tshirt|t-shirt|shirt|hoodie|cap|hat|poster|tote|wristband|sticker|pin|sweater|jacket|bag') THEN 'merch'
    WHEN REGEXP_CONTAINS(LOWER(category), r'paint|glitter|tattoo|glam|nail|hair|makeup|spray|airbrush|braid|jewel|gem|lash') THEN 'glam'
    ELSE 'food'
  END
`;

// --------------------------------------------------------------------
// Brand: extracted from the `store` string.
//
// Default: the last dot-separated segment. e.g. FT2.FT22.KFC -> KFC
//
// To override specific stores, paste a mapping into BRAND_OVERRIDES.
// Keys are the exact `store` values; values are the brand to display.
//
// Example:
//   const BRAND_OVERRIDES = {
//     'VIB Terrace 1.VIB T1.Merch Store': 'VIB Terrace Merch',
//     'Boneyard.Merch': 'Boneyard',
//   };
const BRAND_OVERRIDES = {
  // paste mappings here
};

function brandSql() {
  const fallback = `COALESCE(NULLIF(TRIM(REGEXP_EXTRACT(store, r'[^.]+$')), ''), store)`;

  const entries = Object.entries(BRAND_OVERRIDES);
  if (entries.length === 0) return fallback;

  // Build a deterministic CASE expression. Values are hardcoded by the
  // developer (not user input), so embedding them is safe — we still
  // escape single quotes defensively.
  const esc = (s) => String(s).replace(/'/g, "\\'");
  const cases = entries
    .map(([store, brand]) => `WHEN store = '${esc(store)}' THEN '${esc(brand)}'`)
    .join('\n      ');
  return `
    CASE
      ${cases}
      ELSE ${fallback}
    END
  `;
}

// --------------------------------------------------------------------
// Segment chip values that the client sends → SQL filter values.

const SEGMENT_VALUES = {
  all:   null,                    // no filter
  fb:    ['food', 'beverage'],
  food:  ['food'],
  beverage: ['beverage'],
  merch: ['merch'],
  glam:  ['glam'],
};

module.exports = {
  SEGMENT_SQL,
  BRAND_OVERRIDES,
  brandSql,
  SEGMENT_VALUES,
};
