/**
 * netlify/functions/investor-onboard.ts
 *
 * Netlify function scaffold: receives intake payload from frontend,
 * persists to Supabase (or reuses existing lead ingestion),
 * and calls the existing mautic-sync endpoint to upsert contact and enroll in campaign.
 *
 * Note: this is a scaffold. Replace HTTP client, error handling and environment
 * logic with the production-ready utilities from your repo (e.g. safeFetch).
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

type Payload = {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  utm?: Record<string, string>
  source?: string
  consent?: { marketing_opt_in?: boolean }
}

// Environment variables expected:
// MAUTIC_SYNC_URL - URL to mautic-sync function (defaults to relative path)
// MAUTIC_CAMPAIGN_INVESTOR_WELCOME - Campaign ID for investor welcome flow (required)
// NODE_ENV - Environment (production, staging, development)
// ALLOWED_ORIGIN - Allowed origin for CORS in production
const MAUTIC_SYNC_URL = process.env.MAUTIC_SYNC_URL || '/.netlify/functions/mautic-sync';
const MAUTIC_CAMPAIGN_INVESTOR_WELCOME = process.env.MAUTIC_CAMPAIGN_INVESTOR_WELCOME || process.env.MAUTIC_CAMPAIGN_HIGH_VALUE;

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // CORS headers - restrict to specific domain in production
  const ALLOW_ORIGIN = process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGIN || 'https://hiddenkeyinvestments.com')
    : '*';
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': ALLOW_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
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
      body: JSON.stringify({ ok: false, error: 'Only POST requests allowed' }),
    };
  }

  try {
    let body: Payload;
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch (_parseError) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'Invalid JSON in request body' })
      };
    }

    if (!body?.email) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'email required' })
      };
    }

    if (!MAUTIC_CAMPAIGN_INVESTOR_WELCOME) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'MAUTIC_CAMPAIGN_INVESTOR_WELCOME not configured' })
      };
    }

    // 1) Optionally: save to Supabase / leads table here (or call existing API)
    // 2) Call mautic-sync to upsert contact
    const upsertResponse = await fetch(MAUTIC_SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'upsert_contact',
        payload: {
          contact: {
            email: body.email,
            first_name: body.firstName,
            last_name: body.lastName,
            phone: body.phone
          },
          utm: body.utm,
          consent: body.consent,
        }
      })
    });

    if (!upsertResponse.ok) {
      const errorText = await upsertResponse.text();
      throw new Error(`Upsert contact failed: ${upsertResponse.status} ${errorText}`);
    }

    let upsertJson: { data?: { contactId?: string } };
    try {
      upsertJson = await upsertResponse.json();
    } catch (_jsonError) {
      throw new Error('Failed to parse upsert response JSON');
    }

    // 3) Add to campaign (investor welcome)
    const contactId = upsertJson?.data?.contactId;
    if (!contactId) {
      throw new Error('No contact ID returned from upsert operation');
    }

    const addToCampaign = await fetch(MAUTIC_SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_to_campaign',
        mauticContactId: contactId,
        campaignId: MAUTIC_CAMPAIGN_INVESTOR_WELCOME
      })
    });

    if (!addToCampaign.ok) {
      const errorText = await addToCampaign.text();
      throw new Error(`Add to campaign failed: ${addToCampaign.status} ${errorText}`);
    }

    let campaignJson: { success?: boolean };
    try {
      campaignJson = await addToCampaign.json();
    } catch (_jsonError) {
      throw new Error('Failed to parse campaign response JSON');
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: true,
        data: { upsert: upsertJson, campaign: campaignJson }
      })
    };
  } catch (err: any) {
    console.error('investor-onboard error', err);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: err.message })
    };
  }
};
