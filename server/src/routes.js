const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('./auth');
const { parseFilters } = require('./filters');
const q = require('./queries');

const router = express.Router();

// --- Auth endpoints ---

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, auth.login);
router.post('/logout', auth.logout);
router.get('/me', auth.me);

// --- Data endpoints (all require auth) ---

router.use(auth.requireAuth);

const safe = (handler) => async (req, res) => {
  try {
    const data = await handler(req);
    res.json({ data });
  } catch (err) {
    console.error('[api error]', err);
    res.status(500).json({ error: err.message || 'Internal error' });
  }
};

router.get('/filters', safe(async () => q.getFilterOptions()));

router.get('/kpis', safe(async (req) => q.getKpis(parseFilters(req.query))));

router.get('/sales-over-time', safe(async (req) => {
  const granularity = ['day', 'week', 'month'].includes(req.query.granularity)
    ? req.query.granularity
    : 'day';
  return q.getSalesOverTime(parseFilters(req.query), granularity);
}));

router.get('/top/:dimension', safe(async (req) => {
  return q.getTopByDimension(
    parseFilters(req.query),
    req.params.dimension,
    req.query.limit,
  );
}));

router.get('/top-products', safe(async (req) => {
  return q.getTopProducts(parseFilters(req.query), req.query.limit);
}));

router.get('/dow-heatmap', safe(async (req) => q.getDayOfWeekHeatmap(parseFilters(req.query))));

module.exports = router;
