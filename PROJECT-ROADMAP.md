# High-Level Vision & Roadmap

## Vision
Build a single, extensible platform for Elite real-estate investors that combines:
- Lead capture, enrichment, and automated workflows
- Deal pipeline and investor CRM tailored to elite investors
- ML-powered scoring, valuation and predictive analytics
- Communication tools, templated legal forms, e-signature and audit trails
- Orchestration between your 5 Elite AI assistants and Steve (AI Empire Builder)
- Observability, CI/CD, and secure multi-tenant scaling

## Priority Roadmap

### Stabilize core infra (0–2 weeks, high ROI)
- Finalize function tests and add CI (GitHub Actions) that runs Vitest and lints on PR.
- Add a simple staging environment (Netlify or Vercel + branch preview) and an isolated DB (e.g., Supabase Postgres).
- Add secret/ENV management (Netlify env, GitHub Secrets).

### Core product MVP (2–6 weeks)
- Lead capture API + frontend forms (inbound webhooks + UI).
- Basic CRM model: leads → opportunities → investors.
- Simple workflows: rule engine that triggers email/SMS and moves leads through pipeline.

### Data, enrichment & automation (4–8 weeks)
- Integrate enrichment (ownership, property records, phone/email validation).
- Build event tracking and logging (analytics events).
- Implement automation engine (jobs, queues using Redis/RabbitMQ or serverless job runner).

### ML & predictive analytics (8–16 weeks)
- Data lake: pipeline to collect raw events and normalized features (incremental).
- Feature store + offline training + online scoring API.
- Models: lead-to-deal probability, expected return, time-to-close, investor-match suggestions.
- Score monitoring, drift detection, and scheduled retraining.

### Assistant & orchestration layer (ongoing)
- Define a small HTTP/gRPC protocol for assistant tasks (task request, context, auth, callback).
- Create an "Empire" orchestrator to dispatch complex multi-step plans to Steve (AI Empire Builder).
- Build guardrails, role-based task escalation, and manual review flows.

### Legal, docs, and communications
- Integrate templated legal forms, with e-sign via DocuSign or HelloSign.
- Store signed docs in secure S3-compatible storage with audit logs.

### Scale & observability (ongoing)
- Implement tracing (OpenTelemetry) and centralized logs.
- Add metrics/alerts, runbooks, and SLOs.
- Use IaC (Terraform) and GitOps for deployments.

## Technical Stack Suggestions
- Frontend: React + Vite (already present)
- Backend: Serverless functions (Netlify) for event-driven endpoints; small Node services for heavyweight tasks.
- Primary DB: Postgres (Supabase) for relational data; Redis for queues and cache.
- Data lake / analytics: S3 + dbt + a column-store for analytics (ClickHouse or BigQuery).
- ML: Python infra for training (mlflow or BentoML for serving) + feature store (Feast or custom).
- Orchestration: Temporal/Workflow or lightweight queue + worker pool.
- Auth & Security: OAuth, JWTs, role-based access control, secret scanning, and SSO for Elite team members.
- Observability: Sentry (errors), Prometheus/Grafana (metrics), OpenTelemetry traces.

## Platform "Contract" Examples (for APIs)
- Lead ingestion endpoint
- ML scoring endpoint

## Key Engineering Practices
- Centralized logging with correlationId and per-request tracing.
- Standard error schema (we implemented this in functions).
- Lightweight schema validation (Zod) everywhere.
- Feature flagging (Unleash/LaunchDarkly) for experiments.
- Automated tests: unit + integration + e2e pipelines.

---

# Current Todo List

- Update test infrastructure
- Link local project to Netlify and test functions
- Restore corrupted files
- Finalize PR
- Observablility integration (Sentry/Log provider)
- Platform roadmap: define MVP and architecture
- Platform features: Workflows and automation
- Platform features: Lead generation & enrichment
- Platform features: ML & predictive analytics
- Platform features: Communication & legal tools
- Integrations: AI assistants & orchestrations
- Scaling & infra: CI/CD, infra-as-code
- Redo cleanup & merge to main
- Create backup of repository
- Governance: security and legal compliance
