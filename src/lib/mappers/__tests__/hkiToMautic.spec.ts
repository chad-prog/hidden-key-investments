/**
 * Unit tests for HKI to Mautic mapper functions
 */

import { describe, it, expect } from 'vitest';
import {
  hkiToMauticContact,
  preserveExistingUtmsIfPresent,
  compact,
  type HKILead,
  type MauticContact,
} from '../hkiToMautic';

describe('hkiToMautic mapper', () => {
  describe('compact', () => {
    it('removes null values', () => {
      const input = { a: 'value', b: null, c: 'another' };
      const result = compact(input);
      expect(result).toEqual({ a: 'value', c: 'another' });
    });

    it('removes undefined values', () => {
      const input = { a: 'value', b: undefined, c: 'another' };
      const result = compact(input);
      expect(result).toEqual({ a: 'value', c: 'another' });
    });

    it('removes empty string values', () => {
      const input = { a: 'value', b: '', c: 'another' };
      const result = compact(input);
      expect(result).toEqual({ a: 'value', c: 'another' });
    });

    it('keeps zero and false values', () => {
      const input = { a: 0, b: false, c: 'value' };
      const result = compact(input);
      expect(result).toEqual({ a: 0, b: false, c: 'value' });
    });
  });

  describe('hkiToMauticContact', () => {
    it('maps complete HKI lead to Mautic contact', () => {
      const lead: HKILead = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        updated_at: '2024-01-01T00:00:00Z',
        crm_status: 'qualified',
        consent: {
          marketing_opt_in: true,
        },
        ml: {
          score: 85,
        },
        contact: {
          email: 'john@example.com',
          first_name: 'John',
          last_name: 'Doe',
          phone: '+1234567890',
          company: 'ACME Corp',
        },
        utm: {
          source: 'google',
          medium: 'cpc',
          campaign: 'summer-2024',
          term: 'investment',
          content: 'ad-variant-a',
        },
      };

      const result = hkiToMauticContact(lead);

      expect(result.email).toBe('john@example.com');
      expect(result.firstname).toBe('John');
      expect(result.lastname).toBe('Doe');
      expect(result.phone).toBe('+1234567890');
      expect(result.company).toBe('ACME Corp');
      expect(result.utm_source).toBe('google');
      expect(result.utm_medium).toBe('cpc');
      expect(result.utm_campaign).toBe('summer-2024');
      expect(result.utm_term).toBe('investment');
      expect(result.utm_content).toBe('ad-variant-a');
      expect(result.hki_lead_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.hki_lead_score).toBe(85);
      expect(result.hki_crm_status).toBe('qualified');
      expect(result.marketing_opt_in).toBe(true);
      expect(result.hki_last_sync).toBeDefined();
    });

    it('omits empty fields from result', () => {
      const lead: HKILead = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        contact: {
          email: 'john@example.com',
        },
      };

      const result = hkiToMauticContact(lead);

      expect(result.email).toBe('john@example.com');
      expect(result.hki_lead_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.hki_last_sync).toBeDefined();
      
      // These should not be present
      expect(result.firstname).toBeUndefined();
      expect(result.lastname).toBeUndefined();
      expect(result.phone).toBeUndefined();
      expect(result.company).toBeUndefined();
      expect(result.utm_source).toBeUndefined();
      expect(result.hki_lead_score).toBeUndefined();
      expect(result.hki_crm_status).toBeUndefined();
      expect(result.marketing_opt_in).toBeUndefined();
    });

    it('handles partial UTM data', () => {
      const lead: HKILead = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        contact: {
          email: 'john@example.com',
        },
        utm: {
          source: 'facebook',
          medium: 'social',
          // campaign, term, content are missing
        },
      };

      const result = hkiToMauticContact(lead);

      expect(result.utm_source).toBe('facebook');
      expect(result.utm_medium).toBe('social');
      expect(result.utm_campaign).toBeUndefined();
      expect(result.utm_term).toBeUndefined();
      expect(result.utm_content).toBeUndefined();
    });

    it('includes sync timestamp', () => {
      const lead: HKILead = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        contact: {
          email: 'john@example.com',
        },
      };

      const before = new Date();
      const result = hkiToMauticContact(lead);
      const after = new Date();

      expect(result.hki_last_sync).toBeDefined();
      const syncTime = new Date(result.hki_last_sync!);
      expect(syncTime.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(syncTime.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('preserveExistingUtmsIfPresent', () => {
    it('preserves existing UTM values when HKI has none', () => {
      const hkiContact: MauticContact = {
        email: 'john@example.com',
        firstname: 'John',
        hki_lead_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const existingContact: MauticContact = {
        email: 'john@example.com',
        utm_source: 'original-source',
        utm_medium: 'original-medium',
        utm_campaign: 'original-campaign',
      };

      const result = preserveExistingUtmsIfPresent(hkiContact, existingContact);

      expect(result.email).toBe('john@example.com');
      expect(result.firstname).toBe('John');
      expect(result.utm_source).toBe('original-source');
      expect(result.utm_medium).toBe('original-medium');
      expect(result.utm_campaign).toBe('original-campaign');
    });

    it('does not overwrite HKI UTM values with existing ones', () => {
      const hkiContact: MauticContact = {
        email: 'john@example.com',
        utm_source: 'new-source',
        utm_medium: 'new-medium',
      };

      const existingContact: MauticContact = {
        email: 'john@example.com',
        utm_source: 'old-source',
        utm_medium: 'old-medium',
        utm_campaign: 'old-campaign',
      };

      const result = preserveExistingUtmsIfPresent(hkiContact, existingContact);

      expect(result.utm_source).toBe('new-source');
      expect(result.utm_medium).toBe('new-medium');
      expect(result.utm_campaign).toBe('old-campaign'); // This one is preserved
    });

    it('preserves partial UTM sets', () => {
      const hkiContact: MauticContact = {
        email: 'john@example.com',
        utm_source: 'new-source',
      };

      const existingContact: MauticContact = {
        email: 'john@example.com',
        utm_medium: 'old-medium',
        utm_campaign: 'old-campaign',
        utm_term: 'old-term',
        utm_content: 'old-content',
      };

      const result = preserveExistingUtmsIfPresent(hkiContact, existingContact);

      expect(result.utm_source).toBe('new-source');
      expect(result.utm_medium).toBe('old-medium');
      expect(result.utm_campaign).toBe('old-campaign');
      expect(result.utm_term).toBe('old-term');
      expect(result.utm_content).toBe('old-content');
    });

    it('handles empty existing contact', () => {
      const hkiContact: MauticContact = {
        email: 'john@example.com',
        utm_source: 'new-source',
      };

      const existingContact: MauticContact = {
        email: 'john@example.com',
      };

      const result = preserveExistingUtmsIfPresent(hkiContact, existingContact);

      expect(result.utm_source).toBe('new-source');
      expect(result.utm_medium).toBeUndefined();
    });
  });
});
