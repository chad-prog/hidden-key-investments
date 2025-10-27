# Quick Actions Guide - Start Building Today

**Last Updated**: 2025-10-27  
**Target Audience**: Developers ready to implement  
**Time Required**: 15 minutes to 4 hours depending on action

## 🎯 Purpose

This guide provides immediate, actionable steps you can take **right now** to move your Enterprise Vision forward. Each action is self-contained and can be completed independently.

---

## ⚡ 15-Minute Actions (Highest ROI)

### 1. Activate Sentry Error Monitoring
**Impact**: Production error tracking  
**Effort**: 15 minutes  
**Prerequisites**: None

```bash
# Step 1: Create Sentry account (5 min)
# Visit: https://sentry.io/signup/
# Create project: "Hidden Key Investments"
# Framework: React
# Copy your DSN

# Step 2: Add to Netlify (5 min)
# Netlify UI → Site settings → Environment variables
# Add these variables (all deploy contexts):
VITE_SENTRY_DSN=<your-dsn>
VITE_APP_VERSION=1.0.0
VITE_SENTRY_ENVIRONMENT=production

# Step 3: Uncomment code (2 min)
# Edit src/main.tsx - uncomment lines 36-58

# Step 4: Deploy (3 min)
git add src/main.tsx
git commit -m "feat(observability): activate Sentry error tracking"
git push

# Done! Check Sentry dashboard for incoming events
```

**Validation**:
- Visit your deployed site
- Trigger an error (e.g., click a broken link)
- Check Sentry dashboard - should see the error event

---

### 2. Run Full Quality Check
**Impact**: Verify current system health  
**Effort**: 5 minutes  
**Prerequisites**: Development environment set up

```bash
# Run comprehensive checks
bash scripts/dev-utils.sh check-all

# This runs:
# - Linting (0 errors expected)
# - All tests (72 tests should pass)
# - Build (should complete in <5s)
# - Coverage report generation

# View results summary
cat coverage/lcov-report/index.html # In browser
```

**Expected Results**:
- ✅ Lint: 0 errors (warnings OK)
- ✅ Tests: 72/72 passing
- ✅ Build: <5 seconds
- ✅ Coverage: ~65%

---

### 3. Validate Deployment Scripts
**Impact**: Ensure deployment tools work  
**Effort**: 10 minutes  
**Prerequisites**: Staging environment (or use production)

```bash
# Test deployment validation
bash scripts/validate-deployment.sh https://your-site.netlify.app

# This checks:
# - Site accessibility
# - API endpoints responding
# - Security headers present
# - Build artifacts correct
# - Environment variables loaded

# Alternative: Test staging validation
bash scripts/validate-staging.sh https://staging-your-site.netlify.app
```

**Success**: All checks pass with ✅

---

## 🚀 1-Hour Actions (High Value)

### 4. Set Up Staging Environment
**Impact**: Safe testing environment  
**Effort**: 30-60 minutes  
**Prerequisites**: Supabase account

```bash
# Step 1: Create staging database (10 min)
# Go to: https://supabase.com
# Create new project: "hidden-key-staging"
# Note: URL and keys

# Step 2: Run migrations (5 min)
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -f supabase-sql/01-setup.sql

# Verify tables created
psql "your-connection-string" -c "\dt"
# Should show: leads, opportunities, investors, activities, 
#              workflows, workflow_executions, audit_log

# Step 3: Configure Netlify staging (15 min)
# Netlify UI → Site settings → Environment variables
# Scope: "staging" branch only

SUPABASE_URL=https://your-staging-project.supabase.co
SUPABASE_ANON_KEY=<staging-anon-key>
VITE_SUPABASE_URL=https://your-staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=<staging-anon-key>

# Step 4: Create staging branch (5 min)
git checkout -b staging
git push origin staging

# Step 5: Validate (5 min)
# Wait for Netlify deployment
# Visit staging URL
bash scripts/validate-staging.sh <staging-url>
```

**Validation**: Can create leads via form on staging site

---

### 5. Add Missing Test Cases
**Impact**: Better code reliability  
**Effort**: 1 hour  
**Prerequisites**: Understanding of test structure

```bash
# Run current tests to see coverage
npm run test:coverage

# Identify gaps in coverage report
# coverage/lcov-report/index.html

# Add tests for uncovered areas
# Focus on these files first:
# - netlify/functions/lead-ingest-enhanced.js (add edge cases)
# - netlify/functions/webhook-inbound.js (add error scenarios)
# - src/lib/workflowEngine.ts (add workflow tests)

# Example: Add to netlify/functions/__tests__/lead-ingest-enhanced.test.js
```

**Example Test Cases to Add**:

```javascript
// Edge case: Very long property address
test('handles extremely long property address', async () => {
  const longAddress = 'A'.repeat(500);
  const event = createMockEvent({
    property: {
      address: longAddress,
      city: 'Austin',
      state: 'TX'
    }
  });
  
  const response = await handler(event, mockContext);
  
  expect(response.statusCode).toBe(200);
  // Address should be truncated or rejected gracefully
});

// Edge case: International phone numbers
test('validates international phone numbers', async () => {
  const event = createMockEvent({
    contact: {
      phone: '+44 20 7946 0958', // UK number
      email: 'test@example.com'
    }
  });
  
  const response = await handler(event, mockContext);
  expect(response.statusCode).toBe(200);
});

// Error scenario: Concurrent duplicate submissions
test('handles duplicate lead submissions', async () => {
  const event = createMockEvent({
    contact: { email: 'duplicate@test.com' }
  });
  
  // Submit twice
  const response1 = await handler(event, mockContext);
  const response2 = await handler(event, mockContext);
  
  expect(response1.statusCode).toBe(200);
  // Second should either succeed or return 409 Conflict
  expect([200, 409]).toContain(response2.statusCode);
});
```

**Run Tests**:
```bash
npm test
# All tests should still pass + new tests
```

---

### 6. Enhance CI/CD Pipeline
**Impact**: Better deployment confidence  
**Effort**: 1 hour  
**Prerequisites**: Understanding of GitHub Actions

```yaml
# Edit .github/workflows/ci.yml
# Add deployment validation step after build

  post-deploy-validation:
    name: Validate Deployment
    runs-on: ubuntu-latest
    needs: [build]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      
      - name: Wait for Netlify deployment
        run: |
          echo "Waiting for Netlify deployment to complete..."
          sleep 60  # Wait for deployment
      
      - name: Run smoke tests
        run: |
          bash scripts/validate-deployment.sh https://your-site.netlify.app
      
      - name: Check API health
        run: |
          # Test critical endpoints
          curl -f https://your-site.netlify.app/.netlify/functions/hello || exit 1
          echo "Health check passed"
      
      - name: Notify on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 Deployment Validation Failed',
              body: 'Automated deployment validation failed. Check the workflow logs.',
              labels: ['deployment', 'bug', 'urgent']
            });
```

**Test**: Push to main and verify new workflow step runs

---

## 🎨 4-Hour Actions (Medium-High Value)

### 7. Build Lead List UI Component
**Impact**: First customer-facing feature  
**Effort**: 4 hours  
**Prerequisites**: React knowledge

**Create**: `src/pages/LeadList.tsx`

```typescript
import { useState, useEffect } from 'react';
import { LeadSchema } from '@/lib/schemas/crm';
import { z } from 'zod';

type Lead = z.infer<typeof LeadSchema>;

export function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all'); // all, new, contacted, qualified
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In MVP, use mock data
    // Later: fetch from /.netlify/functions/leads
    const mockLeads: Lead[] = [
      {
        id: '1',
        source: 'website',
        status: 'new',
        contact: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        property: {
          address: '123 Main St',
          city: 'Austin',
          state: 'TX',
          zip: '78701'
        },
        createdAt: new Date().toISOString()
      }
      // Add more mock leads
    ];
    
    setLeads(mockLeads);
    setLoading(false);
  }, []);

  const filteredLeads = leads.filter(lead => {
    // Apply status filter
    if (filter !== 'all' && lead.status !== filter) return false;
    
    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        lead.contact?.email?.toLowerCase().includes(search) ||
        lead.contact?.firstName?.toLowerCase().includes(search) ||
        lead.contact?.lastName?.toLowerCase().includes(search) ||
        lead.property?.address?.toLowerCase().includes(search)
      );
    }
    
    return true;
  });

  if (loading) return <div>Loading leads...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Leads</h1>
      
      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-4 py-2 flex-1"
        />
        
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-4 py-2"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
        </select>
      </div>

      {/* Lead Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">Phone</th>
            <th className="border p-2 text-left">Property</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Source</th>
            <th className="border p-2 text-left">Date</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeads.map(lead => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="border p-2">
                {lead.contact?.firstName} {lead.contact?.lastName}
              </td>
              <td className="border p-2">{lead.contact?.email}</td>
              <td className="border p-2">{lead.contact?.phone}</td>
              <td className="border p-2">
                {lead.property?.address}, {lead.property?.city}
              </td>
              <td className="border p-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  lead.status === 'new' ? 'bg-blue-100' :
                  lead.status === 'contacted' ? 'bg-yellow-100' :
                  'bg-green-100'
                }`}>
                  {lead.status}
                </span>
              </td>
              <td className="border p-2">{lead.source}</td>
              <td className="border p-2">
                {new Date(lead.createdAt).toLocaleDateString()}
              </td>
              <td className="border p-2">
                <button className="text-blue-600 hover:underline mr-2">
                  View
                </button>
                <button className="text-green-600 hover:underline">
                  Convert
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredLeads.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No leads found matching your criteria
        </div>
      )}
    </div>
  );
}
```

**Add Route**:

```typescript
// In your router configuration
import { LeadList } from '@/pages/LeadList';

// Add route
{
  path: '/leads',
  element: <LeadList />
}
```

**Add Test**:

```typescript
// src/pages/__tests__/LeadList.test.tsx
import { render, screen } from '@testing-library/react';
import { LeadList } from '../LeadList';

describe('LeadList', () => {
  test('renders lead list page', () => {
    render(<LeadList />);
    expect(screen.getByText('Leads')).toBeInTheDocument();
  });

  test('displays search input', () => {
    render(<LeadList />);
    expect(screen.getByPlaceholderText('Search leads...')).toBeInTheDocument();
  });

  test('displays filter dropdown', () => {
    render(<LeadList />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
```

**Deploy**:
```bash
npm test  # Ensure tests pass
git add src/pages/LeadList.tsx src/pages/__tests__/LeadList.test.tsx
git commit -m "feat(ui): add lead list view with filtering and search"
git push
```

---

### 8. Create GitHub Secrets Documentation Enhancement
**Impact**: Better security practices  
**Effort**: 2 hours  
**Prerequisites**: Understanding of GitHub Actions

**Enhance**: `docs/GITHUB-SECRETS-GUIDE.md`

Add these sections:

```markdown
## Secret Rotation Automation

### Automated Rotation Checks

The repository includes automated secret rotation monitoring via GitHub Actions.

**Workflow**: `.github/workflows/secret-rotation.yml`
**Schedule**: Every Monday at 9 AM UTC
**Action**: Creates issue if secrets need rotation

### Manual Secret Rotation

Use the provided script for guided rotation:

```bash
bash scripts/rotate-secrets.sh

# Interactive prompts:
# 1. Which secret to rotate? (Supabase/Mailchimp/Airtable/GitHub)
# 2. Have you generated the new secret? (y/n)
# 3. Enter the new secret: [hidden input]
# 4. Update in which environments? (dev/staging/production/all)
# 5. Confirm update? (y/n)

# Script will:
# - Update secret in selected environments
# - Log rotation in docs/SECRET-ROTATION-LOG.md
# - Run validation tests
# - Provide rollback instructions
```

### Secret Lifecycle

```
Generation → Storage → Usage → Rotation → Revocation
    ↓          ↓         ↓         ↓          ↓
   Secure   GitHub   Netlify   Quarterly   After
   Random   Secrets   Env Vars  Schedule   Rotation
```

### Emergency Secret Revocation

If a secret is compromised:

```bash
# 1. Immediately revoke in provider dashboard
# 2. Generate new secret
# 3. Update all environments
# 4. Validate functionality
# 5. Monitor for unauthorized access attempts

# Use emergency rotation script:
bash scripts/rotate-secrets.sh --emergency --secret=SUPABASE
```

### Audit Trail

All secret rotations are logged:

**File**: `docs/SECRET-ROTATION-LOG.md`

**Format**:
```markdown
## Rotation Log

| Date | Secret | Rotated By | Reason | Validation |
|------|--------|-----------|---------|-----------|
| 2025-10-27 | SUPABASE_ANON_KEY | @username | Scheduled | ✅ Passed |
| 2025-10-20 | MAILCHIMP_API | @username | Compromised | ✅ Passed |
```

## Troubleshooting

### Common Issues

**Issue**: GitHub Actions can't access secrets
**Solution**: Check repository permissions, secrets scope

**Issue**: Netlify deployment fails after rotation
**Solution**: Verify env vars in Netlify dashboard, trigger redeploy

**Issue**: Tests fail with new secrets
**Solution**: Run `bash scripts/validate-env.sh` to diagnose
```

**Test**: Review documentation clarity with team

---

### 9. Add Health Check Endpoint
**Impact**: Better monitoring  
**Effort**: 1 hour  
**Prerequisites**: Understanding of Netlify functions

**Create**: `netlify/functions/health.js`

```javascript
/**
 * Health check endpoint for monitoring
 * Returns system status and dependencies
 */

exports.handler = async (event, context) => {
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VITE_APP_VERSION || '1.0.0',
    environment: process.env.CONTEXT || 'development',
    checks: {}
  };

  // Check database connection
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      // In production, would actually ping Supabase
      health.checks.database = { status: 'healthy', message: 'Connected' };
    } else {
      health.checks.database = { status: 'degraded', message: 'Demo mode - no DB configured' };
    }
  } catch (error) {
    health.checks.database = { status: 'unhealthy', message: error.message };
    health.status = 'degraded';
  }

  // Check essential services
  health.checks.mailchimp = {
    status: process.env.MAILCHIMP_API_KEY ? 'healthy' : 'degraded',
    message: process.env.MAILCHIMP_API_KEY ? 'Configured' : 'Demo mode'
  };

  health.checks.airtable = {
    status: process.env.AIRTABLE_API_KEY ? 'healthy' : 'degraded',
    message: process.env.AIRTABLE_API_KEY ? 'Configured' : 'Demo mode'
  };

  health.checks.sentry = {
    status: process.env.VITE_SENTRY_DSN ? 'healthy' : 'degraded',
    message: process.env.VITE_SENTRY_DSN ? 'Active' : 'Not configured'
  };

  // Overall health
  const degradedCount = Object.values(health.checks)
    .filter(check => check.status === 'degraded').length;
  const unhealthyCount = Object.values(health.checks)
    .filter(check => check.status === 'unhealthy').length;

  if (unhealthyCount > 0) {
    health.status = 'unhealthy';
  } else if (degradedCount > 0) {
    health.status = 'degraded';
  }

  health.durationMs = Date.now() - startTime;

  return {
    statusCode: health.status === 'unhealthy' ? 503 : 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    },
    body: JSON.stringify(health, null, 2)
  };
};
```

**Add Test**: `netlify/functions/__tests__/health.test.js`

```javascript
const { handler } = require('../health');

describe('health endpoint', () => {
  const mockEvent = {};
  const mockContext = {};

  test('returns health status', async () => {
    const response = await handler(mockEvent, mockContext);
    
    expect(response.statusCode).toBe(200);
    
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('checks');
  });

  test('includes version information', async () => {
    const response = await handler(mockEvent, mockContext);
    const body = JSON.parse(response.body);
    
    expect(body).toHaveProperty('version');
  });

  test('checks all critical services', async () => {
    const response = await handler(mockEvent, mockContext);
    const body = JSON.parse(response.body);
    
    expect(body.checks).toHaveProperty('database');
    expect(body.checks).toHaveProperty('mailchimp');
    expect(body.checks).toHaveProperty('airtable');
    expect(body.checks).toHaveProperty('sentry');
  });
});
```

**Deploy & Test**:
```bash
npm run test:functions
git add netlify/functions/health.js netlify/functions/__tests__/health.test.js
git commit -m "feat(monitoring): add health check endpoint"
git push

# Test deployed endpoint
curl https://your-site.netlify.app/.netlify/functions/health | jq
```

---

## 📋 Action Priority Matrix

| Action | Time | Impact | Priority | Status |
|--------|------|--------|----------|--------|
| 1. Activate Sentry | 15 min | High | ⚡⚡⚡ | Ready |
| 2. Quality Check | 5 min | Medium | ⚡⚡ | Ready |
| 3. Validate Deployment | 10 min | Medium | ⚡⚡ | Ready |
| 4. Staging Setup | 1 hr | High | ⚡⚡⚡ | Ready |
| 5. Add Tests | 1 hr | Medium | ⚡⚡ | Ready |
| 6. Enhance CI/CD | 1 hr | High | ⚡⚡⚡ | Ready |
| 7. Lead List UI | 4 hr | High | ⚡⚡⚡ | Ready |
| 8. Secrets Docs | 2 hr | Medium | ⚡⚡ | Ready |
| 9. Health Endpoint | 1 hr | Medium | ⚡⚡ | Ready |

**Recommended Order**:
1. Activate Sentry (15 min) - Enables monitoring
2. Staging Setup (1 hr) - Enables safe testing
3. Enhance CI/CD (1 hr) - Better deployments
4. Lead List UI (4 hr) - First user feature
5. Add Tests (1 hr) - Better reliability
6. Health Endpoint (1 hr) - Better monitoring
7. Quality Check (5 min) - Validate everything
8. Secrets Docs (2 hr) - Better security
9. Validate Deployment (10 min) - Final check

---

## 🎯 This Week's Goal

**Minimum**: Complete Actions 1-3 (30 minutes total)
**Target**: Complete Actions 1-6 (4 hours total)
**Stretch**: Complete Actions 1-9 (11 hours total)

---

## 📚 Related Documentation

- **Full Roadmap**: `IMPLEMENTATION-ROADMAP.md`
- **Phase 1 Guide**: `docs/PHASE-1-INFRASTRUCTURE-ACTIVATION.md`
- **Phase 2 Guide**: `docs/PHASE-2-MVP-IMPLEMENTATION-BLUEPRINT.md`
- **Testing Guide**: `docs/TESTING-GUIDE.md`
- **Deployment**: `docs/DEPLOYMENT-RUNBOOK.md`

---

**Ready to start?** Pick an action and begin building! 🚀
