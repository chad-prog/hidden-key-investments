/**
 * Unit tests for mautic-sync Netlify function
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handler, __resetTokenCache, getAccessTokenForTestOnly } from '../mautic-sync';
import { createPostEvent, parseResponseBody } from '../../../tests/helpers/netlify';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('mautic-sync function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetTokenCache();
    
    // Clear Mautic env vars to start in demo mode
    delete process.env.MAUTIC_BASE_URL;
    delete process.env.MAUTIC_CLIENT_ID;
    delete process.env.MAUTIC_CLIENT_SECRET;
  });

  afterEach(() => {
    __resetTokenCache();
  });

  describe('Request validation', () => {
    it('rejects non-POST requests', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-sync', { action: 'ping' });
      event.httpMethod = 'GET';

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(405);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('METHOD_NOT_ALLOWED');
    });

    it('handles OPTIONS preflight', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-sync', {});
      event.httpMethod = 'OPTIONS';

      const response = await handler(event, {} as any);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('');
      expect(response.headers?.['Access-Control-Allow-Origin']).toBe('*');
    });

    it('rejects invalid JSON', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-sync', {});
      event.body = 'not json';

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(400);
      expect(body.error.code).toBe('INVALID_JSON');
    });

    it('validates action field', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-sync', {
        action: 'invalid_action',
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('validates upsert_contact payload', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-sync', {
        action: 'upsert_contact',
        payload: {
          id: 'not-a-uuid',
        },
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('validates add_to_campaign payload', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-sync', {
        action: 'add_to_campaign',
        // Missing mauticContactId and campaignId
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(400);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Demo mode', () => {
    it('returns demo mode response for ping', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-sync', {
        action: 'ping',
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.demoMode).toBe(true);
    });

    it('returns demo mode response for upsert_contact', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-sync', {
        action: 'upsert_contact',
        payload: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          contact: {
            email: 'test@example.com',
          },
        },
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.demoMode).toBe(true);
      expect(body.data.action).toBe('upsert_contact');
    });

    it('returns demo mode response for add_to_campaign', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-sync', {
        action: 'add_to_campaign',
        mauticContactId: '123',
        campaignId: '456',
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.demoMode).toBe(true);
    });
  });

  describe('Correlation ID', () => {
    it('uses provided correlation ID from header', async () => {
      const correlationId = 'test-correlation-id';
      const event = createPostEvent('/.netlify/functions/mautic-sync', {
        action: 'ping',
      });
      event.headers['x-correlation-id'] = correlationId;

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(body.correlationId).toBe(correlationId);
    });

    it('generates correlation ID if not provided', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-sync', {
        action: 'ping',
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(body.correlationId).toBeDefined();
      expect(typeof body.correlationId).toBe('string');
      expect(body.correlationId.length).toBeGreaterThan(0);
    });
  });

  describe('Token caching', () => {
    beforeEach(() => {
      // Set up Mautic config for production mode
      process.env.MAUTIC_BASE_URL = 'https://test.mautic.com';
      process.env.MAUTIC_CLIENT_ID = 'test-client-id';
      process.env.MAUTIC_CLIENT_SECRET = 'test-client-secret';
    });

    it('caches access token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test-token',
          expires_in: 3600,
        }),
      });

      const token1 = await getAccessTokenForTestOnly();
      const token2 = await getAccessTokenForTestOnly();

      expect(token1).toBe('test-token');
      expect(token2).toBe('test-token');
      expect(mockFetch).toHaveBeenCalledTimes(1); // Only called once due to caching
    });

    it('refreshes token when expired', async () => {
      // First token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'token-1',
          expires_in: 0, // Expires immediately
        }),
      });

      const token1 = await getAccessTokenForTestOnly();
      expect(token1).toBe('token-1');

      // Reset cache manually
      __resetTokenCache();

      // Second token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'token-2',
          expires_in: 3600,
        }),
      });

      const token2 = await getAccessTokenForTestOnly();
      expect(token2).toBe('token-2');

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Production mode - upsert_contact', () => {
    beforeEach(() => {
      process.env.MAUTIC_BASE_URL = 'https://test.mautic.com';
      process.env.MAUTIC_CLIENT_ID = 'test-client-id';
      process.env.MAUTIC_CLIENT_SECRET = 'test-client-secret';
    });

    it('creates new contact when email not found', async () => {
      // Mock OAuth token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test-token',
          expires_in: 3600,
        }),
      });

      // Mock contact search (not found)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: {},
        }),
      });

      // Mock contact creation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contact: {
            id: 123,
            fields: { all: { email: 'test@example.com' } },
          },
        }),
      });

      const event = createPostEvent('/.netlify/functions/mautic-sync', {
        action: 'upsert_contact',
        payload: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          contact: {
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
          },
        },
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.success).toBe(true);
      expect(body.data.action).toBe('created');
      expect(mockFetch).toHaveBeenCalledTimes(3); // Token + search + create
    });

    it('updates existing contact when email found', async () => {
      // Mock OAuth token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test-token',
          expires_in: 3600,
        }),
      });

      // Mock contact search (found)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: {
            '456': {
              id: 456,
              fields: { all: { email: 'test@example.com' } },
            },
          },
        }),
      });

      // Mock contact update
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contact: {
            id: 456,
            fields: { all: { email: 'test@example.com' } },
          },
        }),
      });

      const event = createPostEvent('/.netlify/functions/mautic-sync', {
        action: 'upsert_contact',
        payload: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          contact: {
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
          },
        },
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.success).toBe(true);
      expect(body.data.action).toBe('updated');
      expect(body.data.contactId).toBe(456); // Number, not string
    });
  });

  describe('Production mode - add_to_campaign', () => {
    beforeEach(() => {
      process.env.MAUTIC_BASE_URL = 'https://test.mautic.com';
      process.env.MAUTIC_CLIENT_ID = 'test-client-id';
      process.env.MAUTIC_CLIENT_SECRET = 'test-client-secret';
    });

    it('adds contact to campaign', async () => {
      // Mock OAuth token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test-token',
          expires_in: 3600,
        }),
      });

      // Mock add to campaign
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
        }),
      });

      const event = createPostEvent('/.netlify/functions/mautic-sync', {
        action: 'add_to_campaign',
        mauticContactId: '123',
        campaignId: '456',
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.success).toBe(true);
      expect(body.data.message).toContain('123');
      expect(body.data.message).toContain('456');
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      process.env.MAUTIC_BASE_URL = 'https://test.mautic.com';
      process.env.MAUTIC_CLIENT_ID = 'test-client-id';
      process.env.MAUTIC_CLIENT_SECRET = 'test-client-secret';
    });

    it('handles OAuth token fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const event = createPostEvent('/.netlify/functions/mautic-sync', {
        action: 'upsert_contact',
        payload: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          contact: { email: 'test@example.com' },
        },
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(500);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('INTERNAL_ERROR');
    });

    it('handles Mautic API error', async () => {
      // Mock OAuth token
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test-token',
          expires_in: 3600,
        }),
      });

      // Mock contact search success
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ contacts: {} }),
      });

      // Mock contact creation failure
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      const event = createPostEvent('/.netlify/functions/mautic-sync', {
        action: 'upsert_contact',
        payload: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          contact: { email: 'test@example.com' },
        },
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(500);
      expect(body.ok).toBe(false);
    });
  });
});
