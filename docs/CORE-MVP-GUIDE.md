# Core MVP Implementation Guide - Weeks 2-6

**Phase**: Core Product MVP  
**Duration**: 4-6 weeks  
**Status**: Ready to Start  
**Prerequisites**: ✅ Infrastructure Stabilized

## Overview

This guide provides step-by-step instructions for implementing the Core MVP features as outlined in the High-Level Enterprise Vision. This phase transforms the platform from infrastructure to a working CRM with lead capture, workflow automation, and investor management.

## Goals

Build a functional CRM platform with:
1. ✅ Lead capture API (Already implemented)
2. 🎯 Lead management UI
3. 🎯 Opportunity pipeline (Kanban board)
4. 🎯 Investor management interface
5. 🎯 Workflow automation UI
6. 🎯 Email/SMS integration

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Leads   │  │Opportun. │  │Investors │             │
│  │   List   │  │  Kanban  │  │   List   │             │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘             │
└───────┼─────────────┼─────────────┼───────────────────┘
        │             │             │
┌───────▼─────────────▼─────────────▼───────────────────┐
│              Netlify Functions API                      │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ lead-ingest  │  │ opportunity  │  │  investor   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼──────────────────┼──────────────────┼────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼────────┐
│              Supabase PostgreSQL                        │
│  ┌──────┐  ┌──────────────┐  ┌──────────┐            │
│  │Leads │  │Opportunities │  │ Investors│            │
│  └──────┘  └──────────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────┘
```

## Week 3: Lead Management UI

### Day 1-2: Lead List Page

**File**: `src/pages/LeadsPage.tsx`

```typescript
import React, { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { LeadTable } from '@/components/crm/LeadTable';
import { LeadFilters } from '@/components/crm/LeadFilters';
import { Button } from '@/components/ui/button';

export function LeadsPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    dateRange: 'all'
  });

  const { leads, loading, error, refetch } = useLeads(filters);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <Button onClick={() => navigate('/leads/new')}>
          Add Lead
        </Button>
      </div>

      <LeadFilters filters={filters} onChange={setFilters} />
      
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      {leads && <LeadTable leads={leads} onRefresh={refetch} />}
    </div>
  );
}
```

**Components to Build**:
1. `LeadTable.tsx` - Sortable table with actions
2. `LeadFilters.tsx` - Filter controls
3. `LeadCard.tsx` - Card view (optional)

**Features**:
- ✅ Display all leads from database
- ✅ Sort by: date, status, source, score
- ✅ Filter by: status, source, date range
- ✅ Search by: email, phone, name, address
- ✅ Pagination (50 per page)
- ✅ Quick actions: view, edit, convert to opportunity
- ✅ Bulk actions: delete, export, assign

**API Hook**: `src/hooks/useLeads.ts`

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useLeads(filters = {}) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.source && filters.source !== 'all') {
        query = query.eq('source', filters.source);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  return { leads, loading, error, refetch: fetchLeads };
}
```

**Tests**: `src/pages/__tests__/LeadsPage.test.tsx`

### Day 3-4: Lead Detail Page

**File**: `src/pages/LeadDetailPage.tsx`

**Components**:
1. `LeadInfo.tsx` - Display lead information
2. `ActivityTimeline.tsx` - Show activity history
3. `LeadActions.tsx` - Action buttons (edit, convert, delete)
4. `AddNoteForm.tsx` - Add notes to lead
5. `AddTaskForm.tsx` - Create tasks for lead

**Features**:
- ✅ Display complete lead information
- ✅ Edit lead details inline
- ✅ Activity timeline with all interactions
- ✅ Convert to opportunity button
- ✅ Send email/SMS actions
- ✅ Add notes and tasks
- ✅ Status workflow controls
- ✅ Enrichment data display

**Route**: `/leads/:id`

### Day 5: Testing & Polish

- Write unit tests for components
- Add integration tests
- Test mobile responsiveness
- Fix bugs and refine UX

## Week 4: Opportunity Pipeline

### Day 1-2: Kanban Board

**File**: `src/pages/OpportunitiesPage.tsx`

**Library**: Use `@dnd-kit/core` for drag-and-drop

```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { KanbanColumn } from '@/components/crm/KanbanColumn';
import { OpportunityCard } from '@/components/crm/OpportunityCard';

const STAGES = [
  'prospect',
  'qualified', 
  'proposal',
  'negotiation',
  'closed-won',
  'closed-lost'
];

export function OpportunitiesPage() {
  const { opportunities, updateStage } = useOpportunities();

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      updateStage(active.id, over.id);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div className="flex gap-4 overflow-x-auto">
        {STAGES.map(stage => (
          <KanbanColumn
            key={stage}
            stage={stage}
            opportunities={opportunities.filter(o => o.stage === stage)}
          />
        ))}
      </div>
    </DndContext>
  );
}
```

**Features**:
- ✅ Drag-and-drop between stages
- ✅ Stage metrics (count, total value)
- ✅ Filter by investor, date range
- ✅ Quick view modal
- ✅ Stage automation triggers
- ✅ Deal value summaries

**Install**: `npm install @dnd-kit/core @dnd-kit/sortable`

### Day 3-4: Opportunity Detail

**File**: `src/pages/OpportunityDetailPage.tsx`

**Features**:
- Complete opportunity information
- Financial details and projections
- Associated documents
- Activity timeline
- Stage transition controls
- Investor assignment

### Day 5: Testing & Workflow Integration

- Test drag-and-drop functionality
- Ensure workflow triggers fire on stage changes
- Test mobile responsiveness
- Performance optimization

## Week 5: Investor Management

### Day 1-3: Investor List & Detail

**Files**:
- `src/pages/InvestorsPage.tsx`
- `src/pages/InvestorDetailPage.tsx`

**Components**:
1. `InvestorTable.tsx` - List view
2. `InvestorCard.tsx` - Card view
3. `InvestorProfile.tsx` - Detailed profile
4. `InvestorPortfolio.tsx` - Investment history
5. `InvestorDocuments.tsx` - Document management

**Features**:
- ✅ List all investors with filtering
- ✅ Accreditation status indicators
- ✅ Portfolio tracking
- ✅ Communication history
- ✅ Document storage links
- ✅ Interest preferences
- ✅ Risk tolerance indicators

### Day 4-5: Investor-Opportunity Matching

**Component**: `InvestorMatchSuggestions.tsx`

```typescript
export function InvestorMatchSuggestions({ opportunityId }) {
  const { suggestions } = useInvestorMatching(opportunityId);

  return (
    <div className="space-y-4">
      <h3>Suggested Investors</h3>
      {suggestions.map(investor => (
        <InvestorMatchCard
          key={investor.id}
          investor={investor}
          matchScore={investor.matchScore}
          reasons={investor.matchReasons}
        />
      ))}
    </div>
  );
}
```

**Matching Logic** (simple version):
- Accreditation requirements
- Investment amount range
- Property type preferences
- Geographic preferences
- Past investment history

## Week 6: Workflow Automation UI

### Day 1-3: Workflow Builder

**File**: `src/pages/WorkflowsPage.tsx`

**Components**:
1. `WorkflowList.tsx` - List all workflows
2. `WorkflowBuilder.tsx` - Visual workflow editor
3. `TriggerSelector.tsx` - Choose trigger type
4. `ActionBuilder.tsx` - Configure actions
5. `ConditionBuilder.tsx` - Set conditions

**Features**:
- ✅ Visual workflow builder
- ✅ Trigger configuration
- ✅ Action templates (email, SMS, webhook)
- ✅ Condition logic builder
- ✅ Test mode
- ✅ Activity monitoring
- ✅ Enable/disable workflows

**Example Workflow Templates**:

```typescript
const WORKFLOW_TEMPLATES = [
  {
    name: "Welcome Email for New Leads",
    trigger: { type: "lead_created" },
    actions: [
      { type: "send_email", config: { template: "welcome" } }
    ]
  },
  {
    name: "High Score Lead Alert",
    trigger: { type: "lead_score_changed" },
    conditions: [
      { field: "score", operator: "greater_than", value: 80 }
    ],
    actions: [
      { type: "send_email", config: { to: "sales@company.com" } },
      { type: "add_tag", config: { tag: "hot_lead" } }
    ]
  }
];
```

### Day 4: Email/SMS Integration

**Service Integration**: `src/lib/communications.ts`

```typescript
import { SendGrid } from '@sendgrid/mail';
import { Twilio } from 'twilio';

export class CommunicationService {
  constructor() {
    this.sendgrid = new SendGrid(process.env.SENDGRID_API_KEY);
    this.twilio = new Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendEmail({ to, subject, template, data }) {
    // Implementation
  }

  async sendSMS({ to, message }) {
    // Implementation
  }
}
```

**Environment Variables**:
```bash
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_FROM_NAME=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Day 5: Testing & Documentation

- Test all workflow types
- Test email/SMS sending
- Document workflow creation process
- Create user guide

## Integration Checklist

### Frontend Routes

```typescript
// src/App.tsx
const routes = [
  { path: '/leads', component: LeadsPage },
  { path: '/leads/:id', component: LeadDetailPage },
  { path: '/opportunities', component: OpportunitiesPage },
  { path: '/opportunities/:id', component: OpportunityDetailPage },
  { path: '/investors', component: InvestorsPage },
  { path: '/investors/:id', component: InvestorDetailPage },
  { path: '/workflows', component: WorkflowsPage },
  { path: '/workflows/:id', component: WorkflowDetailPage }
];
```

### Navigation Menu

```typescript
const menuItems = [
  { name: 'Dashboard', path: '/', icon: HomeIcon },
  { name: 'Leads', path: '/leads', icon: UsersIcon },
  { name: 'Opportunities', path: '/opportunities', icon: BriefcaseIcon },
  { name: 'Investors', path: '/investors', icon: WalletIcon },
  { name: 'Workflows', path: '/workflows', icon: ZapIcon },
  { name: 'Analytics', path: '/analytics', icon: ChartBarIcon }
];
```

## Testing Strategy

### Unit Tests
- Component rendering
- User interactions
- State management
- Data transformations

### Integration Tests
- API integration
- Database operations
- Workflow execution
- Email/SMS sending

### E2E Tests (Optional)
- Complete user flows
- Lead capture → Convert → Close
- Workflow creation and execution

### Test Coverage Goals
- Components: 80%
- Hooks: 80%
- Utils: 90%
- Overall: 70%

## Performance Optimization

### Code Splitting
```typescript
const LeadsPage = lazy(() => import('./pages/LeadsPage'));
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage'));
```

### Data Fetching
- Use React Query or SWR for caching
- Implement pagination
- Add loading states
- Error boundaries

### Bundle Size
- Target: < 500KB gzipped
- Use bundle analyzer
- Lazy load heavy components
- Optimize images

## Deployment Strategy

### Week 3 Deployment
- Deploy lead management UI to staging
- Test with real data
- Get user feedback
- Fix bugs

### Week 4 Deployment
- Deploy opportunity pipeline to staging
- Test drag-and-drop thoroughly
- Performance testing
- Deploy to production

### Week 5 Deployment
- Deploy investor management to staging
- Test with sample data
- User acceptance testing
- Deploy to production

### Week 6 Deployment
- Deploy workflow automation to staging
- Test all workflow types
- Verify email/SMS sending
- Production deployment
- User training

## Success Metrics

### Technical Metrics
- [ ] Page load time < 2 seconds
- [ ] First contentful paint < 1 second
- [ ] Time to interactive < 3 seconds
- [ ] Test coverage > 70%
- [ ] Zero critical bugs

### Business Metrics
- [ ] 100 leads processed per month
- [ ] Average time to convert lead < 7 days
- [ ] User satisfaction > 4/5 stars
- [ ] System uptime > 99.5%
- [ ] Workflow automation reducing manual work by 50%

## Risk Mitigation

### Technical Risks
- **Database Performance**: Add indexes, optimize queries
- **Real-time Updates**: Use Supabase real-time subscriptions
- **File Uploads**: Implement with Supabase Storage
- **Email Deliverability**: Monitor bounce rates, use authenticated domains

### User Experience Risks
- **Complex UI**: Simplify, add tooltips, user guides
- **Slow Load Times**: Implement skeleton loading states
- **Mobile Usability**: Test thoroughly on mobile devices

## Support & Resources

### Documentation
- Component library: Radix UI + Tailwind
- State management: React hooks + Context
- Forms: React Hook Form + Zod
- API client: Custom hooks + fetch

### External Services
- Database: Supabase
- Email: SendGrid
- SMS: Twilio
- Monitoring: Sentry (optional)

### Team Resources
- Frontend developer: Full-time
- Backend developer: Part-time
- Designer: Part-time
- QA tester: Part-time

## Next Steps After Week 6

After completing Core MVP, proceed to:
1. **Data Enrichment** (Weeks 7-10)
   - Property data integration
   - Email/phone validation
   - Background checks

2. **ML & Analytics** (Weeks 11-16)
   - Lead scoring models
   - Deal probability prediction
   - Investor matching algorithms

3. **Advanced Features** (Weeks 17-20)
   - Document generation
   - E-signature integration
   - Advanced reporting

---

**Document Status**: Active  
**Last Updated**: 2025-10-27  
**Owner**: Product Team  
**Review Schedule**: Weekly during implementation
