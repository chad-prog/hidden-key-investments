# CLAUDE.md - AI Assistant Guide for Hidden Key Investments

> **Last Updated**: 2025-11-15
> **Version**: 1.0.0
> **For**: AI assistants working on this codebase

This document provides a comprehensive guide for AI assistants (like Claude, GPT-4, etc.) working on the Hidden Key Investments platform. It covers codebase structure, development workflows, conventions, and key patterns to follow.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Critical Information](#critical-information)
3. [Codebase Structure](#codebase-structure)
4. [Technology Stack](#technology-stack)
5. [Development Workflow](#development-workflow)
6. [Key Conventions](#key-conventions)
7. [Architecture Patterns](#architecture-patterns)
8. [Testing Strategy](#testing-strategy)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)
11. [Important Files Reference](#important-files-reference)

---

## Project Overview

**Hidden Key Investments** is an enterprise-grade, AI-powered platform for Elite real estate investors. It combines lead capture, CRM, workflow automation, ML-driven analytics, and integrated communications.

### Key Features
- **Lead Capture & Enrichment** - Automated lead ingestion with validation
- **CRM Pipeline** - Leads → Opportunities → Investors workflow
- **Workflow Automation** - Rule-based email/SMS triggers
- **Communication System** - SendGrid email + Twilio SMS integration
- **ML Scoring** - Predictive lead-to-deal probability (planned)
- **AI Orchestration** - Multi-agent task coordination (planned)
- **Documentation Portal** - Interactive docs with AI chatbot
- **Demo Mode** - Full functionality without API keys

### Current Status
- **Phase 1**: Infrastructure Stabilization - ✅ **100% Complete**
- **Phase 2**: Core Features - 🔄 In Progress (60-70% complete)
- **Phase 3-7**: Advanced Features - 📅 Planned

---

## Critical Information

### ⚠️ Before Making Any Changes

1. **Demo Mode**: The application works in demo mode without API keys. Always test in demo mode first.
2. **Branch Strategy**: ALWAYS create feature branches from `staging`, NOT `main`
3. **Testing Required**: All PRs must have passing tests (176 tests currently)
4. **Lint Warnings**: 216 warnings are acceptable and documented - do NOT fix them unless requested
5. **No API Keys in Code**: NEVER commit API keys, tokens, or secrets
6. **TypeScript Strict Mode**: All new code must be TypeScript with strict mode enabled
7. **Build Must Pass**: Production build must succeed (`npm run build`)

### Environment Context
- **Node Version**: 22.x (see `.nvmrc`)
- **Package Manager**: npm (not yarn or pnpm)
- **Build Tool**: Vite 6.0.11
- **Deployment**: Netlify (serverless functions + static hosting)
- **Database**: PostgreSQL (Supabase)
- **CI/CD**: GitHub Actions (8 workflows)

---

## Codebase Structure

```
hidden-key-investments/
├── .github/
│   ├── workflows/          # CI/CD pipelines (8 workflows)
│   └── agents/             # 7 custom AI agent configs
│
├── docs/                   # 164+ documentation files (1.3MB)
│   ├── 00-START-HERE/      # Entry points
│   ├── 01-GETTING-STARTED/ # Setup guides
│   ├── 02-ARCHITECTURE/    # System design
│   ├── 03-FEATURES/        # Feature specs
│   ├── 04-DEVELOPMENT/     # Dev guides
│   ├── 05-DEPLOYMENT/      # Ops runbooks
│   ├── 06-VISION-ROADMAP/  # Strategic planning
│   └── 07-REFERENCE/       # Quick references
│
├── netlify/
│   └── functions/          # 30+ serverless functions
│       └── __tests__/      # 82 function tests
│
├── src/                    # Main application (18,417 lines)
│   ├── components/         # React UI components
│   │   ├── crm/           # CRM-specific components
│   │   ├── documentation/ # Documentation portal
│   │   └── ui/            # 40+ Shadcn/UI components
│   ├── pages/             # Page-level components (17 routes)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Core business logic
│   │   ├── ai/           # AI agents (steveAgent, framework)
│   │   ├── mappers/      # Data transformation
│   │   ├── mautic/       # Mautic CRM integration
│   │   ├── ml/           # Machine learning utilities
│   │   ├── schemas/      # Zod validation schemas
│   │   └── __tests__/    # Library tests
│   ├── maya/              # Maya API schemas (Zod)
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   └── email-templates/   # Email template definitions
│
├── scripts/                # 30+ automation scripts
│   ├── dev-utils.sh       # Quality checks
│   ├── setup-dev.sh       # Automated setup
│   ├── smoke-run.mjs      # Smoke tests
│   └── validate-*.sh      # Validation scripts
│
├── supabase-sql/           # Database schemas (8 tables)
│   ├── schema.sql         # Complete schema
│   ├── 01-setup.sql       # Initial setup
│   └── *.sql              # Specific schemas
│
├── terraform/              # Infrastructure as Code
│   ├── environments/      # dev, staging, production
│   └── modules/           # cicd, database, monitoring, networking
│
└── tests/                  # API tests and helpers
```

### Key Statistics
- **Total Code**: 18,417 lines of TypeScript/TSX
- **Components**: 80+ React components
- **Routes**: 17 application routes
- **Tests**: 176 tests (94 main + 82 functions)
- **Documentation**: 164+ files
- **Database Tables**: 8 tables, 30+ indexes, 3 materialized views
- **Serverless Functions**: 30+ endpoints
- **Custom AI Agents**: 7 specialized agents

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | Latest | Type safety |
| Vite | 6.0.11 | Build tool |
| React Router | 7.5.3 | Routing |
| Tailwind CSS | 3.4.17 | Styling |
| Radix UI | Latest | Component primitives |
| Shadcn/UI | Latest | 40+ pre-built components |
| Zustand | 5.0.5 | State management |
| React Hook Form | 7.56.1 | Form handling |
| Zod | 3.25.76 | Validation |
| i18next | 25.1.2 | Internationalization (7 languages) |
| Recharts | 2.15.3 | Charts |
| Motion | 12.17.0 | Animations |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x | Runtime |
| Netlify Functions | Latest | Serverless API |
| esbuild | 0.25.4 | Function bundler |
| Supabase | 2.76.1 | PostgreSQL client |
| SendGrid | 8.1.6 | Email service |
| Twilio | 5.10.4 | SMS service |
| Sentry | 10.22.0 | Error tracking |

### Database
| Technology | Purpose |
|------------|---------|
| PostgreSQL 14+ | Primary database |
| Supabase | Hosted PostgreSQL |
| JSONB | Flexible data storage |
| UUID | Primary keys |
| Full-text search | PostgreSQL tsvector |
| Triggers | Auto-updated timestamps |
| Materialized views | Common query optimization |

### DevOps
| Technology | Purpose |
|------------|---------|
| GitHub Actions | CI/CD (8 workflows) |
| Netlify | Hosting + functions |
| Terraform | Infrastructure as Code |
| Vitest | Testing framework |
| ESLint | Linting |
| Docker | Dev containers |

---

## Development Workflow

### 1. Setup (First Time)

```bash
# Clone repository
git clone https://github.com/chad-prog/hidden-key-investments.git
cd hidden-key-investments

# Automated setup (recommended)
bash scripts/setup-dev.sh

# Or manual setup
npm install
npm test  # Verify setup

# Start dev server
npm run dev
# → http://localhost:5173 (demo mode, no API keys needed)
```

### 2. Creating a Feature

```bash
# ALWAYS branch from staging, NOT main
git checkout staging
git pull origin staging

# Create feature branch (use conventional naming)
git checkout -b feature/your-feature-name
# OR: fix/bug-description, docs/update, refactor/improvement, etc.

# Make changes, following conventions in this document

# Run quality checks BEFORE committing
npm run lint:fix  # Auto-fix lint issues
npm test          # All 176 tests must pass
npm run build     # Build must succeed

# Commit with conventional format
git add .
git commit -m "feat(scope): description"
# Types: feat, fix, docs, style, refactor, test, chore

# Push and create PR
git push origin feature/your-feature-name
# Create PR targeting 'staging' (NOT main!)
```

### 3. Branch Strategy

```
main (production) ← PR from staging (weekly releases)
  ↑
staging (pre-production) ← PR from feature branches
  ↑
feature/* (development) ← Your work here
```

**Rules:**
- `main` - Protected, production only, auto-deploys to production
- `staging` - Protected, tested features, auto-deploys to staging
- Feature branches - Active development, gets deploy preview

### 4. CI/CD Pipeline

Every PR triggers GitHub Actions:

```yaml
Jobs:
  1. Security Scan (Trivy, Gitleaks, TruffleHog)
  2. Lint (ESLint - warnings OK, errors fail)
  3. Main Tests (94 tests)
  4. Function Tests (82 tests)
  5. Build (production build)
  6. Coverage Report (PRs only)
  7. Deploy Preview (Netlify, PRs only)
```

**All jobs must pass** before merge to staging/main.

### 5. Testing Requirements

```bash
# Run all tests
npm test                    # Main tests (94)
npm run test:functions      # Function tests (82)
npm run test:coverage       # With coverage report

# Watch mode (during development)
npm run test:watch

# Smoke tests (staging/prod)
npm run smoke:staging
npm run smoke:prod
```

**Coverage Requirements:**
- Minimum: 60% overall coverage
- Target: 80%+ for new code
- UI components (Shadcn) excluded from coverage

---

## Key Conventions

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase.tsx | `LeadCard.tsx` |
| Utilities | camelCase.ts | `emailValidation.ts` |
| Hooks | use*.ts | `useLeads.ts` |
| Tests | *.test.{ts,tsx} | `LeadCard.test.tsx` |
| Types | PascalCase.ts | `CRMTypes.ts` |
| Constants | UPPER_SNAKE_CASE.ts | `API_CONSTANTS.ts` |

### TypeScript Patterns

```typescript
// ✅ GOOD: Explicit types, interfaces for objects
interface LeadFormProps {
  onSubmit: (data: LeadData) => void;
  initialValues?: Partial<LeadData>;
}

export function LeadForm({ onSubmit, initialValues }: LeadFormProps) {
  // Implementation
}

// ✅ GOOD: Const over let, explicit return types
export function calculateScore(lead: Lead): number {
  const baseScore = lead.engagement * 10;
  return Math.min(baseScore, 100);
}

// ❌ BAD: Using 'any'
function processData(data: any) { } // Never use 'any'

// ✅ GOOD: Use 'unknown' if type is truly unknown
function processData(data: unknown) {
  if (isLead(data)) {
    // Type guard narrows to Lead
  }
}
```

### Component Structure

```typescript
// src/components/example/MyComponent.tsx

import { useState } from 'react';
import { z } from 'zod';

// 1. Define prop schema (if complex)
const PropsSchema = z.object({
  title: z.string(),
  count: z.number().optional(),
});

// 2. Infer TypeScript interface from schema
interface MyComponentProps extends z.infer<typeof PropsSchema> {}

// 3. Export component with explicit props
export function MyComponent({ title, count = 0 }: MyComponentProps) {
  // 4. State and hooks at top
  const [state, setState] = useState<number>(count);

  // 5. Event handlers
  const handleClick = () => {
    setState(prev => prev + 1);
  };

  // 6. Render
  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p>Count: {state}</p>
      <button onClick={handleClick}>Increment</button>
    </div>
  );
}
```

### Validation with Zod

**ALWAYS use Zod for validation**, especially for:
- API request/response payloads
- Form data
- User input
- External data sources

```typescript
import { z } from 'zod';

// Define schema
export const LeadSchema = z.object({
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'E.164 format required').optional(),
  source: z.enum(['website', 'referral', 'api', 'import']),
  property: z.object({
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/),
  }),
  customFields: z.record(z.unknown()).optional(),
});

// Infer TypeScript type
export type Lead = z.infer<typeof LeadSchema>;

// Use in API
export async function createLead(data: unknown): Promise<Lead> {
  // Validate (throws ZodError if invalid)
  const validated = LeadSchema.parse(data);

  // Or use safeParse for error handling
  const result = LeadSchema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.message);
  }

  return result.data;
}
```

### Error Handling

```typescript
// serverless function pattern
import { createErrorResponse } from '@/lib/errorHandler';

export async function handler(event, context) {
  try {
    // Validate input
    const data = RequestSchema.parse(JSON.parse(event.body));

    // Process
    const result = await processData(data);

    // Success response
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, data: result }),
    };
  } catch (error) {
    // Structured error response
    return createErrorResponse(error, {
      correlationId: event.requestContext?.requestId,
      context: { function: 'handler-name' },
    });
  }
}
```

### State Management (Zustand)

```typescript
// src/stores/leadStore.ts
import { create } from 'zustand';

interface LeadState {
  leads: Lead[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLeads: () => Promise<void>;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
}

export const useLeadStore = create<LeadState>((set, get) => ({
  leads: [],
  isLoading: false,
  error: null,

  fetchLeads: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/.netlify/functions/leads');
      const leads = await response.json();
      set({ leads, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addLead: (lead) => {
    set(state => ({ leads: [...state.leads, lead] }));
  },

  updateLead: (id, updates) => {
    set(state => ({
      leads: state.leads.map(lead =>
        lead.id === id ? { ...lead, ...updates } : lead
      ),
    }));
  },
}));
```

### Environment Variables

**Frontend (VITE_ prefix)** - Embedded in client bundle (PUBLIC):
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_FEATURE_ERRORTRACKING=true
```

**Backend (NO prefix)** - Server-only secrets (Netlify env vars):
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SENDGRID_API_KEY=xxx
TWILIO_AUTH_TOKEN=xxx
```

**⚠️ Security:**
- `VITE_*` variables are **PUBLIC** - never put secrets there
- Server secrets go in Netlify dashboard, not in `.env`
- Use demo mode detection: `isDemoMode()` from `@/lib/envValidation`

---

## Architecture Patterns

### Data Flow

```
User Input → Validation (Zod) → API Function → Database → Response
                ↓
         UI Component ← Store (Zustand) ← Formatted Data
```

### Database Schema

**8 Tables:**

1. **leads** - Lead capture and management
   - Status: new → contacted → qualified → converted → closed_won/lost
   - ML scoring: 0-100 normalized score
   - JSONB: property, enrichment_data, custom_fields
   - Full-text search index

2. **opportunities** - Deal pipeline
   - Stages: prospecting → qualification → proposal → negotiation → closing → won/lost
   - Types: flip, rental, commercial, land, wholesale, development
   - JSONB: documents, custom_fields

3. **investors** - Investor profiles
   - Types: individual, institutional, family_office, syndicate, fund, corporate
   - Status: active, inactive, do_not_contact, archived
   - JSONB: investment_profile, accreditation, preferences

4. **activities** - Activity tracking
   - Types: call, email, sms, meeting, note, task, document, system, status_change, enrichment, workflow
   - Cross-references: leads, opportunities, investors

5. **workflows** - Automation workflows
   - JSONB: trigger, conditions, actions
   - Priority-based execution
   - Execution statistics

6. **workflow_executions** - Execution logs
   - Status: pending → running → completed/failed/cancelled
   - JSONB: results, error tracking
   - Retry support

7. **analytics_events** - Event tracking for ML
   - Multi-entity relationships
   - Session + correlation tracking
   - JSONB: properties

8. **communication_templates** - Email/SMS templates
   - Variable substitution: `{{variable}}`
   - Status: draft, active, archived

**Key Patterns:**
- UUID primary keys
- JSONB for flexibility
- Enum constraints for data integrity
- Soft deletes (status fields)
- Audit trails via analytics_events
- Auto-updated timestamps (triggers)
- Full-text search capabilities

### API Patterns

**Serverless Function Template:**

```javascript
// netlify/functions/example.js
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Request schema
const RequestSchema = z.object({
  email: z.string().email(),
  data: z.record(z.unknown()).optional(),
});

// Initialize clients
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function handler(event, context) {
  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Validate
    const body = JSON.parse(event.body);
    const validated = RequestSchema.parse(body);

    // Process
    const { data, error } = await supabase
      .from('table_name')
      .insert(validated)
      .select()
      .single();

    if (error) throw error;

    // Success
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, data }),
    };
  } catch (error) {
    console.error('Error:', error);

    // Error response
    return {
      statusCode: error.status || 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        correlationId: context.requestId,
      }),
    };
  }
}
```

### Demo Mode Pattern

```typescript
// src/lib/envValidation.ts
export function isDemoMode(): boolean {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const formspreeId = import.meta.env.VITE_FORMSPREE_FORM_ID;

  // Demo mode if critical services not configured
  return !supabaseUrl || !formspreeId ||
         supabaseUrl.includes('placeholder');
}

// Use in components
import { isDemoMode } from '@/lib/envValidation';

export function LeadForm() {
  const handleSubmit = async (data) => {
    if (isDemoMode()) {
      // Mock success response
      console.log('Demo mode: would submit', data);
      toast.success('Lead captured! (Demo mode)');
      return;
    }

    // Real submission
    await fetch('/.netlify/functions/lead-ingest', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };
}
```

---

## Testing Strategy

### Test Organization

```
src/
├── components/
│   └── __tests__/          # Component tests
│       ├── LeadCard.test.tsx
│       └── InvestorProfile.test.tsx
├── pages/
│   └── __tests__/          # Page tests
│       └── LeadManagement.test.tsx
└── lib/
    └── __tests__/          # Utility tests
        └── envValidation.test.ts

netlify/functions/
└── __tests__/              # Function tests (82)
    ├── health.test.js
    ├── investor.test.js
    └── templates.test.ts
```

### Component Testing Pattern

```typescript
// src/components/__tests__/LeadCard.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeadCard } from '../LeadCard';
import { createMockLead } from '@/lib/testFixtures';

describe('LeadCard', () => {
  it('renders lead information', () => {
    const lead = createMockLead({
      contact: { email: 'test@example.com' },
      status: 'new',
    });

    render(<LeadCard lead={lead} />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('calls onUpdate when status changes', () => {
    const lead = createMockLead();
    const onUpdate = vi.fn();

    render(<LeadCard lead={lead} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByRole('button', { name: /change status/i }));
    fireEvent.click(screen.getByText('Contacted'));

    expect(onUpdate).toHaveBeenCalledWith(lead.id, { status: 'contacted' });
  });
});
```

### API Testing Pattern

```javascript
// netlify/functions/__tests__/example.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { handler } from '../example.js';

describe('example function', () => {
  let event, context;

  beforeEach(() => {
    event = {
      httpMethod: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    };
    context = { requestId: 'test-123' };
  });

  it('returns success for valid input', async () => {
    const response = await handler(event, context);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
  });

  it('returns error for invalid input', async () => {
    event.body = JSON.stringify({ email: 'invalid' });

    const response = await handler(event, context);

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
  });
});
```

### Using Test Fixtures

```typescript
// src/lib/testFixtures.ts - Already implemented
import { createMockLead, createMockCRMDataset } from '@/lib/testFixtures';

// Single entity
const lead = createMockLead({
  status: 'new',
  contact: { email: 'test@example.com' },
});

// Complete dataset (50+ entities)
const { leads, opportunities, investors } = createMockCRMDataset();

// Use in tests
it('processes multiple leads', () => {
  const dataset = createMockCRMDataset();
  const result = processLeads(dataset.leads);
  expect(result).toHaveLength(dataset.leads.length);
});
```

---

## Common Tasks

### Adding a New Component

```bash
# 1. Create component file
touch src/components/MyComponent.tsx

# 2. Create test file
touch src/components/__tests__/MyComponent.test.tsx

# 3. Implement component (see Component Structure above)

# 4. Write tests
npm run test:watch  # Run in watch mode

# 5. Add to exports (if needed)
# Edit src/components/index.ts
```

### Adding a New API Endpoint

```bash
# 1. Create function file
touch netlify/functions/my-endpoint.js

# 2. Create test file
touch netlify/functions/__tests__/my-endpoint.test.js

# 3. Implement function (see API Patterns above)

# 4. Test locally
npm run dev
# Test at: http://localhost:8888/.netlify/functions/my-endpoint

# 5. Write tests
npm run test:functions
```

### Adding a Database Table

```bash
# 1. Create migration SQL file
touch supabase-sql/03-my-table.sql

# 2. Write SQL (follow existing patterns)
cat > supabase-sql/03-my-table.sql << 'EOF'
CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_my_table_name ON my_table(name);

-- Trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON my_table
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
EOF

# 3. Apply to Supabase
# Run in Supabase SQL editor or via psql

# 4. Create Zod schema
touch src/lib/schemas/myTable.ts
```

### Adding a New Route

```typescript
// 1. Create page component
// src/pages/MyPage.tsx
export function MyPage() {
  return <div>My Page</div>;
}

// 2. Add route to App.tsx
import { MyPage } from '@/pages/MyPage';

// In <Routes>
<Route path="/my-page" element={<MyPage />} />

// 3. Add navigation link (if needed)
// Update navigation component
```

### Running Quality Checks

```bash
# All checks (recommended before PR)
bash scripts/dev-utils.sh check-all

# Individual checks
npm run lint           # ESLint
npm run lint:fix       # Auto-fix
npm test               # Main tests
npm run test:functions # Function tests
npm run build          # Production build

# Pre-commit checks
bash scripts/dev-utils.sh pre-commit
```

### Debugging

```typescript
// Use structured logging
import { logger } from '@/lib/logger';

logger.info('Processing lead', { leadId, status });
logger.error('Failed to process', { error, context });

// In serverless functions
console.log('[INFO]', { message, data });
console.error('[ERROR]', { error: error.message, stack: error.stack });

// Sentry for production errors
import * as Sentry from '@sentry/react';

try {
  // risky operation
} catch (error) {
  Sentry.captureException(error, {
    tags: { component: 'LeadForm' },
    extra: { leadId, userData },
  });
  throw error;
}
```

---

## Troubleshooting

### Common Issues

#### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

#### Tests Fail

```bash
# Update snapshots (if using)
npm test -- -u

# Run specific test file
npm test src/components/__tests__/MyComponent.test.tsx

# Debug mode
npm run test:watch
```

#### Lint Errors

```bash
# Auto-fix
npm run lint:fix

# If warnings persist, check if they're in acceptable list
# See: docs/LINTING.md for 216 acceptable warnings
```

#### Demo Mode Not Working

```typescript
// Check environment validation
import { isDemoMode, getConfigStatus } from '@/lib/envValidation';

console.log('Demo mode:', isDemoMode());
console.log('Config:', getConfigStatus());
```

#### Database Connection Issues

```bash
# Check Supabase credentials
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
npm run dev
# Check browser console for connection errors
```

### Where to Look

| Issue | Check |
|-------|-------|
| Build errors | `vite.config.ts`, `tsconfig.json` |
| Test failures | Test files, `vitest.config.ts` |
| Lint errors | `eslint.config.js`, code style |
| API errors | Function logs in Netlify dashboard |
| Database errors | Supabase logs, SQL syntax |
| Environment issues | `.env.example`, Netlify env vars |
| CI/CD failures | `.github/workflows/ci.yml`, Actions logs |
| Deployment issues | `netlify.toml`, Netlify deploy logs |

---

## Important Files Reference

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, metadata |
| `tsconfig.json` | TypeScript compiler config |
| `vite.config.ts` | Vite build config |
| `vitest.config.ts` | Test runner config |
| `eslint.config.js` | Linting rules (ESLint 9) |
| `tailwind.config.js` | Tailwind CSS customization |
| `netlify.toml` | Netlify deployment config |
| `.nvmrc` | Node version (22) |

### Key Source Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app component, routing (17 routes) |
| `src/lib/schemas/crm.ts` | CRM data validation schemas |
| `src/lib/testFixtures.ts` | Test data generators |
| `src/lib/envValidation.ts` | Environment & demo mode detection |
| `src/lib/workflowEngine.ts` | Automation engine |
| `src/lib/featureFlags.tsx` | Feature flag system |
| `src/maya/zodSchemas.ts` | Maya API schemas |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `CONTRIBUTING.md` | Contribution guide |
| `docs/QUICK-START.md` | Setup guide |
| `docs/ARCHITECTURE.md` | System design |
| `docs/TESTING-GUIDE.md` | Testing practices |
| `docs/API-REFERENCE.md` | API documentation |
| `docs/CURRENT-STATUS.md` | Platform status |
| `DOCUMENTATION-INDEX.md` | Master doc navigation |

### Scripts

| Script | Purpose |
|--------|---------|
| `scripts/setup-dev.sh` | Automated dev setup |
| `scripts/dev-utils.sh` | Quality checks |
| `scripts/smoke-run.mjs` | Smoke tests |
| `scripts/validate-infrastructure.sh` | Infrastructure validation |
| `scripts/check-platform-status.sh` | Health checks |

---

## Best Practices Summary

### Do's ✅

1. **Always validate data with Zod** before processing
2. **Write tests** for all new features (aim for 80%+ coverage)
3. **Use TypeScript strict mode** for all new code
4. **Follow conventional commits** (feat:, fix:, docs:, etc.)
5. **Branch from staging** for all feature work
6. **Run quality checks** before creating PR
7. **Use demo mode** for testing without API keys
8. **Document complex logic** with comments and JSDoc
9. **Handle errors gracefully** with structured responses
10. **Use existing patterns** from the codebase

### Don'ts ❌

1. **Never commit API keys** or secrets to repository
2. **Never use 'any' type** in TypeScript (use 'unknown')
3. **Never skip tests** for new features
4. **Never branch from main** (use staging)
5. **Never bypass lint/test checks** in CI/CD
6. **Never hardcode config** (use environment variables)
7. **Never modify Shadcn UI components** directly
8. **Never push directly to main/staging** (use PRs)
9. **Never ignore TypeScript errors** (fix them)
10. **Never break the build** (test locally first)

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Production build
npm run preview            # Preview production build

# Testing
npm test                   # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
npm run test:functions     # Function tests only
npm run smoke:staging      # Smoke tests

# Quality
npm run lint               # Check linting
npm run lint:fix           # Auto-fix linting
bash scripts/dev-utils.sh check-all  # All checks

# Documentation
npm run docs:lint          # Lint docs
npm run docs:catalog       # Generate catalog
npm run docs:api           # Generate API docs
```

### Useful Links

- **Documentation Portal**: http://localhost:5173/docs (when running)
- **Netlify Dashboard**: https://app.netlify.com
- **Supabase Dashboard**: https://app.supabase.com
- **Sentry Dashboard**: https://sentry.io
- **GitHub Repository**: https://github.com/chad-prog/hidden-key-investments

---

## Conclusion

This guide should provide everything you need to work effectively on the Hidden Key Investments codebase. When in doubt:

1. **Check existing code** for patterns
2. **Read the docs** in `/docs` directory
3. **Run quality checks** before committing
4. **Ask for clarification** if something is unclear
5. **Follow the conventions** outlined in this guide

Remember: **Quality over speed**. It's better to take time to do it right than to rush and create technical debt.

Good luck, and happy coding! 🚀

---

**For Updates**: This document should be updated whenever major architectural changes occur or new conventions are established. Last updated: 2025-11-15
