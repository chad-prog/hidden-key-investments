# Custom Agents Directory

This directory contains configuration files for specialized AI agents that help build the Hidden Key Investments platform. Each agent is an expert in a specific domain with predefined skills, tools, and context.

## 🤖 Available Agents

### 1. **Elite Frontend Developer** (`Elite-Frontend-Developer.yaml`)
**Use For:** React components, UI/UX, dashboards, forms, and frontend features

**Specialties:**
- React 18 with TypeScript
- Tailwind CSS and Radix UI components
- Form handling with React Hook Form
- State management with Zustand
- Testing with Vitest
- Mobile-responsive design
- Accessibility (WCAG 2.1 AA)

**Example Tasks:**
- Build a WorkflowBuilder component with drag-and-drop
- Create an Analytics Dashboard with KPIs
- Implement a LeadEnrichment status panel

---

### 2. **Elite Backend Developer** (`Elite-Backend-Developer.yaml`)
**Use For:** Serverless functions, APIs, database operations, job queues

**Specialties:**
- Node.js 22.x with ES modules
- Netlify serverless functions
- PostgreSQL with Supabase
- Zod schema validation
- RESTful API design
- Error handling and logging

**Example Tasks:**
- Build a lead enrichment function
- Create a job queue worker for emails
- Implement an opportunity scoring endpoint
- Build a webhook receiver for DocuSign

---

### 3. **Elite ML Engineer** (`Elite-ML-Engineer.yaml`)
**Use For:** Machine learning models, feature engineering, ML pipelines

**Specialties:**
- scikit-learn, XGBoost, LightGBM
- Feature engineering
- Model training and evaluation
- MLflow for experiment tracking
- Model serving with FastAPI
- A/B testing and drift detection

**Example Tasks:**
- Build a lead-to-deal probability model
- Create a feature store using Feast
- Deploy a model scoring API
- Implement drift detection

---

### 4. **Elite Integration Specialist** (`Elite-Integration-Specialist.yaml`)
**Use For:** Third-party API integrations, webhooks, authentication

**Specialties:**
- REST API integration
- OAuth 2.0 authentication
- Webhook handling
- Retry logic and circuit breakers
- Rate limiting
- API documentation

**Example Tasks:**
- Integrate Zillow API for property valuations
- Build DocuSign webhook handler
- Create Twilio SMS integration
- Implement rate limiting for APIs

---

### 5. **Elite DevOps Engineer** (`Elite-DevOps-Engineer.yaml`)
**Use For:** Infrastructure, CI/CD, monitoring, observability

**Specialties:**
- Infrastructure as Code (Terraform)
- GitHub Actions CI/CD
- OpenTelemetry tracing
- Prometheus and Grafana
- Security scanning
- Performance optimization

**Example Tasks:**
- Implement OpenTelemetry tracing
- Create Grafana dashboards for SLO monitoring
- Set up PagerDuty alerts
- Write Terraform modules

---

### 6. **Elite Database Architect** (`Elite-Database-Architect.yaml`)
**Use For:** Database design, query optimization, data modeling

**Specialties:**
- PostgreSQL advanced features
- Database schema design
- Query optimization
- Indexing strategies
- Migration strategies
- Performance tuning

**Example Tasks:**
- Design partitioning strategy for activities table
- Optimize opportunity pipeline queries
- Create data warehouse schema
- Implement full-text search

---

### 7. **Email Template Builder Specialist** (`Email-Template-Builder-Specialist.yaml`)
**Use For:** Email templates, responsive design, email marketing

**Specialties:**
- HTML email development
- Responsive email design
- Email client compatibility
- Personalization and merge tags
- A/B testing

**Example Tasks:**
- Create welcome email template
- Build deal announcement template
- Design monthly newsletter template

---

## 📖 How to Use Custom Agents

### Step 1: Choose the Right Agent
Select an agent based on your task:
- **Frontend work?** → Elite Frontend Developer
- **Backend APIs?** → Elite Backend Developer
- **ML models?** → Elite ML Engineer
- **API integrations?** → Elite Integration Specialist
- **Infrastructure?** → Elite DevOps Engineer
- **Database work?** → Elite Database Architect
- **Email templates?** → Email Template Builder Specialist

### Step 2: Provide Clear Context
When delegating to an agent, include:
1. **What needs to be built** - Be specific
2. **Business context** - Why it matters
3. **Success criteria** - How to measure success
4. **Reference files** - Point to existing examples
5. **Constraints** - Any limitations or requirements

### Step 3: Example Delegation

**❌ Vague:**
"Build a dashboard"

**✅ Clear:**
"Build an Analytics Dashboard with 4 KPI cards (total leads, conversion rate, pipeline value, avg deal size), a line chart showing lead trends over the last 30 days, and a table of the 10 most recent activities. Use Recharts for visualization, follow the existing dashboard patterns in src/pages/LeadManagement.tsx, and ensure it works in demo mode without API keys."

---

## 🎯 Best Practices

### DO's ✅
1. **Be Specific** - Provide detailed requirements
2. **Provide Context** - Share existing patterns and business logic
3. **Set Clear Expectations** - Define success criteria
4. **Reference Existing Code** - Point to examples
5. **Include Business Logic** - Explain why features matter

### DON'Ts ❌
1. **Don't Be Vague** - Avoid "make it better"
2. **Don't Assume Knowledge** - Provide domain context
3. **Don't Skip Examples** - Always include example tasks
4. **Don't Forget Tests** - Always require test coverage
5. **Don't Ignore Security** - Specify security requirements

---

## 🔧 Agent Configuration Structure

Each agent configuration includes:

```yaml
---
name: [Agent Name]
description: |
  [Brief description]
  
role: [Developer | Architect | Specialist | Analyst]

skills:
  - [Specific skills]

tools:
  - [Technologies and frameworks]

context:
  project: hidden-key-investments
  repository: /home/runner/work/hidden-key-investments/hidden-key-investments
  stack: [Technology stack]
  existing_patterns: [Current patterns]
  constraints: [Requirements]

standards:
  - [Quality standards]

deliverables:
  - [Expected outputs]

example_tasks:
  - [Sample tasks]

files_to_reference:
  - [Relevant files]
---
```

---

## 📊 Agent Selection Quick Reference

| Task Type | Agent | File |
|-----------|-------|------|
| React components | Elite Frontend Developer | `Elite-Frontend-Developer.yaml` |
| Serverless APIs | Elite Backend Developer | `Elite-Backend-Developer.yaml` |
| ML models | Elite ML Engineer | `Elite-ML-Engineer.yaml` |
| API integrations | Elite Integration Specialist | `Elite-Integration-Specialist.yaml` |
| Infrastructure | Elite DevOps Engineer | `Elite-DevOps-Engineer.yaml` |
| Database design | Elite Database Architect | `Elite-Database-Architect.yaml` |
| Email templates | Email Template Builder | `Email-Template-Builder-Specialist.yaml` |

---

## 🚀 Getting Started

1. **Review Available Agents** - Read through this README
2. **Choose Your Agent** - Pick the one that matches your task
3. **Read the Agent Config** - Understand their capabilities
4. **Delegate Clearly** - Provide specific, detailed requirements
5. **Review Output** - Validate the work meets standards

---

## 📞 Need Help?

- See [CUSTOM-AGENT-GUIDE.md](../../CUSTOM-AGENT-GUIDE.md) for detailed guidance
- See [HOW-AI-HELPS-YOUR-VISION.md](../../HOW-AI-HELPS-YOUR-VISION.md) for platform overview
- See [IMPLEMENTATION-ROADMAP.md](../../IMPLEMENTATION-ROADMAP.md) for phase breakdown

---

**Ready to delegate? Choose an agent above and get started!** 🚀
