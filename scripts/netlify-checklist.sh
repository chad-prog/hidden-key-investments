#!/usr/bin/env bash
set -euo pipefail
: "${TARGET:?Usage: TARGET=staging|production BASE_URL=https://... ./scripts/netlify-checklist.sh}"
: "${BASE_URL:?Set BASE_URL to your site base URL}"

pass=true; step(){ echo -e "\n▶ $1"; }; ok(){ echo "✅ $1"; }; fail(){ echo "❌ $1"; pass=false; }

# 1) Health
step "Health check"
code=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL/.netlify/functions/health" || echo 000)
[[ "$code" == 200 ]] && ok "health 200" || fail "health $code"

# 2) Analyze sample deal
step "Analyze sample deal"
body='{"purchase_price":350000,"down_payment":70000,"interest_rate":0.065,"term_years":30,"rent_monthly":3200,"vacancy_rate":0.06,"operating_expenses_annual":18000,"capex_annual":5000,"exit_year":7,"exit_cap_rate":0.065}'
start=$(date +%s%3N); resp=$(curl -sS -H 'Content-Type: application/json' -H 'x-ab-cohort: B' -X POST "$BASE_URL/.netlify/functions/analyzeDeal" -d "$body" || true); end=$(date +%s%3N)
latency=$((end-start))
echo "$resp" | jq -e '.metrics.roi,.metrics.irr,.metrics.npv,.explainability.scoring_logic' >/dev/null 2>&1 && ok "schema fields present" || (fail "schema fields missing"; echo "$resp" | jq .)
[[ "$latency" -lt 2000 ]] && ok "latency ${latency}ms (<2s)" || fail "latency ${latency}ms (>=2s)"

$pass && echo -e "\nALL CHECKS ✅" || (echo -e "\nSOME CHECKS FAILED"; exit 2)
