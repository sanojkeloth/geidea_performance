export default function ChartCard({ title, action, children, className = '' }) {
  return (
    <div className={`card card-pad ${className}`}>
      <div className="flex items-center justify-between mb-3 gap-3">
        <h3 className="font-semibold text-ink-100">{title}</h3>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}
