import { useEffect, useState, useCallback } from 'react';
import Login from './components/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { api } from './lib/api.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const { user } = await api.me();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const handleLogin = async (username, password) => {
    const { user } = await api.login(username, password);
    setUser(user);
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink-400">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
