import ChartCard from '../ChartCard.jsx';
import { compact, compactMoney } from '../../lib/format.js';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DowHeatmap({ data }) {
  const byDow = new Map((data || []).map((r) => [Number(r.dow), r]));
  const max = Math.max(1, ...(data || []).map((r) => Number(r.revenue) || 0));

  return (
    <ChartCard title="Activity by day of week">
      <div className="grid grid-cols-7 gap-2">
        {dayNames.map((name, i) => {
          const dow = i + 1; // BigQuery dow: 1=Sunday..7=Saturday
          const row = byDow.get(dow);
          const rev = Number(row?.revenue) || 0;
          const txns = Number(row?.transactions) || 0;
          const intensity = max > 0 ? rev / max : 0;
          // Blend brand-500 over the dark card background.
          const bg = `rgba(91, 138, 255, ${0.08 + intensity * 0.55})`;
          const ring = `rgba(91, 138, 255, ${0.15 + intensity * 0.45})`;
          return (
            <div
              key={dow}
              className="rounded-xl p-3 text-center transition hover:scale-[1.02] border"
              style={{ background: bg, borderColor: ring }}
              title={`${name}: ${compactMoney(rev)} · ${compact(txns)} txns`}
            >
              <div className="text-xs font-medium text-ink-300">{name}</div>
              <div className="text-base font-bold mt-1 text-ink-100">{compactMoney(rev)}</div>
              <div className="text-[11px] text-ink-400 mt-0.5">{compact(txns)} txns</div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
