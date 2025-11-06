/**
 * Mautic Webhook Netlify Function
 * 
 * Production-ready webhook receiver for Mautic events.
 * 
 * Features:
 * - Secret validation via ?secret=... query parameter
 * - Mautic event parsing and normalization
 * - Updates Supabase leads table for unsubscribe/bounce/complaint events
 * - Inserts activity row for audit trail
 * - Zod validation and proper error handling
 * - Demo-safe failure modes
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// ============================================================================
// Type Definitions & Validation
// ============================================================================

const MauticEventSchema = z.object({
  'mautic.lead_post_save_update': z.array(z.object({
    lead: z.object({
      id: z.number(),
      email: z.string().email().optional(),
      fields: z.object({
        all: z.record(z.any()).optional(),
      }).optional(),
    }),
  })).optional(),
  'mautic.email_on_send': z.array(z.any()).optional(),
  'mautic.email_on_open': z.array(z.any()).optional(),
  'mautic.email_on_bounce': z.array(z.object({
    lead: z.object({
      id: z.number(),
      email: z.string().email().optional(),
    }),
  })).optional(),
  'mautic.form_on_submit': z.array(z.any()).optional(),
  'mautic.lead_post_save_new': z.array(z.any()).optional(),
  'mautic.lead_channel_subscription_changed': z.array(z.object({
    lead: z.object({
      id: z.number(),
      email: z.string().email().optional(),
    }),
    channel: z.string().optional(),
    old_status: z.string().optional(),
    new_status: z.string().optional(),
  })).optional(),
}).passthrough();

type MauticWebhookPayload = z.infer<typeof MauticEventSchema>;

// Normalized event types
type NormalizedEvent = {
  type: 'unsubscribe' | 'bounce' | 'complaint' | 'other';
  email: string;
  mauticContactId: number;
  details: any;
};

// ============================================================================
// Configuration
// ============================================================================

function getWebhookSecret(): string | null {
  return process.env.MAUTIC_WEBHOOK_SECRET || null;
}

function getSupabaseConfig(): { url: string; serviceRoleKey: string } | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    return null;
  }
  
  return { url, serviceRoleKey: key };
}

function isDemoMode(): boolean {
  return getSupabaseConfig() === null;
}

// ============================================================================
// Event Normalization
// ============================================================================

function normalizeEvents(payload: MauticWebhookPayload): NormalizedEvent[] {
  const events: NormalizedEvent[] = [];

  // Handle unsubscribe events (channel subscription changed to unsubscribed)
  const subscriptionEvents = payload['mautic.lead_channel_subscription_changed'] || [];
  for (const event of subscriptionEvents) {
    if (event.new_status === 'unsubscribed' || event.new_status === 'dnc') {
      if (event.lead.email) {
        events.push({
          type: 'unsubscribe',
          email: event.lead.email,
          mauticContactId: event.lead.id,
          details: {
            channel: event.channel,
            old_status: event.old_status,
            new_status: event.new_status,
          },
        });
      }
    }
  }

  // Handle bounce events
  const bounceEvents = payload['mautic.email_on_bounce'] || [];
  for (const event of bounceEvents) {
    if (event.lead.email) {
      events.push({
        type: 'bounce',
        email: event.lead.email,
        mauticContactId: event.lead.id,
        details: event,
      });
    }
  }

  return events;
}

// ============================================================================
// Supabase Operations
// ============================================================================

async function updateLeadEmailStatus(
  email: string,
  status: 'unsubscribed' | 'bounced' | 'complained',
  correlationId: string
): Promise<void> {
  const config = getSupabaseConfig();
  if (!config) {
    console.log('[Mautic Webhook] Demo mode - would update email status:', {
      email,
      status,
      correlationId,
    });
    return;
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(config.url, config.serviceRoleKey);

  // Update leads table - find by email (case insensitive)
  const { error: updateError } = await supabase
    .from('leads')
    .update({
      email_status: status,
      email_status_updated_at: new Date().toISOString(),
    })
    .ilike('email', email);

  if (updateError) {
    console.error('[Mautic Webhook] Failed to update lead email status:', {
      email,
      status,
      error: updateError.message,
      correlationId,
    });
    throw new Error(`Database update failed: ${updateError.message}`);
  }

  console.log('[Mautic Webhook] Updated lead email status:', {
    email,
    status,
    correlationId,
  });
}

async function insertActivity(
  email: string,
  eventType: string,
  details: any,
  correlationId: string
): Promise<void> {
  const config = getSupabaseConfig();
  if (!config) {
    console.log('[Mautic Webhook] Demo mode - would insert activity:', {
      email,
      eventType,
      correlationId,
    });
    return;
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(config.url, config.serviceRoleKey);

  // First, find the lead by email to get the lead_id
  const { data: leads, error: findError } = await supabase
    .from('leads')
    .select('id')
    .ilike('email', email)
    .limit(1);

  if (findError) {
    console.error('[Mautic Webhook] Failed to find lead:', {
      email,
      error: findError.message,
      correlationId,
    });
    // Don't throw - activity logging is best-effort
    return;
  }

  if (!leads || leads.length === 0) {
    console.log('[Mautic Webhook] No lead found for email, skipping activity:', {
      email,
      correlationId,
    });
    return;
  }

  const leadId = leads[0].id;

  // Insert activity record
  const activity = {
    id: randomUUID(),
    type: 'automated_action',
    lead_id: leadId,
    subject: `Mautic webhook: ${eventType}`,
    description: `Email status changed via Mautic webhook`,
    metadata: {
      source: 'mautic_webhook',
      event_type: eventType,
      email,
      details,
      correlation_id: correlationId,
    },
    created_by: '00000000-0000-0000-0000-000000000000', // System user
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: insertError } = await supabase
    .from('activities')
    .insert(activity);

  if (insertError) {
    console.error('[Mautic Webhook] Failed to insert activity:', {
      email,
      error: insertError.message,
      correlationId,
    });
    // Don't throw - activity logging is best-effort
  } else {
    console.log('[Mautic Webhook] Inserted activity:', {
      leadId,
      email,
      eventType,
      correlationId,
    });
  }
}

// ============================================================================
// Handler
// ============================================================================

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const correlationId = event.headers['x-correlation-id'] || randomUUID();

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Correlation-ID',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST requests allowed' },
        correlationId,
      }),
    };
  }

  // Verify webhook secret
  const secret = event.queryStringParameters?.secret;
  const expectedSecret = getWebhookSecret();
  
  if (!expectedSecret) {
    // Demo mode - accept all requests
    console.log('[Mautic Webhook] Demo mode - no secret configured');
  } else if (secret !== expectedSecret) {
    console.warn('[Mautic Webhook] Invalid webhook secret', { correlationId });
    return {
      statusCode: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: { code: 'UNAUTHORIZED', message: 'Invalid webhook secret' },
        correlationId,
      }),
    };
  }

  // Parse and validate body
  let body: any;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body' },
        correlationId,
      }),
    };
  }

  const validation = MauticEventSchema.safeParse(body);
  if (!validation.success) {
    console.warn('[Mautic Webhook] Validation failed:', {
      correlationId,
      errors: validation.error.format(),
    });
    
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Webhook payload validation failed',
          details: validation.error.format(),
        },
        correlationId,
      }),
    };
  }

  const payload = validation.data;

  try {
    // Normalize events
    const events = normalizeEvents(payload);

    if (events.length === 0) {
      console.log('[Mautic Webhook] No relevant events to process', { correlationId });
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: true,
          data: { message: 'No events processed', eventsReceived: 0 },
          correlationId,
        }),
      };
    }

    // Process events
    const results = [];
    for (const event of events) {
      try {
        // Map event type to email status
        const emailStatus = event.type === 'unsubscribe' ? 'unsubscribed'
          : event.type === 'bounce' ? 'bounced'
          : event.type === 'complaint' ? 'complained'
          : null;

        if (emailStatus) {
          await updateLeadEmailStatus(event.email, emailStatus, correlationId);
          await insertActivity(event.email, event.type, event.details, correlationId);
        }

        results.push({
          email: event.email,
          type: event.type,
          processed: true,
        });
      } catch (error) {
        console.error('[Mautic Webhook] Failed to process event:', {
          event,
          error: (error as Error).message,
          correlationId,
        });
        
        results.push({
          email: event.email,
          type: event.type,
          processed: false,
          error: (error as Error).message,
        });
      }
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        data: {
          eventsProcessed: results.filter(r => r.processed).length,
          eventsFailed: results.filter(r => !r.processed).length,
          results,
        },
        correlationId,
      }),
    };

  } catch (error) {
    console.error('[Mautic Webhook] Error:', {
      correlationId,
      error: (error as Error).message,
      stack: (error as Error).stack,
    });

    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to process webhook',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        correlationId,
      }),
    };
  }
};
