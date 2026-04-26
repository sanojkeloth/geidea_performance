import clsx from 'clsx';

export default function KpiCard({ label, value, sublabel, icon: Icon, accent = 'brand' }) {
  const accents = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600',
    sky: 'bg-sky-50 text-sky-600',
    slate: 'bg-ink-100 text-ink-600',
  };
  return (
    <div className="card card-pad flex items-start gap-4">
      {Icon && (
        <div className={clsx('w-11 h-11 rounded-xl grid place-items-center flex-shrink-0', accents[accent] || accents.brand)}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide font-medium text-ink-500">{label}</div>
        <div className="text-2xl font-bold text-ink-900 mt-1 truncate">{value}</div>
        {sublabel && <div className="text-xs text-ink-400 mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
}
