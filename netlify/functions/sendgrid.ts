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
  from?: { email: string; name: string };
  templateId?: string;
  variables?: Record<string, string>;
}

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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const requestBody: EmailRequest = JSON.parse(event.body || '{}');
    const { to, subject, content, from, variables } = requestBody;

    if (!to || !subject || !content) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields: to, subject, content' }) };
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    const fromEmail = from?.email ?? process.env.SENDGRID_FROM_EMAIL ?? "";
    const fromName  = from?.name  ?? process.env.SENDGRID_FROM_NAME  ?? "";

    // ✅ Prod guard: refuse to run in production if sender identity isn't configured
    if (process.env.NODE_ENV === "production" && (!fromEmail || !fromName)) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: "Missing sender configuration",
          message: "SENDGRID_FROM_EMAIL and/or SENDGRID_FROM_NAME are not set",
        }),
      };
    }

    // Demo mode if API key isn't set (still allowed locally/staging)
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

    // Real send
    sgMail.setApiKey(apiKey);
    const processedContent = replaceVariables(content, variables);
    const processedSubject = replaceVariables(subject, variables);

    const msg = {
      to,
      from: { email: fromEmail, name: fromName },
      subject: processedSubject,
      html: processedContent,
    };

    const [response] = await sgMail.send(msg as any);
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: (response.headers && (response.headers['x-message-id'] as string)) || `sg-${Date.now()}`,
        message: 'Email sent successfully',
        details: { to, subject },
      }),
    };
  } catch (error: any) {
    console.error('SendGrid error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Failed to send email', message: error.message || 'Unknown error' }),
    };
  }
};
