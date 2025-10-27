# Phase 2: Core Product MVP Implementation Blueprint

**Timeline**: Weeks 2-6 (4 weeks)  
**Status**: Ready to Build  
**Prerequisites**: Phase 1 Complete  
**Last Updated**: 2025-10-27

## Overview

Phase 2 delivers the core MVP features that enable lead management, deal pipeline, and investor CRM functionality. This blueprint provides detailed specifications for each component, including UI mockups, data flows, and test requirements.

## Vision Statement for Phase 2

Enable Elite real-estate investors to:
1. Capture and manage leads through intuitive UI
2. Track deals through visual pipeline
3. Manage investor relationships and portfolios
4. Automate workflows without coding
5. Gain insights through analytics

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  Pages/           Components/         Hooks/        Stores/  │
│  - LeadsPage      - LeadTable        - useLeads    - CRM    │
│  - LeadDetail     - LeadCard         - useOps      - UI     │
│  - OppsPage       - KanbanBoard      - useInvestors         │
│  - InvestorPage   - OpportunityCard  - useWorkflows         │
│  - WorkflowPage   - InvestorProfile                         │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Netlify Functions)             │
├─────────────────────────────────────────────────────────────┤
│  - lead-ingest-enhanced.js    (existing)                    │
│  - opportunity.js             (existing)                    │
│  - investor.js                (existing)                    │
│  - workflow-engine.js         (to create)                   │
│  - analytics.js               (to create)                   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    Database (Supabase PostgreSQL)            │
├─────────────────────────────────────────────────────────────┤
│  Tables: leads, opportunities, investors, activities,        │
│          workflows, workflow_executions, audit_log           │
└─────────────────────────────────────────────────────────────┘
```

## Component 1: Lead Management UI

### Priority: **HIGH** 🔥
### Timeline: Week 1-2 (10 days)
### Value: Immediate operational capability

### Features

#### 1.1 Lead List Page (`src/pages/LeadsPage.tsx`)

**Purpose**: Central hub for viewing and managing all leads

**UI Layout**:
```
┌────────────────────────────────────────────────────────────┐
│  📊 Leads Dashboard                    [+ New Lead]  [↓]   │
├────────────────────────────────────────────────────────────┤
│  Filters: [Status ▼] [Source ▼] [Date Range]  [🔍 Search] │
├────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐   │
│  │ Status │ Source    │ Email           │ Date │ Actions│   │
│  ├────────────────────────────────────────────────────┤   │
│  │ 🟢 New  │ Website  │ john@email.com  │ 10/27│ [⋯]    │   │
│  │ 🟡 Cont │ Referral │ jane@email.com  │ 10/26│ [⋯]    │   │
│  │ 🔵 Qual │ Paid Ads │ bob@email.com   │ 10/25│ [⋯]    │   │
│  └────────────────────────────────────────────────────┘   │
│  Showing 1-50 of 247        [<] [1] [2] [3] [4] [5] [>]   │
└────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Sortable columns (click header to sort)
- Status badges with colors:
  - 🟢 Green: New/Uncontacted
  - 🟡 Yellow: Contacted/In Progress
  - 🔵 Blue: Qualified
  - 🟣 Purple: Converted
  - ⚪ Gray: Unqualified/Lost
- Filters with multi-select
- Real-time search (debounced)
- Pagination (50 per page, configurable)
- Bulk actions (select multiple)
- Quick view modal
- Export to CSV

**Component Structure**:
```typescript
// src/pages/LeadsPage.tsx
import { useState, useEffect } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { LeadTable } from '@/components/crm/LeadTable';
import { LeadFilters } from '@/components/crm/LeadFilters';
import { Button } from '@/components/ui/button';

export function LeadsPage() {
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const { leads, loading, error, totalCount } = useLeads({ filters, page });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leads Dashboard</h1>
        <Button onClick={() => router.push('/leads/new')}>
          + New Lead
        </Button>
      </div>
      
      <LeadFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      <LeadTable 
        leads={leads}
        loading={loading}
        error={error}
        onRowClick={(lead) => router.push(`/leads/${lead.id}`)}
      />
      
      <Pagination 
        currentPage={page}
        totalPages={Math.ceil(totalCount / 50)}
        onPageChange={setPage}
      />
    </div>
  );
}
```

**Data Hook**:
```typescript
// src/hooks/useLeads.ts
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export function useLeads({ filters = {}, page = 1, perPage = 50 }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true);
        const supabase = createClient(
          import.meta.env.VITE_SUPABASE_URL,
          import.meta.env.VITE_SUPABASE_ANON_KEY
        );

        let query = supabase
          .from('leads')
          .select('*', { count: 'exact' });

        // Apply filters
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.source) {
          query = query.eq('source', filters.source);
        }
        if (filters.dateFrom) {
          query = query.gte('created_at', filters.dateFrom);
        }
        if (filters.dateTo) {
          query = query.lte('created_at', filters.dateTo);
        }
        if (filters.search) {
          query = query.or(
            `email.ilike.%${filters.search}%,` +
            `phone.ilike.%${filters.search}%,` +
            `address.ilike.%${filters.search}%`
          );
        }

        // Apply pagination
        const start = (page - 1) * perPage;
        query = query
          .range(start, start + perPage - 1)
          .order('created_at', { ascending: false });

        const { data, error: queryError, count } = await query;

        if (queryError) throw queryError;

        setLeads(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  }, [filters, page, perPage]);

  return { leads, loading, error, totalCount };
}
```

**Tests Required**:
```typescript
// src/pages/__tests__/LeadsPage.test.tsx
describe('LeadsPage', () => {
  it('renders lead list', () => {});
  it('applies filters correctly', () => {});
  it('handles pagination', () => {});
  it('performs search', () => {});
  it('opens lead detail on row click', () => {});
  it('handles loading state', () => {});
  it('handles error state', () => {});
  it('shows empty state when no leads', () => {});
});
```

---

#### 1.2 Lead Detail Page (`src/pages/LeadDetailPage.tsx`)

**Purpose**: View and edit complete lead information

**UI Layout**:
```
┌────────────────────────────────────────────────────────────┐
│  [← Back]  John Doe - New Lead              [Edit] [Convert]│
├────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌───────────────────────────┐   │
│  │ Contact Information │  │    Property Details        │   │
│  │                     │  │                            │   │
│  │ 📧 john@email.com   │  │ 📍 123 Main St            │   │
│  │ 📱 (555) 123-4567   │  │ 🏠 Single Family          │   │
│  │ 🆔 Lead-001         │  │ 💰 $500,000 (estimated)   │   │
│  │ 📅 Created 10/27    │  │ 📏 2000 sqft              │   │
│  │                     │  │ 🛏️  4 bed / 3 bath        │   │
│  └─────────────────────┘  └───────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Activity Timeline                                    │ │
│  │ ─────────────────────────────────────────────────── │ │
│  │ ● 10/27 10:30 AM - Lead created from website form   │ │
│  │ ● 10/27 10:32 AM - Email sent: Welcome message      │ │
│  │ ● 10/27 11:15 AM - Status changed: New → Contacted  │ │
│  │ ● 10/27 02:00 PM - Note added: "Called, left VM"    │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Notes & Comments                      [+ Add Note]   │ │
│  │ ─────────────────────────────────────────────────── │ │
│  │ 📝 Very interested in multi-family properties        │ │
│  │    - John Smith, 10/27 10:45 AM                     │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Tabbed interface (Overview, Activity, Documents, Tasks)
- Inline editing of fields
- Activity timeline with all interactions
- Add notes and comments
- File attachments
- Quick actions:
  - Send email
  - Send SMS
  - Schedule call
  - Convert to opportunity
  - Change status
- Related records (if converted to opportunity)

**Component Structure**:
```typescript
// src/pages/LeadDetailPage.tsx
import { useParams } from 'react-router';
import { useLead } from '@/hooks/useLead';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import { LeadActions } from '@/components/crm/LeadActions';

export function LeadDetailPage() {
  const { id } = useParams();
  const { lead, loading, error, updateLead } = useLead(id);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!lead) return <NotFound />;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Button variant="ghost" onClick={() => history.back()}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold">{lead.fullName}</h1>
          <StatusBadge status={lead.status} />
        </div>
        <LeadActions lead={lead} onUpdate={updateLead} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-2 gap-6">
            <ContactInfo lead={lead} onUpdate={updateLead} />
            <PropertyInfo property={lead.property} />
          </div>
          <NotesSection lead={lead} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityTimeline leadId={lead.id} />
        </TabsContent>

        {/* More tabs... */}
      </Tabs>
    </div>
  );
}
```

**Tests Required**:
```typescript
// src/pages/__tests__/LeadDetailPage.test.tsx
describe('LeadDetailPage', () => {
  it('displays lead information', () => {});
  it('allows inline editing', () => {});
  it('shows activity timeline', () => {});
  it('adds notes', () => {});
  it('changes status', () => {});
  it('converts to opportunity', () => {});
  it('handles missing lead', () => {});
});
```

---

## Component 2: Opportunity Pipeline

### Priority: **HIGH** 🔥
### Timeline: Week 3-4 (10 days)
### Value: Visual deal management

### Features

#### 2.1 Opportunity Kanban Board (`src/pages/OpportunitiesPage.tsx`)

**Purpose**: Visual pipeline for deal management

**UI Layout**:
```
┌──────────────────────────────────────────────────────────────────┐
│  💼 Deal Pipeline                                  [+ New Deal]    │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ 🆕 Lead  │  │ 💬 Qual  │  │ 📄 Prop  │  │ ✅ Close │        │
│  │   $2.5M  │  │   $4.2M  │  │   $1.8M  │  │   $900K  │        │
│  │ (5 deals)│  │ (8 deals)│  │ (3 deals)│  │ (2 deals)│        │
│  ├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤        │
│  │┌────────┐│  │┌────────┐│  │┌────────┐│  │┌────────┐│        │
│  ││Austin  ││  ││Dallas  ││  ││Houston ││  ││San Ant ││        │
│  ││$500K   ││  ││$750K   ││  ││$600K   ││  ││$450K   ││        │
│  ││John D. ││  ││Jane S. ││  ││Bob J.  ││  ││Amy L.  ││        │
│  │└────────┘│  │└────────┘│  │└────────┘│  │└────────┘│        │
│  │┌────────┐│  │┌────────┐│  │┌────────┐│  │┌────────┐│        │
│  ││Dallas  ││  ││Austin  ││  ││Dallas  ││  ││Austin  ││        │
│  ││$400K   ││  ││$900K   ││  ││$700K   ││  ││$450K   ││        │
│  │└────────┘│  │└────────┘│  │└────────┘│  │└────────┘│        │
│  │          │  │          │  │          │  │          │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└──────────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Drag-and-drop between stages
- Stage metrics (count, total value)
- Card shows key info (property, value, investor)
- Quick view modal on click
- Filters (investor, date range, value)
- Export pipeline snapshot
- Stage transition automation

**Stages**:
1. **Lead** - Initial contact
2. **Qualified** - Meets criteria
3. **Proposal** - Offer sent
4. **Negotiation** - Terms discussion
5. **Due Diligence** - Verification
6. **Closing** - Final steps
7. **Closed Won** - Deal complete
8. **Closed Lost** - Deal lost

**Component Structure**:
```typescript
// src/pages/OpportunitiesPage.tsx
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useOpportunities } from '@/hooks/useOpportunities';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { OpportunityCard } from '@/components/crm/OpportunityCard';

export function OpportunitiesPage() {
  const { opportunities, updateStage } = useOpportunities();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oppId = active.id;
    const newStage = over.id;

    await updateStage(oppId, newStage);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Deal Pipeline</h1>
        <Button onClick={() => router.push('/opportunities/new')}>
          + New Deal
        </Button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <KanbanBoard 
          opportunities={opportunities}
          stages={PIPELINE_STAGES}
        />
      </DndContext>
    </div>
  );
}
```

**Tests Required**:
```typescript
// src/pages/__tests__/OpportunitiesPage.test.tsx
describe('OpportunitiesPage', () => {
  it('renders pipeline stages', () => {});
  it('displays opportunities in correct stages', () => {});
  it('handles drag and drop', () => {});
  it('updates stage on drop', () => {});
  it('shows stage metrics', () => {});
  it('applies filters', () => {});
  it('opens detail on card click', () => {});
});
```

---

## Component 3: Investor Management

### Priority: **MEDIUM** 
### Timeline: Week 5 (5 days)
### Value: Relationship tracking

### Features

#### 3.1 Investor List & Profile

**Key Features**:
- Investor directory
- Portfolio tracking
- Investment history
- Communication log
- Preferences and interests
- Document storage

**Implementation**: Similar pattern to Lead Management

---

## Component 4: Workflow Automation UI

### Priority: **MEDIUM**
### Timeline: Week 6 (5 days)
### Value: No-code automation

### Features

#### 4.1 Workflow Builder (`src/pages/WorkflowsPage.tsx`)

**Purpose**: Visual workflow creation

**Key Features**:
- Trigger configuration (new lead, status change, etc.)
- Action templates (send email, update field, etc.)
- Condition logic (if/then/else)
- Test mode
- Activity monitoring
- Enable/disable workflows

---

## Component 5: Basic Analytics Dashboard

### Priority: **LOW** 
### Timeline: Week 6 (2-3 days)
### Value: Data insights

### Features

#### 5.1 Analytics Overview

**Metrics to Display**:
- Lead sources breakdown (pie chart)
- Conversion funnel (funnel chart)
- Pipeline value by stage (bar chart)
- Trends over time (line chart)
- Top performing sources
- Average time to close

**Implementation**:
```typescript
// src/pages/AnalyticsPage.tsx
import { useAnalytics } from '@/hooks/useAnalytics';
import { PieChart, BarChart, LineChart } from 'recharts';

export function AnalyticsPage() {
  const { metrics, loading } = useAnalytics();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-2 gap-6">
        <MetricCard 
          title="Total Leads"
          value={metrics.totalLeads}
          change="+12%"
        />
        <MetricCard 
          title="Pipeline Value"
          value={`$${metrics.pipelineValue}`}
          change="+8%"
        />
        {/* More metrics... */}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Lead Sources</h2>
        <PieChart data={metrics.sourceBreakdown} />
      </div>

      {/* More charts... */}
    </div>
  );
}
```

---

## Testing Strategy

### Unit Tests (per component)
- Component rendering
- User interactions
- Props handling
- State management
- Error handling

### Integration Tests
- API calls and responses
- Data flow between components
- State synchronization
- Error recovery

### E2E Tests (critical paths)
- Create new lead → view → edit → convert
- Drag opportunity through pipeline
- Create workflow → test → activate
- View analytics dashboard

### Test Coverage Target: >80%

---

## Deployment Strategy

### Week-by-Week Releases

**Week 1**: Lead List + Filters
- Deploy to staging
- User acceptance testing
- Fix issues

**Week 2**: Lead Detail + Activity Timeline
- Deploy to staging
- Integration testing
- Deploy to production (behind feature flag)

**Week 3**: Opportunity Kanban (Part 1)
- Deploy to staging
- Performance testing

**Week 4**: Opportunity Kanban (Part 2)
- Deploy to production

**Week 5**: Investor Management
- Deploy to staging
- User testing
- Deploy to production

**Week 6**: Workflows + Analytics
- Deploy to staging
- Final testing
- Deploy to production

---

## Success Criteria

### Technical
- All features deployed and working
- >80% test coverage
- Build time <5s maintained
- Page load time <2s
- Zero critical bugs

### Business
- Users can manage full lead lifecycle
- Pipeline visible and actionable
- Workflow automation functional
- Data drives decisions via analytics

### User Experience
- Intuitive navigation
- Fast, responsive UI
- Mobile-friendly
- Accessible (WCAG 2.1 AA)

---

## Resources

### UI Component Library
- Already using: Radix UI + Tailwind
- Additional: react-beautiful-dnd for drag-drop
- Charts: Recharts (already installed)

### State Management
- Local: useState, useReducer
- Global: Zustand (already installed)
- Server: React Query or SWR

### Forms
- React Hook Form (already installed)
- Zod validation (already installed)

---

## Next Steps

After this blueprint:
1. Review and approve plan
2. Start with Lead Management UI (highest priority)
3. Iterative development with weekly releases
4. Continuous user feedback and improvements

**Ready to begin implementation!** 🚀
