import { UtensilsCrossed } from 'lucide-react';
import { compactMoney, money } from '../lib/format.js';

export default function FbSplitCard({ data }) {
  // data: [{ segment: 'food'|'beverage', revenue, items, transactions }, ...]
  const food = data?.find?.((d) => d.segment === 'food') || {};
  const bev  = data?.find?.((d) => d.segment === 'beverage') || {};
  const foodRev = Number(food.revenue) || 0;
  const bevRev  = Number(bev.revenue)  || 0;
  const total   = foodRev + bevRev;
  const foodPct = total > 0 ? (foodRev / total) * 100 : 0;
  const bevPct  = total > 0 ? (bevRev  / total) * 100 : 0;

  return (
    <div className="card card-pad sm:col-span-2 xl:col-span-2">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl grid place-items-center flex-shrink-0 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
            <UtensilsCrossed size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-400">F&B Revenue</div>
            <div className="text-2xl font-bold text-ink-100 mt-1 truncate">{compactMoney(total)}</div>
            <div className="text-xs text-ink-500 mt-0.5 truncate">Food + Beverage · {money(total)}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Row
          label="Food"
          revenue={foodRev}
          pct={foodPct}
          color="bg-amber-400"
          dot="bg-amber-400"
        />
        <Row
          label="Beverage"
          revenue={bevRev}
          pct={bevPct}
          color="bg-sky-400"
          dot="bg-sky-400"
        />
      </div>
    </div>
  );
}

function Row({ label, revenue, pct, color, dot }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="flex items-center gap-2 text-ink-200">
          <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
          {label}
        </span>
        <span className="tabular-nums text-ink-300">
          <span className="font-semibold">{compactMoney(revenue)}</span>
          <span className="text-ink-500"> · {pct.toFixed(1)}%</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-ink-700/70 overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500`}
          style={{ width: `${Math.max(pct, 1)}%` }}
        />
      </div>
    </div>
  );
}
