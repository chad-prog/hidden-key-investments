/**
 * Unit tests for Mautic campaign enrollment deciders
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  addToCampaignIfHighValue,
  parseEnrollmentConfig,
  shouldEnrollInHighValueCampaign,
  type CampaignEnrollmentConfig,
} from '../deciders';

describe('Mautic deciders', () => {
  describe('parseEnrollmentConfig', () => {
    it('parses valid configuration from env', () => {
      const env = {
        MAUTIC_ENROLLMENT_ENABLED: 'true',
        MAUTIC_HIGH_VALUE_THRESHOLD: '80',
        MAUTIC_CAMPAIGN_HIGH_VALUE: 'campaign-123',
        MAUTIC_ELIGIBLE_STAGES: 'qualified,converted,nurturing',
      };

      const config = parseEnrollmentConfig(env);

      expect(config.enrollmentEnabled).toBe(true);
      expect(config.highValueThreshold).toBe(80);
      expect(config.campaignId).toBe('campaign-123');
      expect(config.eligibleStages).toEqual(['qualified', 'converted', 'nurturing']);
    });

    it('uses default values when env vars missing', () => {
      const env = {};

      const config = parseEnrollmentConfig(env);

      expect(config.enrollmentEnabled).toBe(false);
      expect(config.highValueThreshold).toBe(70);
      expect(config.campaignId).toBeNull();
      expect(config.eligibleStages).toEqual(['qualified', 'converted']);
    });

    it('handles partial configuration', () => {
      const env = {
        MAUTIC_ENROLLMENT_ENABLED: 'true',
        MAUTIC_CAMPAIGN_HIGH_VALUE: 'campaign-456',
      };

      const config = parseEnrollmentConfig(env);

      expect(config.enrollmentEnabled).toBe(true);
      expect(config.highValueThreshold).toBe(70); // default
      expect(config.campaignId).toBe('campaign-456');
      expect(config.eligibleStages).toEqual(['qualified', 'converted']); // default
    });

    it('trims whitespace from eligible stages', () => {
      const env = {
        MAUTIC_ELIGIBLE_STAGES: 'qualified , converted , nurturing',
      };

      const config = parseEnrollmentConfig(env);

      expect(config.eligibleStages).toEqual(['qualified', 'converted', 'nurturing']);
    });
  });

  describe('addToCampaignIfHighValue', () => {
    const baseConfig: CampaignEnrollmentConfig = {
      enrollmentEnabled: true,
      highValueThreshold: 70,
      campaignId: 'campaign-123',
      eligibleStages: ['qualified', 'converted'],
    };

    it('enrolls high-value qualified lead', () => {
      const decision = addToCampaignIfHighValue(85, 'qualified', baseConfig);

      expect(decision.shouldEnroll).toBe(true);
      expect(decision.campaignId).toBe('campaign-123');
      expect(decision.reason).toContain('High-value lead');
      expect(decision.reason).toContain('85');
      expect(decision.reason).toContain('qualified');
    });

    it('enrolls lead at exact threshold', () => {
      const decision = addToCampaignIfHighValue(70, 'qualified', baseConfig);

      expect(decision.shouldEnroll).toBe(true);
      expect(decision.campaignId).toBe('campaign-123');
    });

    it('does not enroll lead below threshold', () => {
      const decision = addToCampaignIfHighValue(69, 'qualified', baseConfig);

      expect(decision.shouldEnroll).toBe(false);
      expect(decision.reason).toContain('below threshold');
      expect(decision.reason).toContain('69');
      expect(decision.reason).toContain('70');
      expect(decision.campaignId).toBeUndefined();
    });

    it('does not enroll lead with ineligible status', () => {
      const decision = addToCampaignIfHighValue(85, 'new', baseConfig);

      expect(decision.shouldEnroll).toBe(false);
      expect(decision.reason).toContain('not in eligible stages');
      expect(decision.reason).toContain('new');
    });

    it('does not enroll when enrollment disabled', () => {
      const config = { ...baseConfig, enrollmentEnabled: false };
      const decision = addToCampaignIfHighValue(85, 'qualified', config);

      expect(decision.shouldEnroll).toBe(false);
      expect(decision.reason).toContain('disabled');
    });

    it('does not enroll when campaign ID missing', () => {
      const config = { ...baseConfig, campaignId: null };
      const decision = addToCampaignIfHighValue(85, 'qualified', config);

      expect(decision.shouldEnroll).toBe(false);
      expect(decision.reason).toContain('No campaign ID configured');
    });

    it('does not enroll lead with null score', () => {
      const decision = addToCampaignIfHighValue(null, 'qualified', baseConfig);

      expect(decision.shouldEnroll).toBe(false);
      expect(decision.reason).toContain('no score');
    });

    it('does not enroll lead with undefined score', () => {
      const decision = addToCampaignIfHighValue(undefined, 'qualified', baseConfig);

      expect(decision.shouldEnroll).toBe(false);
      expect(decision.reason).toContain('no score');
    });

    it('does not enroll lead with null CRM status', () => {
      const decision = addToCampaignIfHighValue(85, null, baseConfig);

      expect(decision.shouldEnroll).toBe(false);
      expect(decision.reason).toContain('no CRM status');
    });

    it('does not enroll lead with undefined CRM status', () => {
      const decision = addToCampaignIfHighValue(85, undefined, baseConfig);

      expect(decision.shouldEnroll).toBe(false);
      expect(decision.reason).toContain('no CRM status');
    });

    it('works with multiple eligible stages', () => {
      const config: CampaignEnrollmentConfig = {
        ...baseConfig,
        eligibleStages: ['qualified', 'converted', 'nurturing', 'contacted'],
      };

      const decision1 = addToCampaignIfHighValue(85, 'nurturing', config);
      expect(decision1.shouldEnroll).toBe(true);

      const decision2 = addToCampaignIfHighValue(85, 'contacted', config);
      expect(decision2.shouldEnroll).toBe(true);

      const decision3 = addToCampaignIfHighValue(85, 'new', config);
      expect(decision3.shouldEnroll).toBe(false);
    });

    it('handles zero score', () => {
      const decision = addToCampaignIfHighValue(0, 'qualified', baseConfig);

      expect(decision.shouldEnroll).toBe(false);
      expect(decision.reason).toContain('below threshold');
    });

    it('handles high threshold', () => {
      const config = { ...baseConfig, highValueThreshold: 95 };
      
      const decision1 = addToCampaignIfHighValue(94, 'qualified', config);
      expect(decision1.shouldEnroll).toBe(false);
      
      const decision2 = addToCampaignIfHighValue(95, 'qualified', config);
      expect(decision2.shouldEnroll).toBe(true);
    });
  });

  describe('shouldEnrollInHighValueCampaign', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      // Save original env
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      // Restore original env
      process.env = originalEnv;
    });

    it('reads configuration from process.env', () => {
      process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
      process.env.MAUTIC_HIGH_VALUE_THRESHOLD = '75';
      process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = 'campaign-789';
      process.env.MAUTIC_ELIGIBLE_STAGES = 'qualified,converted';

      const decision = shouldEnrollInHighValueCampaign(80, 'qualified');

      expect(decision.shouldEnroll).toBe(true);
      expect(decision.campaignId).toBe('campaign-789');
    });

    it('handles missing environment variables', () => {
      delete process.env.MAUTIC_ENROLLMENT_ENABLED;
      delete process.env.MAUTIC_CAMPAIGN_HIGH_VALUE;

      const decision = shouldEnrollInHighValueCampaign(85, 'qualified');

      expect(decision.shouldEnroll).toBe(false);
    });

    it('applies business rules correctly', () => {
      process.env.MAUTIC_ENROLLMENT_ENABLED = 'true';
      process.env.MAUTIC_HIGH_VALUE_THRESHOLD = '70';
      process.env.MAUTIC_CAMPAIGN_HIGH_VALUE = 'campaign-123';
      process.env.MAUTIC_ELIGIBLE_STAGES = 'qualified';

      // Should enroll
      const decision1 = shouldEnrollInHighValueCampaign(85, 'qualified');
      expect(decision1.shouldEnroll).toBe(true);

      // Should not enroll - wrong status
      const decision2 = shouldEnrollInHighValueCampaign(85, 'new');
      expect(decision2.shouldEnroll).toBe(false);

      // Should not enroll - low score
      const decision3 = shouldEnrollInHighValueCampaign(50, 'qualified');
      expect(decision3.shouldEnroll).toBe(false);
    });
  });
});
