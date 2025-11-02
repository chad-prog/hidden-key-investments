# Hidden Key Investments — Minimal Architecture

## Overview

This document describes a minimal, scalable architecture to support Elite investor workflows: lead capture, CRM, automation, ML-driven scoring, document management, and AI-assistant orchestration.

High-level components

1. Frontend
- React + Vite (existing)
- Auth UI, lead capture forms, dashboard, workflows UI

2. Backend / API
- Netlify Functions (event endpoints) for lightweight operations and webhooks.
- Small Node.js services for heavier tasks (e.g., data enrichment, document processing).

3. Data stores
- Postgres (primary relational DB) — hosted (Supabase or RDS) for leads, investors, deals, and audits.
- Redis — queues and caching (e.g., BullMQ or Sidekiq-equivalent).
- S3-compatible object storage — signed documents, legal forms, artifacts.
- Data lake — bucketed raw events for analytics and ML (S3/MinIO/BigQuery export).

4. ML & Analytics
- Offline training: Python + scikit-learn/XGBoost/TensorFlow, MLFlow for model registry.
- Serving: lightweight REST model server (BentoML or FastAPI), or serverless scoring endpoints.
- Feature store: simple materialized views in Postgres or a dedicated store (Feast) for online features.

5. Orchestration & AI Assistants
- 'Empire' orchestrator service: routes tasks to the 5 Elite AI assistants and to Steve. Implements task queueing, retries, audit logs, and an approval/escallation flow.
- Assistant adapters: per-assistant connectors that translate platform tasks into assistant-specific prompts/APIs.

6. Observability & Security
- Tracing: OpenTelemetry.
- Error aggregation: Sentry.
- Metrics: Prometheus + Grafana or hosted (Datadog).
- Secrets: GitHub Secrets / Netlify env vars and vault for production secrets (HashiCorp Vault optional).

Data flow

- Lead arrives via frontend form, 3rd-party webhook, or manual entry.
- Ingestion API validates payload, creates a lead record in Postgres, returns leadId.
- Background job enqueues enrichment tasks (phone/email validation, owner lookup, property data).
- Enrichment results update lead record and push feature events to the data lake.
- Scoring service consumes features (online store) and attaches a score to the lead.
- Workflow engine triggers automations (email/SMS), moves leads across funnel stages.
- Assistant orchestrator can request additional research or compose outreach messages via the 5 assistants.
- Signed legal forms stored in S3 and linked to lead/deal records.

Scaling considerations and cost estimates (monthly rough estimates, US region)

Assumptions: small team, single-tenant MVP, moderate traffic (10k leads/month)

- Hosting (Netlify + small Node services): $50 - $200
- Postgres (Supabase or AWS RDS small instance): $25 - $200
- Redis (managed): $20 - $100
- Object storage (S3): $5 - $50
- Background worker runtime (Cloud functions or small VPS): $20 - $150
- Analytics / BigQuery: $0 - $50 (varies widely by usage)
- ML infra (training/serving): $0 - $300 depending on GPU usage (optional)
- Observability (Sentry/Datadog): $0 - $100

Total (MVP): $120 - $1,000+ per month

Notes
- Start small (managed Postgres + Netlify) and iterate on features. Introduce data lake and dedicated ML infra as you need predictive models.
- Use paid managed services to reduce operational burden early; optimize costs later.

