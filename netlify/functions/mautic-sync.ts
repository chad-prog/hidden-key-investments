/**
 * Mautic Sync Netlify Function
 * 
 * Implements OAuth2 client_credentials token caching, safeFetch with retries+jitter,
 * and actions: upsert_contact, add_to_campaign, ping.
 * 
 * Supports demo-mode when MAUTIC envs are missing/placeholder.
 */

import type { Handler } from '@netlify/functions';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// ============================================================================
// SCHEMAS
// ============================================================================

const PingActionSchema = z.object({
  action: z.literal('ping'),
});

const UpsertContactActionSchema = z.object({
  action: z.literal('upsert_contact'),
  payload: z.object({
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    tags: z.array(z.string()).optional(),
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    utm_term: z.string().optional(),
    utm_content: z.string().optional(),
    updated_at: z.string().optional(), // ISO timestamp for stale-guard
    customFields: z.record(z.any()).optional(),
  }),
});

const AddToCampaignActionSchema = z.object({
  action: z.literal('add_to_campaign'),
  payload: z.object({
    email: z.string().email(),
    campaignId: z.union([z.string(), z.number()]),
  }),
});

const RequestSchema = z.discriminatedUnion('action', [
  PingActionSchema,
  UpsertContactActionSchema,
  AddToCampaignActionSchema,
]);

// ============================================================================
// TYPES
// ============================================================================

interface TokenCache {
  access_token: string;
  expires_at: number; // Unix timestamp in ms
}

interface MauticContact {
  id?: number;
  fields?: {
    all?: Record<string, any>;
  };
  lastActive?: string;
  dateModified?: string;
  [key: string]: any;
}

// ============================================================================
// TOKEN CACHE (persisted on globalThis)
// ============================================================================

declare global {
  var __mauticTokenCache: TokenCache | undefined;
}

function getTokenCache(): TokenCache | undefined {
  return global.__mauticTokenCache;
}

function setTokenCache(token: string, expiresIn: number): void {
  const expiresAt = Date.now() + (expiresIn * 1000) - 60000; // 1 min buffer
  global.__mauticTokenCache = { access_token: token, expires_at: expiresAt };
}

export function __resetTokenCache(): void {
  global.__mauticTokenCache = undefined;
}

// ============================================================================
// OAUTH2 CLIENT CREDENTIALS
// ============================================================================

async function getAccessToken(correlationId: string): Promise<string> {
  const cached = getTokenCache();
  if (cached && cached.expires_at > Date.now()) {
    console.log(`[Mautic] Using cached token | correlationId=${correlationId}`);
    return cached.access_token;
  }

  const baseUrl = process.env.MAUTIC_BASE_URL;
  const clientId = process.env.MAUTIC_CLIENT_ID;
  const clientSecret = process.env.MAUTIC_CLIENT_SECRET;

  if (!baseUrl || !clientId || !clientSecret) {
    throw new Error('Mautic OAuth credentials not configured');
  }

  console.log(`[Mautic] Fetching new access token | correlationId=${correlationId}`);

  const tokenUrl = `${baseUrl}/oauth/v2/token`;
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await safeFetch(
    tokenUrl,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    },
    correlationId
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get access token: ${response.status} ${text}`);
  }

  const data = await response.json();
  const { access_token, expires_in } = data;

  if (!access_token || !expires_in) {
    throw new Error('Invalid token response from Mautic');
  }

  setTokenCache(access_token, expires_in);
  return access_token;
}

// Export for testing
export async function getAccessTokenForTestOnly(correlationId: string): Promise<string> {
  return getAccessToken(correlationId);
}

// ============================================================================
// SAFE FETCH (with retries + jitter)
// ============================================================================

async function safeFetch(
  url: string,
  options: RequestInit,
  correlationId: string,
  retries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Retry on 5xx or 429
      if (response.status >= 500 || response.status === 429) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response;
    } catch (err) {
      lastError = err as Error;
      const jitter = Math.random() * 1000;
      const backoff = Math.pow(2, attempt) * 1000 + jitter;
      
      console.warn(
        `[Mautic] Fetch attempt ${attempt + 1}/${retries} failed | ` +
        `correlationId=${correlationId} | error=${lastError.message} | ` +
        `backoff=${Math.round(backoff)}ms`
      );

      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, backoff));
      }
    }
  }

  throw lastError || new Error('safeFetch failed');
}

// ============================================================================
// DEMO MODE CHECK
// ============================================================================

function isDemoMode(): boolean {
  const baseUrl = process.env.MAUTIC_BASE_URL;
  const clientId = process.env.MAUTIC_CLIENT_ID;
  const clientSecret = process.env.MAUTIC_CLIENT_SECRET;

  return (
    !baseUrl ||
    !clientId ||
    !clientSecret ||
    baseUrl.includes('placeholder') ||
    clientId.includes('placeholder') ||
    clientSecret.includes('placeholder')
  );
}

// ============================================================================
// ACTIONS
// ============================================================================

async function handlePing(correlationId: string): Promise<any> {
  if (isDemoMode()) {
    console.log(`[Mautic] PING (demo mode) | correlationId=${correlationId}`);
    return { ok: true, message: 'pong (demo mode)', correlationId };
  }

  // In production, verify we can get a token
  await getAccessToken(correlationId);
  console.log(`[Mautic] PING successful | correlationId=${correlationId}`);
  return { ok: true, message: 'pong', correlationId };
}

async function handleUpsertContact(
  payload: z.infer<typeof UpsertContactActionSchema>['payload'],
  correlationId: string
): Promise<any> {
  if (isDemoMode()) {
    console.log(
      `[Mautic] UPSERT_CONTACT (demo mode) | correlationId=${correlationId} | email=${payload.email}`
    );
    return {
      ok: true,
      action: 'upsert_contact',
      demoMode: true,
      email: payload.email,
      message: 'Contact would be upserted (demo mode)',
      correlationId,
    };
  }

  const token = await getAccessToken(correlationId);
  const baseUrl = process.env.MAUTIC_BASE_URL;

  // 1. Search for existing contact by email
  const searchUrl = `${baseUrl}/api/contacts?search=email:${encodeURIComponent(payload.email)}`;
  const searchResponse = await safeFetch(
    searchUrl,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    correlationId
  );

  if (!searchResponse.ok) {
    const text = await searchResponse.text();
    throw new Error(`Mautic search failed: ${searchResponse.status} ${text}`);
  }

  const searchData = await searchResponse.json();
  const contacts = searchData?.contacts || {};
  const contactIds = Object.keys(contacts);
  let existingContact: MauticContact | null = null;
  let contactId: number | null = null;

  if (contactIds.length > 0) {
    contactId = parseInt(contactIds[0], 10);
    existingContact = contacts[contactIds[0]];
  }

  // 2. Stale-guard: compare HKI payload.updated_at to Mautic last_platform_update
  if (existingContact && payload.updated_at) {
    const mauticLastUpdate = existingContact.fields?.all?.last_platform_update;
    if (mauticLastUpdate) {
      const hkiTime = new Date(payload.updated_at).getTime();
      const mauticTime = new Date(mauticLastUpdate).getTime();
      
      if (hkiTime <= mauticTime) {
        console.log(
          `[Mautic] Skipping stale update | correlationId=${correlationId} | ` +
          `contactId=${contactId} | hki=${payload.updated_at} <= mautic=${mauticLastUpdate}`
        );
        return {
          ok: true,
          action: 'upsert_contact',
          skipped: true,
          reason: 'stale_data',
          contactId,
          correlationId,
        };
      }
    }
  }

  // 3. Build Mautic contact payload
  const mauticPayload: any = {
    email: payload.email,
  };

  if (payload.firstName) mauticPayload.firstname = payload.firstName;
  if (payload.lastName) mauticPayload.lastname = payload.lastName;
  if (payload.phone) mauticPayload.phone = payload.phone;
  if (payload.company) mauticPayload.company = payload.company;
  if (payload.tags && payload.tags.length > 0) mauticPayload.tags = payload.tags;

  // UTM fields
  if (payload.utm_source) mauticPayload.utm_source = payload.utm_source;
  if (payload.utm_medium) mauticPayload.utm_medium = payload.utm_medium;
  if (payload.utm_campaign) mauticPayload.utm_campaign = payload.utm_campaign;
  if (payload.utm_term) mauticPayload.utm_term = payload.utm_term;
  if (payload.utm_content) mauticPayload.utm_content = payload.utm_content;

  // Custom fields
  if (payload.customFields) {
    Object.assign(mauticPayload, payload.customFields);
  }

  // Timestamp for stale-guard
  if (payload.updated_at) {
    mauticPayload.last_platform_update = payload.updated_at;
  }

  // 4. Create or update contact
  let method: string;
  let url: string;

  if (contactId) {
    method = 'PATCH';
    url = `${baseUrl}/api/contacts/${contactId}/edit`;
  } else {
    method = 'POST';
    url = `${baseUrl}/api/contacts/new`;
  }

  const upsertResponse = await safeFetch(
    url,
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mauticPayload),
    },
    correlationId
  );

  if (!upsertResponse.ok) {
    const text = await upsertResponse.text();
    throw new Error(`Mautic upsert failed: ${upsertResponse.status} ${text}`);
  }

  const upsertData = await upsertResponse.json();
  const finalContactId = upsertData?.contact?.id || contactId;

  console.log(
    `[Mautic] Contact upserted | correlationId=${correlationId} | ` +
    `contactId=${finalContactId} | email=${payload.email}`
  );

  return {
    ok: true,
    action: 'upsert_contact',
    contactId: finalContactId,
    email: payload.email,
    created: !contactId,
    correlationId,
  };
}

async function handleAddToCampaign(
  payload: z.infer<typeof AddToCampaignActionSchema>['payload'],
  correlationId: string
): Promise<any> {
  if (isDemoMode()) {
    console.log(
      `[Mautic] ADD_TO_CAMPAIGN (demo mode) | correlationId=${correlationId} | ` +
      `email=${payload.email} | campaignId=${payload.campaignId}`
    );
    return {
      ok: true,
      action: 'add_to_campaign',
      demoMode: true,
      email: payload.email,
      campaignId: payload.campaignId,
      message: 'Would add contact to campaign (demo mode)',
      correlationId,
    };
  }

  const token = await getAccessToken(correlationId);
  const baseUrl = process.env.MAUTIC_BASE_URL;

  // 1. Search for contact by email
  const searchUrl = `${baseUrl}/api/contacts?search=email:${encodeURIComponent(payload.email)}`;
  const searchResponse = await safeFetch(
    searchUrl,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    correlationId
  );

  if (!searchResponse.ok) {
    const text = await searchResponse.text();
    throw new Error(`Mautic search failed: ${searchResponse.status} ${text}`);
  }

  const searchData = await searchResponse.json();
  const contacts = searchData?.contacts || {};
  const contactIds = Object.keys(contacts);

  if (contactIds.length === 0) {
    throw new Error(`Contact not found: ${payload.email}`);
  }

  const contactId = parseInt(contactIds[0], 10);

  // 2. Add contact to campaign
  const campaignUrl = `${baseUrl}/api/campaigns/${payload.campaignId}/contact/${contactId}/add`;
  const campaignResponse = await safeFetch(
    campaignUrl,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    correlationId
  );

  if (!campaignResponse.ok) {
    const text = await campaignResponse.text();
    throw new Error(`Failed to add to campaign: ${campaignResponse.status} ${text}`);
  }

  console.log(
    `[Mautic] Added to campaign | correlationId=${correlationId} | ` +
    `contactId=${contactId} | campaignId=${payload.campaignId}`
  );

  return {
    ok: true,
    action: 'add_to_campaign',
    contactId,
    campaignId: payload.campaignId,
    email: payload.email,
    correlationId,
  };
}

// ============================================================================
// HANDLER
// ============================================================================

export const handler: Handler = async (event) => {
  const correlationId = event.headers['x-correlation-id'] || randomUUID();
  
  console.log(`[Mautic] Request received | correlationId=${correlationId} | method=${event.httpMethod}`);

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
    const body = JSON.parse(event.body || '{}');
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      console.error(
        `[Mautic] Validation failed | correlationId=${correlationId} | ` +
        `errors=${JSON.stringify(validation.error.format())}`
      );
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify({
          ok: false,
          error: 'Validation failed',
          details: validation.error.format(),
          correlationId,
        }),
      };
    }

    const request = validation.data;
    let result: any;

    switch (request.action) {
      case 'ping':
        result = await handlePing(correlationId);
        break;
      case 'upsert_contact':
        result = await handleUpsertContact(request.payload, correlationId);
        break;
      case 'add_to_campaign':
        result = await handleAddToCampaign(request.payload, correlationId);
        break;
      default:
        throw new Error('Unknown action');
    }

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
      `[Mautic] Error | correlationId=${correlationId} | error=${error.message}`,
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
