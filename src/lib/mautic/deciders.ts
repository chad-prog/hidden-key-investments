/**
 * Mautic Campaign Enrollment Deciders
 * 
 * Pure helper functions to determine campaign enrollment based on
 * business rules and environment configuration.
 */

import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

export const EnrollmentDecisionSchema = z.object({
  shouldEnroll: z.boolean(),
  reason: z.string(),
  campaignId: z.string().optional(),
});

export type EnrollmentDecision = z.infer<typeof EnrollmentDecisionSchema>;

export interface CampaignEnrollmentConfig {
  enrollmentEnabled: boolean;
  highValueThreshold: number;
  campaignId: string | null;
  eligibleStages: string[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse enrollment configuration from environment variables
 * 
 * @param env - Environment variables object (process.env)
 * @returns Parsed configuration
 */
export function parseEnrollmentConfig(env: Record<string, string | undefined>): CampaignEnrollmentConfig {
  return {
    enrollmentEnabled: env.MAUTIC_ENROLLMENT_ENABLED === 'true',
    highValueThreshold: parseFloat(env.MAUTIC_HIGH_VALUE_THRESHOLD || '70'),
    campaignId: env.MAUTIC_CAMPAIGN_HIGH_VALUE || null,
    eligibleStages: (env.MAUTIC_ELIGIBLE_STAGES || 'qualified,converted').split(',').map(s => s.trim()),
  };
}

// ============================================================================
// Decision Functions
// ============================================================================

/**
 * Determine if a lead should be added to the high-value campaign
 * 
 * Business rules:
 * - Enrollment must be enabled via MAUTIC_ENROLLMENT_ENABLED
 * - Campaign ID must be configured
 * - Lead score must meet or exceed threshold
 * - Lead CRM status must be in eligible stages
 * 
 * @param leadScore - ML lead score (0-100)
 * @param crmStatus - Current CRM status of the lead
 * @param config - Campaign enrollment configuration
 * @returns Decision object with enrollment determination and reason
 */
export function addToCampaignIfHighValue(
  leadScore: number | null | undefined,
  crmStatus: string | null | undefined,
  config: CampaignEnrollmentConfig
): EnrollmentDecision {
  // Check if enrollment is enabled
  if (!config.enrollmentEnabled) {
    return {
      shouldEnroll: false,
      reason: 'Campaign enrollment is disabled',
    };
  }
  
  // Check if campaign ID is configured
  if (!config.campaignId) {
    return {
      shouldEnroll: false,
      reason: 'No campaign ID configured',
    };
  }
  
  // Check if lead has a score
  if (leadScore === null || leadScore === undefined) {
    return {
      shouldEnroll: false,
      reason: 'Lead has no score',
    };
  }
  
  // Check if score meets threshold
  if (leadScore < config.highValueThreshold) {
    return {
      shouldEnroll: false,
      reason: `Lead score ${leadScore} below threshold ${config.highValueThreshold}`,
    };
  }
  
  // Check if CRM status is eligible
  if (!crmStatus) {
    return {
      shouldEnroll: false,
      reason: 'Lead has no CRM status',
    };
  }
  
  if (!config.eligibleStages.includes(crmStatus)) {
    return {
      shouldEnroll: false,
      reason: `CRM status "${crmStatus}" not in eligible stages: ${config.eligibleStages.join(', ')}`,
    };
  }
  
  // All checks passed - enroll in campaign
  return {
    shouldEnroll: true,
    reason: `High-value lead (score: ${leadScore}, status: ${crmStatus})`,
    campaignId: config.campaignId,
  };
}

/**
 * Convenience function that uses process.env for configuration
 * 
 * @param leadScore - ML lead score (0-100)
 * @param crmStatus - Current CRM status of the lead
 * @returns Decision object with enrollment determination and reason
 */
export function shouldEnrollInHighValueCampaign(
  leadScore: number | null | undefined,
  crmStatus: string | null | undefined
): EnrollmentDecision {
  const config = parseEnrollmentConfig(process.env as Record<string, string | undefined>);
  return addToCampaignIfHighValue(leadScore, crmStatus, config);
}
