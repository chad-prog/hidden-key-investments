/**
 * Test Fixtures and Factories
 * 
 * Provides reusable test data factories for creating mock entities
 * in tests without duplication.
 */

import type { Lead, Opportunity, Investor, Activity } from '../schemas/crm';

/**
 * Creates a mock Lead with optional overrides
 */
export function createMockLead(overrides?: Partial<Lead>): Lead {
  const now = new Date();
  const id = `lead_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    source: 'website',
    status: 'new',
    contact: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      preferredContact: 'email',
    },
    property: {
      address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      propertyType: 'multi_family',
      estimatedValue: 500000,
    },
    enrichmentData: {},
    tags: [],
    customFields: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Creates a mock Opportunity with optional overrides
 */
export function createMockOpportunity(overrides?: Partial<Opportunity>): Opportunity {
  const now = new Date();
  const id = `opp_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name: 'Test Opportunity',
    stage: 'prospecting',
    dealType: 'acquisition',
    estimatedValue: 1000000,
    expectedReturn: 0.15,
    probability: 0.5,
    property: {
      address: '456 Investment Ave',
      city: 'Dallas',
      state: 'TX',
      zip: '75201',
      propertyType: 'commercial',
      estimatedValue: 1000000,
    },
    documents: [],
    tags: [],
    customFields: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Creates a mock Investor with optional overrides
 */
export function createMockInvestor(overrides?: Partial<Investor>): Investor {
  const now = new Date();
  const id = `inv_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    type: 'individual',
    status: 'active',
    contact: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1987654321',
      preferredContact: 'email',
    },
    investmentProfile: {
      minInvestment: 50000,
      maxInvestment: 500000,
      preferredPropertyTypes: ['multi_family', 'commercial'],
      preferredLocations: ['TX', 'CA'],
      riskTolerance: 'moderate',
    },
    accreditation: {
      status: 'verified',
      verifiedAt: now,
      expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
    totalInvested: 0,
    activeDealCount: 0,
    completedDealCount: 0,
    tags: [],
    customFields: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Creates a mock Activity with optional overrides
 */
export function createMockActivity(overrides?: Partial<Activity>): Activity {
  const now = new Date();
  const id = `act_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    type: 'call',
    subject: 'Follow-up call',
    description: 'Initial outreach to discuss investment opportunity',
    createdBy: 'user_123',
    metadata: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Creates a mock Lead with enrichment data
 */
export function createEnrichedLead(overrides?: Partial<Lead>): Lead {
  return createMockLead({
    enrichmentData: {
      phoneValidation: {
        valid: true,
        type: 'mobile',
        carrier: 'Verizon',
      },
      emailValidation: {
        valid: true,
        disposable: false,
        freeProvider: false,
      },
      propertyData: {
        parcelId: 'TX-TRAVIS-12345',
        yearBuilt: 1985,
        lotSize: 10000,
        buildingSize: 5000,
        lastSalePrice: 450000,
        lastSaleDate: '2020-06-15',
      },
    },
    score: 85,
    scoreReason: 'High property value, verified contact info',
    ...overrides,
  });
}

/**
 * Creates multiple mock leads
 */
export function createMockLeads(count: number, overrides?: Partial<Lead>): Lead[] {
  return Array.from({ length: count }, (_, i) =>
    createMockLead({
      ...overrides,
      contact: {
        firstName: `Lead${i}`,
        lastName: 'Test',
        email: `lead${i}@example.com`,
        phone: `+123456789${i}`,
        preferredContact: 'email',
      },
    })
  );
}

/**
 * Creates a complete CRM dataset for testing
 */
export function createMockCRMDataset() {
  const leads = createMockLeads(5);
  const opportunities = leads.slice(0, 3).map((lead) =>
    createMockOpportunity({
      leadId: lead.id,
      name: `Deal for ${lead.contact.firstName}`,
    })
  );
  const investors = Array.from({ length: 3 }, (_, i) =>
    createMockInvestor({
      contact: {
        firstName: `Investor${i}`,
        lastName: 'Active',
        email: `investor${i}@example.com`,
        phone: `+198765432${i}`,
        preferredContact: 'email',
      },
    })
  );
  const activities: Activity[] = [];
  
  // Create activities for each lead
  leads.forEach((lead) => {
    activities.push(
      createMockActivity({
        leadId: lead.id,
        subject: `Initial contact for ${lead.contact.firstName}`,
      })
    );
  });
  
  return { leads, opportunities, investors, activities };
}

/**
 * Creates a mock workflow for testing
 */
export function createMockWorkflow() {
  return {
    id: `wf_${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Workflow',
    description: 'Automated workflow for testing',
    trigger: {
      type: 'lead_created' as const,
    },
    conditions: [
      {
        field: 'contact.email',
        operator: 'is_not_null' as const,
        value: null,
      },
    ],
    actions: [
      {
        type: 'send_email' as const,
        order: 0,
        config: {
          to: '{{contact.email}}',
          subject: 'Welcome',
          template: 'welcome_email',
        },
      },
    ],
    enabled: true,
    priority: 10,
    createdBy: 'user_123',
    tags: ['test'],
    createdAt: new Date(),
    updatedAt: new Date(),
    executionCount: 0,
  };
}

/**
 * Mock Supabase client for testing
 */
export const createMockSupabaseClient = () => ({
  from: (table: string) => ({
    select: () => ({
      data: [],
      error: null,
    }),
    insert: (data: any) => ({
      data: [{ ...data, id: `mock_${Math.random()}` }],
      error: null,
    }),
    update: (data: any) => ({
      eq: () => ({
        data: [data],
        error: null,
      }),
    }),
    delete: () => ({
      eq: () => ({
        data: [],
        error: null,
      }),
    }),
  }),
});

/**
 * Mock API response
 */
export function createMockAPIResponse<T>(data: T, ok = true) {
  return {
    ok,
    status: ok ? 200 : 400,
    data: ok ? data : undefined,
    error: ok ? undefined : { message: 'Mock error' },
    correlationId: `corr_${Math.random().toString(36).substr(2, 9)}`,
  };
}

/**
 * Mock Netlify function event
 */
export function createMockNetlifyEvent(body: any = {}) {
  return {
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '127.0.0.1',
    },
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/.netlify/functions/test',
    queryStringParameters: {},
    rawUrl: 'http://localhost:8888/.netlify/functions/test',
  };
}

/**
 * Mock Netlify function context
 */
export function createMockNetlifyContext() {
  return {
    callbackWaitsForEmptyEventLoop: true,
    functionName: 'test-function',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test',
    memoryLimitInMB: '1024',
    awsRequestId: `req_${Math.random().toString(36).substr(2, 9)}`,
    logGroupName: '/aws/lambda/test',
    logStreamName: '2024/10/27/[$LATEST]abcd1234',
    identity: undefined,
    clientContext: undefined,
  };
}
