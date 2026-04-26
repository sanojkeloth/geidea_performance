const config = require('./config');

function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  if (username !== config.username || password !== config.password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.user = { username };
  res.json({ ok: true, user: { username } });
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
}

function me(req, res) {
  if (req.session && req.session.user) {
    return res.json({ user: req.session.user });
  }
  res.status(401).json({ error: 'Not authenticated' });
}

function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  res.status(401).json({ error: 'Not authenticated' });
}

module.exports = { login, logout, me, requireAuth };
