#!/usr/bin/env bash
# One-shot redeploy: pull latest from this branch, then build + deploy.
#
# Usage in Cloud Shell:
#     ./redeploy.sh
#
# It reuses whatever DASH_PASSWORD you previously set on the Cloud Run
# service (via the env var on the service), so you won't be asked for it
# again unless you want to rotate it.

set -euo pipefail

cd "$(dirname "$0")"

echo "==> git pull"
git pull --ff-only

# If DASH_PASSWORD isn't set in the local shell, reuse the value already
# deployed on the Cloud Run service so cloudshell-deploy.sh doesn't prompt.
if [[ -z "${DASH_PASSWORD:-}" ]]; then
  PROJECT_ID="${PROJECT_ID:-supple-defender-331706}"
  REGION="${REGION:-us-central1}"
  SERVICE="${SERVICE:-geidea-dashboard}"
  EXISTING=$(gcloud run services describe "$SERVICE" \
    --region "$REGION" --project "$PROJECT_ID" --format=json 2>/dev/null \
    | jq -r '.spec.template.spec.containers[0].env[]? | select(.name=="DASH_PASSWORD") | .value' \
    2>/dev/null || true)
  if [[ -n "$EXISTING" && "$EXISTING" != "null" ]]; then
    export DASH_PASSWORD="$EXISTING"
    echo "==> Reusing existing DASH_PASSWORD from the deployed service"
  fi
fi

bash cloudshell-deploy.sh
