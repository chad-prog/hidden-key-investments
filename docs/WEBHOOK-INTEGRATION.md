# Webhook Integration Guide

## Overview

The webhook endpoint allows third-party services to send lead data to the Hidden Key Investments platform. This enables seamless integration with tools like Zapier, Make (Integromat), n8n, and custom applications.

## Endpoint

```
POST /.netlify/functions/webhook-inbound
```

## Features

- ✅ **Flexible field mapping** - Supports multiple field name conventions
- ✅ **Signature verification** - Optional HMAC-SHA256 signature validation
- ✅ **Rate limiting** - Prevents abuse (100 requests/minute per source)
- ✅ **Automatic normalization** - Converts various formats to standard lead schema
- ✅ **Deduplication-ready** - Tracks webhook IDs and timestamps
- ✅ **Property type mapping** - Handles various property type formats
- ✅ **UTM tracking** - Preserves marketing attribution data
- ✅ **Custom fields** - Stores unmapped fields for future use

## Authentication

### Webhook Signature (Recommended)

For secure webhook integrations, configure a shared secret:

1. Set the `WEBHOOK_SECRET` environment variable in Netlify
2. Generate HMAC-SHA256 signature of the JSON payload
3. Include signature in `X-Webhook-Signature` header

**Example (Node.js):**
```javascript
const crypto = require('crypto');

const payload = { email: 'test@example.com', first_name: 'John' };
const secret = process.env.WEBHOOK_SECRET;

const signature = crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify(payload))
  .digest('hex');

fetch('https://your-site.netlify.app/.netlify/functions/webhook-inbound', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Signature': signature
  },
  body: JSON.stringify(payload)
});
```

**Example (Python):**
```python
import hmac
import hashlib
import json
import requests

payload = {'email': 'test@example.com', 'first_name': 'John'}
secret = os.environ['WEBHOOK_SECRET']

signature = hmac.new(
    secret.encode(),
    json.dumps(payload).encode(),
    hashlib.sha256
).hexdigest()

requests.post(
    'https://your-site.netlify.app/.netlify/functions/webhook-inbound',
    json=payload,
    headers={'X-Webhook-Signature': signature}
)
```

## Request Format

### Flexible Field Names

The webhook accepts various field naming conventions:

#### Contact Information
```json
{
  // Email (any of these)
  "email": "investor@example.com",
  "email_address": "investor@example.com",
  "contact_email": "investor@example.com",
  
  // Name (any combination)
  "first_name": "John",
  "firstName": "John",
  "last_name": "Doe",
  "lastName": "Doe",
  
  // Phone (any of these)
  "phone": "+1234567890",
  "phone_number": "+1234567890",
  "contact_phone": "+1234567890"
}
```

#### Property Information
```json
{
  // Address (any of these)
  "address": "123 Main St",
  "property_address": "123 Main St",
  "street_address": "123 Main St",
  
  "city": "Austin",
  "state": "TX",
  
  // Zip code (any of these)
  "zip": "78701",
  "zipcode": "78701",
  "postal_code": "78701",
  
  // Property type (flexible)
  "property_type": "single family",
  "propertyType": "multi-family",
  
  // Value (number or string)
  "property_value": 500000,
  "estimated_value": "$500,000"
}
```

#### Additional Fields
```json
{
  // Message/Notes
  "message": "Interested in investment opportunities",
  "notes": "Looking for passive income",
  "comments": "First-time investor",
  
  // UTM Tracking
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "spring_2024",
  
  // Source identification
  "source": "website",
  "webhook_source": "zapier",
  
  // Custom metadata
  "custom_fields": {
    "referral_code": "INVEST2024",
    "investment_amount": 100000
  },
  
  // Any unmapped fields are stored as custom fields
  "interest_level": "high",
  "preferred_contact": "email"
}
```

## Response Format

### Success Response (200)
```json
{
  "ok": true,
  "data": {
    "leadId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "created",
    "message": "Lead captured successfully",
    "webhook_received": true
  },
  "correlationId": "abc-123-def-456",
  "metadata": {
    "durationMs": 145
  }
}
```

### Error Responses

#### Validation Error (400)
```json
{
  "ok": false,
  "error": {
    "code": "ERR_VALIDATION",
    "message": "Invalid webhook payload",
    "details": {
      // Zod validation errors
    }
  },
  "correlationId": "abc-123-def-456"
}
```

#### Unauthorized (401)
```json
{
  "ok": false,
  "error": {
    "code": "ERR_INVALID_SIGNATURE",
    "message": "Invalid webhook signature"
  },
  "correlationId": "abc-123-def-456"
}
```

#### Rate Limit (429)
```json
{
  "ok": false,
  "error": {
    "code": "ERR_RATE_LIMIT",
    "message": "Too many requests. Please try again later."
  },
  "correlationId": "abc-123-def-456"
}
```

## Integration Examples

### Zapier

1. **Create a new Zap** with your trigger (e.g., Google Forms, Typeform)
2. **Add a Webhooks action** → "POST"
3. **Configure:**
   - URL: `https://your-site.netlify.app/.netlify/functions/webhook-inbound`
   - Payload Type: JSON
   - Data: Map fields from your trigger

**Example mapping:**
```
{
  "email": {{Email}},
  "first_name": {{FirstName}},
  "last_name": {{LastName}},
  "phone": {{Phone}},
  "address": {{Address}},
  "city": {{City}},
  "state": {{State}},
  "zip": {{ZipCode}},
  "webhook_source": "zapier",
  "notes": {{Message}}
}
```

### Make (Integromat)

1. **Add HTTP module** → "Make a request"
2. **Configure:**
   - URL: `https://your-site.netlify.app/.netlify/functions/webhook-inbound`
   - Method: POST
   - Body type: Raw
   - Content type: application/json

**Example body:**
```json
{
  "email": "{{1.email}}",
  "first_name": "{{1.firstName}}",
  "webhook_source": "make",
  "property_address": "{{1.address}}",
  "city": "{{1.city}}",
  "state": "{{1.state}}"
}
```

### n8n

1. **Add HTTP Request node**
2. **Configure:**
   - Method: POST
   - URL: `https://your-site.netlify.app/.netlify/functions/webhook-inbound`
   - Body: JSON
   - Specify Body: true

**Example:**
```json
{
  "email": "={{$json.email}}",
  "first_name": "={{$json.firstName}}",
  "webhook_source": "n8n"
}
```

### Custom Integration (cURL)

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/webhook-inbound \
  -H "Content-Type: application/json" \
  -d '{
    "email": "investor@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+15551234567",
    "address": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip": "78701",
    "property_type": "single family",
    "property_value": 500000,
    "message": "Interested in investment opportunities",
    "utm_source": "google",
    "utm_campaign": "spring_2024",
    "webhook_source": "custom_crm"
  }'
```

## Property Type Mapping

The webhook automatically normalizes various property type formats:

| Input Format | Normalized Value |
|-------------|------------------|
| "single family", "single-family", "sfr", "house" | `single_family` |
| "multi family", "multi-family", "multifamily", "apartment" | `multi_family` |
| "commercial", "retail", "office" | `commercial` |
| "land", "vacant" | `land` |
| "mixed use", "mixed-use" | `mixed_use` |

## Rate Limiting

- **Default:** 100 requests per minute per source
- **Identification:** Based on webhook_source or IP address
- **Window:** Rolling 60-second window
- **Response:** 429 status code when limit exceeded

## Best Practices

### 1. Include Source Identification
Always include `webhook_source` to help with debugging and analytics:
```json
{
  "webhook_source": "zapier",
  "email": "test@example.com"
}
```

### 2. Use Signature Verification
For production environments, always use webhook signatures to prevent unauthorized access.

### 3. Include Correlation IDs
The response includes a `correlationId` - store this for support requests:
```javascript
const response = await fetch(webhookUrl, { method: 'POST', body: data });
const result = await response.json();
console.log('Correlation ID:', result.correlationId);
```

### 4. Handle Retries
Implement exponential backoff for failed requests:
```javascript
async function sendWebhookWithRetry(data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (response.ok) return await response.json();
      
      if (response.status === 429) {
        // Rate limited - wait and retry
        await sleep(Math.pow(2, i) * 1000);
        continue;
      }
      
      throw new Error(`Webhook failed: ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

### 5. Monitor Webhook Health
Track success/failure rates and response times:
```javascript
const startTime = Date.now();
const response = await sendWebhook(data);
const duration = Date.now() - startTime;

analytics.track('webhook_sent', {
  success: response.ok,
  duration,
  source: data.webhook_source
});
```

## Testing

### Test Endpoint
```bash
# Simple test
curl -X POST https://your-site.netlify.app/.netlify/functions/webhook-inbound \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","webhook_source":"test"}'
```

### Test with Signature
```bash
# Generate signature and test
SECRET="your-webhook-secret"
PAYLOAD='{"email":"test@example.com"}'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

curl -X POST https://your-site.netlify.app/.netlify/functions/webhook-inbound \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

## Troubleshooting

### Common Issues

#### 1. 400 Bad Request - Invalid JSON
**Cause:** Malformed JSON in request body  
**Solution:** Validate JSON before sending

#### 2. 401 Unauthorized - Invalid Signature
**Cause:** Signature doesn't match or using wrong secret  
**Solution:** Verify WEBHOOK_SECRET and signature generation

#### 3. 429 Rate Limited
**Cause:** Too many requests in short time  
**Solution:** Implement retry with exponential backoff

#### 4. 500 Internal Server Error
**Cause:** Lead ingestion failed  
**Solution:** Check correlationId in logs, verify lead data format

### Debug Mode

For development, the endpoint provides detailed error messages:
```json
{
  "error": {
    "code": "ERR_INTERNAL",
    "message": "Failed to process webhook",
    "details": "Detailed error message (development only)"
  }
}
```

## Security Considerations

1. **Always use HTTPS** - Webhooks should only be sent over secure connections
2. **Implement signature verification** - Prevents unauthorized webhook submissions
3. **Monitor for abuse** - Track failed attempts and unusual patterns
4. **Rotate secrets regularly** - Update WEBHOOK_SECRET quarterly
5. **Validate data** - Never trust webhook data blindly
6. **Rate limiting** - Built-in protection against DoS attacks

## Support

For issues or questions:
1. Check the `correlationId` from the response
2. Review server logs in Netlify dashboard
3. Create a GitHub issue with correlation ID and error details

## Changelog

### v1.0.0 (2025-10-27)
- Initial webhook endpoint release
- Flexible field mapping
- Signature verification
- Rate limiting
- Property type normalization
- UTM tracking support
