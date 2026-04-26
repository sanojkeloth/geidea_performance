import { BarChart3, LogOut, RefreshCw } from 'lucide-react';

export default function Layout({ user, onLogout, onRefresh, refreshing, children }) {
  return (
    <div className="min-h-screen flex flex-col bg-ink-900 text-ink-100">
      <header className="sticky top-0 z-10 bg-ink-900/85 backdrop-blur border-b border-ink-700">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white grid place-items-center">
              <BarChart3 size={18} />
            </div>
            <div>
              <div className="font-bold text-ink-100 leading-tight">Geidea Performance</div>
              <div className="text-xs text-ink-400 leading-tight">Sales analytics</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onRefresh} className="btn-ghost" disabled={refreshing} title="Refresh data">
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <span className="hidden md:inline text-sm text-ink-300 px-2">{user?.username}</span>
            <button onClick={onLogout} className="btn-ghost">
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 py-6 space-y-6">
        {children}
      </main>

      <footer className="border-t border-ink-700 py-4 text-center text-xs text-ink-500">
        Data source: <code className="font-mono text-ink-400">supple-defender-331706.geidea.geidea_order_items</code>
      </footer>
    </div>
  );
}
