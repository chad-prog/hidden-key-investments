/**
 * Tests for Twilio SMS function
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../twilio-sms';

// Mock twilio
vi.mock('twilio', () => ({
  default: vi.fn(() => ({
    messages: {
      create: vi.fn()
    }
  }))
}));

describe('twilio-sms function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.TWILIO_AUTH_TOKEN;
    delete process.env.TWILIO_PHONE_NUMBER;
  });

  it('rejects non-POST requests', async () => {
    const event = {
      httpMethod: 'GET',
      headers: {},
      body: null
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(405);
    expect(body.error).toBe('Method not allowed');
  });

  it('validates required fields', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({ to: '+1234567890' })
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.error).toContain('Missing required fields');
  });

  it('validates phone number format', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({
        to: 'invalid-phone',
        message: 'Test message'
      })
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.error).toContain('Invalid phone number');
  });

  it('works in demo mode when no credentials configured', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({
        to: '+1234567890',
        message: 'Test SMS message'
      })
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.demo).toBe(true);
    expect(body.message).toContain('Demo mode');
  });

  it('replaces template variables', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({
        to: '+1234567890',
        message: 'Hello {{firstName}}, your appointment is on {{date}}',
        variables: {
          firstName: 'John',
          date: '2024-12-01'
        }
      })
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
  });

  it('rejects messages that are too long', async () => {
    const longMessage = 'x'.repeat(1601);
    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({
        to: '+1234567890',
        message: longMessage
      })
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.error).toContain('too long');
  });
});
