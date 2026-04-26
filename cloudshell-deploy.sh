#!/usr/bin/env bash
# One-shot deploy of the Geidea Performance dashboard from Google Cloud Shell.
#
# Run this from Cloud Shell after the repo is cloned. It:
#   1. Asks for the password to set
#   2. Enables the GCP APIs you need
#   3. Builds + deploys via Cloud Build → Cloud Run
#   4. Grants the Cloud Run service account BigQuery access
#   5. Prints the public URL
#
# Usage:
#   bash cloudshell-deploy.sh

set -euo pipefail

# ---------- Defaults you can override with env vars ----------
PROJECT_ID="${PROJECT_ID:-supple-defender-331706}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-geidea-dashboard}"
BQ_DATASET="${BQ_DATASET:-geidea}"
BQ_TABLE="${BQ_TABLE:-geidea_order_items}"
DASH_USERNAME="${DASH_USERNAME:-admin}"

cyan()  { printf '\033[36m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$*"; }
red()   { printf '\033[31m%s\033[0m\n' "$*"; }

# ---------- Check prerequisites ----------
command -v gcloud >/dev/null || { red "gcloud not found. Run this from Cloud Shell."; exit 1; }

cyan "==> Project: $PROJECT_ID"
cyan "==> Region:  $REGION"
cyan "==> Service: $SERVICE"
cyan "==> Table:   $PROJECT_ID.$BQ_DATASET.$BQ_TABLE"
cyan "==> Login user: $DASH_USERNAME"
echo

# ---------- Prompt for password ----------
if [[ -z "${DASH_PASSWORD:-}" ]]; then
  read -r -s -p "Choose a dashboard password (won't be echoed): " DASH_PASSWORD
  echo
  read -r -s -p "Confirm: " DASH_PASSWORD2
  echo
  if [[ "$DASH_PASSWORD" != "$DASH_PASSWORD2" ]]; then
    red "Passwords don't match"; exit 1
  fi
  if [[ ${#DASH_PASSWORD} -lt 8 ]]; then
    red "Password must be at least 8 characters"; exit 1
  fi
fi

SESSION_SECRET="${SESSION_SECRET:-$(openssl rand -hex 32)}"

# ---------- Set project + enable APIs ----------
cyan "==> Setting active project"
gcloud config set project "$PROJECT_ID" >/dev/null

cyan "==> Enabling required APIs (idempotent, may take ~1 min)"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  containerregistry.googleapis.com \
  bigquery.googleapis.com

# ---------- Build + deploy ----------
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE}:$(date +%Y%m%d-%H%M%S)"
cyan "==> Building image with Cloud Build: $IMAGE"
gcloud builds submit --tag "$IMAGE" .

cyan "==> Deploying to Cloud Run"
gcloud run deploy "$SERVICE" \
  --region "$REGION" \
  --image "$IMAGE" \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars "GCP_PROJECT_ID=${PROJECT_ID},BQ_DATASET=${BQ_DATASET},BQ_TABLE=${BQ_TABLE},DASH_USERNAME=${DASH_USERNAME},DASH_PASSWORD=${DASH_PASSWORD},SESSION_SECRET=${SESSION_SECRET},NODE_ENV=production"

# ---------- Grant BigQuery permissions to the runtime service account ----------
SVC_ACCT=$(gcloud run services describe "$SERVICE" --region "$REGION" \
  --format='value(spec.template.spec.serviceAccountName)' 2>/dev/null || true)

if [[ -z "$SVC_ACCT" ]]; then
  PROJECT_NUMBER=$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')
  SVC_ACCT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
  yellow "==> Service uses default Compute SA: $SVC_ACCT"
fi

cyan "==> Granting BigQuery roles to $SVC_ACCT"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SVC_ACCT}" --role="roles/bigquery.dataViewer" \
  --condition=None >/dev/null
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SVC_ACCT}" --role="roles/bigquery.jobUser" \
  --condition=None >/dev/null

# ---------- Done ----------
URL=$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')
echo
green "============================================================"
green " Deployed!"
green "============================================================"
green " URL:      $URL"
green " Username: $DASH_USERNAME"
green " Password: (the one you just set)"
green "============================================================"
echo
yellow "Share that URL + username/password with your team."
yellow "Rotate password later with:"
yellow "  gcloud run services update $SERVICE --region $REGION \\"
yellow "    --update-env-vars DASH_PASSWORD=new-password"
