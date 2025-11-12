Guardrails CRP Patch Bundle
===========================

Files
-----
- guardrails-crp-anchor-and-index.patch
- docs/PR-DESCRIPTION.md (save as `docs/PR-DESCRIPTION.md` in your repo)
- smoke-prod.yml.snippet.patch (apply to `.github/workflows/smoke-prod.yml`)

Quick Apply
-----------
```bash
# From the root of your repo
unzip -o guardrails_crp_bundle.zip -d /tmp/guardrails_bundle
cp /tmp/guardrails_bundle/docs_PR-DESCRIPTION.md docs/PR-DESCRIPTION.md
git apply /tmp/guardrails_bundle/guardrails-crp-anchor-and-index.patch
git apply /tmp/guardrails_bundle/smoke-prod.yml.snippet.patch
git add -A
git commit -m "docs(ci): add CRP anchors + attach patch artifact in smoke-prod CI"
git push -u origin chore/fix-smoke-run-robustness
```
Notes
-----
- Adjust the target branch name if needed.
- If your workflow file differs, manually merge the snippet.