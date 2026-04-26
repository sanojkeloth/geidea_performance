import ChartCard from './ChartCard.jsx';

export default function DataTable({ title, columns, rows, action, empty = 'No data' }) {
  return (
    <ChartCard title={title} action={action}>
      <div className="overflow-x-auto -mx-5">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-ink-500 border-b border-ink-100">
              {columns.map((c) => (
                <th key={c.key} className={`px-5 py-2.5 ${c.align === 'right' ? 'text-right' : ''}`}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(rows || []).length === 0 && (
              <tr>
                <td className="px-5 py-6 text-center text-ink-400" colSpan={columns.length}>{empty}</td>
              </tr>
            )}
            {(rows || []).map((row, i) => (
              <tr key={i} className="border-b border-ink-50 hover:bg-ink-50/50">
                {columns.map((c) => (
                  <td key={c.key} className={`px-5 py-2.5 ${c.align === 'right' ? 'text-right tabular-nums' : ''} ${c.mono ? 'font-mono text-xs' : ''}`}>
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
