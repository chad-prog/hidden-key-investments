/**
 * Tests for SendGrid email function
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../sendgrid';

// Mock @sendgrid/mail
vi.mock('@sendgrid/mail', () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn()
  }
}));

describe('sendgrid function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SENDGRID_API_KEY;
    delete process.env.SENDGRID_FROM_EMAIL;
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
      body: JSON.stringify({ to: 'test@example.com' })
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.error).toContain('Missing required fields');
  });

  it('works in demo mode when no API key configured', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test Email',
        content: '<p>Test content</p>'
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
        to: 'test@example.com',
        subject: 'Hello {{firstName}}',
        content: '<p>Welcome, {{firstName}} {{lastName}}!</p>',
        variables: {
          firstName: 'John',
          lastName: 'Doe'
        }
      })
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
  });

  it('handles custom from address', async () => {
    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({
        to: 'test@example.com',
        subject: 'Test',
        content: '<p>Test</p>',
        from: {
          email: 'custom@example.com',
          name: 'Custom Sender'
        }
      })
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
  });
});
