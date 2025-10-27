/**
 * Tests for health check endpoint
 */

import { handler } from '../health.js';
import { describe, test, expect, beforeEach, afterAll } from 'vitest';

describe('health endpoint', () => {
  const mockEvent = {
    httpMethod: 'GET',
    headers: {},
    body: null
  };
  
  const mockContext = {};

  // Store original environment
  const originalEnv = { ...process.env };

  // Reset environment before each test
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Basic functionality', () => {
    test('returns 200 status code when all services healthy or degraded', async () => {
      const response = await handler(mockEvent, mockContext);
      
      expect(response.statusCode).toBe(200);
      expect(response.headers['Content-Type']).toBe('application/json');
    });

    test('returns valid JSON response', async () => {
      const response = await handler(mockEvent, mockContext);
      
      expect(() => JSON.parse(response.body)).not.toThrow();
      
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('timestamp');
      expect(body).toHaveProperty('checks');
    });

    test('includes version information', async () => {
      process.env.VITE_APP_VERSION = '1.2.3';
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.version).toBe('1.2.3');
    });

    test('includes environment information', async () => {
      process.env.CONTEXT = 'production';
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.environment).toBe('production');
    });

    test('includes response time metrics', async () => {
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body).toHaveProperty('durationMs');
      expect(typeof body.durationMs).toBe('number');
      expect(body.durationMs).toBeGreaterThanOrEqual(0);
    });

    test('has no-cache headers', async () => {
      const response = await handler(mockEvent, mockContext);
      
      expect(response.headers['Cache-Control']).toContain('no-cache');
      expect(response.headers['Pragma']).toBe('no-cache');
    });
  });

  describe('Service checks', () => {
    test('checks all critical services', async () => {
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks).toHaveProperty('database');
      expect(body.checks).toHaveProperty('mailchimp');
      expect(body.checks).toHaveProperty('airtable');
      expect(body.checks).toHaveProperty('sentry');
      expect(body.checks).toHaveProperty('sendgrid');
      expect(body.checks).toHaveProperty('twilio');
    });

    test('each service check has required properties', async () => {
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      Object.values(body.checks).forEach(check => {
        expect(check).toHaveProperty('status');
        expect(check).toHaveProperty('message');
        expect(check).toHaveProperty('details');
        expect(['healthy', 'degraded', 'unhealthy']).toContain(check.status);
      });
    });
  });

  describe('Database check', () => {
    test('reports healthy when Supabase is configured', async () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-key';
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.database.status).toBe('healthy');
      expect(body.checks.database.details.configured).toBe(true);
    });

    test('reports degraded when Supabase not configured', async () => {
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_ANON_KEY;
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.database.status).toBe('degraded');
      expect(body.checks.database.details.configured).toBe(false);
      expect(body.checks.database.details.demo_mode).toBe(true);
    });

    test('reports degraded when only URL is configured', async () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.SUPABASE_ANON_KEY;
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.database.status).toBe('degraded');
    });
  });

  describe('Mailchimp check', () => {
    test('reports healthy when fully configured', async () => {
      process.env.MAILCHIMP_API_KEY = 'test-key';
      process.env.MAILCHIMP_AUDIENCE_ID = 'test-audience';
      process.env.MAILCHIMP_SERVER_PREFIX = 'us1';
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.mailchimp.status).toBe('healthy');
      expect(body.checks.mailchimp.details.configured).toBe(true);
    });

    test('reports degraded when not configured', async () => {
      delete process.env.MAILCHIMP_API_KEY;
      delete process.env.MAILCHIMP_AUDIENCE_ID;
      delete process.env.MAILCHIMP_SERVER_PREFIX;
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.mailchimp.status).toBe('degraded');
      expect(body.checks.mailchimp.details.demo_mode).toBe(true);
    });

    test('reports missing configuration details', async () => {
      delete process.env.MAILCHIMP_API_KEY;
      process.env.MAILCHIMP_AUDIENCE_ID = 'test-audience';
      process.env.MAILCHIMP_SERVER_PREFIX = 'us1';
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.mailchimp.details.missing).toContain('MAILCHIMP_API_KEY');
    });
  });

  describe('Airtable check', () => {
    test('reports healthy when configured', async () => {
      process.env.AIRTABLE_API_KEY = 'test-key';
      process.env.AIRTABLE_BASE_ID = 'test-base';
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.airtable.status).toBe('healthy');
      expect(body.checks.airtable.details.configured).toBe(true);
    });

    test('reports degraded when not configured', async () => {
      delete process.env.AIRTABLE_API_KEY;
      delete process.env.AIRTABLE_BASE_ID;
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.airtable.status).toBe('degraded');
      expect(body.checks.airtable.details.demo_mode).toBe(true);
    });
  });

  describe('Sentry check', () => {
    test('reports healthy when configured', async () => {
      process.env.VITE_SENTRY_DSN = 'https://test@sentry.io/123';
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.sentry.status).toBe('healthy');
      expect(body.checks.sentry.details.configured).toBe(true);
    });

    test('reports degraded when not configured', async () => {
      delete process.env.VITE_SENTRY_DSN;
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.sentry.status).toBe('degraded');
      expect(body.checks.sentry.details.configured).toBe(false);
    });

    test('includes recommendation when not configured', async () => {
      delete process.env.VITE_SENTRY_DSN;
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.sentry.details.recommendation).toContain('Configure VITE_SENTRY_DSN');
    });
  });

  describe('SendGrid check', () => {
    test('reports healthy when configured', async () => {
      process.env.SENDGRID_API_KEY = 'test-key';
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.sendgrid.status).toBe('healthy');
      expect(body.checks.sendgrid.details.configured).toBe(true);
    });

    test('reports degraded when not configured', async () => {
      delete process.env.SENDGRID_API_KEY;
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.sendgrid.status).toBe('degraded');
      expect(body.checks.sendgrid.details.optional).toBe(true);
    });
  });

  describe('Twilio check', () => {
    test('reports healthy when fully configured', async () => {
      process.env.TWILIO_ACCOUNT_SID = 'test-sid';
      process.env.TWILIO_AUTH_TOKEN = 'test-token';
      process.env.TWILIO_PHONE_NUMBER = '+1234567890';
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.twilio.status).toBe('healthy');
      expect(body.checks.twilio.details.configured).toBe(true);
    });

    test('reports degraded when not configured', async () => {
      delete process.env.TWILIO_ACCOUNT_SID;
      delete process.env.TWILIO_AUTH_TOKEN;
      delete process.env.TWILIO_PHONE_NUMBER;
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.checks.twilio.status).toBe('degraded');
      expect(body.checks.twilio.details.optional).toBe(true);
    });
  });

  describe('Overall status determination', () => {
    test('reports healthy when all services are healthy', async () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-key';
      process.env.MAILCHIMP_API_KEY = 'test-key';
      process.env.MAILCHIMP_AUDIENCE_ID = 'test-audience';
      process.env.MAILCHIMP_SERVER_PREFIX = 'us1';
      process.env.AIRTABLE_API_KEY = 'test-key';
      process.env.AIRTABLE_BASE_ID = 'test-base';
      process.env.VITE_SENTRY_DSN = 'https://test@sentry.io/123';
      process.env.SENDGRID_API_KEY = 'test-key';
      process.env.TWILIO_ACCOUNT_SID = 'test-sid';
      process.env.TWILIO_AUTH_TOKEN = 'test-token';
      process.env.TWILIO_PHONE_NUMBER = '+1234567890';
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.status).toBe('healthy');
      expect(response.statusCode).toBe(200);
    });

    test('reports degraded when some services are in demo mode', async () => {
      // Configure only critical services
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_ANON_KEY = 'test-key';
      
      // Leave others unconfigured
      delete process.env.MAILCHIMP_API_KEY;
      delete process.env.AIRTABLE_API_KEY;
      
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.status).toBe('degraded');
      expect(response.statusCode).toBe(200);
      expect(body.metadata.services_in_demo_mode).toBeGreaterThan(0);
    });

    test('includes service count metadata', async () => {
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.metadata).toHaveProperty('total_services');
      expect(body.metadata).toHaveProperty('healthy_services');
      expect(body.metadata.total_services).toBe(6); // database, mailchimp, airtable, sentry, sendgrid, twilio
    });
  });

  describe('Error handling', () => {
    test('handles errors gracefully', async () => {
      // This test ensures the handler doesn't throw even with unexpected conditions
      const response = await handler(mockEvent, mockContext);
      
      expect(response).toHaveProperty('statusCode');
      expect(response).toHaveProperty('body');
      expect(() => JSON.parse(response.body)).not.toThrow();
    });

    test('includes timestamp even on errors', async () => {
      const response = await handler(mockEvent, mockContext);
      const body = JSON.parse(response.body);
      
      expect(body.timestamp).toBeDefined();
      expect(() => new Date(body.timestamp)).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('completes within reasonable time', async () => {
      const startTime = Date.now();
      const response = await handler(mockEvent, mockContext);
      const endTime = Date.now();
      const body = JSON.parse(response.body);
      
      const duration = endTime - startTime;
      
      // Should complete in less than 100ms
      expect(duration).toBeLessThan(100);
      expect(body.durationMs).toBeLessThan(100);
    });
  });
});
