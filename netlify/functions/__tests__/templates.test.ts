/**
 * Tests for Template Management function
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { handler } from '../templates';

describe('templates function', () => {
  const createEvent = (method: string, path: string, body?: any, query?: any) => ({
    httpMethod: method,
    path,
    body: body ? JSON.stringify(body) : null,
    queryStringParameters: query || null,
    headers: {}
  });

  it('lists all templates', async () => {
    const event = createEvent('GET', '/.netlify/functions/templates');
    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.templates).toBeInstanceOf(Array);
    expect(body.templates.length).toBeGreaterThan(0);
    expect(body.total).toBe(body.templates.length);
  });

  it('filters templates by type', async () => {
    const event = createEvent('GET', '/.netlify/functions/templates', null, { type: 'email' });
    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.templates.every((t: any) => t.type === 'email')).toBe(true);
  });

  it('filters templates by status', async () => {
    const event = createEvent('GET', '/.netlify/functions/templates', null, { status: 'active' });
    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.templates.every((t: any) => t.status === 'active')).toBe(true);
  });

  it('creates a new email template', async () => {
    const newTemplate = {
      name: 'Test Email Template',
      description: 'A test template',
      type: 'email',
      subject: 'Test Subject {{name}}',
      content: '<p>Hello {{name}}</p>',
      tags: ['test']
    };

    const event = createEvent('POST', '/.netlify/functions/templates', newTemplate);
    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(body.success).toBe(true);
    expect(body.template.name).toBe(newTemplate.name);
    expect(body.template.variables).toContain('name');
    expect(body.template.status).toBe('draft');
  });

  it('creates a new SMS template', async () => {
    const newTemplate = {
      name: 'Test SMS Template',
      type: 'sms',
      content: 'Hi {{firstName}}, your code is {{code}}',
      tags: ['test', 'sms']
    };

    const event = createEvent('POST', '/.netlify/functions/templates', newTemplate);
    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(body.success).toBe(true);
    expect(body.template.variables).toContain('firstName');
    expect(body.template.variables).toContain('code');
  });

  it('requires subject for email templates', async () => {
    const newTemplate = {
      name: 'Invalid Email',
      type: 'email',
      content: '<p>Test</p>'
      // Missing subject
    };

    const event = createEvent('POST', '/.netlify/functions/templates', newTemplate);
    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.error).toContain('Subject is required');
  });

  it('validates required fields', async () => {
    const invalidTemplate = {
      name: 'Invalid Template'
      // Missing type and content
    };

    const event = createEvent('POST', '/.netlify/functions/templates', invalidTemplate);
    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(body.error).toContain('Missing required fields');
  });

  it('gets a specific template', async () => {
    const event = createEvent('GET', '/.netlify/functions/templates/tpl-1');
    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.id).toBe('tpl-1');
    expect(body.name).toBeDefined();
  });

  it('returns 404 for non-existent template', async () => {
    const event = createEvent('GET', '/.netlify/functions/templates/non-existent');
    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(404);
    expect(body.error).toBe('Template not found');
  });

  it('updates a template', async () => {
    const updates = {
      name: 'Updated Name',
      status: 'active'
    };

    const event = createEvent('PUT', '/.netlify/functions/templates/tpl-1', updates);
    const response = await handler(event as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.template.name).toBe(updates.name);
    expect(body.template.status).toBe(updates.status);
  });

  it('deletes a template', async () => {
    // First create a template
    const newTemplate = {
      name: 'To Delete',
      type: 'sms',
      content: 'Test'
    };
    
    const createEvent1 = createEvent('POST', '/.netlify/functions/templates', newTemplate);
    const createResponse = await handler(createEvent1 as any, {} as any);
    const createBody = JSON.parse(createResponse.body);
    const templateId = createBody.template.id;

    // Then delete it
    const deleteEvent = createEvent('DELETE', `/.netlify/functions/templates/${templateId}`);
    const response = await handler(deleteEvent as any, {} as any);
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.success).toBe(true);

    // Verify it's deleted
    const getEvent = createEvent('GET', `/.netlify/functions/templates/${templateId}`);
    const getResponse = await handler(getEvent as any, {} as any);
    expect(getResponse.statusCode).toBe(404);
  });
});
