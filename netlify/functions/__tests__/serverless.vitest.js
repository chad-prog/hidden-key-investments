import { expect, describe, test, beforeEach, vi } from 'vitest';
import { handler as mailchimpHandler } from '../mailchimp-sync';
import { handler as airtableHandler } from '../airtable-sync';

// Mock fetch
vi.mock('undici', () => ({
  fetch: vi.fn()
}));

import { fetch } from 'undici';

describe('Serverless Functions', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockReset();
    process.env = {};
  });

  describe('mailchimp-sync', () => {
    const validEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      }),
    };

    test('returns demo mode response when environment variables are missing', async () => {
      const response = await mailchimpHandler(validEvent);
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        ok: true,
        demo: true,
        action: 'simulated-subscribe',
      });
    });

    test('successfully subscribes user when all environment variables are present', async () => {
      process.env.MAILCHIMP_API_KEY = 'test-key';
      process.env.MAILCHIMP_LIST_ID = 'test-list';
      process.env.MAILCHIMP_SERVER_PREFIX = 'us1';

      vi.mocked(fetch).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'test-member-id' }),
        })
      );

      const response = await mailchimpHandler(validEvent);
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).ok).toBe(true);
      expect(JSON.parse(response.body).demo).toBe(false);
    });
  });

  describe('airtable-sync', () => {
    const validEvent = {
      httpMethod: 'POST',
      body: JSON.stringify({
        name: 'Test Property',
        price: 500000,
        location: 'Test Location',
      }),
    };

    test('returns demo mode response when environment variables are missing', async () => {
      const response = await airtableHandler(validEvent);
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({
        ok: true,
        demo: true,
        action: 'simulated-record-create',
      });
    });

    test('successfully creates record when all environment variables are present', async () => {
      process.env.AIRTABLE_API_KEY = 'test-key';
      process.env.AIRTABLE_BASE_ID = 'test-base';
      process.env.AIRTABLE_TABLE_NAME = 'Properties';

      vi.mocked(fetch).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ records: [{ id: 'test-record-id' }] }),
        })
      );

      const response = await airtableHandler(validEvent);
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).ok).toBe(true);
      expect(JSON.parse(response.body).demo).toBe(false);
    });
  });
});