/**
 * HKI to Mautic Contact Mapper
 * 
 * Pure TypeScript mapper functions to convert HKI lead data to Mautic contact format.
 * Handles UTM preservation, data compaction, and field mapping.
 */

import { z } from 'zod';

// ============================================================================
// Type Definitions
// ============================================================================

export const HKILeadSchema = z.object({
  id: z.string().uuid(),
  updated_at: z.string().optional(), // ISO timestamp
  crm_status: z.string().optional(),
  consent: z.object({
    marketing_opt_in: z.boolean().optional(),
  }).optional(),
  ml: z.object({
    score: z.number().optional(),
  }).optional(),
  contact: z.object({
    email: z.string().email().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
  }).optional(),
  utm: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
});

export type HKILead = z.infer<typeof HKILeadSchema>;

export interface MauticContact {
  email?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  // UTM fields
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  // Custom fields
  hki_lead_id?: string;
  hki_lead_score?: number;
  hki_crm_status?: string;
  hki_last_sync?: string;
  marketing_opt_in?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Remove null, undefined, and empty string values from an object
 */
export function compact<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      result[key as keyof T] = value;
    }
  }
  
  return result;
}

// ============================================================================
// Mapper Functions
// ============================================================================

/**
 * Convert HKI lead to Mautic contact format
 * 
 * Maps HKI lead fields to Mautic contact schema, preserving UTMs and
 * compacting empty values.
 * 
 * @param lead - HKI lead object
 * @returns Mautic contact object with non-empty fields only
 */
export function hkiToMauticContact(lead: HKILead): MauticContact {
  const contact: MauticContact = {
    email: lead.contact?.email,
    firstname: lead.contact?.first_name,
    lastname: lead.contact?.last_name,
    phone: lead.contact?.phone,
    company: lead.contact?.company,
    
    // UTM parameters
    utm_source: lead.utm?.source,
    utm_medium: lead.utm?.medium,
    utm_campaign: lead.utm?.campaign,
    utm_term: lead.utm?.term,
    utm_content: lead.utm?.content,
    
    // Custom HKI fields
    hki_lead_id: lead.id,
    hki_lead_score: lead.ml?.score,
    hki_crm_status: lead.crm_status,
    hki_last_sync: new Date().toISOString(),
    marketing_opt_in: lead.consent?.marketing_opt_in,
  };
  
  // Remove empty values
  return compact(contact);
}

/**
 * Preserve existing UTM values if present on Mautic contact
 * 
 * When updating a Mautic contact, preserve existing UTM values if the
 * incoming HKI lead doesn't have them. This prevents overwriting
 * attribution data.
 * 
 * @param hkiContact - Contact data from HKI lead
 * @param existingContact - Existing Mautic contact data
 * @returns Merged contact with preserved UTM values
 */
export function preserveExistingUtmsIfPresent(
  hkiContact: MauticContact,
  existingContact: MauticContact
): MauticContact {
  const merged: MauticContact = { ...hkiContact };
  
  // UTM fields to preserve
  const utmFields: (keyof MauticContact)[] = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ];
  
  // For each UTM field, use existing value if HKI doesn't have one
  for (const field of utmFields) {
    if (!merged[field] && existingContact[field]) {
      (merged as any)[field] = existingContact[field];
    }
  }
  
  return merged;
}
