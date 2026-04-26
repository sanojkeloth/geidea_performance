# Geidea Performance Dashboard

A modern, end-to-end analytics dashboard for the BigQuery table
`supple-defender-331706.geidea.geidea_order_items`. Built to be deployed to
Google Cloud Run and shared with your team behind a simple shared
username/password.

## Stack

- **Frontend** — Vite + React 18 + Tailwind CSS + Recharts
- **Backend** — Node.js + Express + `@google-cloud/bigquery`
- **Auth** — shared username/password, session cookie (configurable via env)
- **Deploy** — single Docker container on Cloud Run

## Features

- 9 KPI tiles: Revenue, Net Sales, Transactions, Items Sold, Avg Transaction
  Value, Tax, Discount, Stores, Products
- Sales-over-time line chart with day / week / month granularity
- Top stores, top categories (donut), top products, terminals, cashiers
- Event-type breakdown (sale / refund / etc.)
- Day-of-week × hour-style heatmap of activity
- Global filters: date range, store, category, terminal, cashier, event
- Server-side query caching (default 5 min TTL) to control BigQuery cost
- Parameterized SQL — no string concatenation, safe from injection
- Single-page app served by Express in production

## Local development

```bash
# 1. Configure
cp .env.example .env
# edit .env: set DASH_PASSWORD, SESSION_SECRET, point GOOGLE_APPLICATION_CREDENTIALS to a service account key

# 2. Install
(cd server && npm install)
(cd client && npm install)

# 3. Run (two terminals)
# Terminal A — API
cd server && npm run dev
# Terminal B — Vite dev server with proxy to API
cd client && npm run dev

# Visit http://localhost:5173
```

The service account used for `GOOGLE_APPLICATION_CREDENTIALS` needs
`roles/bigquery.dataViewer` on the dataset and `roles/bigquery.jobUser` on
the project.

## Deploy to Cloud Run

```bash
export DASH_PASSWORD="pick-a-strong-password"
export SESSION_SECRET="$(openssl rand -hex 32)"
./deploy.sh
```

The script:
1. Builds the Docker image via Cloud Build
2. Deploys to Cloud Run in `us-central1` (override with `REGION=...`)
3. Sets env vars for auth + BigQuery target

After deploy, grant the Cloud Run service account BigQuery access:

```bash
PROJECT_ID=supple-defender-331706
SVC_ACCT=$(gcloud run services describe geidea-dashboard --region us-central1 \
  --format='value(spec.template.spec.serviceAccountName)')
# If empty it defaults to the Compute Engine default SA: ${PROJECT_NUMBER}-compute@developer.gserviceaccount.com
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SVC_ACCT}" --role="roles/bigquery.dataViewer"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SVC_ACCT}" --role="roles/bigquery.jobUser"
```

Share the Cloud Run URL with the team along with the username/password.

## Changing the password later

```bash
gcloud run services update geidea-dashboard --region us-central1 \
  --update-env-vars DASH_PASSWORD=new-password
```

## Security notes

- The shared password is fine for an internal team but rotate it when
  someone leaves.
- For stronger security, put Cloudflare Access in front of the Cloud Run URL
  and require Microsoft Entra ID.
- Sessions are signed cookies; `SESSION_SECRET` must be set and kept secret.
