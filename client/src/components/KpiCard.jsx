import clsx from 'clsx';

export default function KpiCard({ label, value, sublabel, icon: Icon, accent = 'brand' }) {
  const accents = {
    brand:   'bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
    amber:   'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30',
    rose:    'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
    violet:  'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30',
    sky:     'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30',
    slate:   'bg-ink-700/60 text-ink-200 ring-1 ring-ink-600',
  };
  return (
    <div className="card card-pad flex items-start gap-4 hover:border-ink-600 transition-colors">
      {Icon && (
        <div className={clsx('w-11 h-11 rounded-xl grid place-items-center flex-shrink-0', accents[accent] || accents.brand)}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-400">{label}</div>
        <div className="text-2xl font-bold text-ink-100 mt-1 truncate">{value}</div>
        {sublabel && <div className="text-xs text-ink-500 mt-0.5 truncate">{sublabel}</div>}
      </div>
    </div>
  );
}
