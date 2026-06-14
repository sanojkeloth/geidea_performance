# Geidea Performance Dashboard — Handoff

> **Purpose of this document**: enough context for another engineer
> (or another Claude session) to pick the project up cold, understand
> every moving part, and continue building without re-discovery.
>
> Date: 2026-06-14

---

## 1. Product summary

A self-hosted analytics dashboard for the BigQuery table
`supple-defender-331706.geidea.geidea_order_items`. This table is a
line-item POS feed from Geidea-powered booths at events (MdlBeast,
SoundStorm, Balad Beast, AlUla, Onyx, etc.) selling F&B, merch, and glam.

The dashboard is hosted on **Google Cloud Run** behind a shared
username/password and is intended for an internal Microsoft-using team —
so we deliberately avoid Google SSO / IAP.

Live URL: from `gcloud run services describe geidea-dashboard --region us-central1 --format='value(status.url)'`

---

## 2. Stack at a glance

| Layer        | Choice                                         |
|--------------|------------------------------------------------|
| Frontend     | Vite + React 18 + Tailwind CSS + Recharts      |
| Charts       | Recharts (Areas, Bars, Pie, custom DOW heat)   |
| Icons        | lucide-react                                   |
| Backend      | Node.js 20 + Express 4                         |
| BigQuery     | `@google-cloud/bigquery` v7                    |
| Auth         | Shared username/password + signed cookie       |
| Container    | Single Docker image, multi-stage build         |
| Deploy       | Cloud Run (us-central1), built via Cloud Build |
| One-click    | Mac `.command` + bookmark URL → Cloud Shell    |

No databases other than BigQuery. No Redis. No SSO.

---

## 3. Repository layout

```
geidea_performance/
├── README.md                       # User-facing setup
├── HANDOFF.md                      # This file
├── Dockerfile                      # Multi-stage: client build → server runtime
├── .dockerignore
├── .gitignore
├── .env.example                    # Local dev env vars
├── cloudbuild.yaml                 # Optional Cloud Build trigger config
├── cloudshell-deploy.sh            # Interactive Cloud Shell deploy
├── cloudshell-tutorial.md          # Side-pane tutorial with click-to-run
├── deploy.sh                       # Legacy local deploy
├── redeploy.sh                     # One-shot: git pull + cloudshell-deploy
├── Redeploy Geidea Dashboard.command  # macOS double-click → opens Cloud Shell
│
├── server/                         # Express API
│   ├── package.json
│   └── src/
│       ├── index.js                # Express bootstrap, serves API + SPA
│       ├── config.js               # Env-var → typed config
│       ├── auth.js                 # /login /logout /me, session check
│       ├── routes.js               # /api/* endpoints
│       ├── queries.js              # BigQuery SQL for every chart/KPI
│       ├── filters.js              # parseFilters() + buildWhere() SQL builder
│       ├── segments.js             # Segment + brand + city SQL CASE rules
│       ├── bigquery.js             # BigQuery client, cache, type normalizer
│       └── cache.js                # In-memory TTL cache
│
└── client/                         # Vite React app
    ├── package.json
    ├── vite.config.js              # Proxies /api → http://localhost:8080 in dev
    ├── tailwind.config.js          # Dark "ink" palette + brand blues
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx                 # Auth gate → <Login/> or <Dashboard/>
        ├── index.css               # Tailwind + dark-mode component classes
        ├── lib/
        │   ├── api.js              # Thin fetch wrapper, all endpoints
        │   ├── format.js           # n, money, compact, compactMoney, pct
        │   └── labels.js           # prettyEvent() — friendlier event names
        ├── pages/
        │   └── Dashboard.jsx       # Orchestrates all data fetching + layout
        └── components/
            ├── Login.jsx
            ├── Layout.jsx          # Header + footer
            ├── SegmentTabs.jsx     # All / F&B / Merch / Glam chips
            ├── FiltersBar.jsx      # Date, City, Brand, Category, Event
            ├── KpiCard.jsx
            ├── FbSplitCard.jsx     # Combined F&B revenue tile w/ split bar
            ├── DataTable.jsx
            ├── ChartCard.jsx       # Generic card frame
            └── charts/
                ├── SalesOverTime.jsx       # Area chart w/ day/week/month toggle
                ├── HorizontalBars.jsx      # Generic horizontal bars
                ├── CategoryDonut.jsx       # Donut with grid legend below
                └── DowHeatmap.jsx          # 7-cell day-of-week intensity grid
```

---

## 4. Data model

### 4.1 Source table — `geidea_order_items`

| Column                  | Type     | Notes                                       |
|-------------------------|----------|---------------------------------------------|
| `event_name`            | STRING   | One of: alulaevent, baladbeast25, mdlbeast1001, onyx24, soundstorm23, soundstorm24 |
| `txn_number`            | NUMERIC  | Transaction id (not globally unique)        |
| `transaction_date`      | DATE     | All 659K rows populated, no nulls           |
| `store`                 | STRING   | Hierarchy like `FT2.FT22.KFC`               |
| `terminal`              | STRING   | POS device id                               |
| `cashier`               | STRING   | Cashier name                                |
| `category`              | STRING   | e.g. Bevs, Meals, Single Items, Headliner Merch |
| `sku`                   | STRING   | Often empty                                 |
| `product_name`          | STRING   |                                             |
| `qty`                   | NUMERIC  | Sum is 992,614 across 659K rows             |
| `price_without_discount`| FLOAT64  | List price per unit                         |
| `tax`                   | FLOAT64  | Per line                                    |
| `net_sales`             | FLOAT64  | Post-discount line revenue                  |
| `total`                 | FLOAT64  | net_sales + tax. Total range sum ~SAR 19.76M|

### 4.2 Derived columns (defined in `server/src/segments.js`)

These are pure SQL expressions — no migration needed.

**`segment`** — case-insensitive regex on `category`:
- regex matches `bev|drink|coffee|tea|water|juice|soda|pepsi|cola|mocktail|smoothie|shake|latte|americano|espresso` → `'beverage'`
- regex matches `merch|tee|tshirt|t-shirt|shirt|hoodie|cap|hat|poster|tote|wristband|sticker|pin|sweater|jacket|bag` → `'merch'`
- regex matches `paint|glitter|tattoo|glam|nail|hair|makeup|spray|airbrush|braid|jewel|gem|lash` → `'glam'`
- else → `'food'`

**`brand`** — last dot-separated segment of `store`:
- `FT2.FT22.KFC` → `KFC`, `FT1.FT12.KUDU` → `KUDU`, etc.
- Customizable via `BRAND_OVERRIDES = { 'store value': 'brand label' }`

**`city`** — explicit CASE on `event_name`:
- baladbeast25, onyx24 → Jeddah
- mdlbeast1001, soundstorm23, soundstorm24 → Riyadh
- alulaevent → (currently falls to `'Other'`; should probably be `'AlUla'` — possible bug)
- everything else → Other

### 4.3 KPI formulas (in `getKpis()` in `queries.js`)

```sql
revenue       = SUM(total)
net_sales     = SUM(net_sales)
tax           = SUM(tax)
list_sales    = SUM(price_without_discount * qty)
discount      = SUM(price_without_discount * qty) - SUM(net_sales)   -- promotional, NOT credit wallet
items         = SUM(qty)
transactions  = COUNT(DISTINCT txn_number)
stores        = COUNT(DISTINCT store)
products      = COUNT(DISTINCT sku)
avg_txn_value = SAFE_DIVIDE(SUM(total), COUNT(DISTINCT txn_number))
```

---

## 5. API surface (`server/src/routes.js`)

All under `/api/`. All data endpoints require an authenticated session.

| Method | Path                        | Purpose |
|--------|-----------------------------|---------|
| POST   | `/login`                    | `{username, password}` → 200 sets `geidea.sid` cookie |
| POST   | `/logout`                   | Destroy session                                 |
| GET    | `/me`                       | Returns current user or 401                     |
| GET    | `/filters`                  | Dropdown options + min/max date (cached 30 min) |
| GET    | `/kpis`                     | All KPI tiles in one row                        |
| GET    | `/fb-split`                 | Food vs Beverage revenue (always F&B)           |
| GET    | `/sales-over-time`          | Time series, `?granularity=day|week|month`      |
| GET    | `/top/:dimension`           | Generic top-N. Dimensions: `store`, `category`, `product_name`, `sku`, `event_name`, `brand`, `segment` |
| GET    | `/top-fb-stores`            | Top stores restricted to F&B segments           |
| GET    | `/top-products`             | Top SKUs                                        |
| GET    | `/dow-heatmap`              | Day-of-week revenue/transactions                |

All accept the same filter query params: `from`, `to`, `segment`, `brand`, `city`, `category`, `event_name`.

Login is rate-limited (express-rate-limit, 20/5min per IP). All other endpoints rely on the session cookie.

---

## 6. Filter model

**Top-of-page chips (`SegmentTabs.jsx`):** All / F&B / Merch / Glam.
Maps to `SEGMENT_VALUES` in `segments.js`:
- `all` → no filter
- `fb` → `segment IN ('food','beverage')`
- `merch` → `segment = 'merch'`
- `glam` → `segment = 'glam'`

**Filter row (`FiltersBar.jsx`):** From, To (HTML date inputs), City, Brand, Category, Event.

The defaults on first load are last-30-days within the data's min/max date range. Reset restores the same defaults.

`buildWhere()` in `filters.js` parameterizes everything (DATE values use `bq.date()` wrappers; strings are passed raw). No string interpolation of user input into SQL.

---

## 7. Important fix history (lessons baked in)

1. **`DATE_TRUNC` daily granularity** — BigQuery rejects `DATE_TRUNC(date_col, DATE)`. Use `DAY`.
2. **Date params returning 0 rows** — passing dates as STRING with a separate `types: { from: 'DATE' }` map didn't apply correctly. Fix: wrap with `bq.date()` so the param carries its own type. **Don't undo this.**
3. **Items sold blank** — `SUM(NUMERIC)` returns a `Big.js` (or `BigQueryNumeric`) wrapper, not a plain number. The normalizer in `bigquery.js` detects both shapes (`c/e/s` array OR `.value` string) and converts.
4. **`ROWS` is a reserved word** in BigQuery; aliases need to avoid it.
5. **CSS dark mode** — chose a class-less always-dark approach instead of `dark:` variants for simplicity. Body bg = ink-900, cards = ink-800, borders = ink-700.

---

## 8. Deployment

### 8.1 First-time deploy

```bash
# From Cloud Shell, in the repo dir:
bash cloudshell-deploy.sh
# - prompts for password (twice)
# - enables APIs (run/cloudbuild/bigquery/artifactregistry/containerregistry)
# - generates random SESSION_SECRET
# - builds image with Cloud Build
# - deploys to Cloud Run (--allow-unauthenticated, app auth gates access)
# - grants bigquery.dataViewer + bigquery.jobUser to runtime SA
```

### 8.2 Subsequent deploys

```bash
bash redeploy.sh
# - git pull
# - reads existing DASH_PASSWORD from running service (no re-prompt)
# - delegates to cloudshell-deploy.sh
```

### 8.3 Mac one-click

`Redeploy Geidea Dashboard.command` is a tiny shell that opens
`https://shell.cloud.google.com/cloudshell/editor?…` with
`cloudshell_tutorial=cloudshell-tutorial.md`. The tutorial pane has a
"Copy to Cloud Shell" run button next to `bash redeploy.sh`.

**macOS Sequoia Gatekeeper note:** the file is quarantined on first
download. Either click *Open Anyway* in
*System Settings → Privacy & Security*, or run
`xattr -d com.apple.quarantine "Redeploy Geidea Dashboard.command"` once.

Bookmark URL works without the .command file:
```
https://shell.cloud.google.com/cloudshell/editor?cloudshell_git_repo=https%3A%2F%2Fgithub.com%2Fsanojkeloth%2Fgeidea_performance&cloudshell_git_branch=claude%2Fgeidea-performance-dashboard-uaB5Z&cloudshell_workspace=.&cloudshell_tutorial=cloudshell-tutorial.md
```

### 8.4 Common one-liners

```bash
# Rotate password
gcloud run services update geidea-dashboard --region us-central1 \
  --update-env-vars DASH_PASSWORD=new-strong-password

# Tail logs
gcloud run services logs tail geidea-dashboard --region us-central1

# Get URL
gcloud run services describe geidea-dashboard --region us-central1 \
  --format='value(status.url)'

# Tear down
gcloud run services delete geidea-dashboard --region us-central1
```

---

## 9. Local development (optional)

```bash
cp .env.example .env
# Edit: DASH_PASSWORD, SESSION_SECRET,
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/sa-key.json

(cd server && npm install && npm run dev)   # API on :8080
(cd client && npm install && npm run dev)   # Vite on :5173
# Open http://localhost:5173 (Vite proxies /api → :8080)
```

Service account needs `roles/bigquery.dataViewer` on the dataset and
`roles/bigquery.jobUser` on the project.

---

## 10. Cost & performance posture

- Cloud Run: `min-instances=0`, `max-instances=5`, 512Mi/1 CPU.
  Cold start ~2 s. Free tier covers a small team.
- BigQuery query caching: **5 min TTL in-process** (Map-based, no Redis).
  Filter options cached **30 min**. This means a refresh storm doesn't
  re-bill BigQuery. Cache loses everything on container restart.
- Each KPI request fans out to ~9 parallel BigQuery jobs (one per chart).
  Each scans ~660K rows / ~85 MB. Worst case per refresh: ~750 MB of
  on-demand BigQuery billing.

---

## 11. Known issues & future work

1. **AlUla city mapping**: `alulaevent` currently falls to `'Other'` in
   `CITY_SQL`. Probably should be `'AlUla'`. Single-line fix in
   `server/src/segments.js`.
2. **Brand overrides**: `BRAND_OVERRIDES = {}` is still empty. The user
   intends to paste a store→brand mapping. Drop entries in there.
3. **Top stores chart** uses raw store strings (e.g. `FT2.FT22.KFC`).
   Could optionally also strip to brand or show a friendly label.
4. **Cashier dropdown** was removed per user request. The cashier
   column still exists in BigQuery; can be re-added if needed.
5. **Bundle size** — the client JS is ~580 KB. Recharts is the main
   driver. A code-split per chart would help if startup time matters.
6. **No tests yet.** Given the SQL-heavy nature, a few golden snapshot
   tests of the SQL strings produced by `buildWhere()` for a known
   filter set would be high-leverage.
7. **Session store is in-memory** (express-session default). On
   Cloud Run with `min-instances=0`, sessions die on cold start. For
   a small team this is fine; users just re-log-in. For a bigger
   audience, use `connect-pg-simple` or `connect-redis`.
8. **Logs go to Cloud Logging** via stdout. No structured logger; just
   `console.log/error`. OK for current scale.

---

## 12. Customization quick reference

| Want to change…             | Edit                                            |
|-----------------------------|-------------------------------------------------|
| Segment regex rules         | `server/src/segments.js` → `SEGMENT_SQL`        |
| Brand mapping               | `server/src/segments.js` → `BRAND_OVERRIDES`    |
| City mapping                | `server/src/segments.js` → `CITY_SQL`           |
| Event display labels        | `client/src/lib/labels.js` → `EVENT_LABELS`     |
| Currency (SAR → other)      | `client/src/lib/format.js` → default `currency` |
| Cache TTL                   | env `QUERY_CACHE_TTL_SECONDS`, default 300      |
| Cloud Run region / scaling  | `cloudshell-deploy.sh` and `cloudbuild.yaml`    |
| Add a new chart             | new file in `client/src/components/charts/`, new endpoint in `server/src/routes.js`, new SQL in `queries.js`, wire from `Dashboard.jsx` |

---

## 13. Conversation context (for the next Claude)

The dashboard was built iteratively with these key user decisions:

- **No SSO** (team is on Microsoft accounts, not Google) — chose shared
  username/password. Tradeoff: rotate when people leave.
- **No local install** — the user's office laptop can't run dev tools, so
  everything lives in Cloud Shell. The Mac `.command` file is just a
  shortcut to open the Cloud Shell URL.
- **F&B focused** — top-stores chart is restricted to F&B; the merch
  and glam booths are bracketed off in the segment chips.
- **Cashier and Terminal removed from filters** — the user didn't find
  these meaningful for the report audience.
- **Brand replaces Store as the filter facet** — last dot-segment of
  store, with a user-pasteable override map for edge cases.

What the user said about discount: it confused them as possibly a
credit-wallet field. The dashboard label was renamed to
**"Discount applied"** with a sublabel "List price minus net sales" so
that's clear.

---

## 14. Repo + branch

- Repo: `sanojkeloth/geidea_performance`
- Active dev branch: `claude/geidea-performance-dashboard-uaB5Z`
- Main: empty (initial commit was directly on the dev branch)
- All work is on the dev branch; nothing merged to main yet.

To continue work in another Claude session, point it at:
- This branch
- This handoff document
- `server/src/segments.js` (highest-velocity edit point — taxonomy rules)
