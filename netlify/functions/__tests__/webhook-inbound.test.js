/**
 * Tests for webhook-inbound function
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../webhook-inbound.js';
import { createHmac } from 'crypto';

// Mock fetch globally
global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  delete process.env.WEBHOOK_SECRET;
});

describe('webhook-inbound function', () => {
  
  it('rejects non-POST requests', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {},
      body: '{}',
    };
    
    const response = await handler(event);
    const body = JSON.parse(response.body);
    
    expect(response.statusCode).toBe(405);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('ERR_METHOD_NOT_ALLOWED');
  });
  
  it('rejects invalid JSON', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {},
      body: 'invalid json',
    };
    
    const response = await handler(event);
    const body = JSON.parse(response.body);
    
    expect(response.statusCode).toBe(400);
    expect(body.error.code).toBe('ERR_INVALID_JSON');
  });
  
  it('accepts valid webhook payload with minimal data', async () => {
    const payload = {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      webhook_source: 'zapier',
    };
    
    // Mock successful lead ingestion
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          leadId: 'mock-lead-id',
          status: 'created',
        },
      }),
    });
    
    const event = {
      httpMethod: 'POST',
      headers: {
        host: 'example.netlify.app',
        'x-forwarded-proto': 'https',
      },
      body: JSON.stringify(payload),
    };
    
    const response = await handler(event);
    const body = JSON.parse(response.body);
    
    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.data.leadId).toBe('mock-lead-id');
    expect(body.data.webhook_received).toBe(true);
    
    // Verify fetch was called with normalized data
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchCall = global.fetch.mock.calls[0];
    const fetchBody = JSON.parse(fetchCall[1].body);
    
    expect(fetchBody.email).toBe('test@example.com');
    expect(fetchBody.firstName).toBe('John');
    expect(fetchBody.lastName).toBe('Doe');
    expect(fetchBody.source).toBe('zapier');
  });
  
  it('normalizes property data correctly', async () => {
    const payload = {
      email: 'investor@example.com',
      first_name: 'Jane',
      property_address: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      property_type: 'single family',
      property_value: '$500,000',
      webhook_source: 'make',
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: { leadId: 'lead-123', status: 'created' },
      }),
    });
    
    const event = {
      httpMethod: 'POST',
      headers: {
        host: 'example.netlify.app',
        'x-forwarded-proto': 'https',
      },
      body: JSON.stringify(payload),
    };
    
    const response = await handler(event);
    const body = JSON.parse(response.body);
    
    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    
    // Check normalized data
    const fetchCall = global.fetch.mock.calls[0];
    const fetchBody = JSON.parse(fetchCall[1].body);
    
    expect(fetchBody.property).toBeDefined();
    expect(fetchBody.property.address).toBe('123 Main St');
    expect(fetchBody.property.city).toBe('Austin');
    expect(fetchBody.property.state).toBe('TX');
    expect(fetchBody.property.zip).toBe('78701');
    expect(fetchBody.property.propertyType).toBe('single_family');
    expect(fetchBody.property.estimatedValue).toBe(500000);
  });
  
  it('handles flexible field names', async () => {
    const payload = {
      email_address: 'test@example.com', // alternative field name
      firstName: 'Bob', // camelCase
      phone_number: '+1234567890', // snake_case
      contact_phone: '+0987654321', // would use phone_number if both present
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: { leadId: 'lead-456', status: 'created' },
      }),
    });
    
    const event = {
      httpMethod: 'POST',
      headers: {
        host: 'example.netlify.app',
      },
      body: JSON.stringify(payload),
    };
    
    const response = await handler(event);
    const fetchCall = global.fetch.mock.calls[0];
    const fetchBody = JSON.parse(fetchCall[1].body);
    
    expect(fetchBody.email).toBe('test@example.com');
    expect(fetchBody.firstName).toBe('Bob');
    expect(fetchBody.phone).toBe('+1234567890');
  });
  
  it('verifies webhook signature when secret is configured', async () => {
    const payload = {
      email: 'test@example.com',
      first_name: 'Secure',
    };
    
    const webhookSecret = 'test-secret-key';
    process.env.WEBHOOK_SECRET = webhookSecret;
    
    const signature = createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: { leadId: 'lead-789', status: 'created' },
      }),
    });
    
    const event = {
      httpMethod: 'POST',
      headers: {
        host: 'example.netlify.app',
        'x-webhook-signature': signature,
      },
      body: JSON.stringify(payload),
    };
    
    const response = await handler(event);
    const body = JSON.parse(response.body);
    
    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
  });
  
  it('rejects invalid webhook signature', async () => {
    const payload = {
      email: 'test@example.com',
    };
    
    process.env.WEBHOOK_SECRET = 'test-secret-key';
    
    const event = {
      httpMethod: 'POST',
      headers: {
        host: 'example.netlify.app',
        'x-webhook-signature': 'invalid-signature',
      },
      body: JSON.stringify(payload),
    };
    
    const response = await handler(event);
    const body = JSON.parse(response.body);
    
    expect(response.statusCode).toBe(401);
    expect(body.error.code).toBe('ERR_INVALID_SIGNATURE');
  });
  
  it('stores custom fields', async () => {
    const payload = {
      email: 'test@example.com',
      custom_field_1: 'value1',
      custom_field_2: 'value2',
      random_data: { nested: 'object' },
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: { leadId: 'lead-custom', status: 'created' },
      }),
    });
    
    const event = {
      httpMethod: 'POST',
      headers: {
        host: 'example.netlify.app',
      },
      body: JSON.stringify(payload),
    };
    
    await handler(event);
    
    const fetchCall = global.fetch.mock.calls[0];
    const fetchBody = JSON.parse(fetchCall[1].body);
    
    expect(fetchBody.customFields).toBeDefined();
    expect(fetchBody.customFields.custom_field_1).toBe('value1');
    expect(fetchBody.customFields.custom_field_2).toBe('value2');
    expect(fetchBody.customFields.random_data).toEqual({ nested: 'object' });
  });
  
  it('handles lead ingestion failure', async () => {
    const payload = {
      email: 'test@example.com',
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        ok: false,
        error: {
          code: 'ERR_VALIDATION',
          message: 'Validation failed',
        },
      }),
    });
    
    const event = {
      httpMethod: 'POST',
      headers: {
        host: 'example.netlify.app',
      },
      body: JSON.stringify(payload),
    };
    
    const response = await handler(event);
    const body = JSON.parse(response.body);
    
    expect(response.statusCode).toBe(500);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('ERR_INTERNAL');
  });
  
  it('includes UTM tracking when provided', async () => {
    const payload = {
      email: 'marketing@example.com',
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'spring_2024',
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: { leadId: 'lead-utm', status: 'created' },
      }),
    });
    
    const event = {
      httpMethod: 'POST',
      headers: {
        host: 'example.netlify.app',
      },
      body: JSON.stringify(payload),
    };
    
    await handler(event);
    
    const fetchCall = global.fetch.mock.calls[0];
    const fetchBody = JSON.parse(fetchCall[1].body);
    
    expect(fetchBody.utm).toBeDefined();
    expect(fetchBody.utm.source).toBe('google');
    expect(fetchBody.utm.medium).toBe('cpc');
    expect(fetchBody.utm.campaign).toBe('spring_2024');
  });
  
});
