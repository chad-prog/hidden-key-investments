-- Hidden Key Investments - Database Schema
-- Complete schema for CRM, workflows, and analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Leads Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Source and status
  source TEXT NOT NULL CHECK (source IN (
    'website', 'referral', 'cold_outreach', 'event', 'partner', 'social_media', 'paid_ads', 'other'
  )),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'qualified', 'nurturing', 'converted', 'disqualified', 'lost'
  )),
  
  -- Contact information
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  preferred_contact TEXT DEFAULT 'email' CHECK (preferred_contact IN ('email', 'phone', 'sms', 'none')),
  do_not_contact BOOLEAN DEFAULT false,
  
  -- Property information
  property JSONB,
  
  -- Enrichment data
  enrichment_data JSONB,
  
  -- Scoring
  score NUMERIC(5,2) CHECK (score >= 0 AND score <= 100),
  score_reason TEXT,
  score_updated_at TIMESTAMPTZ,
  
  -- Assignment and organization
  assigned_to UUID,
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB,
  
  -- Tracking
  utm_params JSONB,
  raw_payload JSONB,
  correlation_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC NULLS LAST);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_leads_fulltext ON leads 
  USING GIN (to_tsvector('english', COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') || ' ' || COALESCE(email, '')));

-- ============================================================================
-- Opportunities Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  
  -- Deal details
  name TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN (
    'prospecting', 'qualification', 'proposal', 'negotiation', 'due_diligence', 'closing', 'won', 'lost'
  )),
  deal_type TEXT NOT NULL CHECK (deal_type IN (
    'acquisition', 'syndication', 'joint_venture', 'equity_investment', 'debt_investment', 'other'
  )),
  
  -- Financial
  estimated_value NUMERIC(15,2) NOT NULL CHECK (estimated_value > 0),
  expected_return NUMERIC(5,2),
  expected_close_date DATE,
  actual_close_date DATE,
  
  -- Probability and scoring
  probability NUMERIC(5,2) CHECK (probability >= 0 AND probability <= 100),
  risk_score NUMERIC(5,2) CHECK (risk_score >= 0 AND risk_score <= 100),
  
  -- Relationships
  primary_investor UUID,
  secondary_investors UUID[] DEFAULT '{}',
  assigned_to UUID,
  
  -- Documents and legal
  documents JSONB DEFAULT '[]',
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_lead_id ON opportunities(lead_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_deal_type ON opportunities(deal_type);
CREATE INDEX IF NOT EXISTS idx_opportunities_assigned_to ON opportunities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_expected_close_date ON opportunities(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_estimated_value ON opportunities(estimated_value DESC);

-- ============================================================================
-- Investors Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic information
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  type TEXT NOT NULL CHECK (type IN (
    'accredited', 'institutional', 'high_net_worth', 'family_office', 'individual', 'other'
  )),
  status TEXT NOT NULL CHECK (status IN (
    'prospect', 'active', 'inactive', 'blacklisted'
  )),
  
  -- Contact
  email TEXT,
  phone TEXT,
  preferred_contact TEXT DEFAULT 'email',
  do_not_contact BOOLEAN DEFAULT false,
  address JSONB,
  
  -- Investment profile
  investment_profile JSONB,
  
  -- Accreditation
  accreditation JSONB,
  
  -- Portfolio metrics
  total_invested NUMERIC(15,2) DEFAULT 0,
  active_deals INTEGER DEFAULT 0,
  completed_deals INTEGER DEFAULT 0,
  average_return NUMERIC(5,2),
  
  -- Relationships
  referred_by UUID,
  account_manager UUID,
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  custom_fields JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_investors_email ON investors(email);
CREATE INDEX IF NOT EXISTS idx_investors_phone ON investors(phone);
CREATE INDEX IF NOT EXISTS idx_investors_type ON investors(type);
CREATE INDEX IF NOT EXISTS idx_investors_status ON investors(status);
CREATE INDEX IF NOT EXISTS idx_investors_account_manager ON investors(account_manager);
CREATE INDEX IF NOT EXISTS idx_investors_created_at ON investors(created_at DESC);

-- ============================================================================
-- Activities Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN (
    'call', 'email', 'meeting', 'note', 'task', 'document_sent', 'document_signed', 
    'status_change', 'stage_change', 'automated_action', 'other'
  )),
  
  -- Relationships
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
  
  -- Activity details
  subject TEXT NOT NULL,
  description TEXT,
  outcome TEXT,
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date DATE,
  
  -- Assignment
  created_by UUID NOT NULL,
  assigned_to UUID,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_opportunity_id ON activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_activities_investor_id ON activities(investor_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_by ON activities(created_by);
CREATE INDEX IF NOT EXISTS idx_activities_assigned_to ON activities(assigned_to);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_due_date ON activities(due_date);

-- ============================================================================
-- Workflows Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  
  -- Timestamps and stats
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflows_enabled ON workflows(enabled);
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_workflows_priority ON workflows(priority DESC);

-- ============================================================================
-- Workflow Executions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  
  -- Execution context
  trigger JSONB NOT NULL,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  
  -- Results
  action_results JSONB DEFAULT '[]',
  error TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at DESC);

-- ============================================================================
-- Analytics Events Table (for ML and reporting)
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event details
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  
  -- Relationships
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  investor_id UUID REFERENCES investors(id) ON DELETE SET NULL,
  user_id UUID,
  
  -- Event data
  properties JSONB,
  
  -- Context
  session_id TEXT,
  correlation_id TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_lead_id ON analytics_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- ============================================================================
-- Triggers for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

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
-- Views for Common Queries
-- ============================================================================

-- Active leads with recent activity
CREATE OR REPLACE VIEW v_active_leads AS
SELECT 
  l.*,
  COUNT(DISTINCT a.id) as activity_count,
  MAX(a.created_at) as last_activity_at
FROM leads l
LEFT JOIN activities a ON l.id = a.lead_id
WHERE l.status NOT IN ('converted', 'disqualified', 'lost')
GROUP BY l.id;

-- Pipeline summary
CREATE OR REPLACE VIEW v_pipeline_summary AS
SELECT 
  stage,
  COUNT(*) as deal_count,
  SUM(estimated_value) as total_value,
  AVG(probability) as avg_probability
FROM opportunities
WHERE stage NOT IN ('won', 'lost')
GROUP BY stage
ORDER BY 
  CASE stage
    WHEN 'prospecting' THEN 1
    WHEN 'qualification' THEN 2
    WHEN 'proposal' THEN 3
    WHEN 'negotiation' THEN 4
    WHEN 'due_diligence' THEN 5
    WHEN 'closing' THEN 6
  END;

-- Investor portfolio summary
CREATE OR REPLACE VIEW v_investor_portfolios AS
SELECT 
  i.*,
  COUNT(DISTINCT o.id) FILTER (WHERE o.stage NOT IN ('won', 'lost')) as active_opportunities,
  SUM(o.estimated_value) FILTER (WHERE o.stage NOT IN ('won', 'lost')) as pipeline_value
FROM investors i
LEFT JOIN opportunities o ON i.id = o.primary_investor OR i.id = ANY(o.secondary_investors)
WHERE i.status = 'active'
GROUP BY i.id;

-- ============================================================================
-- Row Level Security (RLS) Policies - Optional
-- ============================================================================

-- Enable RLS on tables (commented out by default)
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Example policy: users can only see their assigned leads
-- CREATE POLICY leads_assigned_policy ON leads
--   FOR SELECT
--   USING (assigned_to = auth.uid());

-- ============================================================================
-- Sample Data (for testing)
-- ============================================================================

-- Uncomment to insert sample data
/*
INSERT INTO leads (source, status, first_name, last_name, email, phone, property, score)
VALUES 
  ('website', 'new', 'John', 'Doe', 'john.doe@example.com', '+1234567890', 
   '{"address": "123 Main St", "city": "Austin", "state": "TX", "zip": "78701"}'::jsonb, 75),
  ('referral', 'contacted', 'Jane', 'Smith', 'jane.smith@example.com', '+1987654321', 
   '{"address": "456 Oak Ave", "city": "Houston", "state": "TX", "zip": "77001"}'::jsonb, 85);
*/
