# Geidea Performance Dashboard

A modern analytics dashboard for the BigQuery table
`supple-defender-331706.geidea.geidea_order_items`. Deployed to Google Cloud
Run, behind a shared username/password.

## Stack

- **Frontend** — Vite + React 18 + Tailwind CSS + Recharts
- **Backend** — Node.js + Express + `@google-cloud/bigquery`
- **Auth** — shared username/password, signed session cookie
- **Deploy** — single Docker container on Cloud Run

## Features

- 9 KPI tiles: Revenue, Net Sales, Transactions, Items Sold, Avg Transaction
  Value, Tax, Discount, Stores, Products (SKUs)
- Sales-over-time area chart (day / week / month toggle)
- Top stores, terminals, cashiers (horizontal bars)
- Revenue by category (donut)
- Day-of-week heatmap
- Top products + event-type breakdown tables
- Global filters: date range, store, category, terminal, cashier, event
- Server-side BigQuery query cache (5 min TTL) to control cost
- Parameterized SQL — safe from injection

---

## Deploy from your browser (recommended — no laptop install)

You'll do this entirely in [Google Cloud Shell](https://shell.cloud.google.com),
which is a free, browser-based terminal already authenticated to your GCP
account.

### One-click open

> Click here to open Cloud Shell with this branch already cloned:
>
> [![Open in Cloud Shell](https://gstatic.com/cloudssh/images/open-btn.svg)](https://shell.cloud.google.com/cloudshell/editor?cloudshell_git_repo=https://github.com/sanojkeloth/geidea_performance&cloudshell_git_branch=claude/geidea-performance-dashboard-uaB5Z&cloudshell_workspace=.&cloudshell_tutorial=README.md)

Or do it manually — the steps are below.

### Step 1 — Open Cloud Shell

Go to https://shell.cloud.google.com and wait for the terminal.

### Step 2 — Clone this branch

```bash
git clone -b claude/geidea-performance-dashboard-uaB5Z \
  https://github.com/sanojkeloth/geidea_performance.git
cd geidea_performance
```

### Step 3 — Run the deploy script

```bash
bash cloudshell-deploy.sh
```

It will:
1. Prompt you for a dashboard password (you choose it)
2. Enable the GCP APIs you need (Cloud Run, Cloud Build, BigQuery, etc.)
3. Build the Docker image with Cloud Build
4. Deploy to Cloud Run in `us-central1`
5. Grant the runtime service account BigQuery read access
6. Print the public URL

Total time: ~5–7 minutes (mostly the first build).

### Step 4 — Share the URL

The script prints something like:

```
URL:      https://geidea-dashboard-xxxxxx-uc.a.run.app
Username: admin
Password: (the one you set)
```

Send this to your team. They sign in with the same username/password.

---

## Changing settings later (also from Cloud Shell)

**Rotate the password:**
```bash
gcloud run services update geidea-dashboard --region us-central1 \
  --update-env-vars DASH_PASSWORD=new-strong-password
```

**Change the username:**
```bash
gcloud run services update geidea-dashboard --region us-central1 \
  --update-env-vars DASH_USERNAME=new-user
```

**Re-deploy after pulling new code:**
```bash
git pull
bash cloudshell-deploy.sh
```

**Tear it down completely:**
```bash
gcloud run services delete geidea-dashboard --region us-central1
```

---

## Customizations

- **Currency**: defaults to SAR. Change in `client/src/lib/format.js` (look
  for `currency = 'SAR'`).
- **Cache TTL**: edit `QUERY_CACHE_TTL_SECONDS` in env, default 300 (5 min).
- **Cloud Run scaling**: edit `--max-instances` / `--memory` in
  `cloudshell-deploy.sh`.
- **Different region**: `REGION=europe-west1 bash cloudshell-deploy.sh`.

---

## Security notes

- A shared password is fine for an internal team. Rotate it when people
  change roles.
- For stronger auth, put Cloudflare Access (free for ≤ 50 users) in front of
  the Cloud Run URL and require Microsoft Entra ID — the Cloud Run service
  stays unchanged.
- Session cookies are HTTP-only, signed with `SESSION_SECRET`, and only
  served over HTTPS in production.
- BigQuery access is via the Cloud Run runtime service account; the dashboard
  itself has no service-account keys baked in.

---

## Local development (optional, not required for deployment)

If you ever need to run it on a machine you control:

```bash
cp .env.example .env
# edit .env

(cd server && npm install)
(cd client && npm install)

# terminal A
(cd server && npm run dev)
# terminal B
(cd client && npm run dev)

# visit http://localhost:5173
```
