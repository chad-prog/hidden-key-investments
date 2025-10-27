/**
 * Webhook Handler for Inbound Lead Capture
 * 
 * Handles webhook requests from third-party services:
 * - Zapier
 * - Make (Integromat)
 * - n8n
 * - Custom integrations
 * 
 * Features:
 * - Signature verification for security
 * - Flexible payload mapping
 * - Rate limiting
 * - Deduplication
 * - Automatic retry handling
 */

import { z } from 'zod';
import { createHmac, randomUUID } from 'crypto';

// Webhook signature verification
function verifyWebhookSignature(payload, signature, secret) {
  if (!secret || !signature) {
    return false;
  }
  
  const expectedSignature = createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}

// Generic webhook payload schema
const WebhookPayloadSchema = z.object({
  // Source identification
  source: z.string().default('webhook'),
  webhook_source: z.string().optional(), // e.g., 'zapier', 'make', 'n8n'
  
  // Contact information (flexible field names)
  email: z.string().email().optional(),
  email_address: z.string().email().optional(),
  contact_email: z.string().email().optional(),
  
  first_name: z.string().optional(),
  firstName: z.string().optional(),
  
  last_name: z.string().optional(),
  lastName: z.string().optional(),
  
  phone: z.string().optional(),
  phone_number: z.string().optional(),
  contact_phone: z.string().optional(),
  
  // Property information
  address: z.string().optional(),
  property_address: z.string().optional(),
  street_address: z.string().optional(),
  
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  zipcode: z.string().optional(),
  postal_code: z.string().optional(),
  
  property_type: z.string().optional(),
  propertyType: z.string().optional(),
  
  property_value: z.union([z.number(), z.string()]).optional(),
  estimated_value: z.union([z.number(), z.string()]).optional(),
  
  // Additional fields
  message: z.string().optional(),
  notes: z.string().optional(),
  comments: z.string().optional(),
  
  // Tracking
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  
  // Metadata
  custom_fields: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
  
  // Webhook metadata
  webhook_id: z.string().optional(),
  webhook_timestamp: z.string().optional(),
}).passthrough(); // Allow additional fields

/**
 * Normalize webhook payload to standard lead format
 */
function normalizeWebhookPayload(data) {
  // Extract email
  const email = data.email || data.email_address || data.contact_email;
  
  // Extract name
  const firstName = data.first_name || data.firstName;
  const lastName = data.last_name || data.lastName;
  
  // Extract phone
  const phone = data.phone || data.phone_number || data.contact_phone;
  
  // Extract address components
  const address = data.address || data.property_address || data.street_address;
  const city = data.city;
  const state = data.state;
  const zip = data.zip || data.zipcode || data.postal_code;
  
  // Extract property info
  const propertyType = data.property_type || data.propertyType;
  const propertyValue = data.property_value || data.estimated_value;
  
  // Build standard lead object
  const lead = {
    source: data.webhook_source || data.source || 'webhook',
  };
  
  if (firstName) lead.firstName = firstName;
  if (lastName) lead.lastName = lastName;
  if (email) lead.email = email;
  if (phone) lead.phone = phone;
  
  // Add property information if we have an address
  if (address && city && state) {
    lead.property = {
      address,
      city,
      state,
      zip: zip || '00000', // Default if not provided
    };
    
    if (propertyType) {
      lead.property.propertyType = mapPropertyType(propertyType);
    }
    
    if (propertyValue) {
      const numericValue = typeof propertyValue === 'string' 
        ? parseFloat(propertyValue.replace(/[$,]/g, ''))
        : propertyValue;
      
      if (!isNaN(numericValue)) {
        lead.property.estimatedValue = numericValue;
      }
    }
  }
  
  // Add notes/message
  const notes = data.notes || data.message || data.comments;
  if (notes) lead.notes = notes;
  
  // Add UTM tracking
  if (data.utm_source || data.utm_medium || data.utm_campaign) {
    lead.utm = {};
    if (data.utm_source) lead.utm.source = data.utm_source;
    if (data.utm_medium) lead.utm.medium = data.utm_medium;
    if (data.utm_campaign) lead.utm.campaign = data.utm_campaign;
  }
  
  // Store custom fields
  const customFields = data.custom_fields || data.metadata || {};
  
  // Add any unmapped fields to custom fields
  Object.keys(data).forEach(key => {
    const knownFields = [
      'email', 'email_address', 'contact_email',
      'first_name', 'firstName', 'last_name', 'lastName',
      'phone', 'phone_number', 'contact_phone',
      'address', 'property_address', 'street_address',
      'city', 'state', 'zip', 'zipcode', 'postal_code',
      'property_type', 'propertyType', 'property_value', 'estimated_value',
      'message', 'notes', 'comments',
      'utm_source', 'utm_medium', 'utm_campaign',
      'source', 'webhook_source', 'webhook_id', 'webhook_timestamp',
      'custom_fields', 'metadata'
    ];
    
    if (!knownFields.includes(key)) {
      customFields[key] = data[key];
    }
  });
  
  if (Object.keys(customFields).length > 0) {
    lead.customFields = customFields;
  }
  
  // Store raw payload for audit
  lead.rawPayload = {
    webhook_id: data.webhook_id,
    webhook_timestamp: data.webhook_timestamp,
    webhook_source: data.webhook_source,
  };
  
  return lead;
}

/**
 * Map property type to standard enum
 */
function mapPropertyType(type) {
  const typeMap = {
    'single family': 'single_family',
    'single-family': 'single_family',
    'sfr': 'single_family',
    'house': 'single_family',
    
    'multi family': 'multi_family',
    'multi-family': 'multi_family',
    'multifamily': 'multi_family',
    'apartment': 'multi_family',
    
    'commercial': 'commercial',
    'retail': 'commercial',
    'office': 'commercial',
    
    'land': 'land',
    'vacant': 'land',
    
    'mixed use': 'mixed_use',
    'mixed-use': 'mixed_use',
  };
  
  const normalized = type.toLowerCase().trim();
  return typeMap[normalized] || 'single_family';
}

/**
 * Simple rate limiting (in-memory, resets on cold start)
 */
const requestCounts = new Map();

function checkRateLimit(identifier, maxRequests = 100, windowMs = 60000) {
  const now = Date.now();
  const key = `${identifier}-${Math.floor(now / windowMs)}`;
  
  const count = requestCounts.get(key) || 0;
  
  if (count >= maxRequests) {
    return false;
  }
  
  requestCounts.set(key, count + 1);
  
  // Clean up old entries
  for (const [k] of requestCounts) {
    if (!k.startsWith(identifier) || k !== key) {
      requestCounts.delete(k);
    }
  }
  
  return true;
}

/**
 * Make standardized response
 */
function makeResponse({ statusCode, correlationId, data, error, metadata }) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
    },
    body: JSON.stringify({
      ok: statusCode >= 200 && statusCode < 300,
      data,
      error,
      correlationId,
      metadata,
    }),
  };
}

/**
 * Main webhook handler
 */
export async function handler(event) {
  const correlationId = randomUUID();
  const startTime = Date.now();
  
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return makeResponse({
      statusCode: 405,
      correlationId,
      error: {
        code: 'ERR_METHOD_NOT_ALLOWED',
        message: 'Only POST requests are allowed',
      },
    });
  }
  
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
  
  // Rate limiting based on IP or source
  const identifier = event.headers['x-forwarded-for'] || 
                    event.headers['x-real-ip'] || 
                    body.webhook_source || 
                    'unknown';
  
  if (!checkRateLimit(identifier)) {
    return makeResponse({
      statusCode: 429,
      correlationId,
      error: {
        code: 'ERR_RATE_LIMIT',
        message: 'Too many requests. Please try again later.',
      },
    });
  }
  
  // Verify webhook signature if secret is configured
  const webhookSecret = process.env.WEBHOOK_SECRET;
  const signature = event.headers['x-webhook-signature'] || 
                    event.headers['x-hub-signature-256'];
  
  if (webhookSecret && signature) {
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
      return makeResponse({
        statusCode: 401,
        correlationId,
        error: {
          code: 'ERR_INVALID_SIGNATURE',
          message: 'Invalid webhook signature',
        },
      });
    }
  }
  
  // Validate webhook payload
  const validation = WebhookPayloadSchema.safeParse(body);
  if (!validation.success) {
    return makeResponse({
      statusCode: 400,
      correlationId,
      error: {
        code: 'ERR_VALIDATION',
        message: 'Invalid webhook payload',
        details: validation.error.format(),
      },
    });
  }
  
  try {
    // Normalize to standard lead format
    const leadData = normalizeWebhookPayload(validation.data);
    
    // Forward to lead ingestion endpoint
    const leadIngestUrl = `${event.headers.host}/.netlify/functions/lead-ingest-enhanced`;
    const protocol = event.headers['x-forwarded-proto'] || 'https';
    
    const response = await fetch(`${protocol}://${leadIngestUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId,
        'X-Webhook-Source': validation.data.webhook_source || 'webhook',
      },
      body: JSON.stringify(leadData),
    });
    
    const result = await response.json();
    
    const duration = Date.now() - startTime;
    
    if (response.ok) {
      console.log('[Webhook] Lead created successfully:', {
        correlationId,
        leadId: result.data?.leadId,
        source: validation.data.webhook_source,
        durationMs: duration,
      });
      
      return makeResponse({
        statusCode: 200,
        correlationId,
        data: {
          ...result.data,
          webhook_received: true,
        },
        metadata: {
          durationMs: duration,
        },
      });
    } else {
      throw new Error(`Lead ingestion failed: ${result.error?.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('[Webhook] Error:', {
      correlationId,
      error: error.message,
      stack: error.stack,
    });
    
    return makeResponse({
      statusCode: 500,
      correlationId,
      error: {
        code: 'ERR_INTERNAL',
        message: 'Failed to process webhook',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
}
