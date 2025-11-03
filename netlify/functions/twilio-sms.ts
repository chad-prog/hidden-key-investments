/**
 * Twilio SMS Service - Netlify Serverless Function
 * Handles SMS sending via Twilio API
 */

import type { Handler } from '@netlify/functions';
// @ts-ignore
import twilio from 'twilio';

interface SmsRequest {
  to: string;
  message: string;
  templateId?: string;
  variables?: Record<string, string>;
}

/**
 * Replace template variables in message
 */
function replaceVariables(message: string, variables?: Record<string, string>): string {
  if (!variables) return message;
  
  let result = message;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
}

/**
 * Validate phone number format (basic validation)
 */
function isValidPhoneNumber(phone: string): boolean {
  // Basic validation: should start with + and contain 10-15 digits
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
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
    const requestBody: SmsRequest = JSON.parse(event.body || '{}');
    const { to, message, variables } = requestBody;

    // Validate required fields
    if (!to || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Missing required fields: to, message' 
        })
      };
    }

    // Validate phone number
    if (!isValidPhoneNumber(to)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Invalid phone number format. Use E.164 format (e.g., +1234567890)' 
        })
      };
    }

    // Check if we're in demo mode (no credentials configured)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber || 
        accountSid.includes('your_') || authToken.includes('your_')) {
      console.log('Demo mode: Would send SMS', { to, message: message.substring(0, 50) });
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          demo: true,
          messageId: `demo-sms-${Date.now()}`,
          message: 'Demo mode: SMS would be sent',
          details: { to, messageLength: message.length }
        })
      };
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Replace template variables
    const processedMessage = replaceVariables(message, variables);

    // Check message length (SMS limit is 160 characters for single message)
    if (processedMessage.length > 1600) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Message too long. Maximum 1600 characters allowed.' 
        })
      };
    }

    // Send SMS
    const response = await client.messages.create({
      body: processedMessage,
      from: fromNumber,
      to: to
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        messageId: response.sid,
        message: 'SMS sent successfully',
        details: { 
          to, 
          status: response.status,
          segments: Math.ceil(processedMessage.length / 160)
        }
      })
    };
  } catch (error: any) {
    console.error('Twilio error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to send SMS',
        message: error.message || 'Unknown error'
      })
    };
  }
};
