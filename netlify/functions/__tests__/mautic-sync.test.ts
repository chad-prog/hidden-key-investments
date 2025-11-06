/**
 * Tests for mautic-sync Netlify function
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handler, getAccessTokenForTestOnly, __resetTokenCache } from '../mautic-sync';
import { invokeHandler, parseResponse } from '../../../tests/helpers/netlify';

describe('mautic-sync function', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let fetchMock: any;

  beforeEach(() => {
    originalEnv = { ...process.env };
    __resetTokenCache();
    
    // Mock global fetch
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('ping action', () => {
    it('should return pong in demo mode', async () => {
      // No MAUTIC env vars = demo mode
      delete process.env.MAUTIC_BASE_URL;
      delete process.env.MAUTIC_CLIENT_ID;
      delete process.env.MAUTIC_CLIENT_SECRET;

      const response = await invokeHandler(handler, {
        body: JSON.stringify({ action: 'ping' }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.ok).toBe(true);
      expect(body.message).toContain('pong');
      expect(body.correlationId).toBeDefined();
    });

    it('should verify token in production mode', async () => {
      process.env.MAUTIC_BASE_URL = 'https://mautic.example.com';
      process.env.MAUTIC_CLIENT_ID = 'test-client-id';
      process.env.MAUTIC_CLIENT_SECRET = 'test-client-secret';

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test-token',
          expires_in: 3600,
        }),
      });

      const response = await invokeHandler(handler, {
        body: JSON.stringify({ action: 'ping' }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.ok).toBe(true);
      expect(body.message).toBe('pong');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('token caching', () => {
    beforeEach(() => {
      process.env.MAUTIC_BASE_URL = 'https://mautic.example.com';
      process.env.MAUTIC_CLIENT_ID = 'test-client-id';
      process.env.MAUTIC_CLIENT_SECRET = 'test-client-secret';
    });

    it('should cache access token', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'cached-token',
          expires_in: 3600,
        }),
      });

      // First call - should fetch token
      const token1 = await getAccessTokenForTestOnly('test-corr-1');
      expect(token1).toBe('cached-token');
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Second call - should use cached token
      const token2 = await getAccessTokenForTestOnly('test-corr-2');
      expect(token2).toBe('cached-token');
      expect(fetchMock).toHaveBeenCalledTimes(1); // Still 1
    });

    it('should refresh expired token', async () => {
      // First token with immediate expiry
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'token-1',
          expires_in: 1, // Very short expiry (1 second)
        }),
      });

      const token1 = await getAccessTokenForTestOnly('test-corr-1');
      expect(token1).toBe('token-1');

      // Clear the cache to simulate expired token
      __resetTokenCache();

      // Setup second token mock
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'token-2',
          expires_in: 3600,
        }),
      });

      const token2 = await getAccessTokenForTestOnly('test-corr-2');
      expect(token2).toBe('token-2');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('upsert_contact action', () => {
    it('should return demo response when in demo mode', async () => {
      delete process.env.MAUTIC_BASE_URL;

      const response = await invokeHandler(handler, {
        body: JSON.stringify({
          action: 'upsert_contact',
          payload: {
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
          },
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.ok).toBe(true);
      expect(body.demoMode).toBe(true);
      expect(body.email).toBe('test@example.com');
    });

    it('should create new contact when not exists', async () => {
      process.env.MAUTIC_BASE_URL = 'https://mautic.example.com';
      process.env.MAUTIC_CLIENT_ID = 'test-client-id';
      process.env.MAUTIC_CLIENT_SECRET = 'test-client-secret';

      // Mock token fetch
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test-token',
          expires_in: 3600,
        }),
      });

      // Mock search - no contacts found
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ contacts: {} }),
      });

      // Mock create contact
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contact: { id: 123, email: 'test@example.com' },
        }),
      });

      const response = await invokeHandler(handler, {
        body: JSON.stringify({
          action: 'upsert_contact',
          payload: {
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            phone: '+1-555-1234',
          },
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.ok).toBe(true);
      expect(body.action).toBe('upsert_contact');
      expect(body.contactId).toBe(123);
      expect(body.created).toBe(true);
      expect(body.email).toBe('test@example.com');
    });

    it('should update existing contact', async () => {
      process.env.MAUTIC_BASE_URL = 'https://mautic.example.com';
      process.env.MAUTIC_CLIENT_ID = 'test-client-id';
      process.env.MAUTIC_CLIENT_SECRET = 'test-client-secret';

      // Mock token fetch
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test-token',
          expires_in: 3600,
        }),
      });

      // Mock search - contact exists
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: {
            '456': {
              id: 456,
              email: 'test@example.com',
              fields: { all: {} },
            },
          },
        }),
      });

      // Mock update contact
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contact: { id: 456, email: 'test@example.com' },
        }),
      });

      const response = await invokeHandler(handler, {
        body: JSON.stringify({
          action: 'upsert_contact',
          payload: {
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User Updated',
          },
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.ok).toBe(true);
      expect(body.contactId).toBe(456);
      expect(body.created).toBe(false);
    });

    it('should skip stale update', async () => {
      process.env.MAUTIC_BASE_URL = 'https://mautic.example.com';
      process.env.MAUTIC_CLIENT_ID = 'test-client-id';
      process.env.MAUTIC_CLIENT_SECRET = 'test-client-secret';

      // Mock token fetch
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test-token',
          expires_in: 3600,
        }),
      });

      // Mock search - contact exists with newer timestamp
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: {
            '456': {
              id: 456,
              email: 'test@example.com',
              fields: {
                all: {
                  last_platform_update: '2024-11-06T12:00:00Z',
                },
              },
            },
          },
        }),
      });

      const response = await invokeHandler(handler, {
        body: JSON.stringify({
          action: 'upsert_contact',
          payload: {
            email: 'test@example.com',
            firstName: 'Test',
            updated_at: '2024-11-06T11:00:00Z', // Older timestamp
          },
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.ok).toBe(true);
      expect(body.skipped).toBe(true);
      expect(body.reason).toBe('stale_data');
      expect(body.contactId).toBe(456);
    });
  });

  describe('add_to_campaign action', () => {
    it('should return demo response when in demo mode', async () => {
      delete process.env.MAUTIC_BASE_URL;

      const response = await invokeHandler(handler, {
        body: JSON.stringify({
          action: 'add_to_campaign',
          payload: {
            email: 'test@example.com',
            campaignId: '123',
          },
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.ok).toBe(true);
      expect(body.demoMode).toBe(true);
      expect(body.campaignId).toBe('123');
    });

    it('should add contact to campaign', async () => {
      process.env.MAUTIC_BASE_URL = 'https://mautic.example.com';
      process.env.MAUTIC_CLIENT_ID = 'test-client-id';
      process.env.MAUTIC_CLIENT_SECRET = 'test-client-secret';

      // Mock token fetch
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test-token',
          expires_in: 3600,
        }),
      });

      // Mock search - contact exists
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          contacts: {
            '456': { id: 456, email: 'test@example.com' },
          },
        }),
      });

      // Mock add to campaign
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const response = await invokeHandler(handler, {
        body: JSON.stringify({
          action: 'add_to_campaign',
          payload: {
            email: 'test@example.com',
            campaignId: '123',
          },
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.ok).toBe(true);
      expect(body.contactId).toBe(456);
      expect(body.campaignId).toBe('123');
    });
  });

  describe('validation', () => {
    it('should reject invalid action', async () => {
      const response = await invokeHandler(handler, {
        body: JSON.stringify({ action: 'invalid_action' }),
      });

      expect(response.statusCode).toBe(400);
      const body = parseResponse(response);
      expect(body.ok).toBe(false);
      expect(body.error).toContain('Validation failed');
    });

    it('should reject missing payload for upsert_contact', async () => {
      const response = await invokeHandler(handler, {
        body: JSON.stringify({ action: 'upsert_contact' }),
      });

      expect(response.statusCode).toBe(400);
      const body = parseResponse(response);
      expect(body.ok).toBe(false);
    });

    it('should reject invalid email', async () => {
      const response = await invokeHandler(handler, {
        body: JSON.stringify({
          action: 'upsert_contact',
          payload: { email: 'not-an-email' },
        }),
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('correlation ID', () => {
    it('should use provided correlation ID', async () => {
      delete process.env.MAUTIC_BASE_URL;

      const response = await invokeHandler(handler, {
        headers: { 'x-correlation-id': 'custom-id-123' },
        body: JSON.stringify({ action: 'ping' }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.correlationId).toBe('custom-id-123');
      expect(response.headers['X-Correlation-ID']).toBe('custom-id-123');
    });

    it('should generate correlation ID if not provided', async () => {
      delete process.env.MAUTIC_BASE_URL;

      const response = await invokeHandler(handler, {
        body: JSON.stringify({ action: 'ping' }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.correlationId).toMatch(/^[0-9a-f-]{36}$/);
    });
  });
});
