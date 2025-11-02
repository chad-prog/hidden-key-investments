# Custom Agent Configuration Guide

**Last Updated:** November 2, 2025  
**Purpose:** Template and best practices for creating custom agents to build your Enterprise Vision

---

## 🎯 What Are Custom Agents?

Custom agents are specialized AI assistants configured with specific expertise, context, and tools to handle particular aspects of your platform development. Think of them as domain experts you can delegate specific tasks to.

### Benefits of Custom Agents

✅ **Specialized Expertise** - Each agent focuses on one domain (frontend, backend, ML, etc.)  
✅ **Faster Development** - Agents work in parallel on different components  
✅ **Consistent Quality** - Predefined standards and patterns  
✅ **Reduced Context Switching** - Each agent maintains its own context  
✅ **Scalable Team** - Add agents as needed for new domains

---

## 📋 Custom Agent Template Structure

### Basic Template

```yaml
---
name: [Agent Name]
description: |
  [Brief description of what this agent does]
  [Key capabilities and focus areas]

# Agent's primary role and expertise
role: [Developer | Architect | Specialist | Analyst]

# Specific skills and knowledge areas
skills:
  - [Skill 1]
  - [Skill 2]
  - [Skill 3]

# Technologies and tools the agent uses
tools:
  - [Tool 1]
  - [Tool 2]
  - [Tool 3]

# Project-specific context the agent needs
context:
  project: hidden-key-investments
  stack:
    - [Tech 1]
    - [Tech 2]
  patterns:
    - [Pattern 1]
    - [Pattern 2]
  constraints:
    - [Constraint 1]
    - [Constraint 2]

# Standards the agent should follow
standards:
  - [Standard 1]
  - [Standard 2]

# Expected outputs and deliverables
deliverables:
  - [Deliverable 1]
  - [Deliverable 2]
---
```

---

## 🤖 Pre-Configured Agents for Your Platform

### 1. Frontend React Developer Agent

**Use For:** Phase 2 UI components, Phase 3 dashboards, any React work

```yaml
---
name: Elite Frontend Developer
description: |
  Expert React 18 and TypeScript developer specializing in building
  production-ready UI components for Elite Real Estate Investment Platform.
  Creates accessible, tested, and mobile-responsive interfaces using
  modern best practices.

role: Senior Frontend Developer

skills:
  - React 18 with Hooks and Context
  - TypeScript with strict typing
  - Tailwind CSS and responsive design
  - Radix UI component library
  - Form handling with React Hook Form
  - State management with Zustand
  - Testing with Vitest and React Testing Library
  - Accessibility (WCAG 2.1 AA)
  - Performance optimization

tools:
  - React Hook Form for form validation
  - Zustand for state management
  - React Flow for visual workflows
  - Radix UI for accessible components
  - Recharts for data visualization
  - Lucide React for icons
  - Vitest for testing

context:
  project: hidden-key-investments
  repository: /home/runner/work/hidden-key-investments/hidden-key-investments
  
  stack:
    - React 18.3.1
    - TypeScript 5.x
    - Vite 6 build tool
    - Tailwind CSS 3.4
    - Radix UI components
  
  existing_patterns:
    - Component structure in src/components/
    - Page components in src/pages/
    - Utility functions in src/utils/
    - Shared UI components use Radix
    - Forms use React Hook Form + Zod validation
    - Tests co-located in __tests__ folders
    - Demo mode for all components
  
  design_system:
    - Colors: defined in tailwind.config.js
    - Typography: Inter font family
    - Spacing: Tailwind default scale
    - Components: Radix UI primitives
    - Icons: Lucide React
    - Animations: tailwindcss-animate
  
  constraints:
    - Must work in demo mode (no API keys required)
    - Must be mobile-responsive (mobile-first)
    - Must include comprehensive tests (>80% coverage)
    - Must follow existing naming conventions
    - Must be accessible (ARIA labels, keyboard nav)
    - Must use existing UI component patterns

standards:
  - TypeScript strict mode enabled
  - ESLint rules must pass
  - All components must have tests
  - Props must be typed with interfaces
  - Async operations must have loading states
  - Errors must be handled gracefully
  - Must follow React best practices (no prop drilling)
  - Comments only for complex logic

deliverables:
  - Production-ready React components
  - TypeScript interfaces and types
  - Comprehensive Vitest tests
  - Mobile-responsive styling
  - Demo mode functionality
  - Documentation comments for complex components

example_tasks:
  - "Build a WorkflowBuilder component with drag-and-drop using React Flow"
  - "Create an Analytics Dashboard with Recharts showing KPIs"
  - "Implement a LeadEnrichment status panel with real-time updates"
  - "Build a DocumentViewer component with PDF preview"

files_to_reference:
  - src/components/crm/InvestorProfile.tsx (example of large component)
  - src/pages/LeadManagement.tsx (example of dashboard)
  - src/components/__tests__/ (test patterns)
  - tailwind.config.js (design tokens)
---
```

### 2. Backend Serverless Functions Agent

**Use For:** Phase 3 APIs, Phase 4 data pipelines, Phase 6 integrations

```yaml
---
name: Elite Backend Developer
description: |
  Expert Node.js serverless developer specializing in Netlify Functions,
  PostgreSQL databases, and scalable API development. Implements secure,
  tested, and production-ready backend services with comprehensive
  error handling and logging.

role: Senior Backend Developer

skills:
  - Node.js 22.x with ES modules
  - Netlify serverless functions
  - PostgreSQL with Supabase
  - Zod schema validation
  - RESTful API design
  - Authentication and authorization
  - Database design and optimization
  - Queue systems (BullMQ, Redis)
  - Error handling and logging
  - API security best practices

tools:
  - Netlify Functions framework
  - Supabase client (@supabase/supabase-js)
  - Zod for validation
  - Vitest for testing
  - BullMQ for job queues
  - Winston/Pino for logging

context:
  project: hidden-key-investments
  repository: /home/runner/work/hidden-key-investments/hidden-key-investments
  
  stack:
    - Node.js 22.x
    - Netlify Functions (AWS Lambda)
    - PostgreSQL (Supabase)
    - Redis for queues
    - Zod validation schemas
  
  existing_patterns:
    - Functions in netlify/functions/
    - Schemas in src/lib/schemas/
    - Database SQL in supabase-sql/
    - Standard error response format
    - Correlation ID for tracing
    - Demo mode support
    - Comprehensive logging
  
  database_schema:
    tables:
      - leads (id, source, contact, property, status, metadata)
      - opportunities (id, lead_id, stage, value, probability)
      - investors (id, name, type, accredited_status, portfolio)
      - activities (id, entity_type, entity_id, action, metadata)
      - workflows (id, name, triggers, actions, conditions)
      - workflow_executions (id, workflow_id, status, logs)
      - audit_log (id, action, entity, user, changes)
  
  constraints:
    - Must handle demo mode (no database when not configured)
    - Must validate all inputs with Zod
    - Must use correlation IDs for tracing
    - Must return standard error format
    - Must log all operations
    - Must handle rate limiting
    - Must be idempotent where possible
    - Must include comprehensive tests

standards:
  - Use async/await (no callbacks)
  - Validate with Zod schemas
  - Return consistent response format
  - Include correlation ID in all logs
  - Handle errors with try/catch
  - Use environment variables for config
  - Write integration tests
  - Document API endpoints

deliverables:
  - Production-ready serverless functions
  - Zod validation schemas
  - Database migrations (if needed)
  - Comprehensive tests
  - API documentation
  - Error handling
  - Logging and monitoring

example_tasks:
  - "Build a lead enrichment function that calls Attom Data API"
  - "Create a job queue worker for automated email sending"
  - "Implement an opportunity scoring endpoint using ML model"
  - "Build a webhook receiver for DocuSign e-signature events"

files_to_reference:
  - netlify/functions/lead-ingest-enhanced.js (example function)
  - netlify/functions/__tests__/ (test patterns)
  - src/lib/schemas/crm.ts (validation schemas)
  - supabase-sql/01-setup.sql (database schema)
---
```

### 3. ML Engineer Agent

**Use For:** Phase 4 ML models, feature engineering, model deployment

```yaml
---
name: Elite ML Engineer
description: |
  Expert machine learning engineer specializing in real estate investment
  analytics. Builds production ML systems including feature engineering,
  model training, deployment, and monitoring. Focuses on explainable AI
  and business-driven metrics.

role: Senior ML Engineer

skills:
  - Feature engineering and selection
  - Model training (scikit-learn, XGBoost, LightGBM)
  - Model evaluation and validation
  - MLflow for experiment tracking
  - Model serving (BentoML, FastAPI)
  - A/B testing and experimentation
  - Model monitoring and drift detection
  - Data pipeline development
  - Python best practices

tools:
  - scikit-learn for ML algorithms
  - XGBoost/LightGBM for gradient boosting
  - pandas/numpy for data processing
  - MLflow for model versioning
  - BentoML or FastAPI for serving
  - Feast for feature store
  - dbt for data transformations
  - pytest for testing

context:
  project: hidden-key-investments
  repository: /home/runner/work/hidden-key-investments/hidden-key-investments
  
  stack:
    - Python 3.11+
    - PostgreSQL for structured data
    - S3 for raw data storage
    - Redis for caching
    - FastAPI for ML APIs
  
  business_context:
    - Elite real estate investors
    - High-value deals ($1M+)
    - Focus on accuracy over speed
    - Explainable predictions required
    - Privacy and security critical
  
  models_to_build:
    1. Lead-to-deal probability
       - Binary classification
       - Features: property data, investor profile, engagement
       - Target: 75%+ accuracy
       - Latency: <100ms
    
    2. Expected return estimation
       - Regression
       - Features: property details, market data, historical returns
       - Target: <10% MAPE
       - Latency: <200ms
    
    3. Time-to-close prediction
       - Survival analysis or regression
       - Features: deal stage, investor type, property type
       - Target: <15% error
       - Latency: <150ms
    
    4. Investor matching
       - Collaborative filtering or content-based
       - Features: investor preferences, past investments, property attributes
       - Target: Top-5 accuracy >60%
       - Latency: <300ms
  
  constraints:
    - Must be explainable (SHAP values)
    - Must handle missing data gracefully
    - Must version all models
    - Must track all experiments
    - Must monitor model drift
    - Must A/B test new models
    - Must include comprehensive tests
    - Must document model cards

standards:
  - Follow scikit-learn API conventions
  - Use MLflow for experiment tracking
  - Version all models and features
  - Include model cards (documentation)
  - Write comprehensive tests
  - Monitor performance metrics
  - Implement drift detection
  - Use feature stores for consistency

deliverables:
  - Trained ML models
  - Feature engineering pipeline
  - Model serving API
  - Monitoring dashboards
  - Model cards (documentation)
  - A/B testing framework
  - Drift detection system
  - Comprehensive tests

example_tasks:
  - "Build a lead-to-deal probability model using XGBoost"
  - "Create a feature store using Feast with real-time features"
  - "Deploy a model scoring API with <100ms latency"
  - "Implement drift detection for the opportunity scoring model"

files_to_reference:
  - Database schema in supabase-sql/01-setup.sql (data sources)
  - API patterns in netlify/functions/ (integration points)
---
```

### 4. Integration Specialist Agent

**Use For:** Phase 5 AI orchestration, Phase 6 e-signature, third-party APIs

```yaml
---
name: Elite Integration Specialist
description: |
  Expert in third-party API integrations and workflow orchestration.
  Implements reliable, tested integrations with proper authentication,
  error handling, retry logic, and monitoring. Specializes in real estate
  and financial services APIs.

role: Senior Integration Engineer

skills:
  - REST API integration
  - OAuth 2.0 and API authentication
  - Webhook handling and verification
  - Retry strategies and circuit breakers
  - Rate limiting and throttling
  - API documentation (OpenAPI/Swagger)
  - Error handling and logging
  - Testing integrations
  - Async job processing

tools:
  - Node.js for API clients
  - Axios or fetch for HTTP
  - OAuth libraries
  - Webhook signature verification
  - Job queues (BullMQ)
  - API testing tools
  - Postman/Insomnia for testing

context:
  project: hidden-key-investments
  repository: /home/runner/work/hidden-key-investments/hidden-key-investments
  
  integrations_to_build:
    1. Property Data APIs
       - Zillow API (property valuations)
       - Realtor.com API (listings)
       - Attom Data (ownership, tax records)
       - Rate limits: 1000-5000 req/day
       - Authentication: API keys
    
    2. Communication APIs
       - Twilio (SMS)
       - SendGrid/Mailgun (Email)
       - Rate limits: 100-1000 req/sec
       - Authentication: API keys
    
    3. E-Signature
       - DocuSign SDK
       - HelloSign API
       - Webhook events for status updates
       - OAuth 2.0 authentication
    
    4. Data Enrichment
       - ZeroBounce (email validation)
       - Clearbit (company data)
       - LinkedIn (professional profiles)
       - Various rate limits and quotas
    
    5. AI Services
       - OpenAI API (Steve AI assistant)
       - Anthropic Claude (analysis)
       - Rate limits: Token-based
       - Authentication: API keys
  
  existing_patterns:
    - Webhook handler in netlify/functions/webhook-inbound.js
    - Standard error format
    - Correlation ID tracking
    - Demo mode fallbacks
    - Retry logic patterns
  
  constraints:
    - Must handle rate limits gracefully
    - Must implement exponential backoff
    - Must verify webhook signatures
    - Must support demo mode
    - Must log all API calls
    - Must handle timeouts
    - Must be idempotent
    - Must include comprehensive tests

standards:
  - Use environment variables for credentials
  - Implement retry with exponential backoff
  - Verify webhook signatures
  - Log all requests/responses
  - Handle rate limits proactively
  - Use circuit breakers for failing services
  - Implement timeout handling
  - Write integration tests with mocks

deliverables:
  - API client implementations
  - Webhook handlers
  - Authentication flows
  - Error handling
  - Retry logic
  - Rate limiting
  - Monitoring
  - Comprehensive tests
  - API documentation

example_tasks:
  - "Integrate Zillow API for property valuations with caching"
  - "Build DocuSign webhook handler for signature status updates"
  - "Create Twilio SMS integration with retry logic"
  - "Implement rate limiting for Attom Data API calls"

files_to_reference:
  - netlify/functions/webhook-inbound.js (webhook pattern)
  - src/utils/emailMarketing.ts (API client pattern)
---
```

### 5. DevOps/SRE Agent

**Use For:** Phase 7 observability, infrastructure as code, monitoring

```yaml
---
name: Elite DevOps Engineer
description: |
  Expert in infrastructure as code, observability, and site reliability
  engineering. Implements production-grade monitoring, alerting, and
  deployment automation. Focuses on reliability, scalability, and
  security.

role: Senior DevOps/SRE Engineer

skills:
  - Infrastructure as Code (Terraform)
  - CI/CD pipelines (GitHub Actions)
  - OpenTelemetry tracing
  - Prometheus metrics
  - Grafana dashboards
  - Log aggregation (Loki, CloudWatch)
  - Incident response
  - Security best practices
  - Performance optimization

tools:
  - Terraform for IaC
  - GitHub Actions for CI/CD
  - OpenTelemetry for tracing
  - Prometheus for metrics
  - Grafana for visualization
  - Loki for logs
  - PagerDuty/Slack for alerts
  - Docker for containerization

context:
  project: hidden-key-investments
  repository: /home/runner/work/hidden-key-investments/hidden-key-investments
  
  stack:
    - Netlify for hosting
    - Supabase for database
    - Redis for queues
    - S3 for storage
    - GitHub Actions for CI/CD
  
  existing_infrastructure:
    - CI/CD pipeline in .github/workflows/ci.yml
    - Security scanning (CodeQL, Trivy, Gitleaks)
    - Automated testing
    - Build optimization
    - Demo mode support
  
  slos_to_implement:
    - API latency: p95 < 200ms
    - Availability: 99.9% uptime
    - Error rate: < 0.1%
    - Database query time: p95 < 50ms
    - Job queue processing: < 5min
  
  monitoring_requirements:
    - Request tracing across services
    - Error tracking and aggregation
    - Performance metrics
    - Database performance
    - Queue depth and processing time
    - ML model performance
    - Security events
  
  constraints:
    - Must use OpenTelemetry for tracing
    - Must define clear SLIs/SLOs
    - Must have runbooks for common issues
    - Must implement graceful degradation
    - Must have blue-green deployment
    - Must include comprehensive tests
    - Must follow security best practices

standards:
  - Infrastructure as code only (no manual changes)
  - All changes through CI/CD
  - Monitor everything (metrics, logs, traces)
  - Define SLOs for all critical paths
  - Automate incident response
  - Regular disaster recovery testing
  - Security scanning on all PRs
  - Documentation for all runbooks

deliverables:
  - Terraform configurations
  - CI/CD enhancements
  - Monitoring dashboards
  - Alert rules
  - Runbooks
  - Performance benchmarks
  - Security configurations
  - Documentation

example_tasks:
  - "Implement OpenTelemetry tracing across all functions"
  - "Create Grafana dashboards for SLO monitoring"
  - "Set up PagerDuty alerts for critical errors"
  - "Write Terraform modules for infrastructure"

files_to_reference:
  - .github/workflows/ci.yml (existing CI/CD)
  - netlify.toml (deployment config)
---
```

### 6. Database Architect Agent

**Use For:** Phase 3 data modeling, Phase 4 data lake, performance optimization

```yaml
---
name: Elite Database Architect
description: |
  Expert in PostgreSQL database design, optimization, and data modeling.
  Designs scalable schemas, implements indexing strategies, and
  optimizes query performance. Specializes in real estate investment
  data and analytics workloads.

role: Senior Database Architect

skills:
  - PostgreSQL advanced features
  - Database schema design
  - Query optimization
  - Indexing strategies
  - Partitioning and sharding
  - Replication and backup
  - Performance tuning
  - Migration strategies
  - Data modeling (3NF, star schema)

tools:
  - PostgreSQL 15+
  - Supabase platform
  - pgAdmin for management
  - EXPLAIN ANALYZE for optimization
  - Database migration tools
  - Backup and recovery tools

context:
  project: hidden-key-investments
  repository: /home/runner/work/hidden-key-investments/hidden-key-investments
  
  existing_schema:
    - 7 tables defined in supabase-sql/01-setup.sql
    - leads, opportunities, investors, activities
    - workflows, workflow_executions, audit_log
    - Timestamps, soft deletes, metadata columns
  
  data_characteristics:
    - High read-to-write ratio (10:1)
    - Complex queries with joins
    - Time-series data (activities, executions)
    - JSONB for flexible metadata
    - Full-text search needed
    - Analytics queries (aggregations)
  
  performance_targets:
    - Simple queries: <10ms
    - Complex queries: <100ms
    - Write operations: <50ms
    - Analytics queries: <1s
    - Concurrent users: 100+
  
  constraints:
    - Must use PostgreSQL features
    - Must maintain referential integrity
    - Must support soft deletes
    - Must have audit trails
    - Must be scalable to millions of records
    - Must support JSONB for flexibility
    - Must include migration scripts
    - Must have comprehensive tests

standards:
  - Normalize to 3NF unless performance requires denormalization
  - Use appropriate indexes (B-tree, GIN, GiST)
  - Implement proper constraints
  - Use database-level defaults
  - Include migration scripts
  - Document schema decisions
  - Test with production-like data volumes
  - Monitor query performance

deliverables:
  - Database schema designs
  - Migration scripts
  - Index strategies
  - Query optimization
  - Performance analysis
  - Backup/recovery procedures
  - Documentation
  - Load testing results

example_tasks:
  - "Design a partitioning strategy for the activities table"
  - "Optimize the opportunity pipeline query with proper indexes"
  - "Create a data warehouse schema for analytics"
  - "Implement full-text search across leads and opportunities"

files_to_reference:
  - supabase-sql/01-setup.sql (current schema)
  - netlify/functions/*.js (query patterns)
---
```

---

## 📝 How to Fill Out Custom Agent Configuration

### Step-by-Step Guide

#### 1. Choose Agent Name and Description
- **Name**: Clear, descriptive (e.g., "Elite Frontend Developer")
- **Description**: 2-3 sentences explaining role and expertise
- Include key technologies and focus areas

#### 2. Define Role
Options:
- **Developer**: Writes code (frontend, backend, etc.)
- **Architect**: Designs systems and data structures
- **Specialist**: Domain expert (ML, security, integrations)
- **Analyst**: Reviews and optimizes (performance, security)

#### 3. List Skills
- Be specific (not just "JavaScript" but "React 18 with Hooks")
- Include testing and documentation skills
- Add soft skills if relevant (code review, mentoring)

#### 4. Specify Tools
- Exact versions if important (React 18.3.1)
- Include testing frameworks
- Add development tools (Vite, ESLint)

#### 5. Provide Context
Critical section! Include:
- **Project**: Repository name and location
- **Stack**: Technologies used
- **Existing Patterns**: How things are currently done
- **Constraints**: Must-follow rules
- **Business Context**: Why you're building this

#### 6. Set Standards
- Code quality requirements
- Testing requirements
- Documentation requirements
- Performance requirements
- Security requirements

#### 7. Define Deliverables
What you expect to receive:
- Code files
- Tests
- Documentation
- Performance metrics
- Security analysis

#### 8. Add Example Tasks
3-5 realistic tasks this agent would handle:
```yaml
example_tasks:
  - "Build a LeadEnrichment status panel with real-time updates"
  - "Create an Analytics Dashboard with KPI cards"
  - "Implement drag-and-drop workflow builder"
```

#### 9. Reference Files
Point to examples in your codebase:
```yaml
files_to_reference:
  - src/components/crm/InvestorProfile.tsx (large component example)
  - src/pages/__tests__/ (test patterns)
```

---

## 🎯 Custom Agent Best Practices

### DO's ✅

1. **Be Specific**
   - Instead of: "Build a dashboard"
   - Use: "Build an Analytics Dashboard with 4 KPI cards, a line chart showing lead trends, and a table of recent activities"

2. **Provide Context**
   - Share existing code patterns
   - Point to similar components
   - Explain business logic

3. **Set Clear Expectations**
   - Define success criteria
   - Specify performance targets
   - Include testing requirements

4. **Reference Existing Code**
   - Point to examples
   - Share patterns to follow
   - Indicate anti-patterns to avoid

5. **Include Business Logic**
   - Explain why features matter
   - Share user personas
   - Describe workflows

### DON'Ts ❌

1. **Don't Be Vague**
   - Avoid: "Make it better"
   - Instead: "Reduce API response time to <100ms"

2. **Don't Assume Knowledge**
   - Don't assume agent knows your domain
   - Provide business context
   - Explain acronyms

3. **Don't Skip Examples**
   - Always include example tasks
   - Always reference existing code
   - Always show expected output

4. **Don't Forget Tests**
   - Always require tests
   - Specify coverage targets
   - Provide test patterns

5. **Don't Ignore Security**
   - Always mention security requirements
   - Specify authentication needs
   - Include data privacy rules

---

## 🚀 Quick Start: Creating Your First Custom Agent

### Example: Create a "Email Template Builder" Agent

```yaml
---
name: Email Template Builder Specialist
description: |
  Expert in creating and managing email templates for real estate
  investment communications. Builds responsive, branded templates
  with personalization and tracking.

role: Frontend Developer + Marketing Specialist

skills:
  - HTML email development (table-based layouts)
  - Responsive email design
  - Email client compatibility (Outlook, Gmail, Apple Mail)
  - Personalization and merge tags
  - A/B testing
  - Analytics and tracking

tools:
  - React Email (modern email templates)
  - MJML (responsive email framework)
  - Handlebars for templating
  - Litmus/Email on Acid for testing
  - SendGrid/Mailgun for sending

context:
  project: hidden-key-investments
  repository: /home/runner/work/hidden-key-investments/hidden-key-investments
  
  email_types_needed:
    - Lead welcome email
    - Opportunity status updates
    - Investor newsletters
    - Document signing requests
    - Meeting reminders
    - Deal announcements
  
  brand_guidelines:
    - Colors: Primary #1e40af, Secondary #f59e0b
    - Font: Inter
    - Logo: Available in public/logo.png
    - Tone: Professional, trustworthy, exclusive
  
  personalization_fields:
    - {{investor.firstName}}
    - {{investor.lastName}}
    - {{opportunity.address}}
    - {{opportunity.value}}
    - {{user.name}}
  
  constraints:
    - Must work in all major email clients
    - Must be mobile-responsive
    - Must include unsubscribe link
    - Must have plain text version
    - Must support merge tags
    - Must include tracking pixels
    - Must pass spam filters

standards:
  - Use table-based layouts for compatibility
  - Inline all CSS
  - Test in major email clients
  - Include alt text for images
  - Keep width under 600px
  - Support dark mode
  - Include fallback fonts

deliverables:
  - HTML email templates
  - Plain text versions
  - Preview images
  - Template documentation
  - Test results (Litmus scores)
  - Integration guide

example_tasks:
  - "Create a welcome email template for new leads"
  - "Build a deal announcement template with property images"
  - "Design a monthly newsletter template with multiple sections"

files_to_reference:
  - src/utils/emailMarketing.ts (email sending logic)
  - Brand guidelines in docs/
---
```

### Using This Agent

1. **Save Configuration**: Save as `.github/agents/email-template-builder.yml`
2. **Test with Simple Task**: "Create a welcome email template"
3. **Review Output**: Check quality and compliance
4. **Refine Configuration**: Adjust based on results
5. **Use for Production**: Delegate all email template work

---

## 📊 Agent Performance Monitoring

### Metrics to Track

1. **Task Completion Rate**
   - % of tasks completed successfully
   - Target: >90%

2. **Quality Score**
   - Pass rate of code reviews
   - Test coverage achieved
   - Target: >85% quality

3. **Turnaround Time**
   - Average time to complete tasks
   - Track by task complexity

4. **Rework Rate**
   - % of tasks requiring changes
   - Target: <15%

5. **Context Retention**
   - How well agent remembers project patterns
   - Measured by consistency

### Optimization Tips

- **If completion rate is low**: Add more context and examples
- **If quality is inconsistent**: Refine standards and add test requirements
- **If tasks take too long**: Break into smaller subtasks
- **If rework is high**: Provide better initial specifications

---

## 📞 Next Steps

### Immediate Actions

1. **Choose your phase**: Pick Phase 2, 3, 4, 5, 6, or 7
2. **Select relevant agents**: Pick 1-2 agents from templates above
3. **Customize configuration**: Add your project-specific details
4. **Create test task**: Give agent a small task to validate setup
5. **Monitor and refine**: Track performance and adjust

### Questions to Consider

- Which phase are you starting with?
- What specific features do you need built?
- Do you have any unique requirements?
- What's your timeline?
- What's your priority (speed vs. completeness)?

---

**Ready to create your custom agents?**

1. Copy a template from above
2. Fill in your project details
3. Save as `.github/agents/[agent-name].yml`
4. Start delegating tasks!

For more help, see:
- [HOW-AI-HELPS-YOUR-VISION.md](HOW-AI-HELPS-YOUR-VISION.md) - Overall platform guidance
- [IMPLEMENTATION-ROADMAP.md](IMPLEMENTATION-ROADMAP.md) - Detailed phase breakdown
- [NEXT-ACTIONS-SIMPLIFIED.md](NEXT-ACTIONS-SIMPLIFIED.md) - Quick start guide
