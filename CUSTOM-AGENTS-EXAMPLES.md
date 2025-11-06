# Custom Agents Usage Examples

This document provides real-world examples of how to effectively delegate tasks to custom agents.

## 📋 Table of Contents

1. [Frontend Development Examples](#frontend-development-examples)
2. [Backend Development Examples](#backend-development-examples)
3. [ML Engineering Examples](#ml-engineering-examples)
4. [Integration Examples](#integration-examples)
5. [DevOps Examples](#devops-examples)
6. [Database Examples](#database-examples)
7. [Email Template Examples](#email-template-examples)

---

## Frontend Development Examples

### Example 1: Building a Dashboard Component

**Task:**
```
I need the Elite Frontend Developer to build an Investment Analytics Dashboard component with the following requirements:

Component Name: InvestmentAnalyticsDashboard
Location: src/pages/InvestmentAnalytics.tsx

Features:
1. Four KPI Cards at the top:
   - Total Portfolio Value (formatted as currency)
   - Active Deals Count
   - Average ROI Percentage
   - YTD Performance

2. Charts Section:
   - Line chart showing portfolio value over time (last 12 months)
   - Pie chart showing investment distribution by property type
   - Bar chart showing top 5 performing properties

3. Recent Activities Table:
   - Display 10 most recent investment activities
   - Columns: Date, Property, Action, Amount, Status
   - Support pagination and sorting

Technical Requirements:
- Use Recharts for all visualizations
- Follow styling patterns from src/pages/LeadManagement.tsx
- Implement with TypeScript strict mode
- Include loading states for async data
- Support demo mode with mock data
- Ensure mobile responsiveness
- Add ARIA labels for accessibility
- Write comprehensive Vitest tests with >80% coverage

Reference Files:
- src/pages/LeadManagement.tsx (dashboard pattern)
- src/components/crm/InvestorProfile.tsx (component structure)
- src/components/__tests__/ (test examples)
```

### Example 2: Creating a Form Component

**Task:**
```
I need the Elite Frontend Developer to create a PropertySubmissionForm component:

Component Name: PropertySubmissionForm
Location: src/components/forms/PropertySubmissionForm.tsx

Form Fields:
- Property Address (text, required)
- Property Type (dropdown: Single Family, Multi-Family, Commercial, Industrial)
- Purchase Price (currency input, required)
- Expected ROI (percentage input)
- Property Description (textarea, optional)
- Property Images (file upload, max 5 images)
- Contact Information (embedded section with name, email, phone)

Requirements:
- Use React Hook Form for form handling
- Use Zod for validation schema
- Display inline validation errors
- Implement multi-step form (3 steps: Basic Info, Financial Details, Contact)
- Show progress indicator
- Support file upload with preview
- Include "Save as Draft" and "Submit" buttons
- Handle submission errors gracefully
- Works in demo mode (console.log submission)
- Write comprehensive tests including validation scenarios

Reference Files:
- src/lib/schemas/crm.ts (validation patterns)
- Existing form components in src/components/forms/
```

---

## Backend Development Examples

### Example 1: Lead Enrichment API

**Task:**
```
I need the Elite Backend Developer to create a lead enrichment serverless function:

Function Name: lead-enrichment
Location: netlify/functions/lead-enrichment.ts

Purpose: Enrich incoming leads with additional property data from Attom Data API

Input Schema (Zod):
- leadId: string (UUID)
- propertyAddress: string
- propertyType: string

Functionality:
1. Validate input using Zod schema
2. Fetch lead data from Supabase
3. Call Attom Data API to get:
   - Property ownership history
   - Tax assessment data
   - Market value estimate
   - Neighborhood statistics
4. Merge enriched data with lead record
5. Update lead in database
6. Return enriched lead data

Technical Requirements:
- Handle demo mode (return mock data if no API key)
- Implement retry logic with exponential backoff (max 3 retries)
- Add correlation ID for request tracing
- Comprehensive error handling
- Log all operations with structured logging
- Rate limit handling (Attom: 100 req/min)
- Cache results for 24 hours (Redis)
- Return standard response format: { success, data, error, correlationId }
- Write integration tests with API mocks
- Document endpoint in JSDoc format

Reference Files:
- netlify/functions/lead-ingest-enhanced.js (function pattern)
- src/lib/schemas/crm.ts (validation schemas)
- netlify/functions/__tests__/ (test patterns)
```

### Example 2: Webhook Handler

**Task:**
```
I need the Elite Backend Developer to build a DocuSign webhook handler:

Function Name: webhook-docusign
Location: netlify/functions/webhook-docusign.ts

Purpose: Handle DocuSign envelope status updates

Webhook Events to Handle:
- envelope-sent
- envelope-delivered
- envelope-completed
- envelope-declined
- envelope-voided

Functionality:
1. Verify webhook signature (HMAC)
2. Parse webhook payload
3. Validate event type
4. Update opportunity status in database based on event
5. Send notification to relevant parties (email/SMS)
6. Log event in audit_log table
7. Return 200 OK response

Technical Requirements:
- Signature verification is critical (security)
- Handle duplicate events (idempotency with event ID)
- Support async processing (queue long-running tasks)
- Comprehensive error handling
- Return 200 even for handled errors (prevent retries)
- Log all webhook events
- Demo mode support (accept unsigned webhooks in dev)
- Write tests with mock webhook payloads

Reference Files:
- netlify/functions/webhook-inbound.js (webhook pattern)
```

---

## ML Engineering Examples

### Example 1: Lead Scoring Model

**Task:**
```
I need the Elite ML Engineer to build a lead-to-deal probability model:

Model Name: LeadScoringModel
Location: ml/models/lead_scoring/

Purpose: Predict probability that a lead will convert to a closed deal

Training Data:
- Source: PostgreSQL leads and opportunities tables
- Features to engineer:
  * Property features: type, value, location, age
  * Lead features: source, engagement score, response time
  * Investor features: accreditation status, portfolio size, past deals
  * Temporal features: time on platform, contact frequency
- Target: binary (converted: yes/no)
- Expected training set: ~10,000 historical leads

Model Requirements:
- Algorithm: XGBoost (try LightGBM for comparison)
- Target accuracy: >75%
- Target latency: <100ms for scoring
- Must be explainable (use SHAP values)
- Handle missing data gracefully
- Support incremental training

Deliverables:
1. Feature engineering pipeline (Python)
2. Model training script with MLflow tracking
3. Model evaluation notebook (Jupyter)
4. FastAPI scoring endpoint
5. Model card documentation
6. Comprehensive tests
7. Deployment instructions

Technical Requirements:
- Use MLflow for experiment tracking
- Version all models and features
- Implement cross-validation (5-fold)
- Monitor for data drift
- A/B testing framework for model comparison
- Include SHAP explainability
- Load test to verify latency requirements

Reference Files:
- supabase-sql/01-setup.sql (data schema)
- netlify/functions/ (for API integration patterns)
```

---

## Integration Examples

### Example 1: Twilio SMS Integration

**Task:**
```
I need the Elite Integration Specialist to integrate Twilio for SMS notifications:

Module Name: TwilioClient
Location: src/lib/integrations/twilio.ts

Features:
1. Send SMS messages
2. Send SMS using templates (with variable substitution)
3. Validate phone numbers (E.164 format)
4. Handle delivery status callbacks
5. Support long messages (multi-segment)

Functionality:
- Initialize Twilio client with credentials from env
- sendSMS(to, message, options)
- sendTemplatedSMS(to, templateId, variables)
- validatePhoneNumber(phone)
- handleStatusCallback(webhookData)

Technical Requirements:
- Environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
- Rate limiting: 100 msg/sec (implement queue if needed)
- Retry logic: exponential backoff, max 3 retries
- Error handling: network errors, invalid numbers, rate limits
- Logging: log all send attempts with correlation ID
- Demo mode: log to console instead of sending
- Cost tracking: track message segments for billing
- Write integration tests with Twilio mocks

Deliverables:
1. Twilio client class
2. TypeScript interfaces
3. Webhook handler for status updates
4. Integration tests
5. Usage documentation
6. Demo mode implementation

Reference Files:
- src/utils/emailMarketing.ts (API client pattern)
- netlify/functions/webhook-inbound.js (webhook handler pattern)
```

---

## DevOps Examples

### Example 1: OpenTelemetry Tracing

**Task:**
```
I need the Elite DevOps Engineer to implement distributed tracing with OpenTelemetry:

Purpose: Add request tracing across all serverless functions and frontend

Scope:
1. Instrument all Netlify Functions
2. Add tracing to frontend API calls
3. Set up trace collection and visualization
4. Define SLIs/SLOs

Requirements:
1. OpenTelemetry SDK setup
2. Trace all serverless function invocations
3. Trace database queries
4. Trace external API calls
5. Trace frontend -> backend flows
6. Export traces to Grafana Cloud (or similar)

Implementation:
- Add OpenTelemetry to package.json
- Create tracing utility module
- Add trace instrumentation to all functions
- Configure trace exporters
- Set up Grafana dashboards
- Define SLOs:
  * API latency: p95 < 200ms
  * Error rate: < 0.1%
  * Database queries: p95 < 50ms

Deliverables:
1. OpenTelemetry configuration
2. Tracing utility functions
3. Instrumentation for all functions
4. Grafana dashboard JSON
5. SLO definitions and alerts
6. Documentation and runbook

Reference Files:
- netlify/functions/ (all functions to instrument)
- .github/workflows/ci.yml (CI/CD integration)
```

---

## Database Examples

### Example 1: Query Optimization

**Task:**
```
I need the Elite Database Architect to optimize the opportunity pipeline query:

Current Issue:
The query that fetches opportunities with investor info and recent activities is slow (>500ms) when dataset grows beyond 10,000 records.

Current Query (problematic):
SELECT o.*, i.name as investor_name, 
       (SELECT json_agg(a.*) FROM activities a 
        WHERE a.entity_type = 'opportunity' 
        AND a.entity_id = o.id 
        ORDER BY a.created_at DESC LIMIT 5) as recent_activities
FROM opportunities o
LEFT JOIN investors i ON o.investor_id = i.id
WHERE o.status = 'active'
ORDER BY o.updated_at DESC
LIMIT 50;

Requirements:
1. Analyze query performance with EXPLAIN ANALYZE
2. Design appropriate indexes
3. Rewrite query if needed for better performance
4. Target: <100ms for queries on tables with 100K+ records
5. Consider materialized views if appropriate
6. Document index strategy

Deliverables:
1. Performance analysis report
2. Index creation SQL scripts
3. Optimized query (if rewrite needed)
4. Migration script
5. Load testing results
6. Documentation of index strategy

Reference Files:
- supabase-sql/01-setup.sql (current schema)
- netlify/functions/ (to identify common query patterns)
```

---

## Email Template Examples

### Example 1: Welcome Email

**Task:**
```
I need the Email Template Builder Specialist to create a welcome email template:

Template Name: lead-welcome-email
Purpose: Welcome new leads who submit inquiry through website

Content Requirements:
1. Header with company logo
2. Personalized greeting ({{firstName}})
3. Welcome message thanking them for their interest
4. Overview of what happens next (3 steps)
5. CTA button: "Schedule Consultation"
6. Footer with contact info and unsubscribe link

Design Requirements:
- Mobile responsive (looks good on all devices)
- Brand colors: Primary #1e40af, Secondary #f59e0b
- Font: Inter
- Professional, welcoming tone
- Images optimized for email clients

Technical Requirements:
- HTML email (table-based layout for compatibility)
- Inline CSS only
- Plain text version included
- Support dark mode
- Test in major clients (Gmail, Outlook, Apple Mail)
- Track opens and clicks
- Under 600px width
- Alt text for all images

Deliverables:
1. HTML email template
2. Plain text version
3. Preview images (desktop, mobile, dark mode)
4. Template variables list
5. Litmus test results
6. Integration instructions

Reference Files:
- src/utils/emailMarketing.ts (sending logic)
- Brand guidelines in docs/
```

---

## 🎯 Key Takeaways

### What Makes a Good Task Delegation?

✅ **Good Delegation:**
- Specific deliverables
- Clear technical requirements
- Referenced existing patterns
- Defined success criteria
- Testing requirements
- Security considerations

❌ **Poor Delegation:**
- Vague requirements ("make it better")
- No context or examples
- Missing testing requirements
- No error handling mentioned
- Assumes domain knowledge

### General Tips:

1. **Always reference existing code** - Point agents to similar patterns
2. **Define success metrics** - What does "done" look like?
3. **Include error cases** - What could go wrong?
4. **Specify testing** - Always require tests
5. **Consider security** - Mention auth, validation, sanitization
6. **Support demo mode** - Most features should work without real APIs
7. **Think about scalability** - How will this perform at scale?

---

For more information, see:
- [CUSTOM-AGENTS-QUICK-REF.md](CUSTOM-AGENTS-QUICK-REF.md) - Quick reference guide
- [.github/agents/README.md](.github/agents/README.md) - Agent directory
- [CUSTOM-AGENT-GUIDE.md](CUSTOM-AGENT-GUIDE.md) - Complete guide
