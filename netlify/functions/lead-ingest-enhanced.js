/**
 * Lead Ingestion API - Enhanced Version
 * 
 * Serverless function for capturing leads with:
 * - Comprehensive validation using Zod
 * - Automated workflow triggers
 * - Event tracking and logging
 * - Graceful degradation for demo mode
 */

import { z } from 'zod';
import { randomUUID } from 'crypto';

// Request validation schema
const LeadIngestSchema = z.object({
  source: z.enum([
    'website',
    'referral',
    'cold_outreach',
    'event',
    'partner',
    'social_media',
    'paid_ads',
    'other'
  ]),
  
  // Contact information
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  
  // Property information
  property: z.object({
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(2).max(2),
    zip: z.string().min(5),
    propertyType: z.enum(['single_family', 'multi_family', 'commercial', 'land', 'mixed_use']).optional(),
    estimatedValue: z.number().positive().optional(),
  }).optional(),
  
  // Additional context
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
  
  // UTM parameters and tracking
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
  
  // Original payload for audit
  rawPayload: z.record(z.any()).optional(),
});

// Response schema
const StandardResponse = z.object({
  ok: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }).optional(),
  correlationId: z.string(),
});

/**
 * Main handler function
 */
export async function handler(event) {
  const correlationId = randomUUID();
  const startTime = Date.now();
  
  // Parse request body
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return makeResponse({
      statusCode: 400,
      correlationId,
      error: {
        code: 'ERR_INVALID_JSON',
        message: 'Invalid JSON in request body',
      },
    });
  }
  
  // Validate request
  const validation = LeadIngestSchema.safeParse(body);
  if (!validation.success) {
    return makeResponse({
      statusCode: 400,
      correlationId,
      error: {
        code: 'ERR_VALIDATION',
        message: 'Validation failed',
        details: validation.error.format(),
      },
    });
  }
  
  const leadData = validation.data;
  
  try {
    // Check if we have database connection
    const isDemoMode = !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY;
    
    if (isDemoMode) {
      // Demo mode - simulate success
      return handleDemoMode(leadData, correlationId);
    }
    
    // Production mode - persist to database
    const lead = await persistLead(leadData, correlationId);
    
    // Trigger workflows asynchronously (don't wait)
    triggerWorkflows(lead).catch(err => {
      console.error('[LeadIngest] Workflow trigger failed:', err);
    });
    
    // Sync to Mautic asynchronously (don't wait)
    syncToMautic(lead, leadData, correlationId).catch(err => {
      console.error('[LeadIngest] Mautic sync failed:', err);
    });
    
    // Track analytics event
    trackEvent('lead_created', {
      leadId: lead.id,
      source: leadData.source,
      hasEmail: !!leadData.email,
      hasPhone: !!leadData.phone,
      hasProperty: !!leadData.property,
    }).catch(err => {
      console.error('[LeadIngest] Analytics tracking failed:', err);
    });
    
    const duration = Date.now() - startTime;
    
    return makeResponse({
      statusCode: 200,
      correlationId,
      data: {
        leadId: lead.id,
        status: 'created',
        message: 'Lead captured successfully',
      },
      metadata: {
        durationMs: duration,
      },
    });
    
  } catch (error) {
    console.error('[LeadIngest] Error:', {
      correlationId,
      error: error.message,
      stack: error.stack,
    });
    
    return makeResponse({
      statusCode: 500,
      correlationId,
      error: {
        code: 'ERR_INTERNAL',
        message: 'Failed to process lead',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
}

/**
 * Handle demo mode
 */
function handleDemoMode(leadData, correlationId) {
  const mockLeadId = randomUUID();
  
  console.log('[LeadIngest] Demo mode - would create lead:', {
    correlationId,
    leadId: mockLeadId,
    source: leadData.source,
    email: leadData.email,
    hasProperty: !!leadData.property,
  });
  
  return makeResponse({
    statusCode: 200,
    correlationId,
    data: {
      leadId: mockLeadId,
      status: 'created',
      message: 'Lead captured successfully (demo mode)',
      demoMode: true,
    },
  });
}

/**
 * Persist lead to database
 */
async function persistLead(leadData, correlationId) {
  // Import Supabase client dynamically to avoid issues in demo mode
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  
  const lead = {
    id: randomUUID(),
    source: leadData.source,
    status: 'new',
    first_name: leadData.firstName,
    last_name: leadData.lastName,
    email: leadData.email,
    phone: leadData.phone,
    property: leadData.property,
    notes: leadData.notes,
    tags: leadData.tags || [],
    custom_fields: leadData.customFields,
    utm_params: leadData.utm,
    raw_payload: leadData.rawPayload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    correlation_id: correlationId,
  };
  
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }
  
  return data;
}

/**
 * Trigger automated workflows
 */
async function triggerWorkflows(lead) {
  // TODO: Implement workflow engine integration for serverless functions
  // The workflow engine currently resides in the frontend src directory
  // and needs to be refactored for serverless function use
  console.log('[LeadIngest] Workflow triggering deferred - lead_created event for lead:', lead.id);
}

/**
 * Sync lead to Mautic
 * 
 * Best-effort sync that doesn't block lead creation.
 * 1. Upsert contact to Mautic
 * 2. Check if high-value lead
 * 3. Add to campaign if qualified
 */
async function syncToMautic(lead, leadData, correlationId) {
  // Skip if no email
  if (!lead.email) {
    console.log('[LeadIngest] Skipping Mautic sync - no email | correlationId=' + correlationId);
    return;
  }

  try {
    // Build Mautic sync payload
    const upsertPayload = {
      action: 'upsert_contact',
      payload: {
        email: lead.email,
        firstName: lead.first_name,
        lastName: lead.last_name,
        phone: lead.phone,
        company: leadData.company,
        tags: lead.tags || [],
        utm_source: leadData.utm?.source,
        utm_medium: leadData.utm?.medium,
        utm_campaign: leadData.utm?.campaign,
        utm_term: leadData.utm?.term,
        utm_content: leadData.utm?.content,
        updated_at: lead.updated_at,
        customFields: lead.custom_fields,
      },
    };

    // Call mautic-sync function
    console.log('[LeadIngest] Syncing to Mautic | correlationId=' + correlationId + ' | email=' + lead.email);
    
    const upsertResponse = await fetch('/.netlify/functions/mautic-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId,
      },
      body: JSON.stringify(upsertPayload),
    });

    if (!upsertResponse.ok) {
      const errorText = await upsertResponse.text();
      throw new Error(`Mautic upsert failed: ${upsertResponse.status} ${errorText}`);
    }

    const upsertResult = await upsertResponse.json();
    console.log('[LeadIngest] Mautic upsert completed | contactId=' + upsertResult.contactId);

    // Check if should enroll in high-value campaign
    const shouldEnroll = checkHighValueEnrollment(lead);
    
    if (shouldEnroll.shouldEnroll) {
      console.log('[LeadIngest] Enrolling in campaign | reason=' + shouldEnroll.reason + ' | campaignId=' + shouldEnroll.campaignId);
      
      const enrollPayload = {
        action: 'add_to_campaign',
        payload: {
          email: lead.email,
          campaignId: shouldEnroll.campaignId,
        },
      };

      const enrollResponse = await fetch('/.netlify/functions/mautic-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify(enrollPayload),
      });

      if (!enrollResponse.ok) {
        const errorText = await enrollResponse.text();
        throw new Error(`Campaign enrollment failed: ${enrollResponse.status} ${errorText}`);
      }

      console.log('[LeadIngest] Campaign enrollment completed | campaignId=' + shouldEnroll.campaignId);
    } else {
      console.log('[LeadIngest] Skipping campaign enrollment | reason=' + shouldEnroll.reason);
    }
  } catch (error) {
    // Log but don't throw - this is best-effort
    console.error('[LeadIngest] Mautic sync error:', error.message);
  }
}

/**
 * Check if lead should be enrolled in high-value campaign
 * 
 * Simplified version of addToCampaignIfHighValue decider
 */
function checkHighValueEnrollment(lead) {
  const enrollmentEnabled = process.env.MAUTIC_ENROLLMENT_ENABLED === 'true';
  
  if (!enrollmentEnabled) {
    return { shouldEnroll: false, reason: 'Enrollment disabled' };
  }

  const campaignId = process.env.MAUTIC_CAMPAIGN_HIGH_VALUE;
  
  if (!campaignId || campaignId.includes('placeholder')) {
    return { shouldEnroll: false, reason: 'Campaign not configured' };
  }

  // Check eligible stages if configured
  const eligibleStagesStr = process.env.MAUTIC_ELIGIBLE_STAGES || '';
  const eligibleStages = eligibleStagesStr
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 0);

  if (eligibleStages.length > 0 && lead.status) {
    const leadStage = lead.status.toLowerCase();
    if (!eligibleStages.includes(leadStage)) {
      return {
        shouldEnroll: false,
        reason: `Stage '${lead.status}' not in eligible stages`,
      };
    }
  }

  // Check property value threshold
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

  return {
    shouldEnroll: true,
    reason: 'Meets high-value criteria',
    campaignId,
  };
}

/**
 * Track analytics event
 */
async function trackEvent(eventName, properties) {
  // TODO: Integrate with analytics service (Segment, Mixpanel, etc.)
  console.log('[Analytics]', eventName, properties);
  
  // If using a service, call it here:
  // await analyticsClient.track({
  //   userId: properties.leadId,
  //   event: eventName,
  //   properties,
  // });
}

/**
 * Make standardized response
 */
function makeResponse({ statusCode, correlationId, data, error, metadata }) {
  const response = {
    ok: statusCode >= 200 && statusCode < 300,
    correlationId,
  };
  
  if (data) {
    response.data = data;
  }
  
  if (error) {
    response.error = error;
  }
  
  if (metadata) {
    response.metadata = metadata;
  }
  
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
    body: JSON.stringify(response),
  };
}

// For testing
export { LeadIngestSchema };
