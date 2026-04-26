import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend,
} from 'recharts';
import ChartCard from '../ChartCard.jsx';
import { compactMoney, compact } from '../../lib/format.js';

const granularities = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
];

export default function SalesOverTime({ data, granularity, setGranularity }) {
  return (
    <ChartCard
      title="Sales over time"
      action={
        <div className="flex items-center gap-1 bg-ink-900/70 border border-ink-700 rounded-lg p-1">
          {granularities.map((g) => (
            <button
              key={g.id}
              onClick={() => setGranularity(g.id)}
              className={`text-xs font-medium px-2.5 py-1 rounded-md transition ${
                granularity === g.id ? 'bg-brand-600 text-white shadow' : 'text-ink-400 hover:text-ink-200'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-72">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5b8aff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#5b8aff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="net" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1d2640" vertical={false} />
            <XAxis
              dataKey="bucket"
              tick={{ fontSize: 11, fill: '#6c7593' }}
              tickLine={{ stroke: '#1d2640' }}
              axisLine={{ stroke: '#1d2640' }}
            />
            <YAxis
              tickFormatter={(v) => compact(v)}
              tick={{ fontSize: 11, fill: '#6c7593' }}
              tickLine={{ stroke: '#1d2640' }}
              axisLine={{ stroke: '#1d2640' }}
              width={50}
            />
            <Tooltip
              formatter={(v, name) => [compactMoney(v), name]}
              contentStyle={{ borderRadius: 12 }}
              cursor={{ stroke: '#2d3654', strokeWidth: 1 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#5b8aff"
              strokeWidth={2}
              fill="url(#rev)"
            />
            <Area
              type="monotone"
              dataKey="net_sales"
              name="Net sales"
              stroke="#34d399"
              strokeWidth={2}
              fill="url(#net)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
