// Display-friendly labels for raw event_name values from BigQuery.
// Keys are the exact raw values; values are what we render in the UI.
// The raw value is still used as the filter parameter, so backend queries
// don't need to change.
const EVENT_LABELS = {
  alulaevent:    'Alula',
  baladbeast25:  'Balad Beast 2025',
  mdlbeast1001:  'MdlBeast1001',
  onyx24:        'Onyx 2024',
  soundstorm23:  'SoundStorm 2023',
  soundstorm24:  'SoundStorm 2024',
};

export function prettyEvent(raw) {
  if (raw === null || raw === undefined) return raw;
  return EVENT_LABELS[raw] || raw;
}
