/**
 * Communication Types - Email and SMS Templates and Workflows
 */

export type CommunicationType = 'email' | 'sms';
export type TemplateStatus = 'draft' | 'active' | 'archived';

/**
 * Communication Template
 */
export interface CommunicationTemplate {
  id: string;
  name: string;
  description?: string;
  type: CommunicationType;
  status: TemplateStatus;
  subject?: string; // For email only
  content: string; // HTML for email, plain text for SMS
  variables: string[]; // Available template variables like {{firstName}}, {{propertyName}}
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  tags?: string[];
}

/**
 * Template Variable
 */
export interface TemplateVariable {
  name: string;
  description: string;
  defaultValue?: string;
  required: boolean;
}

/**
 * Email Send Request
 */
export interface EmailSendRequest {
  to: string;
  templateId?: string;
  subject?: string;
  content?: string;
  variables?: Record<string, string>;
  from?: {
    email: string;
    name: string;
  };
}

/**
 * SMS Send Request
 */
export interface SmsSendRequest {
  to: string;
  templateId?: string;
  message?: string;
  variables?: Record<string, string>;
}

/**
 * Communication Result
 */
export interface CommunicationResult {
  success: boolean;
  messageId?: string;
  message: string;
  error?: string;
}

/**
 * Communication Log Entry
 */
export interface CommunicationLog {
  id: string;
  type: CommunicationType;
  templateId?: string;
  recipient: string;
  subject?: string;
  status: 'sent' | 'failed' | 'pending' | 'delivered';
  sentAt: string;
  deliveredAt?: string;
  error?: string;
  metadata?: Record<string, any>;
}
