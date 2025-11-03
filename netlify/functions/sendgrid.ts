/**
 * SendGrid Email Service - Netlify Serverless Function
 * Handles email sending via SendGrid API
 */

import type { Handler } from '@netlify/functions';
import sgMail from '@sendgrid/mail';

interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  from?: {
    email: string;
    name: string;
  };
  templateId?: string;
  variables?: Record<string, string>;
}

/**
 * Replace template variables in content
 */
function replaceVariables(content: string, variables?: Record<string, string>): string {
  if (!variables) return content;
  
  let result = content;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
}

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const requestBody: EmailRequest = JSON.parse(event.body || '{}');
    const { to, subject, content, from, variables } = requestBody;

    // Validate required fields
    if (!to || !subject || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Missing required fields: to, subject, content' 
        })
      };
    }

    // Check if we're in demo mode (no API key configured)
    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = from?.email || process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
    const fromName = from?.name || process.env.SENDGRID_FROM_NAME || 'Hidden Key Investments';

    if (!apiKey || apiKey.includes('your_') || apiKey === 'demo-key') {
      console.log('Demo mode: Would send email', { to, subject, fromEmail });
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          demo: true,
          messageId: `demo-${Date.now()}`,
          message: 'Demo mode: Email would be sent',
          details: { to, subject, from: fromEmail }
        })
      };
    }

    // Configure SendGrid
    sgMail.setApiKey(apiKey);

    // Replace template variables
    const processedContent = replaceVariables(content, variables);
    const processedSubject = replaceVariables(subject, variables);

    // Prepare email message
    const msg = {
      to,
      from: {
        email: fromEmail,
        name: fromName
      },
      subject: processedSubject,
      html: processedContent
    };

    // Send email
    const [response] = await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: response.headers['x-message-id'] || `sg-${Date.now()}`,
        message: 'Email sent successfully',
        details: { to, subject }
      })
    };
  } catch (error: any) {
    console.error('SendGrid error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to send email',
        message: error.message || 'Unknown error'
      })
    };
  }
};
