import { CalendarRange, RotateCcw } from 'lucide-react';

function Select({ label, value, onChange, options, placeholder = 'All' }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select
        className="input"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">{placeholder}</option>
        {(options || []).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export default function FiltersBar({ filters, options, onChange, onReset }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="card card-pad">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-ink-200 font-semibold">
          <CalendarRange size={18} className="text-brand-400" />
          Filters
        </div>
        <button onClick={onReset} className="btn-ghost text-xs py-1.5 px-2.5">
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div>
          <label className="label">From</label>
          <input
            type="date"
            className="input"
            value={filters.from || ''}
            min={options?.min_date || undefined}
            max={options?.max_date || undefined}
            onChange={(e) => set({ from: e.target.value || null })}
          />
        </div>
        <div>
          <label className="label">To</label>
          <input
            type="date"
            className="input"
            value={filters.to || ''}
            min={options?.min_date || undefined}
            max={options?.max_date || undefined}
            onChange={(e) => set({ to: e.target.value || null })}
          />
        </div>
        <Select label="Brand"    value={filters.brand}      options={options?.brands}     onChange={(v) => set({ brand: v })} />
        <Select label="Category" value={filters.category}   options={options?.categories} onChange={(v) => set({ category: v })} />
        <Select label="Event"    value={filters.event_name} options={options?.events}     onChange={(v) => set({ event_name: v })} />
      </div>
    </div>
  );
}
