// Tests for opportunity.js serverless function
// These tests verify CRUD operations and stage transitions for opportunities

const { describe, it, expect, beforeEach, vi } = require('vitest');

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  update: vi.fn(() => mockSupabase),
  delete: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase)
};

// Mock the supabaseClient module
vi.mock('../supabaseClient.cjs', () => ({
  supabase: mockSupabase
}));

// Import handler after mocking
const { handler } = require('../opportunity.js');

describe('opportunity function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST - Create Opportunity', () => {
    const validOpportunity = {
      title: 'Luxury Condo - Austin',
      stage: 'prospect',
      amount: 500000,
      notes: 'Prime downtown location'
    };

    it('creates opportunity successfully', async () => {
      mockSupabase.select.mockResolvedValueOnce({ 
        data: [], 
        error: null 
      });
      mockSupabase.insert.mockResolvedValueOnce({ 
        data: [{ id: '123', ...validOpportunity, created: expect.any(String) }], 
        error: null 
      });

      const response = await handler({
        httpMethod: 'POST',
        body: JSON.stringify(validOpportunity)
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(201);
      expect(body.message).toBe('Opportunity created');
      expect(body.opportunity.title).toBe(validOpportunity.title);
    });

    it('rejects duplicate title', async () => {
      mockSupabase.select.mockResolvedValueOnce({ 
        data: [{ id: 'existing123', title: validOpportunity.title }], 
        error: null 
      });

      const response = await handler({
        httpMethod: 'POST',
        body: JSON.stringify(validOpportunity)
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(409);
      expect(body.error).toContain('Duplicate opportunity title');
    });

    it('validates required fields', async () => {
      const response = await handler({
        httpMethod: 'POST',
        body: JSON.stringify({ 
          stage: 'prospect'
          // Missing required title
        })
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(400);
      expect(body.error).toBeDefined();
    });

    it('validates stage values', async () => {
      mockSupabase.select.mockResolvedValueOnce({ 
        data: [], 
        error: null 
      });

      const response = await handler({
        httpMethod: 'POST',
        body: JSON.stringify({ 
          title: 'Test Opportunity',
          stage: 'invalid_stage'
        })
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(400);
      expect(body.error).toContain('Invalid stage');
    });

    it('accepts valid stages', async () => {
      const validStages = ['prospect', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
      
      for (const stage of validStages) {
        vi.clearAllMocks();
        mockSupabase.select.mockResolvedValueOnce({ data: [], error: null });
        mockSupabase.insert.mockResolvedValueOnce({ 
          data: [{ id: `${stage}-123`, title: `Test ${stage}`, stage }], 
          error: null 
        });

        const response = await handler({
          httpMethod: 'POST',
          body: JSON.stringify({ 
            title: `Test ${stage}`,
            stage: stage
          })
        });

        expect(response.statusCode).toBe(201);
      }
    });

    it('handles database errors gracefully', async () => {
      mockSupabase.select.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Database connection failed' }
      });

      const response = await handler({
        httpMethod: 'POST',
        body: JSON.stringify(validOpportunity)
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

  describe('GET - List Opportunities', () => {
    it('returns list of opportunities', async () => {
      const mockOpportunities = [
        { id: '1', title: 'Condo A', stage: 'prospect', amount: 500000, created: '2025-01-01' },
        { id: '2', title: 'House B', stage: 'qualified', amount: 750000, created: '2025-01-02' }
      ];

      mockSupabase.select.mockResolvedValueOnce({ 
        data: mockOpportunities, 
        error: null 
      });

      const response = await handler({
        httpMethod: 'GET'
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.opportunities).toHaveLength(2);
      expect(body.opportunities[0].title).toBe('Condo A');
    });

    it('handles empty opportunity list', async () => {
      mockSupabase.select.mockResolvedValueOnce({ 
        data: [], 
        error: null 
      });

      const response = await handler({
        httpMethod: 'GET'
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.opportunities).toHaveLength(0);
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

  describe('PATCH - Update Stage', () => {
    it('updates opportunity stage successfully', async () => {
      mockSupabase.update.mockResolvedValueOnce({ 
        error: null 
      });

      const response = await handler({
        httpMethod: 'PATCH',
        body: JSON.stringify({ 
          id: '123',
          stage: 'negotiation'
        })
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.message).toBe('Opportunity stage updated');
      expect(body.id).toBe('123');
      expect(body.stage).toBe('negotiation');
    });

    it('rejects invalid stage transitions', async () => {
      const response = await handler({
        httpMethod: 'PATCH',
        body: JSON.stringify({ 
          id: '123',
          stage: 'invalid_stage'
        })
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(400);
      expect(body.error).toContain('Invalid stage');
    });

    it('handles database update errors', async () => {
      mockSupabase.update.mockResolvedValueOnce({ 
        error: { message: 'Update failed' }
      });

      const response = await handler({
        httpMethod: 'PATCH',
        body: JSON.stringify({ 
          id: '123',
          stage: 'qualified'
        })
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(500);
      expect(body.error).toContain('Update failed');
    });

    it('rejects invalid JSON', async () => {
      const response = await handler({
        httpMethod: 'PATCH',
        body: 'not valid json'
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(400);
      expect(body.error).toContain('Invalid JSON body');
    });
  });

  describe('DELETE - Remove Opportunity', () => {
    it('deletes opportunity successfully', async () => {
      mockSupabase.delete.mockResolvedValueOnce({ 
        error: null 
      });

      const response = await handler({
        httpMethod: 'DELETE',
        body: JSON.stringify({ id: '123' })
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(200);
      expect(body.message).toBe('Opportunity deleted');
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
  });

  describe('Edge Cases', () => {
    it('handles missing body in POST', async () => {
      const response = await handler({
        httpMethod: 'POST',
        body: null
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(400);
      expect(body.error).toBeDefined();
    });

    it('handles empty object in POST', async () => {
      const response = await handler({
        httpMethod: 'POST',
        body: '{}'
      });

      const body = JSON.parse(response.body);
      expect(response.statusCode).toBe(400);
      expect(body.error).toBeDefined();
    });

    it('handles large amounts', async () => {
      mockSupabase.select.mockResolvedValueOnce({ data: [], error: null });
      mockSupabase.insert.mockResolvedValueOnce({ 
        data: [{ id: '123', title: 'Mega Deal', amount: 10000000 }], 
        error: null 
      });

      const response = await handler({
        httpMethod: 'POST',
        body: JSON.stringify({ 
          title: 'Mega Deal',
          amount: 10000000
        })
      });

      expect(response.statusCode).toBe(201);
    });
  });
});
