#!/usr/bin/env bash
set -euo pipefail
PATCH_FILE="${1:-}"
if [[ -z "${PATCH_FILE}" || ! -f "${PATCH_FILE}" ]]; then
  echo "Usage: bash scripts/apply-patch.sh <patch-file>"
  exit 1
fi
git apply --whitespace=fix "${PATCH_FILE}"
echo "Applied: ${PATCH_FILE}"
