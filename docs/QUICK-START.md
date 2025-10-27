# Quick Start Guide - Get Building Your MVP Now!

## 🚀 You're Ready to Build!

Everything is set up and ready. Here's how to get started immediately.

## ⚡ 5-Minute Quick Start

### Step 1: Setup Your Environment (2 minutes)

```bash
# Clone and setup (if not already done)
git clone https://github.com/chad-prog/hidden-key-investments.git
cd hidden-key-investments

# Automated setup
bash scripts/setup-dev.sh

# Or manual setup
npm install
npm run build
npm test
```

### Step 2: Start Development (1 minute)

```bash
# Start the dev server
npm run dev

# Open browser to http://localhost:5173
```

### Step 3: Explore Demo Mode (2 minutes)

The app works perfectly without any configuration!

- ✅ Browse the UI
- ✅ Try lead capture forms
- ✅ View mock data
- ✅ Test workflows
- ✅ Check analytics

**No API keys needed for development!**

## 🎯 What to Build First

Based on your MVP roadmap, here are concrete next steps:

### Week 1: Lead Capture System

**Goal:** Capture leads from your website

**What to build:**
```typescript
// 1. Create a lead capture form component
import { LeadCreateSchema } from '@/lib/schemas/crm';

function LeadCaptureForm() {
  const handleSubmit = async (data) => {
    // Validate
    const validated = LeadCreateSchema.parse(data);
    
    // Submit to API
    const response = await fetch('/.netlify/functions/lead-ingest-enhanced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validated),
    });
    
    const result = await response.json();
    if (result.ok) {
      // Success! Lead created
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Files to use:**
- `src/lib/schemas/crm.ts` - Validation schemas
- `netlify/functions/lead-ingest-enhanced.js` - API endpoint
- `src/lib/testFixtures.ts` - Test data

**Test it:**
```bash
# Use mock data
import { createMockLead } from '@/lib/testFixtures';
const lead = createMockLead({ source: 'website' });
```

### Week 2: CRM Dashboard

**Goal:** Display and manage leads

**What to build:**
```typescript
// 1. Leads list component
function LeadsList() {
  const [leads, setLeads] = useState([]);
  
  useEffect(() => {
    // In demo mode, use mock data
    if (isDemoMode()) {
      const { leads } = createMockCRMDataset();
      setLeads(leads);
    } else {
      // Load from Supabase
      fetchLeads().then(setLeads);
    }
  }, []);
  
  return (
    <div>
      {leads.map(lead => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}
```

**Files to use:**
- `src/lib/testFixtures.ts` - Mock data
- `src/lib/envValidation.ts` - Check demo mode
- Existing components in `src/components/`

### Week 3: Workflow Automation

**Goal:** Automate lead follow-up

**What to build:**
```typescript
// 1. Create workflow
import { workflowEngine } from '@/lib/workflowEngine';

const welcomeWorkflow = {
  name: 'Welcome New Leads',
  trigger: { type: 'lead_created' },
  conditions: [
    { field: 'contact.email', operator: 'is_not_null', value: null }
  ],
  actions: [
    {
      type: 'send_email',
      config: {
        to: '{{contact.email}}',
        subject: 'Welcome!',
        template: 'welcome_email'
      }
    }
  ],
  enabled: true,
};

workflowEngine.registerWorkflow(welcomeWorkflow);

// 2. Trigger on lead creation
await workflowEngine.trigger('lead_created', newLead);
```

**Files to use:**
- `src/lib/workflowEngine.ts` - Engine
- `src/lib/testFixtures.ts` - Test workflows

### Week 4: Analytics Dashboard

**Goal:** Track key metrics

**What to build:**
```typescript
// 1. Metrics component
function MetricsDashboard() {
  const metrics = {
    totalLeads: leads.length,
    newToday: leads.filter(l => isToday(l.createdAt)).length,
    conversionRate: (opportunities.length / leads.length) * 100,
    avgScore: leads.reduce((sum, l) => sum + l.score, 0) / leads.length,
  };
  
  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard title="Total Leads" value={metrics.totalLeads} />
      <MetricCard title="New Today" value={metrics.newToday} />
      <MetricCard title="Conversion Rate" value={`${metrics.conversionRate}%`} />
      <MetricCard title="Avg Score" value={metrics.avgScore} />
    </div>
  );
}
```

**Use existing:**
- Recharts library (already installed)
- Mock data for development
- Real data when Supabase connected

## 🔌 Connecting Real Services

### Option 1: Keep Using Demo Mode (Recommended for Development)

**No configuration needed!** Everything works with mock data.

### Option 2: Connect Supabase (For Production)

```bash
# 1. Create Supabase project at https://supabase.com

# 2. Run database setup
psql "postgresql://postgres:[password]@[host]:5432/postgres" \
  -f supabase-sql/01-setup.sql

# 3. Add to .env
echo "VITE_SUPABASE_URL=https://your-project.supabase.co" >> .env
echo "VITE_SUPABASE_ANON_KEY=your_anon_key" >> .env

# 4. Restart dev server
npm run dev
```

### Option 3: Connect Email Service

```bash
# Add to .env
echo "SENDGRID_API_KEY=your_sendgrid_key" >> .env

# Or for Mailchimp
echo "MAILCHIMP_API_KEY=your_mailchimp_key" >> .env
```

## 📚 Key Files Reference

### For Building Features

| What You Need | File to Use |
|---------------|-------------|
| Form validation | `src/lib/schemas/crm.ts` |
| API calls | `netlify/functions/*.js` |
| Mock data | `src/lib/testFixtures.ts` |
| Workflows | `src/lib/workflowEngine.ts` |
| Feature flags | `src/lib/featureFlags.tsx` |
| Environment | `src/lib/envValidation.ts` |

### For Testing

| What to Test | How to Test |
|--------------|-------------|
| Components | `import { createMockLead } from '@/lib/testFixtures'` |
| API calls | `import { createMockAPIResponse } from '@/lib/testFixtures'` |
| Workflows | `import { createMockWorkflow } from '@/lib/testFixtures'` |
| Full dataset | `import { createMockCRMDataset } from '@/lib/testFixtures'` |

### For Documentation

| Topic | Document |
|-------|----------|
| Full capabilities | `docs/CAPABILITIES.md` |
| Environment setup | `docs/ENVIRONMENT-VARIABLES.md` |
| Architecture | `docs/ARCHITECTURE.md` |
| MVP features | `docs/MVP-IMPLEMENTATION.md` |
| Monitoring | `docs/OBSERVABILITY-GUIDE.md` |
| Staging | `docs/STAGING-SETUP.md` |

## 🧪 Testing Your Changes

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test
npm test -- src/lib/__tests__/testFixtures.test.ts

# Build for production
npm run build

# Lint code
npm run lint

# Auto-fix lint issues
npm run lint:fix
```

## 🚢 Deploying to Staging

```bash
# 1. Push to staging branch
git checkout -b staging
git push origin staging

# 2. Netlify will automatically deploy
# 3. Check deploy at: https://staging--your-site.netlify.app
```

See `docs/STAGING-SETUP.md` for full guide.

## 💡 Pro Tips

### 1. Use Mock Data While Developing

```typescript
import { createMockCRMDataset } from '@/lib/testFixtures';

// Get full dataset instantly
const { leads, opportunities, investors, activities } = createMockCRMDataset();
```

### 2. Check Demo Mode

```typescript
import { isDemoMode } from '@/lib/envValidation';

if (isDemoMode()) {
  // Use mock data
} else {
  // Use real API
}
```

### 3. Feature Flags for Gradual Rollout

```typescript
import { featureFlags } from '@/lib/featureFlags';

if (featureFlags.isEnabled('mlScoring')) {
  // Show ML features
}
```

### 4. Structured Logging

```typescript
import { logger } from '@/lib/observability';

logger.info('Lead created', {
  leadId: lead.id,
  source: lead.source,
  correlationId: request.id,
});
```

## 🎯 Your MVP Roadmap

### ✅ Phase 1: Foundation (COMPLETE)
- [x] Infrastructure setup
- [x] Testing framework
- [x] Database schema
- [x] Documentation
- [x] Dev tools

### 🔄 Phase 2: Core Features (Weeks 1-4)
- [ ] Lead capture forms
- [ ] CRM dashboard
- [ ] Workflow automation
- [ ] Analytics

### 📅 Phase 3: Integration (Weeks 5-8)
- [ ] Email/SMS
- [ ] Enrichment
- [ ] Document management
- [ ] Investor portal

### 🚀 Phase 4: Advanced (Weeks 9-16)
- [ ] ML scoring
- [ ] AI orchestration
- [ ] Advanced analytics
- [ ] Mobile app

## 🆘 Need Help?

### Common Issues

**Build fails:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Tests fail:**
```bash
# Check Node version (need 22+)
node --version

# Reinstall dependencies
npm ci
npm test
```

**Environment issues:**
```bash
# Validate environment
npm run dev
# Check console for validation warnings
```

### Getting Support

1. **Check documentation:** Start with `docs/CAPABILITIES.md`
2. **Review examples:** Look at test files for usage examples
3. **Use demo mode:** Everything works without configuration
4. **Check logs:** Console shows helpful validation messages

## 🎉 You're All Set!

Everything is ready. Just pick a feature from Week 1-4 above and start building!

**Remember:** 
- ✅ No API keys needed for development
- ✅ Full test suite available
- ✅ Mock data ready to use
- ✅ All documentation complete

**Now go build something amazing! 🚀**
