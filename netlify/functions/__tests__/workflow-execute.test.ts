/**
 * Tests for Workflow Execution function
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../workflow-execute';

// Mock fetch globally
global.fetch = vi.fn();

describe('workflow-execute function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      body: JSON.stringify({ workflowId: 'wf-1' })
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.error).toContain('Missing required fields');
  });

  it('executes a simple workflow with trigger and action', async () => {
    const workflow = {
      workflowId: 'wf-1',
      nodes: [
        { id: '1', type: 'trigger', name: 'Start', config: {}, position: { x: 0, y: 0 } },
        { id: '2', type: 'action', name: 'Simple Action', config: {}, position: { x: 0, y: 1 } }
      ],
      connections: [{ from: '1', to: '2' }],
      data: {}
    };

    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify(workflow)
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.executionId).toBeDefined();
    expect(body.results).toHaveLength(2);
    expect(body.results[0].status).toBe('success');
    expect(body.results[1].status).toBe('success');
  });

  it('executes workflow with email action (demo mode)', async () => {
    // Mock fetch to return demo mode response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, demo: true, message: 'Demo mode: Email sent' })
    });

    const workflow = {
      workflowId: 'wf-email',
      nodes: [
        { 
          id: '1', 
          type: 'action', 
          name: 'Send Email', 
          config: { service: 'sendgrid' }, 
          position: { x: 0, y: 0 } 
        }
      ],
      connections: [],
      data: {
        email: 'test@example.com',
        subject: 'Test',
        content: '<p>Test</p>'
      }
    };

    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify(workflow)
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.results[0].status).toBe('success');
    expect(body.results[0].message).toContain('Email sent');
  });

  it('executes workflow with SMS action (demo mode)', async () => {
    // Mock fetch to return demo mode response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, demo: true, message: 'Demo mode: SMS sent' })
    });

    const workflow = {
      workflowId: 'wf-sms',
      nodes: [
        { 
          id: '1', 
          type: 'action', 
          name: 'Send SMS', 
          config: { service: 'twilio' }, 
          position: { x: 0, y: 0 } 
        }
      ],
      connections: [],
      data: {
        phone: '+1234567890',
        message: 'Test SMS'
      }
    };

    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify(workflow)
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.results[0].status).toBe('success');
    expect(body.results[0].message).toContain('SMS sent');
  });

  it('handles delay actions', async () => {
    const workflow = {
      workflowId: 'wf-delay',
      nodes: [
        { 
          id: '1', 
          type: 'action', 
          name: 'Wait', 
          config: { delay: '2d' }, 
          position: { x: 0, y: 0 } 
        }
      ],
      connections: [],
      data: {}
    };

    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify(workflow)
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.results[0].message).toContain('Delay scheduled');
  });

  it('stops execution on node failure', async () => {
    // Mock fetch to return error
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'Service unavailable' })
    });

    const workflow = {
      workflowId: 'wf-fail',
      nodes: [
        { 
          id: '1', 
          type: 'action', 
          name: 'Send Email', 
          config: { service: 'sendgrid' }, 
          position: { x: 0, y: 0 } 
        },
        { 
          id: '2', 
          type: 'action', 
          name: 'Should Not Execute', 
          config: {}, 
          position: { x: 0, y: 1 } 
        }
      ],
      connections: [{ from: '1', to: '2' }],
      data: { email: 'test@example.com' }
    };

    const event = {
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify(workflow)
    };

    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(false);
    expect(body.results).toHaveLength(1); // Only first node executed
    expect(body.results[0].status).toBe('failed');
  });
});
