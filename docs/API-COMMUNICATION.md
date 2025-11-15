# Communication API Documentation

This document describes the communication APIs for SendGrid (email) and Twilio (SMS) integration.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Email API (SendGrid)](#email-api-sendgrid)
4. [SMS API (Twilio)](#sms-api-twilio)
5. [Template Management API](#template-management-api)
6. [Workflow Execution API](#workflow-execution-api)
7. [Error Handling](#error-handling)
8. [Demo Mode](#demo-mode)

## Overview

The communication system provides:
- **Email sending** via SendGrid
- **SMS sending** via Twilio
- **Template management** for reusable content
- **Workflow automation** for multi-step communications
- **Demo mode** for development without API keys

## Authentication

All APIs use serverless functions and require environment variables to be configured in Netlify:

### SendGrid Configuration
```bash
SENDGRID_API_KEY=your_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your Company Name
```

### Twilio Configuration
```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Email API (SendGrid)

### Send Email

**Endpoint:** `POST /.netlify/functions/sendgrid`

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Welcome to {{companyName}}",
  "content": "<h1>Welcome, {{firstName}}!</h1><p>Thanks for joining us.</p>",
  "variables": {
    "companyName": "Hidden Key Investments",
    "firstName": "John"
  },
  "from": {
    "email": "custom@example.com",
    "name": "Custom Sender"
  }
}
```

**Required Fields:**
- `to` (string): Recipient email address
- `subject` (string): Email subject line
- `content` (string): HTML email content

**Optional Fields:**
- `variables` (object): Key-value pairs for template variable substitution
- `from` (object): Custom sender (uses defaults if not provided)
- `templateId` (string): Reference to a saved template

**Response:**
```json
{
  "success": true,
  "messageId": "sg-abc123",
  "message": "Email sent successfully",
  "details": {
    "to": "recipient@example.com",
    "subject": "Welcome to Hidden Key Investments"
  }
}
```

**Template Variables:**
Use `{{variableName}}` syntax in subject and content. Variables are automatically replaced with values from the `variables` object.

Example:
- Template: `"Hello {{firstName}} {{lastName}}"`
- Variables: `{"firstName": "John", "lastName": "Doe"}`
- Result: `"Hello John Doe"`

## SMS API (Twilio)

### Send SMS

**Endpoint:** `POST /.netlify/functions/twilio-sms`

**Request Body:**
```json
{
  "to": "+1234567890",
  "message": "Hi {{firstName}}, your appointment is on {{date}} at {{time}}",
  "variables": {
    "firstName": "John",
    "date": "2024-12-15",
    "time": "3:00 PM"
  },
  "templateId": "tpl-2"
}
```

**Required Fields:**
- `to` (string): Recipient phone number in E.164 format (+1234567890)
- `message` (string): SMS message content

**Optional Fields:**
- `variables` (object): Key-value pairs for template variable substitution
- `templateId` (string): Reference to a saved template

**Response:**
```json
{
  "success": true,
  "messageId": "SM-xyz789",
  "message": "SMS sent successfully",
  "details": {
    "to": "+1234567890",
    "status": "queued",
    "segments": 1
  }
}
```

**Phone Number Format:**
- Must be in E.164 format: `+[country code][number]`
- Examples: `+12025551234`, `+447911123456`
- Invalid: `(202) 555-1234`, `202-555-1234`

**Message Length:**
- Maximum: 1,600 characters
- Single SMS segment: 160 characters
- Multi-segment messages are automatically split

## Template Management API

### List Templates

**Endpoint:** `GET /.netlify/functions/templates`

**Query Parameters:**
- `type` (optional): Filter by type (`email` or `sms`)
- `status` (optional): Filter by status (`draft`, `active`, or `archived`)

**Response:**
```json
{
  "templates": [
    {
      "id": "tpl-1",
      "name": "Welcome Email",
      "description": "Welcome email for new investors",
      "type": "email",
      "status": "active",
      "subject": "Welcome, {{firstName}}!",
      "content": "<h1>Welcome!</h1>",
      "variables": ["firstName"],
      "createdAt": "2024-11-03T00:00:00Z",
      "updatedAt": "2024-11-03T00:00:00Z",
      "tags": ["welcome", "onboarding"]
    }
  ],
  "total": 1
}
```

### Get Template

**Endpoint:** `GET /.netlify/functions/templates/{templateId}`

**Response:** Single template object (same structure as list item)

### Create Template

**Endpoint:** `POST /.netlify/functions/templates`

**Request Body:**
```json
{
  "name": "Appointment Reminder",
  "description": "SMS reminder for appointments",
  "type": "sms",
  "content": "Hi {{firstName}}, reminder: {{date}} at {{time}}",
  "tags": ["reminder", "appointment"]
}
```

**Required Fields:**
- `name` (string): Template name
- `type` (string): Template type (`email` or `sms`)
- `content` (string): Template content
- `subject` (string): Required for email templates only

**Response:**
```json
{
  "success": true,
  "message": "Template created successfully",
  "template": { /* template object */ }
}
```

### Update Template

**Endpoint:** `PUT /.netlify/functions/templates/{templateId}`

**Request Body:** Partial template object with fields to update

### Delete Template

**Endpoint:** `DELETE /.netlify/functions/templates/{templateId}`

**Response:**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

## Workflow Execution API

### Execute Workflow

**Endpoint:** `POST /.netlify/functions/workflow-execute`

**Request Body:**
```json
{
  "workflowId": "wf-welcome-series",
  "nodes": [
    {
      "id": "1",
      "type": "trigger",
      "name": "New Lead Created",
      "config": {},
      "position": { "x": 0, "y": 0 }
    },
    {
      "id": "2",
      "type": "action",
      "name": "Send Welcome Email",
      "config": {
        "service": "sendgrid",
        "templateId": "tpl-1"
      },
      "position": { "x": 0, "y": 1 }
    }
  ],
  "connections": [
    { "from": "1", "to": "2" }
  ],
  "data": {
    "email": "newlead@example.com",
    "firstName": "John",
    "subject": "Welcome!",
    "content": "<p>Welcome to our platform!</p>"
  }
}
```

**Response:**
```json
{
  "success": true,
  "executionId": "exec-1699000000000",
  "workflowId": "wf-welcome-series",
  "message": "Workflow executed successfully",
  "results": [
    {
      "nodeId": "1",
      "nodeName": "New Lead Created",
      "status": "success",
      "message": "Workflow triggered"
    },
    {
      "nodeId": "2",
      "nodeName": "Send Welcome Email",
      "status": "success",
      "message": "Email sent: Demo mode: Email would be sent"
    }
  ]
}
```

**Node Types:**

1. **Trigger** - Starts the workflow
2. **Action** - Performs an action
   - `service: "sendgrid"` - Send email
   - `service: "twilio"` - Send SMS
   - `delay: "2d"` - Schedule delay
3. **Condition** - Branching logic (basic evaluation)

## Error Handling

All APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created (for POST requests)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

**Common Errors:**
- Missing required fields
- Invalid email address
- Invalid phone number format
- Template not found
- Service unavailable

## Demo Mode

When API keys are not configured, the system operates in demo mode:

**Features:**
- All API calls return successful responses
- No actual emails or SMS are sent
- Useful for development and testing
- Console logs show what would have been sent

**Identifying Demo Mode:**
Response includes `demo: true` flag:
```json
{
  "success": true,
  "demo": true,
  "message": "Demo mode: Email would be sent"
}
```

**Enabling Production Mode:**
1. Set environment variables in Netlify dashboard
2. Deploy the application
3. APIs will automatically use real services

## Rate Limits

**SendGrid:**
- Free tier: 100 emails/day
- Paid tiers: Up to 100+ emails/second

**Twilio:**
- Free trial: Limited credits
- Paid: Based on message volume and destination

**Best Practices:**
- Implement retry logic for failed requests
- Use batch sending for large volumes
- Monitor usage via service dashboards
- Implement rate limiting in your application

## Support

For issues or questions:
- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review [SendGrid Documentation](https://docs.sendgrid.com/)
- Review [Twilio Documentation](https://www.twilio.com/docs)
- Contact support@example.com
