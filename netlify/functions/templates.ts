/**
 * Template Management - Netlify Serverless Function
 * Handles CRUD operations for email and SMS templates
 */

import type { Handler } from '@netlify/functions';

interface Template {
  id: string;
  name: string;
  description?: string;
  type: 'email' | 'sms';
  status: 'draft' | 'active' | 'archived';
  subject?: string;
  content: string;
  variables: string[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

// In-memory storage for demo (in production, use a database)
// Note: This will reset on each cold start in serverless environment
// For production, integrate with Supabase or other persistent storage
const templates: Map<string, Template> = new Map();

// Initialize with sample templates
function initializeSampleTemplates() {
  if (templates.size === 0) {
    const sampleTemplates: Template[] = [
      {
        id: 'tpl-1',
        name: 'Welcome Email',
        description: 'Welcome email for new investors',
        type: 'email',
        status: 'active',
        subject: 'Welcome to Hidden Key Investments, {{firstName}}!',
        content: `<h1>Welcome, {{firstName}}!</h1>
<p>Thank you for joining Hidden Key Investments. We're excited to have you on board.</p>
<p>Your investment journey starts here.</p>
<p>Best regards,<br>The Hidden Key Team</p>`,
        variables: ['firstName'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['welcome', 'onboarding']
      },
      {
        id: 'tpl-2',
        name: 'Appointment Reminder',
        description: 'SMS reminder for scheduled appointments',
        type: 'sms',
        status: 'active',
        content: 'Hi {{firstName}}, this is a reminder about your appointment on {{date}} at {{time}}. Reply CONFIRM to confirm.',
        variables: ['firstName', 'date', 'time'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['reminder', 'appointment']
      },
      {
        id: 'tpl-3',
        name: 'Investment Opportunity',
        description: 'Email for new investment opportunities',
        type: 'email',
        status: 'active',
        subject: 'New Investment Opportunity: {{propertyName}}',
        content: `<h2>New Investment Opportunity Available</h2>
<p>Hi {{firstName}},</p>
<p>A new investment opportunity has become available: <strong>{{propertyName}}</strong></p>
<p>Location: {{location}}</p>
<p>Expected ROI: {{roi}}%</p>
<p><a href="{{propertyLink}}">View Details</a></p>`,
        variables: ['firstName', 'propertyName', 'location', 'roi', 'propertyLink'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['opportunity', 'investment']
      }
    ];
    
    sampleTemplates.forEach(tpl => templates.set(tpl.id, tpl));
  }
}

/**
 * Extract variables from template content
 */
function extractVariables(content: string, subject?: string): string[] {
  const text = subject ? `${subject} ${content}` : content;
  const matches = text.match(/{{(\w+)}}/g);
  if (!matches) return [];
  
  const variables = matches.map(match => match.replace(/{{|}}/g, ''));
  return [...new Set(variables)]; // Remove duplicates
}

export const handler: Handler = async (event) => {
  // Initialize sample templates
  initializeSampleTemplates();

  const { httpMethod, path } = event;
  const segments = path?.split('/').filter(Boolean) || [];
  const templateId = segments[segments.length - 1];

  try {
    // GET - List all templates or get specific template
    if (httpMethod === 'GET') {
      // Get specific template
      if (templateId && templateId !== 'templates') {
        const template = templates.get(templateId);
        if (!template) {
          return {
            statusCode: 404,
            body: JSON.stringify({ error: 'Template not found' })
          };
        }
        return {
          statusCode: 200,
          body: JSON.stringify(template)
        };
      }
      
      // List all templates (with optional filtering)
      const queryParams = event.queryStringParameters || {};
      const type = queryParams.type as 'email' | 'sms' | undefined;
      const status = queryParams.status as 'draft' | 'active' | 'archived' | undefined;
      
      let templateList = Array.from(templates.values());
      
      if (type) {
        templateList = templateList.filter(t => t.type === type);
      }
      if (status) {
        templateList = templateList.filter(t => t.status === status);
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          templates: templateList,
          total: templateList.length
        })
      };
    }

    // POST - Create new template
    if (httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { name, description, type, subject, content, tags } = body;

      if (!name || !type || !content) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            error: 'Missing required fields: name, type, content' 
          })
        };
      }

      if (type === 'email' && !subject) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            error: 'Subject is required for email templates' 
          })
        };
      }

      const newTemplate: Template = {
        id: `tpl-${Date.now()}`,
        name,
        description,
        type,
        status: 'draft',
        subject,
        content,
        variables: extractVariables(content, subject),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags
      };

      templates.set(newTemplate.id, newTemplate);

      return {
        statusCode: 201,
        body: JSON.stringify({
          success: true,
          message: 'Template created successfully',
          template: newTemplate
        })
      };
    }

    // PUT - Update template
    if (httpMethod === 'PUT' && templateId && templateId !== 'templates') {
      const existingTemplate = templates.get(templateId);
      if (!existingTemplate) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Template not found' })
        };
      }

      const body = JSON.parse(event.body || '{}');
      const updatedTemplate: Template = {
        ...existingTemplate,
        ...body,
        id: templateId, // Ensure ID doesn't change
        updatedAt: new Date().toISOString()
      };

      // Re-extract variables if content or subject changed
      if (body.content || body.subject) {
        updatedTemplate.variables = extractVariables(
          body.content || existingTemplate.content,
          body.subject || existingTemplate.subject
        );
      }

      templates.set(templateId, updatedTemplate);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Template updated successfully',
          template: updatedTemplate
        })
      };
    }

    // DELETE - Delete template
    if (httpMethod === 'DELETE' && templateId && templateId !== 'templates') {
      const existingTemplate = templates.get(templateId);
      if (!existingTemplate) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Template not found' })
        };
      }

      templates.delete(templateId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Template deleted successfully'
        })
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  } catch (error: any) {
    console.error('Template management error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message || 'Unknown error'
      })
    };
  }
};
