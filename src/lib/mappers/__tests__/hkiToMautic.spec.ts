/**
 * Tests for HKI to Mautic mapper functions
 */

import { describe, it, expect } from 'vitest';
import {
  hkiToMauticContact,
  preserveExistingUtmsIfPresent,
  compact,
  type HKILead,
  type MauticContact,
} from '../hkiToMautic';

describe('hkiToMauticContact', () => {
  it('should map basic fields', () => {
    const lead: HKILead = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-1234',
      company: 'Acme Corp',
    };

    const result = hkiToMauticContact(lead);

    expect(result.email).toBe('test@example.com');
    expect(result.firstname).toBe('John');
    expect(result.lastname).toBe('Doe');
    expect(result.phone).toBe('+1-555-1234');
    expect(result.company).toBe('Acme Corp');
  });

  it('should map UTM parameters', () => {
    const lead: HKILead = {
      email: 'test@example.com',
      utm: {
        source: 'google',
        medium: 'cpc',
        campaign: 'q4-2024',
        term: 'real estate',
        content: 'ad-variant-a',
      },
    };

    const result = hkiToMauticContact(lead);

    expect(result.utm_source).toBe('google');
    expect(result.utm_medium).toBe('cpc');
    expect(result.utm_campaign).toBe('q4-2024');
    expect(result.utm_term).toBe('real estate');
    expect(result.utm_content).toBe('ad-variant-a');
  });

  it('should map property fields', () => {
    const lead: HKILead = {
      email: 'test@example.com',
      property: {
        address: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        propertyType: 'single_family',
        estimatedValue: 500000,
      },
    };

    const result = hkiToMauticContact(lead);

    expect(result.property_address).toBe('123 Main St');
    expect(result.property_city).toBe('Austin');
    expect(result.property_state).toBe('TX');
    expect(result.property_zip).toBe('78701');
    expect(result.property_type).toBe('single_family');
    expect(result.property_value).toBe(500000);
  });

  it('should map tags', () => {
    const lead: HKILead = {
      email: 'test@example.com',
      tags: ['high-value', 'investor', 'qualified'],
    };

    const result = hkiToMauticContact(lead);

    expect(result.tags).toEqual(['high-value', 'investor', 'qualified']);
  });

  it('should skip empty tags array', () => {
    const lead: HKILead = {
      email: 'test@example.com',
      tags: [],
    };

    const result = hkiToMauticContact(lead);

    expect(result.tags).toBeUndefined();
  });

  it('should map custom fields', () => {
    const lead: HKILead = {
      email: 'test@example.com',
      customFields: {
        investment_amount: 100000,
        preferred_contact: 'email',
        referral_source: 'partner',
      },
    };

    const result = hkiToMauticContact(lead);

    expect(result.investment_amount).toBe(100000);
    expect(result.preferred_contact).toBe('email');
    expect(result.referral_source).toBe('partner');
  });

  it('should map updated_at to last_platform_update', () => {
    const lead: HKILead = {
      email: 'test@example.com',
      updated_at: '2024-11-06T12:00:00Z',
    };

    const result = hkiToMauticContact(lead);

    expect(result.last_platform_update).toBe('2024-11-06T12:00:00Z');
  });

  it('should prune empty values', () => {
    const lead: HKILead = {
      email: 'test@example.com',
      firstName: '',
      lastName: undefined,
      phone: null as any,
      company: 'Acme Corp',
    };

    const result = hkiToMauticContact(lead);

    expect(result.email).toBe('test@example.com');
    expect(result.company).toBe('Acme Corp');
    expect(result.firstname).toBeUndefined();
    expect(result.lastname).toBeUndefined();
    expect(result.phone).toBeUndefined();
  });

  it('should handle minimal lead', () => {
    const lead: HKILead = {
      email: 'minimal@example.com',
    };

    const result = hkiToMauticContact(lead);

    expect(result.email).toBe('minimal@example.com');
    expect(Object.keys(result).length).toBe(1);
  });

  it('should handle partial UTM data', () => {
    const lead: HKILead = {
      email: 'test@example.com',
      utm: {
        source: 'facebook',
        campaign: 'spring-2024',
        // medium, term, content omitted
      },
    };

    const result = hkiToMauticContact(lead);

    expect(result.utm_source).toBe('facebook');
    expect(result.utm_campaign).toBe('spring-2024');
    expect(result.utm_medium).toBeUndefined();
    expect(result.utm_term).toBeUndefined();
    expect(result.utm_content).toBeUndefined();
  });

  it('should prune empty custom fields', () => {
    const lead: HKILead = {
      email: 'test@example.com',
      customFields: {
        field1: 'value',
        field2: '',
        field3: null,
        field4: undefined,
      },
    };

    const result = hkiToMauticContact(lead);

    expect(result.field1).toBe('value');
    expect(result.field2).toBeUndefined();
    expect(result.field3).toBeUndefined();
    expect(result.field4).toBeUndefined();
  });
});

describe('preserveExistingUtmsIfPresent', () => {
  it('should preserve existing UTMs when HKI payload has none', () => {
    const hkiContact: MauticContact = {
      email: 'test@example.com',
      firstname: 'John',
    };

    const existingMauticContact = {
      id: 123,
      fields: {
        all: {
          utm_source: 'google',
          utm_medium: 'organic',
          utm_campaign: 'old-campaign',
        },
      },
    };

    const result = preserveExistingUtmsIfPresent(hkiContact, existingMauticContact);

    expect(result.utm_source).toBe('google');
    expect(result.utm_medium).toBe('organic');
    expect(result.utm_campaign).toBe('old-campaign');
    expect(result.firstname).toBe('John');
  });

  it('should not overwrite HKI UTMs with existing values', () => {
    const hkiContact: MauticContact = {
      email: 'test@example.com',
      utm_source: 'facebook',
      utm_campaign: 'new-campaign',
    };

    const existingMauticContact = {
      id: 123,
      fields: {
        all: {
          utm_source: 'google',
          utm_medium: 'organic',
          utm_campaign: 'old-campaign',
        },
      },
    };

    const result = preserveExistingUtmsIfPresent(hkiContact, existingMauticContact);

    expect(result.utm_source).toBe('facebook');
    expect(result.utm_campaign).toBe('new-campaign');
    expect(result.utm_medium).toBe('organic'); // Preserved from existing
  });

  it('should handle missing fields.all', () => {
    const hkiContact: MauticContact = {
      email: 'test@example.com',
    };

    const existingMauticContact = {
      id: 123,
      fields: {},
    };

    const result = preserveExistingUtmsIfPresent(hkiContact, existingMauticContact);

    expect(result.email).toBe('test@example.com');
    expect(result.utm_source).toBeUndefined();
  });

  it('should handle null existing contact', () => {
    const hkiContact: MauticContact = {
      email: 'test@example.com',
      utm_source: 'twitter',
    };

    const result = preserveExistingUtmsIfPresent(hkiContact, null);

    expect(result.email).toBe('test@example.com');
    expect(result.utm_source).toBe('twitter');
  });

  it('should preserve all UTM fields', () => {
    const hkiContact: MauticContact = {
      email: 'test@example.com',
    };

    const existingMauticContact = {
      fields: {
        all: {
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'campaign',
          utm_term: 'keyword',
          utm_content: 'ad-1',
        },
      },
    };

    const result = preserveExistingUtmsIfPresent(hkiContact, existingMauticContact);

    expect(result.utm_source).toBe('google');
    expect(result.utm_medium).toBe('cpc');
    expect(result.utm_campaign).toBe('campaign');
    expect(result.utm_term).toBe('keyword');
    expect(result.utm_content).toBe('ad-1');
  });
});

describe('compact', () => {
  it('should remove null values', () => {
    const obj = {
      a: 'value',
      b: null,
      c: 'another',
    };

    const result = compact(obj);

    expect(result.a).toBe('value');
    expect(result.c).toBe('another');
    expect(result.b).toBeUndefined();
  });

  it('should remove undefined values', () => {
    const obj = {
      a: 'value',
      b: undefined,
      c: 'another',
    };

    const result = compact(obj);

    expect(result.a).toBe('value');
    expect(result.c).toBe('another');
    expect(result.b).toBeUndefined();
  });

  it('should remove empty strings', () => {
    const obj = {
      a: 'value',
      b: '',
      c: 'another',
    };

    const result = compact(obj);

    expect(result.a).toBe('value');
    expect(result.c).toBe('another');
    expect(result.b).toBeUndefined();
  });

  it('should keep zero and false values', () => {
    const obj = {
      a: 0,
      b: false,
      c: 'value',
    };

    const result = compact(obj);

    expect(result.a).toBe(0);
    expect(result.b).toBe(false);
    expect(result.c).toBe('value');
  });

  it('should handle empty object', () => {
    const obj = {};
    const result = compact(obj);
    expect(result).toEqual({});
  });

  it('should handle all-empty object', () => {
    const obj = {
      a: null,
      b: undefined,
      c: '',
    };

    const result = compact(obj);
    expect(result).toEqual({});
  });
});
