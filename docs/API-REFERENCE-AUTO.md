# API Reference (Auto-Generated)

_Generated on: 11/2/2025, 9:15:47 AM_

_This documentation is automatically generated from TypeScript source files._

## Table of Contents

- [Interfaces](#interfaces)
- [Functions](#functions)

---

## Interfaces

### `AnalyticsData`

Advanced Analytics and Investor Intelligence System Real-time tracking, predictive analytics, and investor behavior analysis /

import { useState, useEffect } from 'react';

/   Analytics data interface

**Properties:**

| Name | Type | Optional |
|------|------|----------|
| `totalInvestors` | `number` |  |
| `activeDeals` | `number` |  |
| `capitalDeployed` | `number` |  |
| `conversionRate` | `number` |  |
| `averageROI` | `number` |  |
| `cohortAnalysis` | `CohortAnalysis[]` |  |
| `riskAssessment` | `RiskAssessment[]` |  |
| `predictiveMetrics` | `PredictiveMetrics` |  |

_Source: `src/utils/advancedAnalytics.ts`_

---

### `CohortAnalysis`

Cohort analysis interface

**Properties:**

| Name | Type | Optional |
|------|------|----------|
| `cohort` | `string` |  |
| `size` | `number` |  |
| `averageInvestment` | `number` |  |
| `retentionRate` | `number` |  |

_Source: `src/utils/advancedAnalytics.ts`_

---

### `RiskAssessment`

Risk assessment interface

**Properties:**

| Name | Type | Optional |
|------|------|----------|
| `name` | `string` |  |
| `riskScore` | `number` |  |
| `factors` | `string[]` |  |
| `recommendation` | `string` |  |

_Source: `src/utils/advancedAnalytics.ts`_

---

### `PredictiveMetrics`

Predictive metrics interface

**Properties:**

| Name | Type | Optional |
|------|------|----------|
| `recommendedActions` | `string[]` |  |
| `successProbability` | `number` |  |
| `marketTrend` | `'bullish' | 'bearish' | 'neutral'` |  |

_Source: `src/utils/advancedAnalytics.ts`_

---

### `Prediction`

Prediction interface

**Properties:**

| Name | Type | Optional |
|------|------|----------|
| `predictedRaise` | `number` |  |
| `confidence` | `number` |  |
| `timeframe` | `string` |  |

_Source: `src/utils/advancedAnalytics.ts`_

---

### `SearchToken`

Advanced search utilities for documentation portal Supports boolean operators: AND, OR, NOT

**Properties:**

| Name | Type | Optional |
|------|------|----------|
| `type` | `'term' | 'and' | 'or' | 'not'` |  |
| `value` | `string` |  |

_Source: `src/utils/advancedSearch.ts`_

---

## Functions

### `useInvestors()`

useInvestors Hook  Custom hook for managing investor data fetching and state management Provides CRUD operations and filtering for investors /

import { useState, useEffect } from 'react';
import type { Investor, InvestorCreate, InvestorUpdate } from '@/lib/schemas/crm';
import { isDemoMode } from '@/lib/envValidation';
import { createMockInvestor } from '@/lib/testFixtures';

interface UseInvestorsResult {
  investors: Investor[];
  isLoading: boolean;
  error: Error | null;
  getInvestor: (id: string) => Investor | undefined;
  createInvestor: (data: InvestorCreate) => Promise<Investor>;
  updateInvestor: (data: InvestorUpdate) => Promise<Investor>;
  deleteInvestor: (id: string) => Promise<void>;
  refreshInvestors: () => Promise<void>;
}

/   Hook for managing investor data

**Returns:** `UseInvestorsResult`

_Source: `src/hooks/useInvestors.ts`_

---

### `validateEnv()`

Environment Variable Validation  Validates required environment variables at startup to fail fast with clear error messages rather than mysterious runtime errors.  Usage: import { validateEnv } from '@/lib/envValidation'; validateEnv(); // Call at app startup /

import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Supabase Configuration (Optional in demo mode)
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
  
  // API Keys (Optional - graceful degradation)
  VITE_MAILCHIMP_API_KEY: z.string().optional(),
  VITE_AIRTABLE_API_KEY: z.string().optional(),
  
  // Feature Flags (Optional - defaults provided)
  VITE_FEATURE_LEADCAPTURE: z.string().optional(),
  VITE_FEATURE_CRMPIPELINE: z.string().optional(),
  VITE_FEATURE_WORKFLOWAUTOMATION: z.string().optional(),
  VITE_FEATURE_MLSCORING: z.string().optional(),
  VITE_FEATURE_AIASSISTANTS: z.string().optional(),
  
  // Observability (Optional)
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_ANALYTICS_ID: z.string().optional(),
  
  // Environment
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  DEV: z.boolean().optional(),
  PROD: z.boolean().optional(),
});

// Server-side only environment variables (for Netlify functions)
const serverEnvSchema = z.object({
  // Supabase Service Role (server-side only)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  
  // Email Service
  SENDGRID_API_KEY: z.string().optional(),
  MAILCHIMP_API_KEY: z.string().optional(),
  
  // SMS Service
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // API Keys
  AIRTABLE_API_KEY: z.string().optional(),
  AIRTABLE_BASE_ID: z.string().optional(),
  
  // Document Services
  DOCUSIGN_API_KEY: z.string().optional(),
  HELLOSIGN_API_KEY: z.string().optional(),
  
  // Enrichment Services
  CLEARBIT_API_KEY: z.string().optional(),
  ZILLOW_API_KEY: z.string().optional(),
  
  // Observability
  SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

interface ValidationResult {
  success: boolean;
  errors?: string[];
  warnings?: string[];
  demoMode?: boolean;
}

/   Validates client-side environment variables

**Returns:** `ValidationResult`

_Source: `src/lib/envValidation.ts`_

---

### `validateServerEnv()`

Validates server-side environment variables (for use in Netlify functions)

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `env` | `NodeJS.ProcessEnv` |  |

**Returns:** `ValidationResult`

_Source: `src/lib/envValidation.ts`_

---

### `isDemoMode()`

Gets a typed environment variable with fallback /
export function getEnv<K extends keyof Env>(
  key: K,
  fallback?: Env[K]
): Env[K] | undefined {
  const value = import.meta.env[key];
  return value ?? fallback;
}

/   Checks if running in demo mode (no API keys configured)

**Returns:** `boolean`

_Source: `src/lib/envValidation.ts`_

---

### `isServiceConfigured()`

Checks if a specific service is configured

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `service` | `'supabase' | 'mailchimp' | 'airtable' | 'sentry'` |  |

**Returns:** `boolean`

_Source: `src/lib/envValidation.ts`_

---

### `createLogger()`

Observability and Error Tracking Infrastructure  Centralized error handling, logging, and monitoring Integrates with services like Sentry, Datadog, etc. /

import { randomUUID } from 'crypto';

// ============================================================================
// Types
// ============================================================================

export interface ErrorContext {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  environment?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface LogContext extends ErrorContext {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  data?: any;
}

export interface MetricData {
  name: string;
  value: number;
  unit?: string;
  tags?: Record<string, string>;
  timestamp?: string;
}

export interface PerformanceMetric {
  operation: string;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// Error Tracking Service
// ============================================================================

export class ErrorTracker {
  private enabled: boolean;
  private environment: string;
  private sentryAvailable: boolean = false;

  constructor() {
    this.enabled = typeof process !== 'undefined' && process.env.VITE_FEATURE_ERRORTRACKING === 'true';
    this.environment = typeof process !== 'undefined' ? (process.env.NODE_ENV || 'development') : 'development';
    
    // Check if Sentry is available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      this.sentryAvailable = true;
    }
  }

  /   Capture an exception /
  captureException(error: Error, context?: ErrorContext): void {
    const enrichedContext = {
      ...context,
      environment: this.environment,
      timestamp: new Date().toISOString(),
      errorType: error.name,
      errorMessage: error.message,
      stack: error.stack,
    };

    // Send to Sentry if available
    if (this.sentryAvailable && typeof window !== 'undefined') {
      const Sentry = (window as any).Sentry;
      Sentry.captureException(error, {
        contexts: { custom: enrichedContext },
        tags: {
          component: context?.component,
          action: context?.action,
        },
        user: context?.userId ? { id: context.userId } : undefined,
      });
    }

    // Always log to console in development or if tracking disabled
    if (!this.enabled || this.environment === 'development') {
      console.error('[ErrorTracker]', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        context: enrichedContext,
      });
    }
  }

  /   Capture a message (for non-error logging) /
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
    const enrichedContext = {
      ...context,
      environment: this.environment,
      timestamp: new Date().toISOString(),
      level,
    };

    // Send to Sentry if available
    if (this.sentryAvailable && typeof window !== 'undefined') {
      const Sentry = (window as any).Sentry;
      Sentry.captureMessage(message, {
        level: level === 'warning' ? 'warning' : level,
        contexts: { custom: enrichedContext },
        tags: {
          component: context?.component,
          action: context?.action,
        },
      });
    }

    // Log to console in development or if tracking disabled
    if (!this.enabled || this.environment === 'development') {
      console.log('[ErrorTracker]', level, message, enrichedContext);
    }
  }

  /   Set user context for error tracking /
  setUser(userId: string, email?: string, username?: string): void {
    // Set in Sentry if available
    if (this.sentryAvailable && typeof window !== 'undefined') {
      const Sentry = (window as any).Sentry;
      Sentry.setUser({ id: userId, email, username });
    }

    if (this.environment === 'development') {
      console.log('[ErrorTracker] User set:', { userId, email, username });
    }
  }

  /   Clear user context /
  clearUser(): void {
    // Clear in Sentry if available
    if (this.sentryAvailable && typeof window !== 'undefined') {
      const Sentry = (window as any).Sentry;
      Sentry.setUser(null);
    }

    if (this.environment === 'development') {
      console.log('[ErrorTracker] User cleared');
    }
  }

  /   Add breadcrumb (for debugging) /
  addBreadcrumb(message: string, category?: string, data?: any): void {
    // Add to Sentry if available
    if (this.sentryAvailable && typeof window !== 'undefined') {
      const Sentry = (window as any).Sentry;
      Sentry.addBreadcrumb({ message, category, data, timestamp: Date.now() / 1000 });
    }

    if (this.environment === 'development') {
      console.debug('[ErrorTracker] Breadcrumb:', { message, category, data });
    }
  }
}

// ============================================================================
// Structured Logger
// ============================================================================

export class Logger {
  private context: ErrorContext;
  private correlationId: string;

  constructor(context: ErrorContext = {}) {
    this.context = context;
    this.correlationId = context.correlationId || randomUUID();
  }

  private log(level: LogContext['level'], message: string, data?: any): void {
    const logEntry: LogContext = {
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: this.correlationId,
      ...this.context,
      ...(data && { data }),
    };

    const consoleMethod = level === 'debug' ? console.debug : 
                         level === 'info' ? console.info :
                         level === 'warn' ? console.warn :
                         console.error;

    consoleMethod(JSON.stringify(logEntry));
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: Error | any, data?: any): void {
    const errorData = error instanceof Error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      ...data,
    } : { error, ...data };

    this.log('error', message, errorData);
  }

  fatal(message: string, error?: Error | any, data?: any): void {
    const errorData = error instanceof Error ? {
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack,
      ...data,
    } : { error, ...data };

    this.log('fatal', message, errorData);
  }

  /   Create a child logger with additional context /
  child(additionalContext: Partial<ErrorContext>): Logger {
    return new Logger({
      ...this.context,
      ...additionalContext,
      correlationId: this.correlationId,
    });
  }
}

// ============================================================================
// Performance Monitoring
// ============================================================================

export class PerformanceMonitor {
  private enabled: boolean;

  constructor() {
    this.enabled = typeof process !== 'undefined' && process.env.VITE_FEATURE_PERFORMANCEMONITORING === 'true';
  }

  /   Track operation performance /
  async trackOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    let success = false;
    let error: string | undefined;

    try {
      const result = await fn();
      success = true;
      return result;
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      
      if (this.enabled) {
        this.recordMetric({
          operation,
          duration,
          success,
          error,
          metadata,
        });
      }
    }
  }

  /   Record a performance metric /
  private recordMetric(metric: PerformanceMetric): void {
    console.log('[PerformanceMonitor]', metric);

    // TODO: Send to monitoring service (Datadog, New Relic, etc.)
    // datadog.increment('operation.count', 1, { operation: metric.operation, success: metric.success });
    // datadog.histogram('operation.duration', metric.duration, { operation: metric.operation });
  }

  /   Create a timer for manual tracking /
  startTimer(operation: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.recordMetric({
        operation,
        duration,
        success: true,
      });
    };
  }
}

// ============================================================================
// Metrics Collector
// ============================================================================

export class MetricsCollector {
  private enabled: boolean;

  constructor() {
    this.enabled = typeof process !== 'undefined' && process.env.VITE_FEATURE_PERFORMANCEMONITORING === 'true';
  }

  /   Record a custom metric /
  recordMetric(metric: MetricData): void {
    if (!this.enabled) {
      console.debug('[Metrics] (disabled)', metric);
      return;
    }

    const enrichedMetric = {
      ...metric,
      timestamp: metric.timestamp || new Date().toISOString(),
    };

    console.log('[Metrics]', enrichedMetric);

    // TODO: Send to metrics service
    // datadog.gauge(metric.name, metric.value, metric.tags);
  }

  /   Increment a counter /
  increment(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.recordMetric({
      name,
      value,
      unit: 'count',
      tags,
    });
  }

  /   Record a gauge value /
  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name,
      value,
      unit: 'gauge',
      tags,
    });
  }

  /   Record a histogram value (for distributions) /
  histogram(name: string, value: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name,
      value,
      unit: 'histogram',
      tags,
    });
  }

  /   Record a timing value /
  timing(name: string, durationMs: number, tags?: Record<string, string>): void {
    this.recordMetric({
      name,
      value: durationMs,
      unit: 'milliseconds',
      tags,
    });
  }
}

// ============================================================================
// Singleton Instances
// ============================================================================

export const errorTracker = new ErrorTracker();
export const performanceMonitor = new PerformanceMonitor();
export const metricsCollector = new MetricsCollector();

/   Create a logger instance

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `context` | `ErrorContext` | ✓ |

**Returns:** `Logger`

_Source: `src/lib/observability.ts`_

---

### `getCorrelationId()`

Extract correlation ID from request or generate new one

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `req` | `any` |  |

**Returns:** `string`

_Source: `src/lib/observability.ts`_

---

### `createRequestLogger()`

Create logger from request context

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `req` | `any` |  |

**Returns:** `Logger`

_Source: `src/lib/observability.ts`_

---

### `createMockLead()`

Test Fixtures and Factories  Provides reusable test data factories for creating mock entities in tests without duplication. /

import type { Lead, Opportunity, Investor, Activity } from '../schemas/crm';

/   Creates a mock Lead with optional overrides

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `overrides` | `Partial<Lead>` | ✓ |

**Returns:** `Lead`

_Source: `src/lib/testFixtures.ts`_

---

### `createMockOpportunity()`

Creates a mock Opportunity with optional overrides

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `overrides` | `Partial<Opportunity>` | ✓ |

**Returns:** `Opportunity`

_Source: `src/lib/testFixtures.ts`_

---

### `createMockInvestor()`

Creates a mock Investor with optional overrides

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `overrides` | `Partial<Investor>` | ✓ |

**Returns:** `Investor`

_Source: `src/lib/testFixtures.ts`_

---

### `createMockActivity()`

Creates a mock Activity with optional overrides

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `overrides` | `Partial<Activity>` | ✓ |

**Returns:** `Activity`

_Source: `src/lib/testFixtures.ts`_

---

### `createEnrichedLead()`

Creates a mock Lead with enrichment data

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `overrides` | `Partial<Lead>` | ✓ |

**Returns:** `Lead`

_Source: `src/lib/testFixtures.ts`_

---

### `createMockLeads()`

Creates multiple mock leads

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `count` | `number` |  |
| `overrides` | `Partial<Lead>` | ✓ |

**Returns:** `Lead[]`

_Source: `src/lib/testFixtures.ts`_

---

### `mockLead()`

Testing Utilities  Helper functions and mock data for testing /

import { z } from 'zod';
import type { Lead, Opportunity, Investor, Activity } from './schemas/crm';
import { randomUUID } from 'crypto';

// ============================================================================
// Constants
// ============================================================================

/  Reserved UUID for system/test data that should not be deleted /
const RESERVED_TEST_UUID = '00000000-0000-0000-0000-000000000000';

// ============================================================================
// Mock Data Generators
// ============================================================================

/   Generate mock lead data

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `overrides` | `Partial<Lead>` | ✓ |

**Returns:** `Lead`

_Source: `src/lib/testUtils.ts`_

---

### `mockOpportunity()`

Generate mock opportunity data

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `overrides` | `Partial<Opportunity>` | ✓ |

**Returns:** `Opportunity`

_Source: `src/lib/testUtils.ts`_

---

### `mockInvestor()`

Generate mock investor data

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `overrides` | `Partial<Investor>` | ✓ |

**Returns:** `Investor`

_Source: `src/lib/testUtils.ts`_

---

### `mockActivity()`

Generate mock activity data

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `overrides` | `Partial<Activity>` | ✓ |

**Returns:** `Activity`

_Source: `src/lib/testUtils.ts`_

---

### `mockLeads()`

Generate array of mock data

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `count` | `number` |  |
| `overrides` | `Partial<Lead>` | ✓ |

**Returns:** `Lead[]`

_Source: `src/lib/testUtils.ts`_

---

### `wait()`

Mock successful API response /
export function mockApiSuccess<T>(data: T, correlationId: string = randomUUID()) {
  return {
    ok: true,
    data,
    correlationId,
  };
}

/   Mock error API response /
export function mockApiError(
  code: string = 'ERR_INTERNAL',
  message: string = 'Internal error',
  correlationId: string = randomUUID()
) {
  return {
    ok: false,
    error: {
      code,
      message,
    },
    correlationId,
  };
}

// ============================================================================
// Test Helpers
// ============================================================================

/   Wait for a specified time (useful in tests)

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `ms` | `number` |  |

**Returns:** `Promise<void>`

_Source: `src/lib/testUtils.ts`_

---

### `generateInsertSql()`

Mock fetch function for testing Note: Requires jest or compatible testing framework with fn() mock support /
export function mockFetch(response: any, status: number = 200) {
  const mockFn = (url: string, options?: RequestInit) =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response);

  // Add mock tracking if jest is available
  if (typeof jest !== 'undefined') {
    return jest.fn(mockFn) as any;
  }
  
  return mockFn as any;
}

/   Mock API client for testing /
export class MockApiClient {
  private responses: Map<string, any> = new Map();

  setResponse(endpoint: string, response: any): void {
    this.responses.set(endpoint, response);
  }

  async request(endpoint: string): Promise<any> {
    const response = this.responses.get(endpoint);
    if (!response) {
      return mockApiError('ERR_NOT_FOUND', 'Endpoint not mocked');
    }
    return response;
  }

  reset(): void {
    this.responses.clear();
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/   Assert that a value matches a schema /
export function assertValidSchema<T>(schema: z.ZodSchema<T>, value: any): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(`Validation failed: ${JSON.stringify(result.error.format())}`);
  }
  return result.data;
}

/   Check if object has required fields /
export function hasRequiredFields<T extends object>(
  obj: T,
  requiredFields: (keyof T)[]
): boolean {
  return requiredFields.every(field => obj[field] !== undefined && obj[field] !== null);
}

// ============================================================================
// Database Test Helpers
// ============================================================================

/   Generate SQL insert statement for testing

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `tableName` | `string` |  |
| `data` | `Record<string` |  |
| `any>` | `any` |  |

**Returns:** `string`

_Source: `src/lib/testUtils.ts`_

---

### `parseSearchQuery()`

Advanced search utilities for documentation portal Supports boolean operators: AND, OR, NOT /

export interface SearchToken {
  type: 'term' | 'and' | 'or' | 'not';
  value: string;
}

/   Parse search query into tokens supporting AND, OR, NOT operators Examples: - "testing AND deployment" - both terms must be present - "react OR vue" - either term must be present - "NOT deprecated" - term must not be present - "api AND testing OR development" - complex queries

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `query` | `string` |  |

**Returns:** `SearchToken[]`

_Source: `src/utils/advancedSearch.ts`_

---

### `evaluateSearch()`

Evaluate search tokens against searchable text

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `tokens` | `SearchToken[]` |  |
| `searchableText` | `string` |  |

**Returns:** `boolean`

_Source: `src/utils/advancedSearch.ts`_

---

### `highlightSearchTerms()`

Advanced search with boolean operators /
export function advancedSearch<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string
): T[] {
  const tokens = parseSearchQuery(query);
  
  if (tokens.length === 0) return items;

  return items.filter((item) => {
    const searchableText = getSearchableText(item);
    return evaluateSearch(tokens, searchableText);
  });
}

/   Highlight search terms in text

**Parameters:**

| Name | Type | Optional |
|------|------|----------|
| `text` | `string` |  |
| `query` | `string` |  |

**Returns:** `string`

_Source: `src/utils/advancedSearch.ts`_

---

### `getSearchHelp()`

Get search syntax help text

**Returns:** `string`

_Source: `src/utils/advancedSearch.ts`_

---

