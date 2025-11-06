/**
 * Mautic Campaign Enrollment Deciders
 * 
 * Pure helper functions for determining campaign enrollment based on business rules.
 */

export interface CampaignDecision {
  shouldEnroll: boolean;
  reason: string;
  campaignId?: string | number;
}

export interface Lead {
  email: string;
  property?: {
    estimatedValue?: number;
  };
  stage?: string;
  [key: string]: any;
}

/**
 * Determine if a lead should be added to high-value campaign
 * 
 * Decision logic:
 * 1. Check if enrollment is enabled (MAUTIC_ENROLLMENT_ENABLED)
 * 2. Check if lead stage is in eligible stages (MAUTIC_ELIGIBLE_STAGES)
 * 3. Check if property value meets threshold (MAUTIC_HIGH_VALUE_THRESHOLD)
 * 4. Return campaign ID if all conditions met (MAUTIC_CAMPAIGN_HIGH_VALUE)
 * 
 * @param lead - Lead object with property and stage information
 * @returns Decision object with shouldEnroll flag, reason, and optional campaignId
 */
export function addToCampaignIfHighValue(lead: Lead): CampaignDecision {
  // 1. Check if enrollment is enabled
  const enrollmentEnabled = process.env.MAUTIC_ENROLLMENT_ENABLED === 'true';
  
  if (!enrollmentEnabled) {
    return {
      shouldEnroll: false,
      reason: 'Campaign enrollment disabled',
    };
  }

  // 2. Check campaign ID is configured
  const campaignId = process.env.MAUTIC_CAMPAIGN_HIGH_VALUE;
  
  if (!campaignId || campaignId.includes('placeholder')) {
    return {
      shouldEnroll: false,
      reason: 'High-value campaign not configured',
    };
  }

  // 3. Check eligible stages
  const eligibleStagesStr = process.env.MAUTIC_ELIGIBLE_STAGES || '';
  const eligibleStages = eligibleStagesStr
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 0);

  if (eligibleStages.length > 0 && lead.stage) {
    const leadStage = lead.stage.toLowerCase();
    const isEligibleStage = eligibleStages.includes(leadStage);
    
    if (!isEligibleStage) {
      return {
        shouldEnroll: false,
        reason: `Lead stage '${lead.stage}' not in eligible stages: ${eligibleStages.join(', ')}`,
      };
    }
  }

  // 4. Check property value threshold
  const thresholdStr = process.env.MAUTIC_HIGH_VALUE_THRESHOLD;
  const threshold = thresholdStr ? parseFloat(thresholdStr) : null;

  if (threshold !== null && !isNaN(threshold)) {
    const propertyValue = lead.property?.estimatedValue;
    
    if (!propertyValue || propertyValue < threshold) {
      return {
        shouldEnroll: false,
        reason: `Property value ${propertyValue || 0} below threshold ${threshold}`,
      };
    }
  }

  // All conditions met
  return {
    shouldEnroll: true,
    reason: 'Lead meets high-value criteria',
    campaignId,
  };
}
