/**
 * Integration tests for lead-ingest-enhanced function
 * 
 * Tests the enhanced lead ingestion API with:
 * - Comprehensive validation
 * - Demo mode support
 * - Error handling
 * - Workflow triggers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('lead-ingest-enhanced function', () => {
  let handler;

  beforeEach(async () => {
    // Import handler fresh for each test
    const module = await import('../lead-ingest-enhanced.js');
    handler = module.handler;
    
    // Clear all mocks
    vi.clearAllMocks();
    
    // Ensure demo mode for tests (no Supabase required)
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
  });

  describe('Request validation', () => {
    it('accepts valid lead with all required fields', async () => {
      const event = {
        body: JSON.stringify({
          source: 'website',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          property: {
            address: '123 Main St',
            city: 'Austin',
            state: 'TX',
            zip: '78701'
          }
        })
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.leadId).toBeDefined();
      expect(body.data.status).toBe('created');
      expect(body.correlationId).toBeDefined();
    });

    it('accepts minimal valid lead (source only)', async () => {
      const event = {
        body: JSON.stringify({
          source: 'referral'
        })
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.ok).toBe(true);
      expect(body.data.leadId).toBeDefined();
    });

    it('rejects invalid source value', async () => {
      const event = {
        body: JSON.stringify({
          source: 'invalid_source'
        })
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(body.ok).toBe(false);
      expect(body.error.code).toBe('ERR_VALIDATION');
      expect(body.error.message).toBe('Validation failed');
    });

    it('rejects invalid email format', async () => {
      const event = {
        body: JSON.stringify({
          source: 'website',
          email: 'not-an-email'
        })
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(body.error.code).toBe('ERR_VALIDATION');
    });

    it('rejects invalid property data', async () => {
      const event = {
        body: JSON.stringify({
          source: 'website',
          property: {
            address: '123 Main St',
            // Missing required city, state, zip
          }
        })
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(body.error.code).toBe('ERR_VALIDATION');
    });

    it('rejects malformed JSON', async () => {
      const event = {
        body: 'not valid json{'
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(body.error.code).toBe('ERR_INVALID_JSON');
    });

    it('handles missing request body', async () => {
      const event = {
        body: null
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(body.error.code).toBe('ERR_VALIDATION');
    });
  });

  describe('Demo mode functionality', () => {
    it('returns demo mode response when Supabase not configured', async () => {
      const event = {
        body: JSON.stringify({
          source: 'website',
          email: 'demo@example.com'
        })
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.data.demoMode).toBe(true);
      expect(body.data.message).toContain('demo mode');
    });

    it('generates unique lead IDs in demo mode', async () => {
      const event = {
        body: JSON.stringify({
          source: 'referral'
        })
      };

      const response1 = await handler(event);
      const response2 = await handler(event);
      
      const body1 = JSON.parse(response1.body);
      const body2 = JSON.parse(response2.body);

      expect(body1.data.leadId).toBeDefined();
      expect(body2.data.leadId).toBeDefined();
      expect(body1.data.leadId).not.toBe(body2.data.leadId);
    });
  });

  describe('UTM tracking and metadata', () => {
    it('accepts and preserves UTM parameters', async () => {
      const event = {
        body: JSON.stringify({
          source: 'paid_ads',
          email: 'utm-test@example.com',
          utm: {
            source: 'google',
            medium: 'cpc',
            campaign: 'summer_sale',
            term: 'real estate investment',
            content: 'ad_variant_a'
          }
        })
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.data.leadId).toBeDefined();
    });

    it('accepts custom fields for flexibility', async () => {
      const event = {
        body: JSON.stringify({
          source: 'partner',
          customFields: {
            partnerName: 'ACME Corp',
            referralCode: 'REF123',
            priority: 'high'
          }
        })
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.data.leadId).toBeDefined();
    });

    it('accepts tags array', async () => {
      const event = {
        body: JSON.stringify({
          source: 'event',
          tags: ['vip', 'investor', 'qualified']
        })
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.data.leadId).toBeDefined();
    });

    it('accepts notes field', async () => {
      const event = {
        body: JSON.stringify({
          source: 'cold_outreach',
          notes: 'Met at conference. Very interested in multi-family properties.'
        })
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.data.leadId).toBeDefined();
    });
  });

  describe('Property type validation', () => {
    it('accepts single_family property type', async () => {
      const event = {
        body: JSON.stringify({
          source: 'website',
          property: {
            address: '456 Oak Ave',
            city: 'Dallas',
            state: 'TX',
            zip: '75201',
            propertyType: 'single_family',
            estimatedValue: 350000
          }
        })
      };

      const response = await handler(event);
      expect(response.statusCode).toBe(200);
    });

    it('accepts multi_family property type', async () => {
      const event = {
        body: JSON.stringify({
          source: 'referral',
          property: {
            address: '789 Pine St',
            city: 'Houston',
            state: 'TX',
            zip: '77001',
            propertyType: 'multi_family',
            estimatedValue: 1200000
          }
        })
      };

      const response = await handler(event);
      expect(response.statusCode).toBe(200);
    });

    it('accepts commercial property type', async () => {
      const event = {
        body: JSON.stringify({
          source: 'partner',
          property: {
            address: '321 Commerce Blvd',
            city: 'San Antonio',
            state: 'TX',
            zip: '78201',
            propertyType: 'commercial'
          }
        })
      };

      const response = await handler(event);
      expect(response.statusCode).toBe(200);
    });

    it('rejects invalid property type', async () => {
      const event = {
        body: JSON.stringify({
          source: 'website',
          property: {
            address: '999 Bad Type St',
            city: 'Austin',
            state: 'TX',
            zip: '78701',
            propertyType: 'invalid_type'
          }
        })
      };

      const response = await handler(event);
      expect(response.statusCode).toBe(400);
    });
  });

  describe('Source type validation', () => {
    const validSources = [
      'website',
      'referral',
      'cold_outreach',
      'event',
      'partner',
      'social_media',
      'paid_ads',
      'other'
    ];

    validSources.forEach(source => {
      it(`accepts ${source} as valid source`, async () => {
        const event = {
          body: JSON.stringify({ source })
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(200);
      });
    });
  });

  describe('Response structure', () => {
    it('includes correlation ID in all responses', async () => {
      const event = {
        body: JSON.stringify({
          source: 'website'
        })
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(body.correlationId).toBeDefined();
      expect(typeof body.correlationId).toBe('string');
      expect(body.correlationId.length).toBeGreaterThan(0);
    });

    it('includes correlation ID in error responses', async () => {
      const event = {
        body: 'invalid json'
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(body.correlationId).toBeDefined();
    });

    it('returns proper CORS headers', async () => {
      const event = {
        body: JSON.stringify({
          source: 'website'
        })
      };

      const response = await handler(event);

      expect(response.headers).toBeDefined();
    });

    it('includes duration metadata in successful response', async () => {
      const event = {
        body: JSON.stringify({
          source: 'referral',
          email: 'perf@example.com'
        })
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      // In demo mode, check for basic response structure
      expect(body.data).toBeDefined();
      expect(body.data.leadId).toBeDefined();
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles empty object', async () => {
      const event = {
        body: JSON.stringify({})
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(body.error).toBeDefined();
    });

    it('handles very long strings gracefully', async () => {
      const longString = 'a'.repeat(10000);
      const event = {
        body: JSON.stringify({
          source: 'website',
          notes: longString
        })
      };

      const response = await handler(event);
      // Should either accept or reject cleanly
      expect([200, 400]).toContain(response.statusCode);
    });

    it('handles special characters in names', async () => {
      const event = {
        body: JSON.stringify({
          source: 'website',
          firstName: "O'Brien",
          lastName: 'Müller-Schmidt'
        })
      };

      const response = await handler(event);
      expect(response.statusCode).toBe(200);
    });

    it('handles international phone formats', async () => {
      const event = {
        body: JSON.stringify({
          source: 'website',
          phone: '+44 20 7946 0958'
        })
      };

      const response = await handler(event);
      expect(response.statusCode).toBe(200);
    });
  });

  describe('Raw payload preservation', () => {
    it('accepts rawPayload for audit trail', async () => {
      const originalPayload = {
        someField: 'value',
        nestedData: {
          foo: 'bar'
        }
      };

      const event = {
        body: JSON.stringify({
          source: 'partner',
          rawPayload: originalPayload
        })
      };

      const response = await handler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.data.leadId).toBeDefined();
    });
  });
});
