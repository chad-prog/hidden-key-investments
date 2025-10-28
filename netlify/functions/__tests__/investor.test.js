// Tests for investor.js serverless function
// These tests verify CRUD operations for investor management

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  delete: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase)
};

// Mock the supabaseClient module
vi.mock('../supabaseClient.cjs', () => ({
  supabase: mockSupabase
}));

// Import handler after mocking
const { handler } = await import('../investor.js');

describe('investor function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST - Create Investor', () => {
    const validInvestor = {
      name: 'John Doe',
      email: 'john@example.com',
      accredited: true,
      notes: 'High net worth individual'
    };

    it('creates investor successfully', async () => {
      mockSupabase.select.mockResolvedValueOnce({ 
        data: [], 
        error: null 
      });
      mockSupabase.insert.mockResolvedValueOnce({ 
        data: [{ id: '123', ...validInvestor, created: expect.any(String) }], 
        error: null 
      });

      const response = await handler({
        httpMethod: 'POST',
        body: JSON.stringify(validInvestor)
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(201);
      expect(body.message).toBe('Investor created');
      expect(body.investor.email).toBe(validInvestor.email);
    });

    it('rejects duplicate email', async () => {
      mockSupabase.select.mockResolvedValueOnce({ 
        data: [{ id: 'existing123', email: validInvestor.email }], 
        error: null 
      });

      const response = await handler({
        httpMethod: 'POST',
        body: JSON.stringify(validInvestor)
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(409);
      expect(body.error).toContain('Duplicate investor email');
    });

    it('validates required fields', async () => {
      const response = await handler({
        httpMethod: 'POST',
        body: JSON.stringify({ 
          name: 'John Doe'
          // Missing required email
        })
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(400);
      expect(body.error).toBeDefined();
    });

    it('validates email format', async () => {
      const response = await handler({
        httpMethod: 'POST',
        body: JSON.stringify({ 
          name: 'John Doe',
          email: 'not-an-email'
        })
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(400);
      expect(body.error).toBeDefined();
    });

    it('handles database errors gracefully', async () => {
      mockSupabase.select.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Database connection failed' }
      });

      const response = await handler({
        httpMethod: 'POST',
        body: JSON.stringify(validInvestor)
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(500);
      expect(body.error).toContain('Database connection failed');
    });

    it('rejects invalid JSON', async () => {
      const response = await handler({
        httpMethod: 'POST',
        body: 'not valid json'
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(400);
      expect(body.error).toContain('Invalid JSON body');
    });
  });

  describe('GET - List Investors', () => {
    it('returns list of investors', async () => {
      const mockInvestors = [
        { id: '1', name: 'John Doe', email: 'john@example.com', created: '2025-01-01' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', created: '2025-01-02' }
      ];

      mockSupabase.select.mockResolvedValueOnce({ 
        data: mockInvestors, 
        error: null 
      });

      const response = await handler({
        httpMethod: 'GET'
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.investors).toHaveLength(2);
      expect(body.investors[0].email).toBe('john@example.com');
    });

    it('handles empty investor list', async () => {
      mockSupabase.select.mockResolvedValueOnce({ 
        data: [], 
        error: null 
      });

      const response = await handler({
        httpMethod: 'GET'
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.investors).toHaveLength(0);
    });

    it('handles database errors', async () => {
      mockSupabase.select.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Query failed' }
      });

      const response = await handler({
        httpMethod: 'GET'
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(500);
      expect(body.error).toContain('Query failed');
    });
  });

  describe('DELETE - Remove Investor', () => {
    it('deletes investor successfully', async () => {
      mockSupabase.delete.mockResolvedValueOnce({ 
        error: null 
      });

      const response = await handler({
        httpMethod: 'DELETE',
        body: JSON.stringify({ id: '123' })
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.message).toBe('Investor deleted');
      expect(body.id).toBe('123');
    });

    it('handles database deletion errors', async () => {
      mockSupabase.delete.mockResolvedValueOnce({ 
        error: { message: 'Deletion failed' }
      });

      const response = await handler({
        httpMethod: 'DELETE',
        body: JSON.stringify({ id: '123' })
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(500);
      expect(body.error).toContain('Deletion failed');
    });

    it('rejects invalid JSON', async () => {
      const response = await handler({
        httpMethod: 'DELETE',
        body: 'not valid json'
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(400);
      expect(body.error).toContain('Invalid JSON body');
    });
  });

  describe('Unsupported Methods', () => {
    it('rejects PUT requests', async () => {
      const response = await handler({
        httpMethod: 'PUT',
        body: '{}'
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(405);
      expect(body.error).toContain('Method not allowed');
    });

    it('rejects PATCH requests', async () => {
      const response = await handler({
        httpMethod: 'PATCH',
        body: '{}'
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(405);
      expect(body.error).toContain('Method not allowed');
    });
  });
});
