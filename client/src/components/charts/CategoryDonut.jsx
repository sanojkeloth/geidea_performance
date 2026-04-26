import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts';
import ChartCard from '../ChartCard.jsx';
import { compactMoney } from '../../lib/format.js';

const palette = ['#2849dc', '#3a66f6', '#5b8aff', '#8eb3ff', '#bcd2ff', '#10b981', '#34d399', '#f59e0b', '#f97316', '#ef4444'];

export default function CategoryDonut({ title, data }) {
  const items = (data || []).map((d, i) => ({
    name: d.label || 'Unknown',
    value: Number(d.revenue) || 0,
    color: palette[i % palette.length],
  }));
  const total = items.reduce((s, x) => s + x.value, 0);

  return (
    <ChartCard title={title}>
      <div className="h-72 flex">
        <div className="flex-1">
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
                innerRadius={60}
                outerRadius={92}
                paddingAngle={2}
                stroke="white"
                strokeWidth={2}
              >
                {items.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value, _e, idx) => {
                  const it = items[idx];
                  if (!it || total === 0) return value;
                  return `${value} · ${((it.value / total) * 100).toFixed(1)}%`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  );
}
