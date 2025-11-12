# PR Description: Centralized CRP Anchors and Patch Attachment

This PR adds two CRP anchor files and wires CI to attach the CRP patch bundle to the PR.

## Added files
- `docs/chats/CONVERSATION-ANCHOR.md`
- `docs/CRP-ANCHORS.md`

## Patch bundle
- `guardrails-crp-anchor-and-index.patch` (the same content as applied here, for reuse)

## CI integration
- Update `.github/workflows/smoke-prod.yml` to attach the patch as an artifact and comment the run URL

## What this enables
- Quick rehydration of context in future conversations via a single, centralized anchor
- A discoverable index for all CRP anchors at `docs/CRP-ANCHORS.md`
- One-click patch application for reviewers and CI-driven validation

## Usage
- After the PR is opened, reviewers can download and apply the patch to reproduce the CRP anchors locally:
  ```bash
  curl -L -o guardrails-crp-anchor-and-index.patch "<RUN_ARTIFACT_URL>"
  git apply guardrails-crp-anchor-and-index.patch
  ```

## Notes
- If you prefer a different patch attachment approach (action name, script choice), specify and we’ll adapt.