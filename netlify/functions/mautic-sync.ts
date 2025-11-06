/**
 * Mautic Sync Netlify Function
 * 
 * Production-ready Netlify function for syncing leads with Mautic CRM.
 * 
 * Features:
 * - OAuth2 client_credentials flow with token caching (globalThis)
 * - Retry logic with exponential backoff and jitter
 * - Zod validation for payloads
 * - Correlation ID support
 * - Demo mode when envs missing
 * - Test helpers for unit testing
 * 
 * Actions:
 * - upsert_contact: Create or update a Mautic contact
 * - add_to_campaign: Add contact to a campaign
 * - ping: Health check
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// ============================================================================
// Type Definitions & Validation
// ============================================================================

const ActionSchema = z.enum(['upsert_contact', 'add_to_campaign', 'ping']);

const UpsertContactPayloadSchema = z.object({
  action: z.literal('upsert_contact'),
  payload: z.object({
    id: z.string().uuid(),
    updated_at: z.string().optional(),
    crm_status: z.string().optional(),
    consent: z.object({
      marketing_opt_in: z.boolean().optional(),
    }).optional(),
    ml: z.object({
      score: z.number().optional(),
    }).optional(),
    contact: z.object({
      email: z.string().email().optional(),
      first_name: z.string().optional(),
      last_name: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
    }).optional(),
    utm: z.object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
      term: z.string().optional(),
      content: z.string().optional(),
    }).optional(),
  }),
});

const AddToCampaignPayloadSchema = z.object({
  action: z.literal('add_to_campaign'),
  mauticContactId: z.string(),
  campaignId: z.string(),
});

const PingPayloadSchema = z.object({
  action: z.literal('ping'),
});

const RequestSchema = z.discriminatedUnion('action', [
  UpsertContactPayloadSchema,
  AddToCampaignPayloadSchema,
  PingPayloadSchema,
]);

type RequestPayload = z.infer<typeof RequestSchema>;

// ============================================================================
// Token Cache (globalThis for serverless persistence across warm starts)
// ============================================================================

interface TokenCache {
  accessToken: string;
  expiresAt: number; // timestamp in ms
}

declare global {
  var __mauticTokenCache: TokenCache | null;
}

globalThis.__mauticTokenCache = globalThis.__mauticTokenCache || null;

export function __resetTokenCache() {
  globalThis.__mauticTokenCache = null;
}

// ============================================================================
// Configuration
// ============================================================================

interface MauticConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

function getMauticConfig(): MauticConfig | null {
  const baseUrl = process.env.MAUTIC_BASE_URL;
  const clientId = process.env.MAUTIC_CLIENT_ID;
  const clientSecret = process.env.MAUTIC_CLIENT_SECRET;

  if (!baseUrl || !clientId || !clientSecret) {
    return null;
  }

  // Remove trailing slash from base URL
  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    clientId,
    clientSecret,
  };
}

function isDemoMode(): boolean {
  return getMauticConfig() === null;
}

// ============================================================================
// OAuth2 Token Management
// ============================================================================

async function getAccessToken(config: MauticConfig): Promise<string> {
  // Check cache first
  const cache = globalThis.__mauticTokenCache;
  if (cache && cache.expiresAt > Date.now() + 60000) {
    // Token valid for at least 60 more seconds
    return cache.accessToken;
  }

  // Fetch new token
  const tokenUrl = `${config.baseUrl}/oauth/v2/token`;
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get access token: ${response.status} ${text}`);
  }

  const data = await response.json();
  
  if (!data.access_token) {
    throw new Error('No access token in response');
  }

  // Cache token (default expiry is 3600 seconds)
  const expiresIn = data.expires_in || 3600;
  globalThis.__mauticTokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (expiresIn * 1000),
  };

  return data.access_token;
}

export async function getAccessTokenForTestOnly(): Promise<string | null> {
  const config = getMauticConfig();
  if (!config) return null;
  return getAccessToken(config);
}

// ============================================================================
// Retry Logic with Exponential Backoff
// ============================================================================

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function jitter(ms: number): number {
  // Add ±20% jitter
  const variance = ms * 0.2;
  return ms + (Math.random() * variance * 2 - variance);
}

async function safeFetch(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      // Retry on 5xx errors and 429 (rate limit)
      if (response.status >= 500 || response.status === 429) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      
      if (i < retries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = jitter(1000 * Math.pow(2, i));
        await sleep(delayMs);
      }
    }
  }

  throw lastError || new Error('safeFetch failed');
}

// ============================================================================
// Mautic API Actions
// ============================================================================

async function upsertContact(
  config: MauticConfig,
  payload: z.infer<typeof UpsertContactPayloadSchema>['payload'],
  correlationId: string
): Promise<any> {
  const token = await getAccessToken(config);
  
  // Import mapper
  const { hkiToMauticContact } = await import('../../src/lib/mappers/hkiToMautic.js');
  const mauticContact = hkiToMauticContact(payload);

  // Check if contact exists by email
  let contactId: string | null = null;
  if (mauticContact.email) {
    const searchUrl = `${config.baseUrl}/api/contacts?search=email:${encodeURIComponent(mauticContact.email)}`;
    const searchResponse = await safeFetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.contacts && Object.keys(searchData.contacts).length > 0) {
        contactId = Object.keys(searchData.contacts)[0];
      }
    }
  }

  // Create or update
  const method = contactId ? 'PATCH' : 'POST';
  const url = contactId 
    ? `${config.baseUrl}/api/contacts/${contactId}/edit`
    : `${config.baseUrl}/api/contacts/new`;

  const response = await safeFetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
    },
    body: JSON.stringify(mauticContact),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mautic API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  
  return {
    success: true,
    contactId: data.contact?.id || contactId,
    action: contactId ? 'updated' : 'created',
  };
}

async function addToCampaign(
  config: MauticConfig,
  mauticContactId: string,
  campaignId: string,
  correlationId: string
): Promise<any> {
  const token = await getAccessToken(config);
  
  const url = `${config.baseUrl}/api/campaigns/${campaignId}/contact/${mauticContactId}/add`;

  const response = await safeFetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mautic API error: ${response.status} ${text}`);
  }

  return {
    success: true,
    message: `Contact ${mauticContactId} added to campaign ${campaignId}`,
  };
}

// ============================================================================
// Handler
// ============================================================================

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const correlationId = event.headers['x-correlation-id'] || randomUUID();
  const startTime = Date.now();

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

  const validation = RequestSchema.safeParse(body);
  if (!validation.success) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: validation.error.format(),
        },
        correlationId,
      }),
    };
  }

  const request = validation.data;

  try {
    // Check for demo mode
    if (isDemoMode()) {
      console.log(`[Mautic Sync] Demo mode - action: ${request.action}`, {
        correlationId,
        action: request.action,
      });

      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: true,
          data: {
            demoMode: true,
            action: request.action,
            message: 'Demo mode - no actual sync performed',
          },
          correlationId,
        }),
      };
    }

    const config = getMauticConfig()!;

    // Handle ping action
    if (request.action === 'ping') {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: true,
          data: { status: 'healthy', timestamp: new Date().toISOString() },
          correlationId,
        }),
      };
    }

    // Handle upsert_contact action
    if (request.action === 'upsert_contact') {
      const result = await upsertContact(config, request.payload, correlationId);
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: true,
          data: result,
          correlationId,
          durationMs: Date.now() - startTime,
        }),
      };
    }

    // Handle add_to_campaign action
    if (request.action === 'add_to_campaign') {
      const result = await addToCampaign(
        config,
        request.mauticContactId,
        request.campaignId,
        correlationId
      );
      
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ok: true,
          data: result,
          correlationId,
          durationMs: Date.now() - startTime,
        }),
      };
    }

    // Should never reach here due to discriminated union
    throw new Error(`Unknown action: ${(request as any).action}`);

  } catch (error) {
    console.error('[Mautic Sync] Error:', {
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
          message: 'Failed to process request',
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        },
        correlationId,
      }),
    };
  }
};
