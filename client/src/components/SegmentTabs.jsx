import { Layers, UtensilsCrossed, ShoppingBasket, Sparkles } from 'lucide-react';

const SEGMENTS = [
  { id: 'all',   label: 'All',   icon: Layers },
  { id: 'fb',    label: 'F&B',   icon: UtensilsCrossed },
  { id: 'merch', label: 'Merch', icon: ShoppingBasket },
  { id: 'glam',  label: 'Glam',  icon: Sparkles },
];

export default function SegmentTabs({ value, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 bg-ink-800 border border-ink-700 rounded-xl p-1.5">
      {SEGMENTS.map(({ id, label, icon: Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
              active
                ? 'bg-brand-600 text-white shadow'
                : 'text-ink-300 hover:text-ink-100 hover:bg-ink-700/60'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
