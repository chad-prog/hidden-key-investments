/**
 * Tests for Mautic campaign enrollment deciders
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { addToCampaignIfHighValue, type Lead } from '../deciders';

describe('addToCampaignIfHighValue', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should not enroll when enrollment disabled', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'false';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '123';
    process.env.MAUTIC_HIGH_VALUE_THRESHOLD = '500000';

    const lead: Lead = {
      email: 'test@example.com',
      property: { estimatedValue: 600000 },
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(false);
    expect(result.reason).toContain('disabled');
    expect(result.campaignId).toBeUndefined();
  });

  it('should not enroll when campaign not configured', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    delete process.env.MAUTIC_CAMPAIGN_HIGH_VALUE;

    const lead: Lead = {
      email: 'test@example.com',
      property: { estimatedValue: 600000 },
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(false);
    expect(result.reason).toContain('not configured');
  });

  it('should not enroll when campaign is placeholder', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = 'placeholder';

    const lead: Lead = {
      email: 'test@example.com',
      property: { estimatedValue: 600000 },
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(false);
    expect(result.reason).toContain('not configured');
  });

  it('should not enroll when stage not eligible', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '123';
    process.env.MAUTIC_ELIGIBLE_STAGES = 'qualified,nurture,hot';
    process.env.MAUTIC_HIGH_VALUE_THRESHOLD = '500000';

    const lead: Lead = {
      email: 'test@example.com',
      stage: 'cold',
      property: { estimatedValue: 600000 },
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(false);
    expect(result.reason).toContain('not in eligible stages');
    expect(result.reason).toContain('cold');
  });

  it('should enroll when stage is eligible (case-insensitive)', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '123';
    process.env.MAUTIC_ELIGIBLE_STAGES = 'qualified,nurture,hot';
    process.env.MAUTIC_HIGH_VALUE_THRESHOLD = '500000';

    const lead: Lead = {
      email: 'test@example.com',
      stage: 'QUALIFIED', // Uppercase
      property: { estimatedValue: 600000 },
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(true);
    expect(result.campaignId).toBe('123');
  });

  it('should not enroll when property value below threshold', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '123';
    process.env.MAUTIC_HIGH_VALUE_THRESHOLD = '500000';

    const lead: Lead = {
      email: 'test@example.com',
      property: { estimatedValue: 400000 },
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(false);
    expect(result.reason).toContain('below threshold');
    expect(result.reason).toContain('400000');
    expect(result.reason).toContain('500000');
  });

  it('should not enroll when property value is missing', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '123';
    process.env.MAUTIC_HIGH_VALUE_THRESHOLD = '500000';

    const lead: Lead = {
      email: 'test@example.com',
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(false);
    expect(result.reason).toContain('below threshold');
  });

  it('should enroll when property value meets threshold', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '123';
    process.env.MAUTIC_HIGH_VALUE_THRESHOLD = '500000';

    const lead: Lead = {
      email: 'test@example.com',
      property: { estimatedValue: 500000 },
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(true);
    expect(result.reason).toContain('high-value criteria');
    expect(result.campaignId).toBe('123');
  });

  it('should enroll when property value exceeds threshold', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '456';
    process.env.MAUTIC_HIGH_VALUE_THRESHOLD = '1000000';

    const lead: Lead = {
      email: 'test@example.com',
      property: { estimatedValue: 2000000 },
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(true);
    expect(result.campaignId).toBe('456');
  });

  it('should enroll when no threshold set', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '789';
    delete process.env.MAUTIC_HIGH_VALUE_THRESHOLD;

    const lead: Lead = {
      email: 'test@example.com',
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(true);
    expect(result.campaignId).toBe('789');
  });

  it('should enroll when no eligible stages set', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '123';
    delete process.env.MAUTIC_ELIGIBLE_STAGES;

    const lead: Lead = {
      email: 'test@example.com',
      stage: 'any-stage',
      property: { estimatedValue: 600000 },
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(true);
  });

  it('should handle empty eligible stages string', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '123';
    process.env.MAUTIC_ELIGIBLE_STAGES = '';

    const lead: Lead = {
      email: 'test@example.com',
      stage: 'any-stage',
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(true);
  });

  it('should handle whitespace in eligible stages', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '123';
    process.env.MAUTIC_ELIGIBLE_STAGES = ' qualified , nurture , hot ';

    const lead: Lead = {
      email: 'test@example.com',
      stage: 'nurture',
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(true);
  });

  it('should enroll when lead has no stage but stages not required', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '123';
    process.env.MAUTIC_ELIGIBLE_STAGES = 'qualified,nurture';
    process.env.MAUTIC_HIGH_VALUE_THRESHOLD = '500000';

    const lead: Lead = {
      email: 'test@example.com',
      property: { estimatedValue: 600000 },
      // No stage property
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(true);
  });

  it('should support numeric campaign IDs', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '999';

    const lead: Lead = {
      email: 'test@example.com',
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(true);
    expect(result.campaignId).toBe('999');
  });

  it('should work with all conditions met', () => {
    process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
    process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = '42';
    process.env.MAUTIC_HIGH_VALUE_THRESHOLD = '750000';
    process.env.MAUTIC_ELIGIBLE_STAGES = 'qualified,hot';

    const lead: Lead = {
      email: 'vip@example.com',
      stage: 'hot',
      property: { estimatedValue: 1000000 },
    };

    const result = addToCampaignIfHighValue(lead);

    expect(result.shouldEnroll).toBe(true);
    expect(result.reason).toBe('Lead meets high-value criteria');
    expect(result.campaignId).toBe('42');
  });
});
