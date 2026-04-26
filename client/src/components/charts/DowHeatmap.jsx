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
          const bg = `rgba(40, 73, 220, ${0.08 + intensity * 0.85})`;
          return (
            <div
              key={dow}
              className="rounded-xl p-3 text-center text-white transition hover:scale-[1.02]"
              style={{ background: bg }}
              title={`${name}: ${compactMoney(rev)} · ${compact(txns)} txns`}
            >
              <div className="text-xs font-medium opacity-90">{name}</div>
              <div className="text-base font-bold mt-1">{compactMoney(rev)}</div>
              <div className="text-[11px] opacity-80 mt-0.5">{compact(txns)} txns</div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
