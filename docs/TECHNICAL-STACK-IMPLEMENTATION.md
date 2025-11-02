# Technical Stack Implementation Guide

## Executive Summary

This guide provides detailed implementation instructions for the complete technology stack powering your elite real estate investment platform. It covers infrastructure, application layers, data systems, ML/AI components, and observability—all optimized for DevOps workflows and enterprise scale.

**Goal**: Build a production-ready, cloud-native platform that can scale from MVP to 10,000+ users while maintaining sub-second response times and 99.9% uptime.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Stack](#frontend-stack)
3. [Backend & API Layer](#backend--api-layer)
4. [Database & Data Layer](#database--data-layer)
5. [ML & AI Infrastructure](#ml--ai-infrastructure)
6. [Integration & Communication](#integration--communication)
7. [Security & Authentication](#security--authentication)
8. [Deployment & Infrastructure](#deployment--infrastructure)
9. [Cost Optimization](#cost-optimization)

---

## Architecture Overview

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     CDN Layer (Netlify)                      │
│  - Static assets caching                                     │
│  - Global edge distribution                                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               Frontend (React + Vite)                        │
│  - SPA with code-splitting                                   │
│  - Progressive Web App                                       │
│  - Real-time updates (WebSocket)                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│            API Gateway (Netlify Functions)                   │
│  - Serverless functions                                      │
│  - Auto-scaling                                              │
│  - Rate limiting                                             │
└──────┬──────────────────┬──────────────────┬────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Database   │  │  Job Queue   │  │  External    │
│  (Supabase)  │  │   (Redis)    │  │    APIs      │
│              │  │              │  │  (OpenAI,    │
│  - Postgres  │  │  - BullMQ    │  │   Zillow,    │
│  - Auth      │  │  - Workers   │  │   Twilio)    │
│  - Storage   │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│              Analytics & ML Layer                            │
│  - Feature Store (Feast)                                     │
│  - Model Training (Python + MLflow)                         │
│  - Inference (BentoML/FastAPI)                              │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│           Observability Stack                                │
│  - Metrics: Prometheus + Grafana                            │
│  - Logs: Loki / CloudWatch                                  │
│  - Traces: OpenTelemetry + Jaeger                           │
│  - Errors: Sentry                                            │
└─────────────────────────────────────────────────────────────┘
```

### Technology Decisions

| Layer | Technology | Why? | Alternatives |
|-------|-----------|------|--------------|
| Frontend | React 18 + Vite | Fast builds, React ecosystem, TypeScript | Next.js, SvelteKit, Vue |
| Backend | Netlify Functions | Serverless, auto-scale, simple | AWS Lambda, Cloud Run, Vercel |
| Database | PostgreSQL (Supabase) | Relational + realtime, built-in auth | MongoDB, Firebase, PlanetScale |
| State Management | Zustand | Lightweight, TypeScript-first | Redux, MobX, Jotai |
| Forms | React Hook Form | Performance, validation | Formik, Final Form |
| UI Components | Radix UI + Tailwind | Accessible, customizable | Material-UI, Chakra, Ant Design |
| API Validation | Zod | TypeScript integration | Yup, Joi, Ajv |
| Testing | Vitest + Testing Library | Fast, Vite-native | Jest, Cypress |
| CI/CD | GitHub Actions | Integrated, flexible | GitLab CI, CircleCI |

---

## Frontend Stack

### Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base components (Button, Input, etc.)
│   ├── forms/           # Form components
│   ├── layouts/         # Page layouts
│   └── features/        # Feature-specific components
│       ├── leads/
│       ├── deals/
│       └── analytics/
├── pages/               # Page components (routes)
│   ├── Dashboard.tsx
│   ├── Leads.tsx
│   ├── Deals.tsx
│   └── Analytics.tsx
├── lib/                 # Business logic & utilities
│   ├── api/            # API client functions
│   ├── schemas/        # Zod validation schemas
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Helper functions
│   ├── ai/             # AI agent logic
│   └── ml/             # ML model integration
├── stores/              # State management (Zustand)
│   ├── authStore.ts
│   ├── crmStore.ts
│   └── uiStore.ts
├── types/               # TypeScript type definitions
├── styles/              # Global styles
└── main.tsx            # App entry point
```

### Key Implementation Examples

#### 1. API Client with Type Safety

```typescript
// src/lib/api/client.ts
import { z } from 'zod';

export class APIClient {
  private baseURL: string;
  
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || '/.netlify/functions';
  }
  
  async request<T>(
    endpoint: string,
    options?: RequestInit,
    schema?: z.ZodSchema<T>
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}/${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
    
    if (!response.ok) {
      throw new APIError(response.status, await response.text());
    }
    
    const data = await response.json();
    
    // Validate response with Zod schema
    if (schema) {
      return schema.parse(data);
    }
    
    return data as T;
  }
  
  // Convenience methods
  get<T>(endpoint: string, schema?: z.ZodSchema<T>) {
    return this.request<T>(endpoint, { method: 'GET' }, schema);
  }
  
  post<T>(endpoint: string, body: unknown, schema?: z.ZodSchema<T>) {
    return this.request<T>(
      endpoint,
      { method: 'POST', body: JSON.stringify(body) },
      schema
    );
  }
  
  put<T>(endpoint: string, body: unknown, schema?: z.ZodSchema<T>) {
    return this.request<T>(
      endpoint,
      { method: 'PUT', body: JSON.stringify(body) },
      schema
    );
  }
  
  delete<T>(endpoint: string, schema?: z.ZodSchema<T>) {
    return this.request<T>(endpoint, { method: 'DELETE' }, schema);
  }
}

export class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export const api = new APIClient();
```

#### 2. CRM Store (Zustand)

```typescript
// src/stores/crmStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { api } from '@/lib/api/client';
import type { Lead, Opportunity, Investor } from '@/types';

interface CRMStore {
  // State
  leads: Lead[];
  opportunities: Opportunity[];
  investors: Investor[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchLeads: (filters?: LeadFilters) => Promise<void>;
  createLead: (lead: LeadCreate) => Promise<Lead>;
  updateLead: (id: string, update: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  
  fetchOpportunities: () => Promise<void>;
  createOpportunity: (opp: OpportunityCreate) => Promise<Opportunity>;
  updateOpportunity: (id: string, update: Partial<Opportunity>) => Promise<void>;
  
  // Computed
  getLeadsByStatus: (status: string) => Lead[];
  getHighPriorityLeads: () => Lead[];
}

export const useCRMStore = create<CRMStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        leads: [],
        opportunities: [],
        investors: [],
        loading: false,
        error: null,
        
        // Actions
        fetchLeads: async (filters) => {
          set({ loading: true, error: null });
          try {
            const leads = await api.get<Lead[]>('leads', LeadArraySchema);
            set({ leads, loading: false });
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },
        
        createLead: async (leadData) => {
          set({ loading: true, error: null });
          try {
            const lead = await api.post<Lead>('leads', leadData, LeadSchema);
            set(state => ({
              leads: [lead, ...state.leads],
              loading: false
            }));
            return lead;
          } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
          }
        },
        
        updateLead: async (id, update) => {
          set({ loading: true });
          try {
            const updated = await api.put<Lead>(`leads/${id}`, update, LeadSchema);
            set(state => ({
              leads: state.leads.map(l => l.id === id ? updated : l),
              loading: false
            }));
          } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
          }
        },
        
        deleteLead: async (id) => {
          try {
            await api.delete(`leads/${id}`);
            set(state => ({
              leads: state.leads.filter(l => l.id !== id)
            }));
          } catch (error) {
            set({ error: error.message });
            throw error;
          }
        },
        
        fetchOpportunities: async () => {
          set({ loading: true });
          try {
            const opportunities = await api.get<Opportunity[]>('opportunities');
            set({ opportunities, loading: false });
          } catch (error) {
            set({ error: error.message, loading: false });
          }
        },
        
        createOpportunity: async (oppData) => {
          const opp = await api.post<Opportunity>('opportunities', oppData);
          set(state => ({
            opportunities: [opp, ...state.opportunities]
          }));
          return opp;
        },
        
        updateOpportunity: async (id, update) => {
          const updated = await api.put<Opportunity>(`opportunities/${id}`, update);
          set(state => ({
            opportunities: state.opportunities.map(o => o.id === id ? updated : o)
          }));
        },
        
        // Computed
        getLeadsByStatus: (status) => {
          return get().leads.filter(l => l.status === status);
        },
        
        getHighPriorityLeads: () => {
          return get().leads.filter(l => l.priority === 'high');
        }
      }),
      {
        name: 'crm-store',
        partialize: (state) => ({
          // Only persist certain fields
          leads: state.leads.slice(0, 50), // Limit persisted data
        })
      }
    )
  )
);
```

#### 3. Optimized Lead List Component

```typescript
// src/components/features/leads/LeadList.tsx
import { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCRMStore } from '@/stores/crmStore';
import { LeadCard } from './LeadCard';

export function LeadList({ filters }: { filters: LeadFilters }) {
  const leads = useCRMStore(state => state.leads);
  const fetchLeads = useCRMStore(state => state.fetchLeads);
  
  // Filter and sort
  const filteredLeads = useMemo(() => {
    let result = leads;
    
    if (filters.status) {
      result = result.filter(l => l.status === filters.status);
    }
    
    if (filters.source) {
      result = result.filter(l => l.source === filters.source);
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(l =>
        l.contact.email?.toLowerCase().includes(search) ||
        l.contact.name?.toLowerCase().includes(search) ||
        l.property.address?.toLowerCase().includes(search)
      );
    }
    
    return result.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [leads, filters]);
  
  // Virtual scrolling for performance with large lists
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: filteredLeads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated row height
    overscan: 5
  });
  
  useEffect(() => {
    fetchLeads(filters);
  }, [filters]);
  
  return (
    <div ref={parentRef} className="h-full overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => {
          const lead = filteredLeads[virtualRow.index];
          return (
            <div
              key={lead.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <LeadCard lead={lead} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

#### 4. Real-time Updates with WebSocket

```typescript
// src/lib/realtime.ts
import { createClient } from '@supabase/supabase-js';
import { useCRMStore } from '@/stores/crmStore';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function setupRealtimeSubscriptions() {
  // Subscribe to lead changes
  const leadsSubscription = supabase
    .channel('leads-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'leads' },
      (payload) => {
        const store = useCRMStore.getState();
        
        switch (payload.eventType) {
          case 'INSERT':
            store.addLead(payload.new);
            break;
          case 'UPDATE':
            store.updateLead(payload.new.id, payload.new);
            break;
          case 'DELETE':
            store.removeLead(payload.old.id);
            break;
        }
      }
    )
    .subscribe();
  
  return () => {
    leadsSubscription.unsubscribe();
  };
}

// Use in App component
export function App() {
  useEffect(() => {
    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, []);
  
  return <YourApp />;
}
```

---

## Backend & API Layer

### Serverless Function Structure

```
netlify/functions/
├── lib/                    # Shared utilities
│   ├── database.js        # DB connection
│   ├── auth.js            # Auth middleware
│   ├── validation.js      # Input validation
│   ├── logger.js          # Structured logging
│   └── metrics.js         # Prometheus metrics
├── leads/
│   ├── create.js          # POST /leads
│   ├── get.js             # GET /leads/:id
│   ├── list.js            # GET /leads
│   ├── update.js          # PUT /leads/:id
│   └── delete.js          # DELETE /leads/:id
├── opportunities/
│   ├── create.js
│   ├── list.js
│   └── update.js
├── ai/
│   ├── score-lead.js      # Maya: Lead scoring
│   ├── generate-content.js # Lex: Content generation
│   └── analyze-deal.js    # Dave: Deal analysis
└── webhooks/
    ├── inbound.js         # Generic webhook handler
    └── stripe.js          # Payment webhooks
```

### Function Best Practices

#### 1. Standardized Response Format

```javascript
// netlify/functions/lib/response.js
export function success(data, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })
  };
}

export function error(message, statusCode = 500, details = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString()
    })
  };
}
```

#### 2. Database Connection Pooling

```javascript
// netlify/functions/lib/database.js
import { createClient } from '@supabase/supabase-js';

let supabase;

export function getDatabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: { 'x-application': 'hidden-key-investments' }
        }
      }
    );
  }
  
  return supabase;
}
```

#### 3. Authentication Middleware

```javascript
// netlify/functions/lib/auth.js
import { getDatabase } from './database.js';

export async function authenticate(event) {
  const authHeader = event.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = getDatabase();
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid or expired token');
  }
  
  return user;
}

// Usage in functions
export async function handler(event, context) {
  try {
    const user = await authenticate(event);
    // ... rest of function logic
  } catch (error) {
    return error({ error: error.message, statusCode: 401 });
  }
}
```

#### 4. Rate Limiting

```javascript
// netlify/functions/lib/rateLimiter.js
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function checkRateLimit(identifier, maxRequests = 100, windowMs = 60000) {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Remove old entries
  await redis.zremrangebyscore(key, 0, windowStart);
  
  // Count requests in current window
  const requestCount = await redis.zcard(key);
  
  if (requestCount >= maxRequests) {
    throw new Error('Rate limit exceeded');
  }
  
  // Add current request
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  await redis.expire(key, Math.ceil(windowMs / 1000));
  
  return {
    allowed: true,
    remaining: maxRequests - requestCount - 1
  };
}
```

---

## Database & Data Layer

### PostgreSQL Schema (Production-Ready)

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  priority VARCHAR(20) DEFAULT 'medium',
  
  -- Contact information
  contact JSONB NOT NULL,
  
  -- Property details
  property JSONB NOT NULL,
  
  -- Enrichment data
  enrichment JSONB DEFAULT '{}',
  
  -- Scoring
  score DECIMAL(5,2),
  score_details JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  
  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(contact->>'name', '') || ' ' ||
      coalesce(contact->>'email', '') || ' ' ||
      coalesce(property->>'address', '')
    )
  ) STORED,
  
  -- Constraints
  CONSTRAINT leads_status_check CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  CONSTRAINT leads_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
);

-- Indexes for performance
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_score ON leads(score DESC NULLS LAST);
CREATE INDEX idx_leads_search ON leads USING GIN(search_vector);
CREATE INDEX idx_leads_contact_email ON leads((contact->>'email'));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Opportunities table
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  
  stage VARCHAR(50) DEFAULT 'prospecting',
  deal_type VARCHAR(50) NOT NULL,
  
  -- Financial details
  property_value DECIMAL(12,2),
  offer_amount DECIMAL(12,2),
  estimated_profit DECIMAL(12,2),
  
  -- Property details
  property JSONB NOT NULL,
  
  -- Analysis
  analysis JSONB DEFAULT '{}',
  
  -- Timeline
  close_date DATE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT opportunities_stage_check CHECK (
    stage IN ('prospecting', 'qualified', 'proposal', 'negotiation', 'due_diligence', 'closing', 'won', 'lost')
  )
);

CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_lead_id ON opportunities(lead_id);
CREATE INDEX idx_opportunities_close_date ON opportunities(close_date);

-- Activities (for tracking interactions)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Activity details
  subject TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Assignment
  assigned_to UUID,
  assigned_by UUID,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT activities_type_check CHECK (
    type IN ('call', 'email', 'sms', 'meeting', 'note', 'task')
  )
);

CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_scheduled_at ON activities(scheduled_at);
CREATE INDEX idx_activities_status ON activities(status);

-- ML Feature Store (for model training)
CREATE TABLE ml_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL, -- 'lead', 'opportunity', etc.
  entity_id UUID NOT NULL,
  
  feature_name VARCHAR(100) NOT NULL,
  feature_value JSONB NOT NULL,
  
  -- Versioning
  feature_version VARCHAR(20) DEFAULT '1.0',
  
  -- Metadata
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT ml_features_entity_feature UNIQUE (entity_type, entity_id, feature_name, feature_version)
);

CREATE INDEX idx_ml_features_entity ON ml_features(entity_type, entity_id);
CREATE INDEX idx_ml_features_name ON ml_features(feature_name);
```

### Data Access Layer

```typescript
// src/lib/data/leads.ts
import { getDatabase } from './database';
import type { Lead, LeadCreate, LeadUpdate } from '@/types';

export class LeadsRepository {
  private db = getDatabase();
  
  async findAll(filters?: {
    status?: string;
    source?: string;
    minScore?: number;
    limit?: number;
    offset?: number;
  }): Promise<Lead[]> {
    let query = this.db
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.source) {
      query = query.eq('source', filters.source);
    }
    
    if (filters?.minScore) {
      query = query.gte('score', filters.minScore);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    
    return data as Lead[];
  }
  
  async findById(id: string): Promise<Lead | null> {
    const { data, error } = await this.db
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }
    
    return data as Lead;
  }
  
  async create(lead: LeadCreate): Promise<Lead> {
    const { data, error } = await this.db
      .from('leads')
      .insert(lead)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    return data as Lead;
  }
  
  async update(id: string, update: LeadUpdate): Promise<Lead> {
    const { data, error } = await this.db
      .from('leads')
      .update(update)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    return data as Lead;
  }
  
  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from('leads')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }
  
  async search(query: string, limit = 20): Promise<Lead[]> {
    const { data, error } = await this.db
      .from('leads')
      .select('*')
      .textSearch('search_vector', query)
      .limit(limit);
    
    if (error) throw new Error(error.message);
    
    return data as Lead[];
  }
}

export const leadsRepo = new LeadsRepository();
```

---

## ML & AI Infrastructure

### Model Training Pipeline

```python
# ml/training/lead_scoring_model.py
import pandas as pd
import mlflow
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib

def train_lead_scoring_model():
    # Load data from database
    df = load_historical_leads()
    
    # Feature engineering
    features = engineer_features(df)
    X = features[['property_value', 'days_since_contact', 'source_quality', ...]]
    y = features['converted']  # Binary: did lead convert?
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    with mlflow.start_run():
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        model.fit(X_train_scaled, y_train)
        
        # Evaluate
        accuracy = model.score(X_test_scaled, y_test)
        
        # Log metrics
        mlflow.log_metric('accuracy', accuracy)
        mlflow.log_params({
            'n_estimators': 100,
            'max_depth': 10
        })
        
        # Save model
        mlflow.sklearn.log_model(model, 'model')
        joblib.dump(scaler, 'scaler.pkl')
        mlflow.log_artifact('scaler.pkl')
    
    return model, scaler

def engineer_features(df):
    # Add computed features
    df['days_since_contact'] = (pd.Timestamp.now() - df['created_at']).dt.days
    df['source_quality'] = df['source'].map(SOURCE_QUALITY_SCORES)
    # ... more feature engineering
    return df
```

### Model Serving

```python
# ml/serving/api.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mlflow
import joblib

app = FastAPI()

# Load model at startup
model = mlflow.sklearn.load_model('models:/lead_scoring/production')
scaler = joblib.load('models/scaler.pkl')

class LeadScoreRequest(BaseModel):
    property_value: float
    days_since_contact: int
    source: str
    # ... other features

class LeadScoreResponse(BaseModel):
    score: float
    confidence: float
    explanation: dict

@app.post('/score', response_model=LeadScoreResponse)
async def score_lead(request: LeadScoreRequest):
    try:
        # Prepare features
        features = prepare_features(request)
        features_scaled = scaler.transform([features])
        
        # Predict
        probability = model.predict_proba(features_scaled)[0][1]
        
        # Get feature importance for explanation
        explanation = get_feature_importance(model, features)
        
        return LeadScoreResponse(
            score=probability,
            confidence=calculate_confidence(model, features_scaled),
            explanation=explanation
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def prepare_features(request):
    return [
        request.property_value,
        request.days_since_contact,
        # ... encode categorical features
    ]
```

---

## Cost Optimization

### Monthly Cost Estimates

```markdown
## Projected Monthly Costs (by user scale)

### MVP (100 users)
- Netlify: $19/mo (Starter plan)
- Supabase: $25/mo (Pro plan)
- Sentry: $26/mo (Team plan)
- Total: ~$70/mo

### Growth (1,000 users)
- Netlify: $99/mo (Pro plan)
- Supabase: $100/mo (increased usage)
- Redis (Upstash): $10/mo
- OpenAI API: $50-200/mo (usage-based)
- Sentry: $80/mo
- Total: ~$340-530/mo

### Scale (10,000 users)
- Netlify: $249/mo (Business plan)
- Supabase: $599/mo (Enterprise)
- Redis: $50/mo
- OpenAI API: $500-1000/mo
- ML Infrastructure: $200/mo (BentoML/FastAPI on Cloud Run)
- Observability: $200/mo
- Total: ~$1,800-2,300/mo

### Optimization Strategies
- Use caching aggressively (Redis)
- Implement request batching for AI calls
- Optimize database queries (indexes, materialized views)
- Use CDN for static assets
- Implement smart rate limiting
```

---

## Next Steps

### Week 1-2: Foundation
1. [ ] Setup development environment
2. [ ] Configure database schema
3. [ ] Implement basic CRUD APIs
4. [ ] Build authentication flow

### Week 3-4: Core Features
1. [ ] Build lead capture UI
2. [ ] Implement CRM dashboard
3. [ ] Add real-time updates
4. [ ] Integrate external APIs

### Week 5-6: ML Integration
1. [ ] Train initial ML models
2. [ ] Deploy model serving API
3. [ ] Integrate scoring in frontend
4. [ ] Monitor model performance

### Week 7-8: AI Agents
1. [ ] Implement Steve orchestration
2. [ ] Build Maya data enrichment
3. [ ] Add Lex content generation
4. [ ] Deploy Nova sales automation

**Ready to build a world-class technical platform!** 🚀💻
