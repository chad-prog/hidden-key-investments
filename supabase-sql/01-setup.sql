-- ============================================================================
-- Hidden Key Investments - Database Setup Script
-- ============================================================================
-- This script sets up the complete database schema for the CRM platform
-- Run this in your Supabase SQL editor or via psql
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- LEADS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  
  -- Contact Information
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  
  -- Property Information
  property JSONB,
  
  -- Enrichment Data
  enrichment_data JSONB DEFAULT '{}',
  
  -- Scoring
  score NUMERIC,
  score_reason TEXT,
  
  -- Assignment
  assigned_to UUID,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  utm_params JSONB,
  raw_payload JSONB,
  
  -- Tracking
  correlation_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- Indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_leads_tags ON leads USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_leads_correlation_id ON leads(correlation_id);

-- Full-text search on leads
CREATE INDEX IF NOT EXISTS idx_leads_search ON leads USING GIN(
  to_tsvector('english', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' || 
    COALESCE(email, '')
  )
);

-- ============================================================================
-- OPPORTUNITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  
  -- Basic Info
  name TEXT NOT NULL,
  stage TEXT NOT NULL,
  deal_type TEXT NOT NULL,
  
  -- Financial
  estimated_value NUMERIC NOT NULL,
  expected_return NUMERIC,
  expected_close_date DATE,
  actual_close_date DATE,
  
  -- Risk & Probability
  probability NUMERIC CHECK (probability >= 0 AND probability <= 1),
  risk_score NUMERIC,
  
  -- Property Info
  property JSONB,
  
  -- Investors
  primary_investor UUID,
  secondary_investors UUID[],
  
  -- Assignment
  assigned_to UUID,
  
  -- Documents
  documents JSONB DEFAULT '[]',
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Indexes for opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_lead_id ON opportunities(lead_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_deal_type ON opportunities(deal_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_close_date ON opportunities(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_value ON opportunities(estimated_value DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_tags ON opportunities USING GIN(tags);

-- ============================================================================
-- INVESTORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  
  -- Contact & Address
  contact JSONB,
  address JSONB,
  
  -- Investment Profile
  investment_profile JSONB,
  accreditation JSONB,
  
  -- Performance Metrics
  total_invested NUMERIC DEFAULT 0,
  active_deal_count INTEGER DEFAULT 0,
  completed_deal_count INTEGER DEFAULT 0,
  average_return NUMERIC,
  
  -- Relationships
  referred_by UUID,
  account_manager UUID,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ
);

-- Indexes for investors
CREATE INDEX IF NOT EXISTS idx_investors_email ON investors((contact->>'email'));
CREATE INDEX IF NOT EXISTS idx_investors_type ON investors(type);
CREATE INDEX IF NOT EXISTS idx_investors_status ON investors(status);
CREATE INDEX IF NOT EXISTS idx_investors_created_at ON investors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_investors_tags ON investors USING GIN(tags);

-- Full-text search on investors
CREATE INDEX IF NOT EXISTS idx_investors_search ON investors USING GIN(
  to_tsvector('english', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' || 
    COALESCE(company_name, '') || ' ' ||
    COALESCE(contact->>'email', '')
  )
);

-- ============================================================================
-- ACTIVITIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Type & Content
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  outcome TEXT,
  
  -- Related Entities
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date DATE,
  
  -- Assignment
  created_by UUID NOT NULL,
  assigned_to UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activities
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_opportunity_id ON activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_activities_investor_id ON activities(investor_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);
CREATE INDEX IF NOT EXISTS idx_activities_scheduled_at ON activities(scheduled_at);

-- ============================================================================
-- WORKFLOWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Configuration
  trigger JSONB NOT NULL,
  conditions JSONB DEFAULT '[]',
  actions JSONB NOT NULL,
  
  -- Settings
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  
  -- Metadata
  created_by UUID NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0
);

-- Indexes for workflows
CREATE INDEX IF NOT EXISTS idx_workflows_enabled ON workflows(enabled);
CREATE INDEX IF NOT EXISTS idx_workflows_priority ON workflows(priority DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at DESC);

-- ============================================================================
-- WORKFLOW EXECUTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  
  -- Execution Data
  trigger JSONB NOT NULL,
  status TEXT NOT NULL,
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Results
  action_results JSONB DEFAULT '[]',
  error TEXT,
  
  -- Retry
  retry_count INTEGER DEFAULT 0
);

-- Indexes for workflow executions
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at DESC);

-- ============================================================================
-- AUDIT LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- What happened
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  
  -- Who did it
  user_id UUID,
  
  -- When
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  
  -- Details
  changes JSONB,
  metadata JSONB DEFAULT '{}',
  
  -- Request tracking
  correlation_id TEXT,
  ip_address INET,
  user_agent TEXT
);

-- Indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_correlation_id ON audit_log(correlation_id);

-- ============================================================================
-- UPDATE TIMESTAMP TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON investors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Active leads view
CREATE OR REPLACE VIEW active_leads AS
SELECT 
  l.*,
  CONCAT(l.first_name, ' ', l.last_name) as full_name,
  (l.property->>'city') as city,
  (l.property->>'state') as state
FROM leads l
WHERE l.status NOT IN ('converted', 'lost', 'archived');

-- Open opportunities view
CREATE OR REPLACE VIEW open_opportunities AS
SELECT 
  o.*,
  l.email as lead_email,
  l.first_name as lead_first_name,
  l.last_name as lead_last_name
FROM opportunities o
LEFT JOIN leads l ON o.lead_id = l.id
WHERE o.stage NOT IN ('closed_won', 'closed_lost');

-- Active investors view
CREATE OR REPLACE VIEW active_investors AS
SELECT 
  i.*,
  (i.contact->>'email') as email,
  (i.contact->>'phone') as phone
FROM investors i
WHERE i.status = 'active';

-- ============================================================================
-- ROW LEVEL SECURITY (Optional - Enable if using Supabase Auth)
-- ============================================================================

-- Uncomment if you want to enable RLS
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Example policy (adjust based on your auth setup)
-- CREATE POLICY "Users can view their own leads" ON leads
--   FOR SELECT USING (auth.uid() = assigned_to);

-- ============================================================================
-- SEED DATA (Optional - for development)
-- ============================================================================

-- Insert sample workflow
INSERT INTO workflows (name, description, trigger, actions, created_by, enabled)
VALUES (
  'Welcome New Leads',
  'Send welcome email to new leads with valid email',
  '{"type": "lead_created"}',
  '[
    {
      "type": "send_email",
      "order": 0,
      "config": {
        "to": "{{contact.email}}",
        "subject": "Welcome to Hidden Key Investments",
        "template": "welcome_email"
      }
    },
    {
      "type": "add_tag",
      "order": 1,
      "config": {
        "tag": "new_lead"
      }
    }
  ]',
  '00000000-0000-0000-0000-000000000000',
  false -- Disabled by default, enable when ready
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE 'Tables created: leads, opportunities, investors, activities, workflows, workflow_executions, audit_log';
  RAISE NOTICE 'Views created: active_leads, open_opportunities, active_investors';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update environment variables with Supabase credentials';
  RAISE NOTICE '2. Test lead ingestion endpoint';
  RAISE NOTICE '3. Enable and configure workflows';
END $$;
