/**
 * Test Fixtures Tests
 */

import { describe, it, expect } from 'vitest';
import {
  createMockLead,
  createMockOpportunity,
  createMockInvestor,
  createMockActivity,
  createEnrichedLead,
  createMockLeads,
  createMockCRMDataset,
  createMockWorkflow,
  createMockAPIResponse,
  createMockNetlifyEvent,
} from '../testFixtures';

describe('Test Fixtures', () => {
  describe('createMockLead', () => {
    it('should create a valid lead with defaults', () => {
      const lead = createMockLead();
      expect(lead).toHaveProperty('id');
      expect(lead).toHaveProperty('source', 'website');
      expect(lead).toHaveProperty('status', 'new');
      expect(lead.contact).toHaveProperty('email');
      expect(lead.property).toHaveProperty('address');
    });

    it('should allow overrides', () => {
      const lead = createMockLead({ source: 'referral', status: 'contacted' });
      expect(lead.source).toBe('referral');
      expect(lead.status).toBe('contacted');
    });
  });

  describe('createMockOpportunity', () => {
    it('should create a valid opportunity', () => {
      const opp = createMockOpportunity();
      expect(opp).toHaveProperty('id');
      expect(opp).toHaveProperty('stage', 'prospecting');
      expect(opp).toHaveProperty('estimatedValue');
      expect(opp.estimatedValue).toBeGreaterThan(0);
    });
  });

  describe('createMockInvestor', () => {
    it('should create a valid investor', () => {
      const investor = createMockInvestor();
      expect(investor).toHaveProperty('id');
      expect(investor).toHaveProperty('type', 'individual');
      expect(investor).toHaveProperty('status', 'active');
      expect(investor.investmentProfile).toHaveProperty('minInvestment');
      expect(investor.accreditation).toHaveProperty('isAccredited', true);
    });
  });

  describe('createMockActivity', () => {
    it('should create a valid activity', () => {
      const activity = createMockActivity();
      expect(activity).toHaveProperty('id');
      expect(activity).toHaveProperty('type', 'call');
      expect(activity).toHaveProperty('subject');
      expect(activity).toHaveProperty('createdBy');
    });
  });

  describe('createEnrichedLead', () => {
    it('should create a lead with enrichment data', () => {
      const lead = createEnrichedLead();
      expect(lead.enrichmentData).toBeDefined();
      expect(lead.enrichmentData).toHaveProperty('phoneValidation');
      expect(lead.enrichmentData).toHaveProperty('emailValidation');
      expect(lead.enrichmentData).toHaveProperty('propertyData');
      expect(lead.score).toBe(85);
    });
  });

  describe('createMockLeads', () => {
    it('should create multiple leads', () => {
      const leads = createMockLeads(5);
      expect(leads).toHaveLength(5);
      expect(leads[0].contact.email).not.toBe(leads[1].contact.email);
    });
  });

  describe('createMockCRMDataset', () => {
    it('should create a complete dataset', () => {
      const dataset = createMockCRMDataset();
      expect(dataset.leads).toHaveLength(5);
      expect(dataset.opportunities).toHaveLength(3);
      expect(dataset.investors).toHaveLength(3);
      expect(dataset.activities.length).toBeGreaterThan(0);
    });
  });

  describe('createMockWorkflow', () => {
    it('should create a valid workflow', () => {
      const workflow = createMockWorkflow();
      expect(workflow).toHaveProperty('id');
      expect(workflow).toHaveProperty('name');
      expect(workflow).toHaveProperty('trigger');
      expect(workflow.trigger.type).toBe('lead_created');
      expect(workflow.actions).toHaveLength(1);
    });
  });

  describe('createMockAPIResponse', () => {
    it('should create a successful response', () => {
      const response = createMockAPIResponse({ leadId: '123' });
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toEqual({ leadId: '123' });
      expect(response.correlationId).toBeDefined();
    });

    it('should create an error response', () => {
      const response = createMockAPIResponse(null, false);
      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(response.error).toBeDefined();
    });
  });

  describe('createMockNetlifyEvent', () => {
    it('should create a valid Netlify event', () => {
      const event = createMockNetlifyEvent({ test: 'data' });
      expect(event.httpMethod).toBe('POST');
      expect(event.headers['content-type']).toBe('application/json');
      expect(JSON.parse(event.body)).toEqual({ test: 'data' });
    });
  });
});
