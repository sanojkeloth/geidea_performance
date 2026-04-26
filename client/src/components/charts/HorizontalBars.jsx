import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Cell,
} from 'recharts';
import ChartCard from '../ChartCard.jsx';
import { compactMoney, compact } from '../../lib/format.js';

const palette = ['#5b8aff', '#3a66f6', '#8eb3ff', '#34d399', '#10b981', '#f59e0b', '#fb923c', '#f87171', '#a78bfa', '#22d3ee'];

function truncate(label, max = 26) {
  if (typeof label !== 'string') return label ?? '';
  return label.length > max ? `${label.slice(0, max - 1)}…` : label;
}

export default function HorizontalBars({ title, data, height, valueKey = 'revenue', valueLabel = 'Revenue', currency = false }) {
  const fmt = currency ? compactMoney : compact;
  const rows = (data || []).map((d) => ({ ...d, _full: d.label, label: truncate(d.label, 24) }));
  // Scale chart height with row count so labels never collide.
  const computedHeight = height ?? Math.max(220, rows.length * 34 + 40);

  return (
    <ChartCard title={title}>
      <div style={{ height: computedHeight }}>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={rows}
            margin={{ top: 4, right: 18, left: 8, bottom: 4 }}
            barCategoryGap={6}
          >
            <CartesianGrid stroke="#1d2640" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => fmt(v)}
              tick={{ fontSize: 11, fill: '#6c7593' }}
              tickLine={{ stroke: '#1d2640' }}
              axisLine={{ stroke: '#1d2640' }}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 12, fill: '#cfd4e3' }}
              tickLine={false}
              axisLine={{ stroke: '#1d2640' }}
              width={200}
              interval={0}
            />
            <Tooltip
              formatter={(v) => [fmt(v), valueLabel]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?._full || ''}
              contentStyle={{ borderRadius: 12 }}
              cursor={{ fill: 'rgba(91, 138, 255, 0.08)' }}
            />
            <Bar dataKey={valueKey} radius={[0, 8, 8, 0]} maxBarSize={22}>
              {rows.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
