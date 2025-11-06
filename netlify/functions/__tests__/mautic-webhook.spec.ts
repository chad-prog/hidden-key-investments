/**
 * Tests for mautic-webhook Netlify function
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handler } from '../mautic-webhook';
import { invokeHandler, parseResponse } from '../../../tests/helpers/netlify';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

describe('mautic-webhook function', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Default mock responses
    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('secret validation', () => {
    it('should reject request with invalid secret', async () => {
      process.env.MAUTIC_WEBHOOK_SECRET = 'correct-secret';

      const response = await invokeHandler(handler, {
        queryStringParameters: { secret: 'wrong-secret' },
        body: JSON.stringify({ event: 'unsubscribe' }),
      });

      expect(response.statusCode).toBe(403);
      const body = parseResponse(response);
      expect(body.ok).toBe(false);
      expect(body.error).toContain('Invalid webhook secret');
    });

    it('should accept request with correct secret', async () => {
      process.env.MAUTIC_WEBHOOK_SECRET = 'correct-secret';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE = 'test-key';

      const response = await invokeHandler(handler, {
        queryStringParameters: { secret: 'correct-secret' },
        body: JSON.stringify({
          event: 'unsubscribe',
          email: 'test@example.com',
        }),
      });

      expect(response.statusCode).toBe(200);
    });

    it('should accept request in demo mode without secret', async () => {
      delete process.env.MAUTIC_WEBHOOK_SECRET;

      const response = await invokeHandler(handler, {
        body: JSON.stringify({
          event: 'unsubscribe',
          email: 'test@example.com',
        }),
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('event processing', () => {
    beforeEach(() => {
      process.env.MAUTIC_WEBHOOK_SECRET = 'test-secret';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE = 'test-key';
    });

    it('should process unsubscribe event', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockResolvedValue({
        data: [{ id: 1, email: 'test@example.com' }],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate,
        insert: vi.fn().mockReturnThis(),
        eq: mockEq,
        select: mockSelect,
      });

      const response = await invokeHandler(handler, {
        queryStringParameters: { secret: 'test-secret' },
        body: JSON.stringify({
          event: 'unsubscribe',
          email: 'test@example.com',
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.ok).toBe(true);
      expect(body.email).toBe('test@example.com');
      expect(body.emailStatus).toBe('unsubscribed');
      expect(body.marketingOptIn).toBe(false);

      // Verify database update was called
      expect(mockUpdate).toHaveBeenCalledWith({
        email_status: 'unsubscribed',
        marketing_opt_in: false,
        email_status_updated_at: expect.any(String),
        updated_at: expect.any(String),
      });
      expect(mockEq).toHaveBeenCalledWith('email', 'test@example.com');
    });

    it('should process bounce event', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockResolvedValue({
        data: [{ id: 1 }],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate,
        insert: vi.fn().mockReturnThis(),
        eq: mockEq,
        select: mockSelect,
      });

      const response = await invokeHandler(handler, {
        queryStringParameters: { secret: 'test-secret' },
        body: JSON.stringify({
          event: 'bounce',
          email: 'bounced@example.com',
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.emailStatus).toBe('bounced');
      expect(body.marketingOptIn).toBe(false);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          email_status: 'bounced',
          marketing_opt_in: false,
        })
      );
    });

    it('should process complaint event', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockResolvedValue({
        data: [{ id: 1 }],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate,
        insert: vi.fn().mockReturnThis(),
        eq: mockEq,
        select: mockSelect,
      });

      const response = await invokeHandler(handler, {
        queryStringParameters: { secret: 'test-secret' },
        body: JSON.stringify({
          event: 'complaint',
          email: 'complaint@example.com',
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.emailStatus).toBe('complaint');
      expect(body.marketingOptIn).toBe(false);
    });

    it('should handle mautic.lead_post_save_update structure', async () => {
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockResolvedValue({
        data: [{ id: 1 }],
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate,
        insert: vi.fn().mockReturnThis(),
        eq: mockEq,
        select: mockSelect,
      });

      const response = await invokeHandler(handler, {
        queryStringParameters: { secret: 'test-secret' },
        body: JSON.stringify({
          'mautic.lead_post_save_update': [
            {
              lead: {
                id: 123,
                email: 'mautic@example.com',
              },
              event: 'unsubscribe',
            },
          ],
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.email).toBe('mautic@example.com');
      expect(body.emailStatus).toBe('unsubscribed');
    });

    it('should return success for non-actionable event', async () => {
      // Use demo mode for non-actionable events
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE;
      delete process.env.MAUTIC_WEBHOOK_SECRET;
      
      const response = await invokeHandler(handler, {
        body: JSON.stringify({
          // Empty event - passes validation but has no actionable data
          'mautic.email_on_send': [{ test: 'data' }],
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.ok).toBe(true);
      expect(body.message).toContain('No actionable event');
    });
  });

  describe('activity logging', () => {
    beforeEach(() => {
      process.env.MAUTIC_WEBHOOK_SECRET = 'test-secret';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE = 'test-key';
    });

    it('should insert activity record', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'leads') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
          };
        } else if (table === 'activities') {
          return {
            insert: mockInsert,
          };
        }
        return {};
      });

      const response = await invokeHandler(handler, {
        queryStringParameters: { secret: 'test-secret' },
        body: JSON.stringify({
          event: 'unsubscribe',
          email: 'test@example.com',
        }),
      });

      expect(response.statusCode).toBe(200);
      
      // Verify activity insert was called
      expect(mockInsert).toHaveBeenCalledWith({
        id: expect.any(String),
        type: 'mautic_webhook',
        description: 'Mautic webhook: unsubscribe',
        metadata: expect.objectContaining({
          email: 'test@example.com',
          event: 'unsubscribe',
          emailStatus: 'unsubscribed',
          marketingOptIn: false,
        }),
        created_at: expect.any(String),
      });
    });

    it('should continue on activity insert failure', async () => {
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'leads') {
          return {
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            select: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
          };
        } else if (table === 'activities') {
          return {
            insert: vi.fn().mockResolvedValue({ error: new Error('Activity insert failed') }),
          };
        }
        return {};
      });

      const response = await invokeHandler(handler, {
        queryStringParameters: { secret: 'test-secret' },
        body: JSON.stringify({
          event: 'unsubscribe',
          email: 'test@example.com',
        }),
      });

      // Should still succeed even if activity insert fails
      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.ok).toBe(true);
    });
  });

  describe('demo mode', () => {
    it('should handle demo mode gracefully', async () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_SERVICE_ROLE;
      delete process.env.MAUTIC_WEBHOOK_SECRET;

      const response = await invokeHandler(handler, {
        body: JSON.stringify({
          event: 'unsubscribe',
          email: 'demo@example.com',
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.ok).toBe(true);
      expect(body.demoMode).toBe(true);
      expect(body.email).toBe('demo@example.com');
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      process.env.MAUTIC_WEBHOOK_SECRET = 'test-secret';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE = 'test-key';
    });

    it('should handle database error', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      });

      const response = await invokeHandler(handler, {
        queryStringParameters: { secret: 'test-secret' },
        body: JSON.stringify({
          event: 'unsubscribe',
          email: 'test@example.com',
        }),
      });

      expect(response.statusCode).toBe(500);
      const body = parseResponse(response);
      expect(body.ok).toBe(false);
      expect(body.error).toContain('Database update failed');
    });

    it('should handle invalid JSON', async () => {
      const response = await invokeHandler(handler, {
        queryStringParameters: { secret: 'test-secret' },
        body: 'invalid json{',
      });

      expect(response.statusCode).toBe(500);
      const body = parseResponse(response);
      expect(body.ok).toBe(false);
    });

    it('should reject non-POST requests', async () => {
      const response = await invokeHandler(handler, {
        httpMethod: 'GET',
        queryStringParameters: { secret: 'test-secret' },
      });

      expect(response.statusCode).toBe(405);
      const body = parseResponse(response);
      expect(body.error).toContain('Method not allowed');
    });
  });

  describe('correlation ID', () => {
    beforeEach(() => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_SERVICE_ROLE = 'test-key';
      process.env.MAUTIC_WEBHOOK_SECRET = 'test-secret';
    });

    it('should use provided correlation ID', async () => {
      const response = await invokeHandler(handler, {
        headers: { 'x-correlation-id': 'webhook-123' },
        queryStringParameters: { secret: 'test-secret' },
        body: JSON.stringify({
          event: 'unsubscribe',
          email: 'test@example.com',
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.correlationId).toBe('webhook-123');
    });

    it('should generate correlation ID if not provided', async () => {
      const response = await invokeHandler(handler, {
        queryStringParameters: { secret: 'test-secret' },
        body: JSON.stringify({
          event: 'unsubscribe',
          email: 'test@example.com',
        }),
      });

      expect(response.statusCode).toBe(200);
      const body = parseResponse(response);
      expect(body.correlationId).toMatch(/^[0-9a-f-]{36}$/);
    });
  });
});
