import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../airtable-sync.js';

import { fetch as origFetch } from 'undici';

// Mock undici fetch
vi.mock('undici', () => ({
  fetch: vi.fn()
}));

// Get the mocked fetch function
const fetch = vi.mocked(origFetch);

// Mock environment variables
const ENV_VARS = {
  AIRTABLE_API_KEY: 'test-api-key',
  AIRTABLE_BASE_ID: 'test-base',
  AIRTABLE_TABLE_NAME: 'Subscribers'
};

describe('airtable-sync function', () => {
  beforeEach(() => {
    // Reset environment
    process.env = { ...ENV_VARS };
    // Reset mocks
    vi.clearAllMocks();
  });

  const validPayload = {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User'
  };

  it('handles successful record creation', async () => {
    const mockResponse = {
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ 
        records: [{ id: 'rec123', fields: validPayload }] 
      })),
      status: 200,
      headers: new Headers()
    };
    
    fetch.mockResolvedValue(mockResponse);

    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify(validPayload)
    });

    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.code).toBe('SUCCESS');
  });

  it('handles authentication errors', async () => {
    const mockResponse = {
      ok: false,
      text: () => Promise.resolve(JSON.stringify({
        error: { message: 'Invalid API key', type: 'AUTHENTICATION_FAILED' }
      })),
      status: 401
    };
    
    fetch.mockResolvedValue(mockResponse);

    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify(validPayload)
    });

    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(401);
    expect(body.ok).toBe(false);
    expect(body.code).toBe('ERR_AUTHENTICATION_FAILED');
  });

  it('handles rate limiting with retry', async () => {
    const rateLimitResponse = {
      ok: false,
      text: () => Promise.resolve(JSON.stringify({
        error: { message: 'Too Many Requests', type: 'RATE_LIMIT' }
      })),
      status: 429,
      headers: new Headers({ 'retry-after': '2' })
    };

    const successResponse = {
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ 
        records: [{ id: 'rec123', fields: validPayload }] 
      })),
      status: 200
    };

    fetch
      .mockResolvedValueOnce(rateLimitResponse)
      .mockResolvedValueOnce(successResponse);

    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify(validPayload)
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(response.statusCode).toBe(200);
  });

  it('handles validation errors', async () => {
    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify({ 
        email: 'invalid-email',
        firstName: '',  // Required
        lastName: 'User' 
      })
    });

    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(400);
    expect(body.code).toBe('ERR_VALIDATION');
    expect(body.details.validationErrors).toBeDefined();
  });

  it('runs in demo mode when environment variables are missing', async () => {
    const originalEnv = process.env;
    process.env = { NODE_ENV: 'test' }; // Keep only essential variables

    const response = await handler({
      httpMethod: 'POST',
      body: JSON.stringify(validPayload)
    });

    process.env = originalEnv; // Restore environment

    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.code).toBe('DEMO_MODE');
  });
});