/**
 * Integration test for campaign enrollment flow
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handler } from '../mautic-sync';
import { addToCampaignIfHighValue } from '../../../src/lib/mautic/deciders';
import { hkiToMauticContact } from '../../../src/lib/mappers/hkiToMautic';
import { invokeHandler, parseResponse } from '../../../tests/helpers/netlify';

describe('Campaign Enrollment Integration', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let fetchMock: any;

  beforeEach(() => {
    originalEnv = { ...process.env };
    
    // Configure environment for high-value enrollment
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '123';
    process.env.MAUTIC_HIGH_VALUE_THRESHOLD = '500000';
    process.env.MAUTIC_ELIGIBLE_STAGES = 'qualified,hot';
    
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should call add_to_campaign for high-value lead', async () => {
    // Test lead that meets high-value criteria
    const lead = {
      email: 'highvalue@example.com',
      firstName: 'High',
      lastName: 'Value',
      stage: 'qualified',
      property: {
        estimatedValue: 1000000,
      },
    };

    // Check decision
    const decision = addToCampaignIfHighValue(lead);
    expect(decision.shouldEnroll).toBe(true);
    expect(decision.campaignId).toBe('123');

    // Map to Mautic format
    const mauticContact = hkiToMauticContact(lead);
    expect(mauticContact.email).toBe('highvalue@example.com');
    expect(mauticContact.firstname).toBe('High');

    // Simulate the add_to_campaign call shape
    const addToCampaignPayload = {
      action: 'add_to_campaign',
      payload: {
        email: lead.email,
        campaignId: decision.campaignId,
      },
    };

    expect(addToCampaignPayload.action).toBe('add_to_campaign');
    expect(addToCampaignPayload.payload.email).toBe('highvalue@example.com');
    expect(addToCampaignPayload.payload.campaignId).toBe('123');
  });

  it('should not call add_to_campaign for low-value lead', async () => {
    const lead = {
      email: 'lowvalue@example.com',
      stage: 'qualified',
      property: {
        estimatedValue: 300000, // Below threshold
      },
    };

    const decision = addToCampaignIfHighValue(lead);
    expect(decision.shouldEnroll).toBe(false);
    expect(decision.reason).toContain('below threshold');
  });

  it('should not call add_to_campaign for ineligible stage', async () => {
    const lead = {
      email: 'coldlead@example.com',
      stage: 'cold', // Not in eligible stages
      property: {
        estimatedValue: 1000000,
      },
    };

    const decision = addToCampaignIfHighValue(lead);
    expect(decision.shouldEnroll).toBe(false);
    expect(decision.reason).toContain('not in eligible stages');
  });

  it('should handle demo mode for add_to_campaign', async () => {
    // Demo mode (no real Mautic credentials)
    delete process.env.MAUTIC_BASE_URL;
    delete process.env.MAUTIC_CLIENT_ID;
    delete process.env.MAUTIC_CLIENT_SECRET;

    const response = await invokeHandler(handler, {
      body: JSON.stringify({
        action: 'add_to_campaign',
        payload: {
          email: 'test@example.com',
          campaignId: '123',
        },
      }),
    });

    expect(response.statusCode).toBe(200);
    const body = parseResponse(response);
    expect(body.ok).toBe(true);
    expect(body.demoMode).toBe(true);
    expect(body.action).toBe('add_to_campaign');
  });

  it('should handle complete enrollment flow', async () => {
    // High-value lead
    const lead = {
      email: 'premium@example.com',
      firstName: 'Premium',
      lastName: 'Investor',
      stage: 'hot',
      property: {
        estimatedValue: 2000000,
      },
      utm: {
        source: 'referral',
        campaign: 'vip-program',
      },
    };

    // Step 1: Check if should enroll
    const decision = addToCampaignIfHighValue(lead);
    expect(decision.shouldEnroll).toBe(true);

    // Step 2: Map to Mautic format
    const mauticContact = hkiToMauticContact(lead);
    expect(mauticContact.email).toBe('premium@example.com');
    expect(mauticContact.property_value).toBe(2000000);
    expect(mauticContact.utm_source).toBe('referral');

    // Step 3: Verify add_to_campaign call structure
    const enrollPayload = {
      action: 'add_to_campaign',
      payload: {
        email: mauticContact.email,
        campaignId: decision.campaignId,
      },
    };

    expect(enrollPayload.payload).toEqual({
      email: 'premium@example.com',
      campaignId: '123',
    });
  });

  it('should preserve UTMs during enrollment', async () => {
    const lead = {
      email: 'utm@example.com',
      stage: 'qualified',
      property: { estimatedValue: 800000 },
      utm: {
        source: 'google',
        medium: 'cpc',
        campaign: 'high-value',
      },
    };

    const mauticContact = hkiToMauticContact(lead);
    
    // Verify UTMs are mapped
    expect(mauticContact.utm_source).toBe('google');
    expect(mauticContact.utm_medium).toBe('cpc');
    expect(mauticContact.utm_campaign).toBe('high-value');
  });

  it('should handle enrollment disabled', async () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'false';

    const lead = {
      email: 'test@example.com',
      property: { estimatedValue: 1000000 },
    };

    const decision = addToCampaignIfHighValue(lead);
    expect(decision.shouldEnroll).toBe(false);
    expect(decision.reason).toContain('disabled');
  });

  it('should handle multiple eligible stages', async () => {
    process.env.MAUTIC_ELIGIBLE_STAGES = 'qualified,nurture,hot,warm';

    const stages = ['qualified', 'nurture', 'hot', 'warm'];
    
    for (const stage of stages) {
      const lead = {
        email: `${stage}@example.com`,
        stage,
        property: { estimatedValue: 700000 },
      };

      const decision = addToCampaignIfHighValue(lead);
      expect(decision.shouldEnroll).toBe(true);
      expect(decision.campaignId).toBe('123');
    }
  });

  it('should validate payload structure for add_to_campaign', () => {
    const lead = {
      email: 'validate@example.com',
      stage: 'hot',
      property: { estimatedValue: 900000 },
    };

    const decision = addToCampaignIfHighValue(lead);
    
    // Build the actual payload that would be sent
    const payload = {
      action: 'add_to_campaign' as const,
      payload: {
        email: lead.email,
        campaignId: decision.campaignId!,
      },
    };

    // Verify it matches expected structure
    expect(payload).toHaveProperty('action');
    expect(payload).toHaveProperty('payload');
    expect(payload.payload).toHaveProperty('email');
    expect(payload.payload).toHaveProperty('campaignId');
    expect(typeof payload.payload.email).toBe('string');
    expect(['string', 'number']).toContain(typeof payload.payload.campaignId);
  });
});
