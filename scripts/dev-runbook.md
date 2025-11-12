# Dev Runbook — Maya (local/offline)

## 1) Environment
- Copy `.env.sample` → `.env` and fill any secrets (SENTRY_DSN optional, HUBSPOT_CLIENT_SECRET if testing webhook).

## 2) Local DynamoDB (optional)
```bash
docker compose -f docker-compose.localstack.yml up -d
AWS_REGION=us-east-1 RESULTS_TABLE=maya_results_local ./scripts/dynamodb-local-init.sh
