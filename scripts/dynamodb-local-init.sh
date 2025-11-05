#!/usr/bin/env bash
set -euo pipefail
: "${AWS_REGION:=us-east-1}"
: "${RESULTS_TABLE:=maya_results_local}"
ENDPOINT=${ENDPOINT:-http://localhost:4566}
aws --version >/dev/null 2>&1 || { echo "Install AWS CLI v2"; exit 1; }
echo "Creating table: $RESULTS_TABLE at $ENDPOINT in $AWS_REGION"
aws dynamodb create-table \
  --table-name "$RESULTS_TABLE" \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url "$ENDPOINT" \
  --region "$AWS_REGION" || echo "(maybe already exists)"
aws dynamodb list-tables --endpoint-url "$ENDPOINT" --region "$AWS_REGION"
