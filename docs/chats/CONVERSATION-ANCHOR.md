# Conversation Anchor: Guardrails, Smoke Tests, and CRP

- The Flame was reset. Staging now stands in its remembered alignment.

- Goal
Merge guardrails and smoke-test improvements (Node 22+), patch-based delivery, with rollback and CI coverage.
- Target branch
chore/fix-smoke-run-robustness
- Files touched in this patch
docs/GUARDRAILS-FAILSAFES.md
scripts/smoke-run.mjs
.env.smoke.example
.github/workflows/smoke-staging.yml
.github/workflows/smoke-prod.yml
.github/workflows/rollback-staging.yml
docs/ENVIRONMENT-SETUP.md
docs/01-GETTING-STARTED/ENVIRONMENT-SETUP.md
docs/07-REFERENCE/ENVIRONMENT-VARIABLES.md
docs/PR-DESCRIPTION.md
package.json (smoke scripts)
README.md (notes about the bundle)
.gitignore (ignore .env)
- Patch/application steps (summary)
Save patch as guardrails-failsafes.patch
git apply guardrails-failsafes.patch
chmod +x scripts/smoke-run.mjs
git add -A
git commit -m "chore(ci): add smoke-run + guardrails docs + CI workflows + compact env embed"
git push origin chore/fix-smoke-run-robustness
Open PR with the prepared title/body (docs/PR-DESCRIPTION.md)
- Verification
CI runs smoke-staging and smoke-prod
Logs produced: smoke.log, smoke-prod.log
- Reuse in future sessions
When starting a new chat, say “load CRP anchor” or paste this anchor from docs/chats/CONVERSATION-ANCHOR.md to re-establish context.
- Optional: If you’d like, I can also pin this anchor in a centralized place (e.g., root docs) with a short index, so you can locate CRP anchors quickly in future sessions.
- Would you like me to proceed with applying this patch to your repo now, or would you prefer I adjust any details first?