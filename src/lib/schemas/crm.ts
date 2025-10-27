/**
 * CRM Data Models and Zod Schemas
 * 
 * Defines the core data structures for leads, opportunities, and investors
 * with comprehensive validation using Zod
 */

import { z } from 'zod';

// ============================================================================
// Lead Schemas
// ============================================================================

export const LeadSourceSchema = z.enum([
  'website',
  'referral',
  'cold_outreach',
  'event',
  'partner',
  'social_media',
  'paid_ads',
  'other'
]);

export const LeadStatusSchema = z.enum([
  'new',
  'contacted',
  'qualified',
  'nurturing',
  'converted',
  'disqualified',
  'lost'
]);

export const PropertyInfoSchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(2).max(2),
  zip: z.string().min(5),
  propertyType: z.enum(['single_family', 'multi_family', 'commercial', 'land', 'mixed_use']).optional(),
  estimatedValue: z.number().positive().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
});

export const ContactInfoSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  preferredContact: z.enum(['email', 'phone', 'sms', 'none']).default('email'),
  doNotContact: z.boolean().default(false),
});

export const LeadSchema = z.object({
  id: z.string().uuid(),
  source: LeadSourceSchema,
  status: LeadStatusSchema,
  
  // Contact information
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  contact: ContactInfoSchema,
  
  // Property information
  property: PropertyInfoSchema.optional(),
  
  // Enrichment data
  enrichmentData: z.object({
    emailValidated: z.boolean().optional(),
    phoneValidated: z.boolean().optional(),
    ownershipVerified: z.boolean().optional(),
    creditScore: z.number().min(300).max(850).optional(),
    estimatedIncome: z.number().positive().optional(),
  }).optional(),
  
  // Scoring
  score: z.number().min(0).max(100).optional(),
  scoreReason: z.string().optional(),
  
  // Metadata
  assignedTo: z.string().uuid().optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.any()).optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  lastContactedAt: z.date().optional(),
  convertedAt: z.date().optional(),
});

export const LeadCreateSchema = LeadSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
}).partial({
  status: true,
  contact: true,
});

export const LeadUpdateSchema = LeadSchema.partial().required({ id: true });

// ============================================================================
// Opportunity (Deal) Schemas
// ============================================================================

export const OpportunityStageSchema = z.enum([
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'due_diligence',
  'closing',
  'won',
  'lost'
]);

export const DealTypeSchema = z.enum([
  'acquisition',
  'syndication',
  'joint_venture',
  'equity_investment',
  'debt_investment',
  'other'
]);

export const OpportunitySchema = z.object({
  id: z.string().uuid(),
  leadId: z.string().uuid(),
  
  // Deal details
  name: z.string().min(1),
  stage: OpportunityStageSchema,
  dealType: DealTypeSchema,
  
  // Financial
  estimatedValue: z.number().positive(),
  expectedReturn: z.number().optional(),
  expectedCloseDate: z.date().optional(),
  actualCloseDate: z.date().optional(),
  
  // Probability and scoring
  probability: z.number().min(0).max(100).optional(),
  riskScore: z.number().min(0).max(100).optional(),
  
  // Relationships
  primaryInvestor: z.string().uuid().optional(),
  secondaryInvestors: z.array(z.string().uuid()).default([]),
  assignedTo: z.string().uuid().optional(),
  
  // Documents and legal
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    url: z.string().url(),
    uploadedAt: z.date(),
  })).default([]),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.any()).optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  closedAt: z.date().optional(),
});

export const OpportunityCreateSchema = OpportunitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  closedAt: true,
});

export const OpportunityUpdateSchema = OpportunitySchema.partial().required({ id: true });

// ============================================================================
// Investor Schemas
// ============================================================================

export const InvestorTypeSchema = z.enum([
  'accredited',
  'institutional',
  'high_net_worth',
  'family_office',
  'individual',
  'other'
]);

export const InvestorStatusSchema = z.enum([
  'prospect',
  'active',
  'inactive',
  'blacklisted'
]);

export const InvestorSchema = z.object({
  id: z.string().uuid(),
  
  // Basic information
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  companyName: z.string().optional(),
  type: InvestorTypeSchema,
  status: InvestorStatusSchema,
  
  // Contact
  contact: ContactInfoSchema,
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().default('US'),
  }).optional(),
  
  // Investment profile
  investmentProfile: z.object({
    minInvestment: z.number().positive().optional(),
    maxInvestment: z.number().positive().optional(),
    preferredDealTypes: z.array(DealTypeSchema).default([]),
    preferredPropertyTypes: z.array(z.string()).default([]),
    preferredLocations: z.array(z.string()).default([]),
    riskTolerance: z.enum(['low', 'medium', 'high', 'very_high']).optional(),
  }).optional(),
  
  // Accreditation
  accreditation: z.object({
    isAccredited: z.boolean(),
    verifiedAt: z.date().optional(),
    expiresAt: z.date().optional(),
    documentUrl: z.string().url().optional(),
  }).optional(),
  
  // Portfolio
  totalInvested: z.number().nonnegative().default(0),
  activeDeals: z.number().nonnegative().default(0),
  completedDeals: z.number().nonnegative().default(0),
  averageReturn: z.number().optional(),
  
  // Relationships
  referredBy: z.string().uuid().optional(),
  accountManager: z.string().uuid().optional(),
  
  // Metadata
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
  lastContactedAt: z.date().optional(),
});

export const InvestorCreateSchema = InvestorSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const InvestorUpdateSchema = InvestorSchema.partial().required({ id: true });

// ============================================================================
// Activity Schemas
// ============================================================================

export const ActivityTypeSchema = z.enum([
  'call',
  'email',
  'meeting',
  'note',
  'task',
  'document_sent',
  'document_signed',
  'status_change',
  'stage_change',
  'automated_action',
  'other'
]);

export const ActivitySchema = z.object({
  id: z.string().uuid(),
  type: ActivityTypeSchema,
  
  // Relationships
  leadId: z.string().uuid().optional(),
  opportunityId: z.string().uuid().optional(),
  investorId: z.string().uuid().optional(),
  
  // Activity details
  subject: z.string().min(1),
  description: z.string().optional(),
  outcome: z.string().optional(),
  
  // Scheduling
  scheduledAt: z.date().optional(),
  completedAt: z.date().optional(),
  dueDate: z.date().optional(),
  
  // Assignment
  createdBy: z.string().uuid(),
  assignedTo: z.string().uuid().optional(),
  
  // Metadata
  metadata: z.record(z.any()).optional(),
  
  // Timestamps
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ActivityCreateSchema = ActivitySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// Type exports
// ============================================================================

export type Lead = z.infer<typeof LeadSchema>;
export type LeadCreate = z.infer<typeof LeadCreateSchema>;
export type LeadUpdate = z.infer<typeof LeadUpdateSchema>;
export type LeadSource = z.infer<typeof LeadSourceSchema>;
export type LeadStatus = z.infer<typeof LeadStatusSchema>;

export type Opportunity = z.infer<typeof OpportunitySchema>;
export type OpportunityCreate = z.infer<typeof OpportunityCreateSchema>;
export type OpportunityUpdate = z.infer<typeof OpportunityUpdateSchema>;
export type OpportunityStage = z.infer<typeof OpportunityStageSchema>;
export type DealType = z.infer<typeof DealTypeSchema>;

export type Investor = z.infer<typeof InvestorSchema>;
export type InvestorCreate = z.infer<typeof InvestorCreateSchema>;
export type InvestorUpdate = z.infer<typeof InvestorUpdateSchema>;
export type InvestorType = z.infer<typeof InvestorTypeSchema>;
export type InvestorStatus = z.infer<typeof InvestorStatusSchema>;

export type Activity = z.infer<typeof ActivitySchema>;
export type ActivityCreate = z.infer<typeof ActivityCreateSchema>;
export type ActivityType = z.infer<typeof ActivityTypeSchema>;
