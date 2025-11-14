#!/usr/bin/env bash
set -euo pipefail
BASE="${1:-}"
if [[ -z "${BASE}" ]]; then
  echo "Usage: bash scripts/verify-analyze-deal.sh <DEPLOY_PREVIEW_BASE_URL>"
  exit 1
fi
FUNC="$BASE/.netlify/functions/analyzeDeal"
echo "→ POST ${FUNC}"
PAYLOAD='{
  "address": "123 Test St",
  "purchase_price": 350000,
  "down_payment": 0.25,
  "interest_rate": 6.5,
  "term_years": 30,
  "rent_monthly": 4200,
  "vacancy_pct": 0.05,
  "op_ex_monthly": 1200
}'
echo "${PAYLOAD}" | tee /dev/stderr | curl -fsS -X POST "${FUNC}" -H "Content-Type: application/json" -d @- | if command -v jq >/dev/null; then jq .; else cat; fi
