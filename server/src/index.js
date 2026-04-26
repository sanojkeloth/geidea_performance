const path = require('path');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const config = require('./config');
const apiRoutes = require('./routes');

const app = express();
app.set('trust proxy', 1); // Cloud Run terminates TLS upstream

app.use(compression());
app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());

if (config.nodeEnv !== 'production') {
  app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
}

app.use(session({
  name: 'geidea.sid',
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.nodeEnv === 'production',
    maxAge: 1000 * 60 * 60 * 8, // 8h
  },
}));

app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.use('/api', apiRoutes);

// Static files for production
const clientDist = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) res.status(404).end();
  });
});

app.listen(config.port, () => {
  console.log(`Geidea dashboard listening on :${config.port} (${config.nodeEnv})`);
});
