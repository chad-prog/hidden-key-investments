/**
 * HKI to Mautic Contact Mapper
 * 
 * Pure TypeScript mappers for converting HKI lead data to Mautic contact format.
 * Includes UTM preservation logic and empty field pruning.
 */

export interface HKILead {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  tags?: string[];
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  property?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    propertyType?: string;
    estimatedValue?: number;
  };
  customFields?: Record<string, any>;
  updated_at?: string;
  [key: string]: any;
}

export interface MauticContact {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  tags?: string[];
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  last_platform_update?: string;
  [key: string]: any;
}

/**
 * Helper to remove empty/null/undefined values from an object
 */
function compact(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Map HKI lead data to Mautic contact format
 * 
 * @param lead - HKI lead object
 * @returns Mautic contact object with empty values pruned
 */
export function hkiToMauticContact(lead: HKILead): MauticContact {
  const mauticContact: MauticContact = {
    email: lead.email,
  };

  // Basic fields
  if (lead.firstName) mauticContact.firstname = lead.firstName;
  if (lead.lastName) mauticContact.lastname = lead.lastName;
  if (lead.phone) mauticContact.phone = lead.phone;
  if (lead.company) mauticContact.company = lead.company;
  if (lead.tags && lead.tags.length > 0) mauticContact.tags = lead.tags;

  // UTM parameters
  if (lead.utm?.source) mauticContact.utm_source = lead.utm.source;
  if (lead.utm?.medium) mauticContact.utm_medium = lead.utm.medium;
  if (lead.utm?.campaign) mauticContact.utm_campaign = lead.utm.campaign;
  if (lead.utm?.term) mauticContact.utm_term = lead.utm.term;
  if (lead.utm?.content) mauticContact.utm_content = lead.utm.content;

  // Property information (flatten to custom fields)
  if (lead.property) {
    if (lead.property.address) mauticContact.property_address = lead.property.address;
    if (lead.property.city) mauticContact.property_city = lead.property.city;
    if (lead.property.state) mauticContact.property_state = lead.property.state;
    if (lead.property.zip) mauticContact.property_zip = lead.property.zip;
    if (lead.property.propertyType) mauticContact.property_type = lead.property.propertyType;
    if (lead.property.estimatedValue) {
      mauticContact.property_value = lead.property.estimatedValue;
    }
  }

  // Custom fields
  if (lead.customFields) {
    Object.entries(lead.customFields).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        mauticContact[key] = value;
      }
    });
  }

  // Timestamp for stale-guard
  if (lead.updated_at) {
    mauticContact.last_platform_update = lead.updated_at;
  }

  return compact(mauticContact);
}

/**
 * Preserve existing UTM parameters from Mautic contact if not present in HKI payload
 * 
 * This ensures we don't overwrite UTM data that was already captured in Mautic
 * when the HKI payload doesn't include UTM parameters.
 * 
 * @param hkiContact - Mapped HKI contact data
 * @param existingMauticContact - Existing Mautic contact (from API)
 * @returns Merged contact with preserved UTMs
 */
export function preserveExistingUtmsIfPresent(
  hkiContact: MauticContact,
  existingMauticContact: any
): MauticContact {
  const result = { ...hkiContact };
  
  // Extract existing UTM values from Mautic contact
  const existingFields = existingMauticContact?.fields?.all || {};
  
  const utmFields = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ];

  // Preserve existing UTM values if not present in HKI payload
  utmFields.forEach(field => {
    if (!result[field] && existingFields[field]) {
      result[field] = existingFields[field];
    }
  });

  return result;
}

export { compact };
