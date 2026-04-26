import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Cell,
} from 'recharts';
import ChartCard from '../ChartCard.jsx';
import { compactMoney, compact } from '../../lib/format.js';

const palette = ['#2849dc', '#3a66f6', '#5b8aff', '#8eb3ff', '#10b981', '#34d399', '#f59e0b', '#f97316', '#ef4444', '#a855f7'];

export default function HorizontalBars({ title, data, height = 320, valueKey = 'revenue', valueLabel = 'Revenue', currency = false }) {
  const fmt = currency ? compactMoney : compact;
  return (
    <ChartCard title={title}>
      <div style={{ height }}>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 4, right: 20, left: 8, bottom: 4 }}
          >
            <CartesianGrid stroke="#eef0f4" horizontal={false} />
            <XAxis type="number" tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11, fill: '#7f8aa0' }} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 12, fill: '#3f4759' }}
              width={140}
              interval={0}
            />
            <Tooltip
              formatter={(v) => [fmt(v), valueLabel]}
              contentStyle={{ borderRadius: 12 }}
            />
            <Bar dataKey={valueKey} radius={[0, 8, 8, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
