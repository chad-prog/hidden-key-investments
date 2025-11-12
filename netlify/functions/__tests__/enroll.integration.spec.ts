/**
 * Integration test for enrollment flow
 * 
 * Tests the full enrollment flow from lead scoring to campaign addition
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Campaign enrollment integration', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch as any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Set up environment for enrollment
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_HIGH_VALUE_THRESHOLD = '70';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = 'campaign-123';
    process.env.MAUTIC_ELIGIBLE_STAGES = 'qualified,converted';
    process.env.MAUTIC_BASE_URL = 'https://test.mautic.com';
    process.env.MAUTIC_CLIENT_ID = 'test-client';
    process.env.MAUTIC_CLIENT_SECRET = 'test-secret';
  });

  it('enrolls high-value qualified lead in campaign', async () => {
    const { shouldEnrollInHighValueCampaign } = await import('../../../src/lib/mautic/deciders');
    const { handler: mauticSyncHandler } = await import('../mautic-sync');

    // Test the decision logic
    const decision = shouldEnrollInHighValueCampaign(85, 'qualified');
    
    expect(decision.shouldEnroll).toBe(true);
    expect(decision.campaignId).toBe('campaign-123');
    expect(decision.reason).toContain('High-value lead');

    // Mock the API calls for add_to_campaign
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'test-token',
        expires_in: 3600,
      }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Simulate the add_to_campaign call
    const event = {
      httpMethod: 'POST',
      headers: {},
      queryStringParameters: null,
      body: JSON.stringify({
        action: 'add_to_campaign',
        mauticContactId: '456',
        campaignId: decision.campaignId,
      }),
      path: '/.netlify/functions/mautic-sync',
      rawUrl: 'http://localhost:8888/.netlify/functions/mautic-sync',
      rawQuery: '',
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
    };

    const response = await mauticSyncHandler(event, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.success).toBe(true);
    
    // Verify the fetch call was made with correct parameters
    const addToCampaignCall = mockFetch.mock.calls.find(call => 
      call[0].includes('/campaigns/')
    );
    expect(addToCampaignCall).toBeDefined();
    expect(addToCampaignCall![0]).toContain('campaign-123');
    expect(addToCampaignCall![0]).toContain('456');
  });

  it('does not enroll low-score lead', async () => {
    const { shouldEnrollInHighValueCampaign } = await import('../../../src/lib/mautic/deciders');

    const decision = shouldEnrollInHighValueCampaign(50, 'qualified');
    
    expect(decision.shouldEnroll).toBe(false);
    expect(decision.reason).toContain('below threshold');
    expect(decision.campaignId).toBeUndefined();
  });

  it('does not enroll lead with ineligible status', async () => {
    const { shouldEnrollInHighValueCampaign } = await import('../../../src/lib/mautic/deciders');

    const decision = shouldEnrollInHighValueCampaign(85, 'new');
    
    expect(decision.shouldEnroll).toBe(false);
    expect(decision.reason).toContain('not in eligible stages');
    expect(decision.campaignId).toBeUndefined();
  });

  it('full enrollment flow with upsert and add_to_campaign', async () => {
    const { shouldEnrollInHighValueCampaign } = await import('../../../src/lib/mautic/deciders');
    const { handler: mauticSyncHandler, __resetTokenCache } = await import('../mautic-sync');

    __resetTokenCache();

    // Step 1: Check if lead should be enrolled
    const leadScore = 85;
    const crmStatus = 'qualified';
    const decision = shouldEnrollInHighValueCampaign(leadScore, crmStatus);
    
    expect(decision.shouldEnroll).toBe(true);

    // Step 2: Upsert contact
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: 'test-token',
        expires_in: 3600,
      }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ contacts: {} }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        contact: { id: 789 },
      }),
    });

    const upsertEvent = {
      httpMethod: 'POST',
      headers: {},
      queryStringParameters: null,
      body: JSON.stringify({
        action: 'upsert_contact',
        payload: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          crm_status: crmStatus,
          ml: { score: leadScore },
          contact: {
            email: 'highvalue@example.com',
            first_name: 'High',
            last_name: 'Value',
          },
        },
      }),
      path: '/.netlify/functions/mautic-sync',
      rawUrl: 'http://localhost:8888/.netlify/functions/mautic-sync',
      rawQuery: '',
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
    };

    const upsertResponse = await mauticSyncHandler(upsertEvent, {} as any);
    const upsertBody = JSON.parse(upsertResponse.body);

    expect(upsertResponse.statusCode).toBe(200);
    expect(upsertBody.ok).toBe(true);
    expect(upsertBody.data.contactId).toBe(789); // Number, not string

    // Step 3: Add to campaign
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const enrollEvent = {
      httpMethod: 'POST',
      headers: {},
      queryStringParameters: null,
      body: JSON.stringify({
        action: 'add_to_campaign',
        mauticContactId: String(upsertBody.data.contactId),
        campaignId: decision.campaignId,
      }),
      path: '/.netlify/functions/mautic-sync',
      rawUrl: 'http://localhost:8888/.netlify/functions/mautic-sync',
      rawQuery: '',
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
    };

    const enrollResponse = await mauticSyncHandler(enrollEvent, {} as any);
    const enrollBody = JSON.parse(enrollResponse.body);

    expect(enrollResponse.statusCode).toBe(200);
    expect(enrollBody.ok).toBe(true);
    expect(enrollBody.data.success).toBe(true);
  });

  it('handles enrollment when disabled', async () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'false';
    
    const { shouldEnrollInHighValueCampaign } = await import('../../../src/lib/mautic/deciders');

    const decision = shouldEnrollInHighValueCampaign(85, 'qualified');
    
    expect(decision.shouldEnroll).toBe(false);
    expect(decision.reason).toContain('disabled');
  });
});
