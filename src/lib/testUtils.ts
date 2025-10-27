/**
 * Testing Utilities
 * 
 * Helper functions and mock data for testing
 */

import { z } from 'zod';
import type { Lead, Opportunity, Investor, Activity } from './schemas/crm';
import { randomUUID } from 'crypto';

// ============================================================================
// Constants
// ============================================================================

/** Reserved UUID for system/test data that should not be deleted */
const RESERVED_TEST_UUID = '00000000-0000-0000-0000-000000000000';

// ============================================================================
// Mock Data Generators
// ============================================================================

/**
 * Generate mock lead data
 */
export function mockLead(overrides?: Partial<Lead>): Lead {
  return {
    id: randomUUID(),
    source: 'website',
    status: 'new',
    firstName: 'John',
    lastName: 'Doe',
    contact: {
      email: 'john.doe@example.com',
      phone: '+1234567890',
      preferredContact: 'email',
      doNotContact: false,
    },
    property: {
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      propertyType: 'multi_family',
      estimatedValue: 500000,
    },
    enrichmentData: {
      emailValidated: true,
      phoneValidated: true,
      ownershipVerified: false,
    },
    score: 75,
    scoreReason: 'Good fit based on property type and location',
    tags: ['accredited', 'texas'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Generate mock opportunity data
 */
export function mockOpportunity(overrides?: Partial<Opportunity>): Opportunity {
  return {
    id: randomUUID(),
    leadId: randomUUID(),
    name: 'Austin Multi-Family Acquisition',
    stage: 'qualification',
    dealType: 'acquisition',
    estimatedValue: 2500000,
    expectedReturn: 15,
    expectedCloseDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    probability: 60,
    riskScore: 30,
    secondaryInvestors: [],
    documents: [],
    tags: ['austin', 'multi-family'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Generate mock investor data
 */
export function mockInvestor(overrides?: Partial<Investor>): Investor {
  return {
    id: randomUUID(),
    firstName: 'Jane',
    lastName: 'Smith',
    type: 'accredited',
    status: 'active',
    contact: {
      email: 'jane.smith@example.com',
      phone: '+1987654321',
      preferredContact: 'email',
      doNotContact: false,
    },
    address: {
      street: '456 Oak Ave',
      city: 'Houston',
      state: 'TX',
      zip: '77001',
      country: 'US',
    },
    investmentProfile: {
      minInvestment: 50000,
      maxInvestment: 500000,
      preferredDealTypes: ['acquisition', 'syndication'],
      preferredPropertyTypes: ['multi_family', 'commercial'],
      preferredLocations: ['TX', 'CA', 'FL'],
      riskTolerance: 'medium',
    },
    accreditation: {
      isAccredited: true,
      verifiedAt: new Date(),
    },
    totalInvested: 1250000,
    activeDeals: 3,
    completedDeals: 7,
    averageReturn: 12.5,
    tags: ['high-net-worth', 'texas'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Generate mock activity data
 */
export function mockActivity(overrides?: Partial<Activity>): Activity {
  return {
    id: randomUUID(),
    type: 'call',
    leadId: randomUUID(),
    subject: 'Initial qualification call',
    description: 'Discussed investment goals and property preferences',
    outcome: 'Interested in multi-family properties in Texas',
    scheduledAt: new Date(),
    completedAt: new Date(),
    createdBy: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Generate array of mock data
 */
export function mockLeads(count: number, overrides?: Partial<Lead>): Lead[] {
  return Array.from({ length: count }, () => mockLead(overrides));
}

export function mockOpportunities(count: number, overrides?: Partial<Opportunity>): Opportunity[] {
  return Array.from({ length: count }, () => mockOpportunity(overrides));
}

export function mockInvestors(count: number, overrides?: Partial<Investor>): Investor[] {
  return Array.from({ length: count }, () => mockInvestor(overrides));
}

export function mockActivities(count: number, overrides?: Partial<Activity>): Activity[] {
  return Array.from({ length: count }, () => mockActivity(overrides));
}

// ============================================================================
// API Response Mocks
// ============================================================================

/**
 * Mock successful API response
 */
export function mockApiSuccess<T>(data: T, correlationId: string = randomUUID()) {
  return {
    ok: true,
    data,
    correlationId,
  };
}

/**
 * Mock error API response
 */
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

/**
 * Wait for a specified time (useful in tests)
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock fetch function for testing
 * Note: Requires jest or compatible testing framework with fn() mock support
 */
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

/**
 * Mock API client for testing
 */
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

/**
 * Assert that a value matches a schema
 */
export function assertValidSchema<T>(schema: z.ZodSchema<T>, value: any): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(`Validation failed: ${JSON.stringify(result.error.format())}`);
  }
  return result.data;
}

/**
 * Check if object has required fields
 */
export function hasRequiredFields<T extends object>(
  obj: T,
  requiredFields: (keyof T)[]
): boolean {
  return requiredFields.every(field => obj[field] !== undefined && obj[field] !== null);
}

// ============================================================================
// Database Test Helpers
// ============================================================================

/**
 * Generate SQL insert statement for testing
 */
export function generateInsertSql(tableName: string, data: Record<string, any>): string {
  const columns = Object.keys(data).join(', ');
  const values = Object.values(data)
    .map(v => {
      if (v === null) return 'NULL';
      if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      if (typeof v === 'object') return `'${JSON.stringify(v)}'::jsonb`;
      return v;
    })
    .join(', ');

  return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
}

/**
 * Clean test data from database
 * Removes all records except those with the reserved test UUID
 */
export async function cleanupTestData(
  supabase: { from: (table: string) => { delete: () => { neq: (column: string, value: string) => Promise<any> } } },
  tables: string[]
): Promise<void> {
  for (const table of tables) {
    await supabase.from(table).delete().neq('id', RESERVED_TEST_UUID);
  }
}

// ============================================================================
// Workflow Test Helpers
// ============================================================================

/**
 * Mock workflow execution
 */
export function mockWorkflowExecution(workflowId: string, entityId: string) {
  return {
    id: randomUUID(),
    workflowId,
    trigger: {
      type: 'lead_created' as const,
      entityType: 'lead' as const,
      entityId,
      payload: {},
    },
    status: 'completed' as const,
    startedAt: new Date(),
    completedAt: new Date(),
    actionResults: [
      {
        action: {
          type: 'send_email' as const,
          config: { to: 'test@example.com' },
          order: 0,
          stopOnError: false,
        },
        status: 'completed' as const,
        executedAt: new Date(),
        result: { sent: true },
      },
    ],
    retryCount: 0,
  };
}

// ============================================================================
// Performance Test Helpers
// ============================================================================

/**
 * Measure execution time of a function
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  const start = Date.now();
  const result = await fn();
  const durationMs = Date.now() - start;
  return { result, durationMs };
}

/**
 * Run benchmark test
 */
export async function benchmark(
  name: string,
  fn: () => Promise<void>,
  iterations: number = 100
): Promise<{ avgMs: number; minMs: number; maxMs: number }> {
  const durations: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const { durationMs } = await measureExecutionTime(fn);
    durations.push(durationMs);
  }

  const avgMs = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minMs = Math.min(...durations);
  const maxMs = Math.max(...durations);

  console.log(`[Benchmark] ${name}: avg=${avgMs.toFixed(2)}ms, min=${minMs}ms, max=${maxMs}ms`);

  return { avgMs, minMs, maxMs };
}

// ============================================================================
// Export all utilities
// ============================================================================

export const testUtils = {
  // Mock generators
  mockLead,
  mockOpportunity,
  mockInvestor,
  mockActivity,
  mockLeads,
  mockOpportunities,
  mockInvestors,
  mockActivities,
  
  // API mocks
  mockApiSuccess,
  mockApiError,
  mockFetch,
  MockApiClient,
  
  // Helpers
  wait,
  assertValidSchema,
  hasRequiredFields,
  generateInsertSql,
  cleanupTestData,
  mockWorkflowExecution,
  measureExecutionTime,
  benchmark,
};
