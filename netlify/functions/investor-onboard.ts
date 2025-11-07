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
// MAUTIC_SYNC_URL (or call local netlify function endpoint), MAUTIC_ENROLLMENT_CAMPAIGN_ID
const MAUTIC_SYNC_URL = process.env.MAUTIC_SYNC_URL || 'https://your-site.netlify.app/.netlify/functions/mautic-sync'
const MAUTIC_CAMPAIGN_INVESTOR_WELCOME = process.env.MAUTIC_CAMPAIGN_INVESTOR_WELCOME || process.env.MAUTIC_CAMPAIGN_HIGH_VALUE || '123'

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
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
    const body: Payload = event.body ? JSON.parse(event.body) : {};
    if (!body?.email) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: 'email required' })
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
      throw new Error(`Upsert contact failed: ${upsertResponse.status}`);
    }

    const upsertJson = await upsertResponse.json();

    // 3) Add to campaign (investor welcome)
    const addToCampaign = await fetch(MAUTIC_SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_to_campaign',
        mauticContactId: upsertJson?.data?.contactId || undefined,
        campaignId: MAUTIC_CAMPAIGN_INVESTOR_WELCOME
      })
    });

    if (!addToCampaign.ok) {
      throw new Error(`Add to campaign failed: ${addToCampaign.status}`);
    }

    const campaignJson = await addToCampaign.json();

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
