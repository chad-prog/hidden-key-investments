#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-}"
if [[ -z "${BASE}" ]]; then
  echo "Usage: bash scripts/verify-health.sh <DEPLOY_PREVIEW_BASE_URL>"
  echo "Example: https://deploy-preview-94--hidden-key-investments.netlify.app"
  exit 1
fi
FUNC="$BASE/.netlify/functions/health"
echo "→ GET ${FUNC}"
curl -sS "${FUNC}" | jq . || curl -sS "${FUNC}"
