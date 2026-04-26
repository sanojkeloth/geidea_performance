import { useState } from 'react';
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
        <div className="flex items-center gap-1 bg-ink-100 rounded-lg p-1">
          {granularities.map((g) => (
            <button
              key={g.id}
              onClick={() => setGranularity(g.id)}
              className={`text-xs font-medium px-2.5 py-1 rounded-md transition ${
                granularity === g.id ? 'bg-white text-ink-800 shadow-sm' : 'text-ink-500 hover:text-ink-700'
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
                <stop offset="0%" stopColor="#3a66f6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3a66f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="net" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" vertical={false} />
            <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: '#7f8aa0' }} />
            <YAxis
              tickFormatter={(v) => compact(v)}
              tick={{ fontSize: 11, fill: '#7f8aa0' }}
              width={50}
            />
            <Tooltip
              formatter={(v, name) => [compactMoney(v), name]}
              labelClassName="text-ink-700 font-medium"
              contentStyle={{ borderRadius: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#3a66f6"
              strokeWidth={2}
              fill="url(#rev)"
            />
            <Area
              type="monotone"
              dataKey="net_sales"
              name="Net sales"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#net)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
