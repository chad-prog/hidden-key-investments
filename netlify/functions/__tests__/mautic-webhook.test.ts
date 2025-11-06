/**
 * Unit tests for mautic-webhook Netlify function
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../mautic-webhook';
import { createPostEvent, parseResponseBody } from '../../../tests/helpers/netlify';

// Mock @supabase/supabase-js
const mockUpdate = vi.fn();
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockIlike = vi.fn();
const mockFrom = vi.fn();
const mockLimit = vi.fn();

const mockCreateClient = vi.fn(() => ({
  from: mockFrom,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: any[]) => mockCreateClient(...args),
}));

describe('mautic-webhook function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Clear env vars to start in demo mode
    delete process.env.MAUTIC_WEBHOOK_SECRET;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Set up default mock chain
    mockFrom.mockImplementation((table: string) => {
      const baseReturn: any = {
        update: mockUpdate,
        select: mockSelect,
        insert: mockInsert,
      };
      
      return baseReturn;
    });
    
    mockUpdate.mockReturnValue({
      ilike: mockIlike,
    });
    
    mockIlike.mockResolvedValue({
      error: null,
      data: null,
    });
    
    mockSelect.mockReturnValue({
      ilike: vi.fn().mockReturnValue({
        limit: mockLimit,
      }),
    });
    
    mockLimit.mockResolvedValue({
      data: [{ id: 'test-lead-id' }],
      error: null,
    });
    
    mockInsert.mockResolvedValue({
      error: null,
      data: null,
    });
  });

  describe('Request validation', () => {
    it('rejects non-POST requests', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {});
      event.httpMethod = 'GET';

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(405);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('METHOD_NOT_ALLOWED');
    });

    it('handles OPTIONS preflight', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {});
      event.httpMethod = 'OPTIONS';

      const response = await handler(event, {} as any);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe('');
    });

    it('rejects invalid JSON', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {});
      event.body = 'not json';

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(400);
      expect(body.error.code).toBe('INVALID_JSON');
    });
  });

  describe('Secret validation', () => {
    it('accepts request without secret in demo mode', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {});

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
    });

    it('rejects request with wrong secret', async () => {
      process.env.MAUTIC_WEBHOOK_SECRET = 'correct-secret';
      
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {});
      event.queryStringParameters = { secret: 'wrong-secret' };

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(401);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('accepts request with correct secret', async () => {
      process.env.MAUTIC_WEBHOOK_SECRET = 'correct-secret';
      
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {});
      event.queryStringParameters = { secret: 'correct-secret' };

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
    });
  });

  describe('Event processing - demo mode', () => {
    it('handles unsubscribe event', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {
        'mautic.lead_channel_subscription_changed': [{
          lead: {
            id: 123,
            email: 'test@example.com',
          },
          channel: 'email',
          old_status: 'subscribed',
          new_status: 'unsubscribed',
        }],
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.eventsProcessed).toBe(1);
      expect(body.data.results[0].type).toBe('unsubscribe');
      expect(body.data.results[0].email).toBe('test@example.com');
    });

    it('handles bounce event', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {
        'mautic.email_on_bounce': [{
          lead: {
            id: 456,
            email: 'bounce@example.com',
          },
        }],
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.eventsProcessed).toBe(1);
      expect(body.data.results[0].type).toBe('bounce');
      expect(body.data.results[0].email).toBe('bounce@example.com');
    });

    it('handles multiple events', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {
        'mautic.lead_channel_subscription_changed': [{
          lead: { id: 1, email: 'user1@example.com' },
          new_status: 'unsubscribed',
        }],
        'mautic.email_on_bounce': [{
          lead: { id: 2, email: 'user2@example.com' },
        }],
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.eventsProcessed).toBe(2);
    });

    it('ignores events without email', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {
        'mautic.lead_channel_subscription_changed': [{
          lead: { id: 123 }, // No email
          new_status: 'unsubscribed',
        }],
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.eventsReceived).toBe(0);
    });

    it('ignores non-unsubscribe status changes', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {
        'mautic.lead_channel_subscription_changed': [{
          lead: { id: 123, email: 'test@example.com' },
          new_status: 'subscribed',
        }],
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.data.eventsReceived).toBe(0);
    });
  });

  describe('Event processing - production mode', () => {
    beforeEach(() => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
    });

    it('updates lead email status in database', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {
        'mautic.lead_channel_subscription_changed': [{
          lead: {
            id: 123,
            email: 'test@example.com',
          },
          new_status: 'unsubscribed',
        }],
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      
      // Verify database update was called
      expect(mockFrom).toHaveBeenCalledWith('leads');
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockIlike).toHaveBeenCalledWith('email', 'test@example.com');
    });

    it('inserts activity record', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {
        'mautic.email_on_bounce': [{
          lead: {
            id: 456,
            email: 'bounce@example.com',
          },
        }],
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      
      // Verify activity insert was called
      expect(mockInsert).toHaveBeenCalled();
    });

    it('handles database update error gracefully', async () => {
      mockIlike.mockResolvedValueOnce({
        error: { message: 'Database error' },
      });

      const event = createPostEvent('/.netlify/functions/mautic-webhook', {
        'mautic.lead_channel_subscription_changed': [{
          lead: {
            id: 123,
            email: 'test@example.com',
          },
          new_status: 'unsubscribed',
        }],
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.eventsFailed).toBe(1);
      expect(body.data.results[0].processed).toBe(false);
    });

    it('handles missing lead for activity insert', async () => {
      mockLimit.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const event = createPostEvent('/.netlify/functions/mautic-webhook', {
        'mautic.lead_channel_subscription_changed': [{
          lead: {
            id: 123,
            email: 'notfound@example.com',
          },
          new_status: 'unsubscribed',
        }],
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      // Activity insert should be skipped but event still processed
      expect(body.data.eventsProcessed).toBe(1);
    });
  });

  describe('Correlation ID', () => {
    it('uses provided correlation ID from header', async () => {
      const correlationId = 'test-correlation-id';
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {});
      event.headers['x-correlation-id'] = correlationId;

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(body.correlationId).toBe(correlationId);
    });

    it('generates correlation ID if not provided', async () => {
      const event = createPostEvent('/.netlify/functions/mautic-webhook', {});

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      expect(body.correlationId).toBeDefined();
      expect(typeof body.correlationId).toBe('string');
    });
  });

  describe('Error handling', () => {
    it('handles unexpected errors gracefully per event', async () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
      
      // Make mock throw error during update
      mockUpdate.mockReturnValue({
        ilike: vi.fn().mockRejectedValue(new Error('Database error')),
      });

      const event = createPostEvent('/.netlify/functions/mautic-webhook', {
        'mautic.lead_channel_subscription_changed': [{
          lead: {
            id: 123,
            email: 'test@example.com',
          },
          new_status: 'unsubscribed',
        }],
      });

      const response = await handler(event, {} as any);
      const body = parseResponseBody(response);

      // Webhook returns 200 but reports failed events
      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.eventsFailed).toBe(1);
      expect(body.data.eventsProcessed).toBe(0);
    });
  });
});
