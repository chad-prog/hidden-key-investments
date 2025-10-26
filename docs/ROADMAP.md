Hidden Key Investments — Prioritized Implementation Roadmap

Goal: Build a platform that automates sourcing, nurturing, and executing investments for Elite real-estate investors with AI-first orchestration.

Quarter 0 (Now — 1 month)
- Stabilize repository and CI (tests + lint on PR)
- Complete Netlify Functions reliability work (we added improved error handling)
- Create staging environment and secrets management
- Implement lead ingestion API + basic frontend form

Quarter 1 (1–3 months)
- CRM data model (leads, investors, deals, activities)
- Workflow engine: rules, triggers, email/SMS actions
- Lead enrichment connectors (phone/email validation)
- Basic scoring service (rule-based scoring)

Quarter 2 (3–6 months)
- ML model prototype: lead-to-deal scoring, time-to-close prediction
- Feature store and data pipeline to support training
- Assistant orchestration framework: Empire service, assistant adapters
- E-signature integration and document storage

Quarter 3 (6–12 months)
- Production ML models and monitoring
- Advanced lead-gen integrations (list-building, scraping, property data)
- Multi-user, role-based access with audit trails
- Scale infra, implement IaC and robust CI/CD

Sprint-level tasks (example 2-week sprint)
- Sprint 1: CI + tests, staging setup, .env cleanup, backup branch
- Sprint 2: Lead ingestion API, frontend form, unit tests
- Sprint 3: CRM schema, DB migrations, basic admin UI
- Sprint 4: Workflow engine MVP, email integration
- Sprint 5: Enrichment connectors (Airtable sync refactor into pipeline)

KPIs / acceptance criteria
- Lead ingestion: 99% success on valid payloads
- Test coverage: 80% of serverless functions and core services
- ML: ROC-AUC > 0.75 for lead-to-deal (prototype)

