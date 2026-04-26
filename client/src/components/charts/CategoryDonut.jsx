import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from 'recharts';
import ChartCard from '../ChartCard.jsx';
import { compactMoney } from '../../lib/format.js';

const palette = ['#5b8aff', '#3a66f6', '#8eb3ff', '#bcd2ff', '#34d399', '#10b981', '#f59e0b', '#fb923c', '#f87171', '#a78bfa'];

export default function CategoryDonut({ title, data }) {
  const items = (data || []).map((d, i) => ({
    name: d.label || 'Unknown',
    value: Number(d.revenue) || 0,
    color: palette[i % palette.length],
  }));
  const total = items.reduce((s, x) => s + x.value, 0);

  return (
    <ChartCard title={title}>
      <div className="grid grid-rows-[1fr_auto] gap-4 h-72">
        <div className="min-h-0">
          <ResponsiveContainer>
            <PieChart>
              <Tooltip
                formatter={(v, _n, p) => [compactMoney(v), p?.payload?.name]}
                contentStyle={{ borderRadius: 12 }}
              />
              <Pie
                data={items}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={86}
                paddingAngle={2}
                stroke="#131a2c"
                strokeWidth={2}
              >
                {items.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
          {items.map((it) => {
            const share = total > 0 ? (it.value / total) * 100 : 0;
            return (
              <li key={it.name} className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: it.color }}
                />
                <span className="text-ink-200 truncate" title={it.name}>{it.name}</span>
                <span className="ml-auto text-ink-400 tabular-nums flex-shrink-0">{share.toFixed(1)}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </ChartCard>
  );
}
