/**
 * Mautic Webhook Receiver - Netlify Function
 * 
 * Receives webhook events from Mautic (unsubscribe, bounce, complaint)
 * and updates Supabase leads table accordingly.
 */

import type { Handler } from '@netlify/functions';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SCHEMAS
// ============================================================================

const WebhookEventSchema = z.object({
  'mautic.lead_post_save_update': z.array(z.object({
    lead: z.object({
      id: z.number().optional(),
      email: z.string().email().optional(),
      fields: z.object({
        all: z.record(z.any()).optional(),
      }).optional(),
      dateModified: z.string().optional(),
    }).optional(),
    event: z.string().optional(),
  })).optional(),
  'mautic.email_on_send': z.array(z.any()).optional(),
  'mautic.email_on_open': z.array(z.any()).optional(),
  contact: z.object({
    email: z.string().email().optional(),
    fields: z.record(z.any()).optional(),
  }).optional(),
  email: z.string().email().optional(),
  event: z.enum(['unsubscribe', 'bounce', 'complaint']).optional(),
}).passthrough();

// ============================================================================
// DEMO MODE CHECK
// ============================================================================

function isDemoMode(): boolean {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

  return (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes('placeholder') ||
    supabaseKey.includes('placeholder')
  );
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

async function processWebhookEvent(
  body: any,
  correlationId: string
): Promise<any> {
  const validation = WebhookEventSchema.safeParse(body);
  
  if (!validation.success) {
    console.error(
      `[MauticWebhook] Invalid payload | correlationId=${correlationId} | ` +
      `errors=${JSON.stringify(validation.error.format())}`
    );
    throw new Error('Invalid webhook payload');
  }

  const data = validation.data;
  let email: string | null = null;
  let event: string | null = null;
  let emailStatus: 'unsubscribed' | 'bounced' | 'complaint' | null = null;
  let marketingOptIn = true;

  // Extract email and event from various payload structures
  if (data.event && ['unsubscribe', 'bounce', 'complaint'].includes(data.event)) {
    event = data.event;
    email = data.email || data.contact?.email || null;
  } else if (data['mautic.lead_post_save_update']) {
    const updates = data['mautic.lead_post_save_update'];
    if (updates && updates.length > 0) {
      const firstUpdate = updates[0];
      if (firstUpdate.event === 'unsubscribe' || firstUpdate.event === 'bounced') {
        event = firstUpdate.event;
        email = firstUpdate.lead?.email || null;
      }
    }
  }

  // Map event to email_status and marketing_opt_in
  if (event === 'unsubscribe') {
    emailStatus = 'unsubscribed';
    marketingOptIn = false;
  } else if (event === 'bounce') {
    emailStatus = 'bounced';
    marketingOptIn = false;
  } else if (event === 'complaint') {
    emailStatus = 'complaint';
    marketingOptIn = false;
  }

  if (!email || !emailStatus) {
    console.warn(
      `[MauticWebhook] No actionable event | correlationId=${correlationId} | ` +
      `email=${email} | event=${event}`
    );
    return {
      ok: true,
      message: 'No actionable event',
      correlationId,
    };
  }

  console.log(
    `[MauticWebhook] Processing event | correlationId=${correlationId} | ` +
    `email=${email} | event=${event} | status=${emailStatus}`
  );

  if (isDemoMode()) {
    console.log(
      `[MauticWebhook] Demo mode - would update | email=${email} | ` +
      `emailStatus=${emailStatus} | marketingOptIn=${marketingOptIn}`
    );
    return {
      ok: true,
      demoMode: true,
      email,
      emailStatus,
      marketingOptIn,
      message: 'Would update lead (demo mode)',
      correlationId,
    };
  }

  // Update Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );

  // Update leads table
  const { data: updateData, error: updateError } = await supabase
    .from('leads')
    .update({
      email_status: emailStatus,
      marketing_opt_in: marketingOptIn,
      email_status_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('email', email)
    .select();

  if (updateError) {
    console.error(
      `[MauticWebhook] Update failed | correlationId=${correlationId} | ` +
      `error=${updateError.message}`
    );
    throw new Error(`Database update failed: ${updateError.message}`);
  }

  const updatedCount = updateData?.length || 0;

  // Insert activity record for traceability
  const { error: activityError } = await supabase
    .from('activities')
    .insert({
      id: randomUUID(),
      type: 'mautic_webhook',
      description: `Mautic webhook: ${event}`,
      metadata: {
        email,
        event,
        emailStatus,
        marketingOptIn,
        correlationId,
      },
      created_at: new Date().toISOString(),
    });

  if (activityError) {
    console.warn(
      `[MauticWebhook] Activity insert failed | correlationId=${correlationId} | ` +
      `error=${activityError.message}`
    );
    // Don't fail the webhook for activity insert failure
  }

  console.log(
    `[MauticWebhook] Updated ${updatedCount} lead(s) | correlationId=${correlationId} | ` +
    `email=${email} | status=${emailStatus}`
  );

  return {
    ok: true,
    email,
    emailStatus,
    marketingOptIn,
    updatedCount,
    correlationId,
  };
}

// ============================================================================
// HANDLER
// ============================================================================

export const handler: Handler = async (event) => {
  const correlationId = event.headers['x-correlation-id'] || randomUUID();
  
  console.log(
    `[MauticWebhook] Request received | correlationId=${correlationId} | ` +
    `method=${event.httpMethod}`
  );

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId,
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Verify webhook secret
    const secret = event.queryStringParameters?.secret;
    const expectedSecret = process.env.MAUTIC_WEBHOOK_SECRET;

    if (!expectedSecret || expectedSecret.includes('placeholder')) {
      console.warn(
        `[MauticWebhook] Demo mode - secret not configured | correlationId=${correlationId}`
      );
      // In demo mode, accept without secret validation
    } else if (secret !== expectedSecret) {
      console.error(
        `[MauticWebhook] Invalid secret | correlationId=${correlationId}`
      );
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify({
          ok: false,
          error: 'Invalid webhook secret',
          correlationId,
        }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const result = await processWebhookEvent(body, correlationId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId,
      },
      body: JSON.stringify(result),
    };
  } catch (error: any) {
    console.error(
      `[MauticWebhook] Error | correlationId=${correlationId} | error=${error.message}`,
      error.stack
    );

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId,
      },
      body: JSON.stringify({
        ok: false,
        error: error.message,
        correlationId,
      }),
    };
  }
};
