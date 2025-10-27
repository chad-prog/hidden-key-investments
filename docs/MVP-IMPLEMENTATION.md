# MVP Implementation Guide

## Overview

This guide documents the newly implemented features to support the High-Level MVP Vision for the Hidden Key Investments platform. These additions provide a solid foundation for building an Elite real-estate investor platform with lead capture, CRM, workflows, and AI orchestration.

## What Has Been Implemented

### 1. Feature Flag System (`src/lib/featureFlags.ts`)

A comprehensive feature flag management system enabling gradual rollout and A/B testing.

**Key Features:**
- Toggle features on/off without code changes
- Support for rollout percentages (gradual deployment)
- A/B testing with variants
- Client-side (localStorage) and server-side (env vars) overrides
- Environment-specific configuration

**Usage Examples:**

```typescript
import { featureFlags } from '@/lib/featureFlags';

// Check if a feature is enabled
if (featureFlags.isEnabled('mlScoring')) {
  // Run ML scoring
}

// Get A/B test variant
const variant = featureFlags.getVariant('workflowAutomation', 'control');

// React hook
import { useFeatureFlag } from '@/lib/featureFlags';

function MyComponent() {
  const isEnabled = useFeatureFlag('aiAssistants');
  return isEnabled ? <AIAssistant /> : null;
}
```

**Environment Variables:**
```bash
# Enable/disable features via environment
VITE_FEATURE_MLSCORING=true
VITE_FEATURE_AIASSISTANTS=false
```

### 2. CRM Data Models (`src/lib/schemas/crm.ts`)

Comprehensive Zod schemas for all core CRM entities with full TypeScript support.

**Entities Defined:**
- **Leads** - Potential investors with contact info, property details, enrichment data
- **Opportunities** - Deals in the pipeline with stages, financials, documents
- **Investors** - Accredited investors with profiles, portfolios, preferences
- **Activities** - Interactions, tasks, and events across all entities

**Key Features:**
- Full validation with Zod
- TypeScript type inference
- Nested schemas for complex objects
- Enum types for status, stages, categories
- Create/Update schema variants

**Usage Examples:**

```typescript
import { LeadSchema, LeadCreateSchema } from '@/lib/schemas/crm';

// Validate lead data
const result = LeadSchema.safeParse(leadData);
if (result.success) {
  const lead = result.data; // Fully typed
}

// Create new lead with validation
const newLead = LeadCreateSchema.parse({
  source: 'website',
  contact: {
    email: 'investor@example.com',
    preferredContact: 'email'
  },
  property: {
    address: '123 Main St',
    city: 'Austin',
    state: 'TX',
    zip: '78701'
  }
});
```

### 3. Workflow Engine (`src/lib/workflowEngine.ts`)

Rule-based automation engine for triggering actions based on CRM events.

**Key Features:**
- Event-driven triggers (lead created, status changed, etc.)
- Conditional logic with multiple operators
- Sequential action execution
- Error handling with stop-on-error option
- Priority-based workflow ordering
- Extensible action handler system

**Workflow Components:**

**Triggers:**
- `lead_created`, `lead_status_changed`, `lead_score_changed`
- `opportunity_created`, `opportunity_stage_changed`
- `investor_created`, `investor_status_changed`
- `activity_completed`, `time_based`, `manual`

**Actions:**
- `send_email`, `send_sms`
- `update_status`, `update_stage`, `assign_to`
- `create_task`, `create_activity`
- `add_tag`, `remove_tag`, `update_score`
- `trigger_webhook`, `execute_function`, `delay`

**Usage Examples:**

```typescript
import { workflowEngine } from '@/lib/workflowEngine';

// Define a workflow
const welcomeWorkflow = {
  id: crypto.randomUUID(),
  name: 'New Lead Welcome',
  trigger: {
    type: 'lead_created'
  },
  conditions: [
    { field: 'contact.email', operator: 'is_not_null', value: null }
  ],
  actions: [
    {
      type: 'send_email',
      order: 0,
      config: {
        to: '{{contact.email}}',
        subject: 'Welcome to Hidden Key Investments',
        template: 'welcome_email'
      }
    },
    {
      type: 'add_tag',
      order: 1,
      config: { tag: 'new_lead' }
    }
  ],
  enabled: true,
  priority: 10,
  createdBy: userId,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Register the workflow
workflowEngine.registerWorkflow(welcomeWorkflow);

// Trigger workflows when lead is created
const executions = await workflowEngine.trigger('lead_created', newLead);
```

### 4. Enhanced Lead Capture API (`netlify/functions/lead-ingest-enhanced.js`)

Production-ready lead ingestion endpoint with validation, tracking, and workflow triggers.

**Key Features:**
- Comprehensive request validation with Zod
- Correlation IDs for request tracing
- Graceful degradation to demo mode
- Automated workflow triggers
- Analytics event tracking
- Standard error handling
- CORS support

**API Endpoint:**
```
POST /.netlify/functions/lead-ingest-enhanced
```

**Request Schema:**
```json
{
  "source": "website",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "property": {
    "address": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip": "78701",
    "propertyType": "multi_family",
    "estimatedValue": 500000
  },
  "tags": ["accredited", "texas"],
  "utm": {
    "source": "google",
    "medium": "cpc",
    "campaign": "q4_investors"
  }
}
```

**Response Schema:**
```json
{
  "ok": true,
  "data": {
    "leadId": "uuid",
    "status": "created",
    "message": "Lead captured successfully"
  },
  "correlationId": "uuid"
}
```

## Database Schema

To use these features in production, create the following Supabase tables:

### Leads Table
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  property JSONB,
  enrichment_data JSONB,
  score NUMERIC,
  score_reason TEXT,
  assigned_to UUID,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB,
  utm_params JSONB,
  raw_payload JSONB,
  correlation_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
```

### Opportunities Table
```sql
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id),
  name TEXT NOT NULL,
  stage TEXT NOT NULL,
  deal_type TEXT NOT NULL,
  estimated_value NUMERIC NOT NULL,
  expected_return NUMERIC,
  expected_close_date DATE,
  actual_close_date DATE,
  probability NUMERIC,
  risk_score NUMERIC,
  primary_investor UUID,
  secondary_investors UUID[],
  assigned_to UUID,
  documents JSONB,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX idx_opportunities_lead_id ON opportunities(lead_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at);
```

### Investors Table
```sql
CREATE TABLE investors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  contact JSONB,
  address JSONB,
  investment_profile JSONB,
  accreditation JSONB,
  total_invested NUMERIC DEFAULT 0,
  active_deals INTEGER DEFAULT 0,
  completed_deals INTEGER DEFAULT 0,
  average_return NUMERIC,
  referred_by UUID,
  account_manager UUID,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  custom_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ
);

CREATE INDEX idx_investors_email ON investors((contact->>'email'));
CREATE INDEX idx_investors_type ON investors(type);
CREATE INDEX idx_investors_status ON investors(status);
```

### Activities Table
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  lead_id UUID REFERENCES leads(id),
  opportunity_id UUID REFERENCES opportunities(id),
  investor_id UUID REFERENCES investors(id),
  subject TEXT NOT NULL,
  description TEXT,
  outcome TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date DATE,
  created_by UUID NOT NULL,
  assigned_to UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_opportunity_id ON activities(opportunity_id);
CREATE INDEX idx_activities_investor_id ON activities(investor_id);
CREATE INDEX idx_activities_type ON activities(type);
```

### Workflows Table
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  trigger JSONB NOT NULL,
  conditions JSONB DEFAULT '[]',
  actions JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0
);
```

### Workflow Executions Table
```sql
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id),
  trigger JSONB NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  action_results JSONB DEFAULT '[]',
  error TEXT,
  retry_count INTEGER DEFAULT 0
);

CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
```

## Integration Guide

### 1. Frontend Integration

```typescript
// In your React components
import { featureFlags } from '@/lib/featureFlags';
import { LeadCreateSchema } from '@/lib/schemas/crm';

function LeadCaptureForm() {
  const handleSubmit = async (formData) => {
    // Validate data
    const validation = LeadCreateSchema.safeParse(formData);
    if (!validation.success) {
      showErrors(validation.error);
      return;
    }

    // Submit to API
    const response = await fetch('/.netlify/functions/lead-ingest-enhanced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validation.data)
    });

    const result = await response.json();
    if (result.ok) {
      showSuccess(`Lead ${result.data.leadId} created`);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 2. Backend Workflow Setup

```typescript
// In your initialization code
import { workflowEngine } from '@/lib/workflowEngine';

// Register custom action handlers
workflowEngine.registerActionHandler('send_email', async (action, context) => {
  const emailService = new EmailService();
  await emailService.send({
    to: action.config.to,
    subject: action.config.subject,
    template: action.config.template,
    data: context.entity
  });
});

// Load workflows from database
const workflows = await loadWorkflowsFromDB();
workflows.forEach(workflow => {
  workflowEngine.registerWorkflow(workflow);
});
```

## Testing

All new modules include comprehensive type safety and validation. To test:

```bash
# Run existing tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

## Next Steps

### Immediate (Week 1-2)
1. ✅ Create Supabase tables using SQL above
2. ✅ Update environment variables with Supabase credentials
3. ✅ Test lead capture API endpoint
4. ✅ Create initial workflows in database
5. ✅ Deploy to staging environment

### Short-term (Week 3-4)
1. Add enrichment service integrations
2. Implement email/SMS service connections
3. Build admin UI for workflow management
4. Add analytics dashboard
5. Implement ML scoring endpoint

### Medium-term (Month 2-3)
1. Build AI assistant orchestrator
2. Implement document generation and e-signature
3. Add advanced reporting and analytics
4. Build investor portal
5. Implement role-based access control

## Environment Variables

Add these to your `.env` or Netlify environment:

```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Feature Flags (optional overrides)
VITE_FEATURE_LEADCAPTURE=true
VITE_FEATURE_CRMPIPELINE=true
VITE_FEATURE_WORKFLOWAUTOMATION=true
VITE_FEATURE_MLSCORING=false
VITE_FEATURE_AIASSISTANTS=false

# Email Service (when ready)
SENDGRID_API_KEY=your_key
MAILCHIMP_API_KEY=your_key

# SMS Service (when ready)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
```

## Support and Documentation

- **Architecture**: See `docs/ARCHITECTURE.md`
- **Roadmap**: See `docs/ROADMAP.md` and `PROJECT-ROADMAP.md`
- **Environment Setup**: See `docs/ENVIRONMENT-VARIABLES.md`
- **API Reference**: See `docs/openapi/lead_crm_scoring_openapi.yaml`

## Success Metrics

Track these KPIs to measure platform success:

- **Lead Capture Rate**: Percentage of form submissions that successfully create leads
- **Workflow Execution Rate**: Percentage of workflows that complete without errors
- **API Response Time**: Average time for lead ingestion (target: <500ms)
- **Feature Adoption**: Percentage of users with each feature enabled
- **Conversion Rate**: Lead → Opportunity → Deal conversion rates
- **Time to Action**: Average time from lead creation to first automated action

## Troubleshooting

### Demo Mode Active
If seeing "demo mode" messages:
1. Check `SUPABASE_URL` is set
2. Check `SUPABASE_ANON_KEY` is set
3. Restart development server after setting env vars

### Workflow Not Triggering
1. Check workflow is enabled in database
2. Verify trigger type matches event
3. Check conditions are met
4. Review workflow execution logs

### Validation Errors
1. Check request matches schema in `src/lib/schemas/crm.ts`
2. Review Zod error messages for specific fields
3. Ensure required fields are present
4. Verify data types match schema

## Contributing

When adding new features:
1. Define schemas in `src/lib/schemas/`
2. Add feature flags in `src/lib/featureFlags.ts`
3. Create workflow actions in `src/lib/workflowEngine.ts`
4. Add tests for new functionality
5. Update this documentation
