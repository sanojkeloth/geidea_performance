import ChartCard from './ChartCard.jsx';

export default function DataTable({ title, columns, rows, action, empty = 'No data' }) {
  return (
    <ChartCard title={title} action={action}>
      <div className="overflow-x-auto -mx-5">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-ink-400 border-b border-ink-700">
              {columns.map((c) => (
                <th key={c.key} className={`px-5 py-2.5 ${c.align === 'right' ? 'text-right' : ''}`}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(rows || []).length === 0 && (
              <tr>
                <td className="px-5 py-6 text-center text-ink-500" colSpan={columns.length}>{empty}</td>
              </tr>
            )}
            {(rows || []).map((row, i) => (
              <tr key={i} className="border-b border-ink-700/60 hover:bg-ink-700/30 text-ink-200">
                {columns.map((c) => (
                  <td key={c.key} className={`px-5 py-2.5 ${c.align === 'right' ? 'text-right tabular-nums' : ''} ${c.mono ? 'font-mono text-xs text-ink-300' : ''}`}>
                    {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  );
}
