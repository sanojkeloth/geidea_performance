import { useState } from 'react';
import { LogIn, BarChart3 } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await onLogin(username, password);
    } catch (e) {
      setErr(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-11 h-11 rounded-2xl bg-brand-600 text-white grid place-items-center shadow-cardLg">
            <BarChart3 size={22} />
          </div>
          <div>
            <div className="text-xl font-bold text-ink-900">Geidea Performance</div>
            <div className="text-xs text-ink-500">Sales analytics dashboard</div>
          </div>
        </div>

        <form onSubmit={submit} className="card card-pad space-y-4">
          <div>
            <label className="label">Username</label>
            <input
              className="input"
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {err && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {err}
            </div>
          )}
          <button type="submit" className="btn-primary w-full" disabled={busy}>
            <LogIn size={16} />
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-ink-400 mt-6">
          Internal team access only.
        </p>
      </div>
    </div>
  );
}
