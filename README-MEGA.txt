HKI Final CI Release Bundle v1
Date: 2025-11-12

This package is designed for drop-in application on branch `chore/fix-smoke-run-robustness`
(or any working branch). It unifies: CRP anchor patch, CI patch-attachment wiring,
Netlify function verification, Maya analyzeDeal schema adapter, and ready-made PR content.

──────────────────────────────────────────────────────────────────────────────
QUICK START (5 steps)
──────────────────────────────────────────────────────────────────────────────
1) These files are included in the PR. After merging, they will be available at the repo root of Hidden Key Investments.

2) Apply CRP & anchors patch (adds docs/chats/CONVERSATION-ANCHOR.md, docs/CRP-ANCHORS.md):
   bash scripts/apply-patch.sh patches/guardrails-crp-anchor-and-index.patch

3) (Optional) Update CI to attach patch artifacts to PRs:
   bash scripts/apply-patch.sh patches/smoke-prod-ci-patch.patch

4) Verify deploy preview health + deal analysis locally (replace URL):
   export DEPLOY_PREVIEW="https://deploy-preview-XXX--hidden-key-investments.netlify.app"
   bash scripts/verify-health.sh  "$DEPLOY_PREVIEW"
   bash scripts/verify-analyze-deal.sh "$DEPLOY_PREVIEW"

5) Commit + push, then open PR with prepared description:
   git add -A
   git commit -m "chore(ci): CRP anchors, patch-attachment CI, deal analyzer adapter & verifiers"
   git push -u origin chore/fix-smoke-run-robustness


──────────────────────────────────────────────────────────────────────────────
WHAT’S INSIDE
──────────────────────────────────────────────────────────────────────────────
patches/
  guardrails-crp-anchor-and-index.patch     # Adds CRP anchors
  smoke-prod-ci-patch.patch                 # Adds patch-attachment steps to smoke-prod.yml

docs/
  PR-DESCRIPTION.md                         # Ready-to-paste PR description
  chats/CONVERSATION-ANCHOR.md
  CRP-ANCHORS.md

scripts/
  apply-patch.sh                            # one-liner git apply wrapper
  verify-health.sh                          # curl checks for .netlify/functions/health
  verify-analyze-deal.sh                    # curl POST to analyzeDeal with proper keys
  verify-analyze.js                         # Node alternative using schemaAdapter

src/maya/
  schemaAdapter.ts                          # maps camelCase -> API snake_case (and validates)
  zodSchemas.ts                             # (reference) Zod schemas for adapter

tests/api/
  analyzeDeal.sample.json
  analyzeDeal.http                          # VSCode/IntelliJ HTTP client example

.env.smoke.example                          # Example environment for smoke

──────────────────────────────────────────────────────────────────────────────
NOTES
──────────────────────────────────────────────────────────────────────────────
• The adapter normalizes keys expected by your analyzeDeal function:
  purchasePrice -> purchase_price, downPaymentPct -> down_payment, etc.
• If your server already expects camelCase, keep the adapter on the client side;
  if it expects snake_case, you can import the adapter server-side.
• CI patch uses attachment as artifact and PR comment with run URL. Safe for forks.
• All scripts avoid external dependencies (jq optional).

Enjoy the glide-path. This is a Legacy Machine Safety System, not just DevOps.
