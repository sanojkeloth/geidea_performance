#!/usr/bin/env bash
# Deploy the Geidea Performance dashboard to Google Cloud Run.
#
# Prereqs:
#   - gcloud CLI installed and authenticated
#   - Project has Cloud Run, Cloud Build, BigQuery enabled
#   - You've set the env vars below (or edit defaults)
#
# Usage:
#   ./deploy.sh
#
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-supple-defender-331706}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-geidea-dashboard}"
DASH_USERNAME="${DASH_USERNAME:-admin}"
DASH_PASSWORD="${DASH_PASSWORD:?Set DASH_PASSWORD in your env before deploying}"
SESSION_SECRET="${SESSION_SECRET:-$(openssl rand -hex 32)}"
BQ_DATASET="${BQ_DATASET:-geidea}"
BQ_TABLE="${BQ_TABLE:-geidea_order_items}"

IMAGE="gcr.io/${PROJECT_ID}/${SERVICE}:$(date +%Y%m%d-%H%M%S)"

echo "==> Building image ${IMAGE}"
gcloud builds submit \
  --project "${PROJECT_ID}" \
  --tag "${IMAGE}" \
  .

echo "==> Deploying to Cloud Run (${REGION})"
gcloud run deploy "${SERVICE}" \
  --project "${PROJECT_ID}" \
  --region "${REGION}" \
  --image "${IMAGE}" \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --set-env-vars "GCP_PROJECT_ID=${PROJECT_ID},BQ_DATASET=${BQ_DATASET},BQ_TABLE=${BQ_TABLE},DASH_USERNAME=${DASH_USERNAME},DASH_PASSWORD=${DASH_PASSWORD},SESSION_SECRET=${SESSION_SECRET},NODE_ENV=production"

echo "==> Done. Run:"
echo "    gcloud run services describe ${SERVICE} --region ${REGION} --format='value(status.url)'"
