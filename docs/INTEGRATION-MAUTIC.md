# Mautic Integration Guide

This document describes the Mautic integration for Hidden Key Investments, including setup, endpoints, and usage.

## Overview

The Mautic integration provides:

- **Contact Synchronization**: Bi-directional sync of lead data with Mautic
- **Campaign Enrollment**: Automatic enrollment of high-value leads
- **Webhook Processing**: Real-time updates for email events (unsubscribe, bounce, complaint)
- **OAuth2 Token Caching**: Efficient token management with automatic refresh
- **Demo Mode**: Safe operation without Mautic credentials

## Required Environment Variables

Add these to your Netlify environment or `.env` file:

### Mautic Connection
```bash
# Mautic base URL (e.g., https://mautic.example.com)
MAUTIC_BASE_URL=https://your-mautic-instance.com

# OAuth2 Client Credentials
MAUTIC_CLIENT_ID=your_client_id
MAUTIC_CLIENT_SECRET=your_client_secret

# Webhook Secret (for verifying incoming webhooks)
MAUTIC_WEBHOOK_SECRET=random_secret_string_here
```

### Campaign Enrollment (Optional)
```bash
# Enable automatic campaign enrollment
MAUTIC_ENROLLMENT_ENABLED=true

# High-value campaign ID
MAUTIC_CAMPAIGN_HIGH_VALUE=123

# Minimum property value for high-value designation
MAUTIC_HIGH_VALUE_THRESHOLD=500000

# Eligible lead stages (comma-separated, case-insensitive)
MAUTIC_ELIGIBLE_STAGES=qualified,nurture,hot
```

### Supabase (Required for webhook processing)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role_key
```

## Endpoints

### 1. Mautic Sync Function

**Endpoint**: `/.netlify/functions/mautic-sync`

**Actions**:

#### Ping (Health Check)
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/mautic-sync \
  -H "Content-Type: application/json" \
  -d '{
    "action": "ping"
  }'
```

**Response**:
```json
{
  "ok": true,
  "message": "pong",
  "correlationId": "uuid-here"
}
```

#### Upsert Contact
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/mautic-sync \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: custom-correlation-id" \
  -d '{
    "action": "upsert_contact",
    "payload": {
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1-555-1234",
      "company": "Acme Corp",
      "tags": ["high-value", "property-investor"],
      "utm_source": "google",
      "utm_medium": "cpc",
      "utm_campaign": "q4-2024",
      "updated_at": "2024-11-06T12:00:00Z"
    }
  }'
```

**Response**:
```json
{
  "ok": true,
  "action": "upsert_contact",
  "contactId": 456,
  "email": "john.doe@example.com",
  "created": false,
  "correlationId": "custom-correlation-id"
}
```

**Stale-guard behavior**: If `updated_at` in the payload is older than or equal to `last_platform_update` in Mautic, the update is skipped:
```json
{
  "ok": true,
  "action": "upsert_contact",
  "skipped": true,
  "reason": "stale_data",
  "contactId": 456,
  "correlationId": "..."
}
```

#### Add to Campaign
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/mautic-sync \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add_to_campaign",
    "payload": {
      "email": "john.doe@example.com",
      "campaignId": "123"
    }
  }'
```

**Response**:
```json
{
  "ok": true,
  "action": "add_to_campaign",
  "contactId": 456,
  "campaignId": "123",
  "email": "john.doe@example.com",
  "correlationId": "uuid-here"
}
```

### 2. Mautic Webhook Receiver

**Endpoint**: `/.netlify/functions/mautic-webhook?secret=YOUR_SECRET`

Configure this URL in your Mautic instance under **Webhooks** with the following events:
- Contact unsubscribe
- Email bounce
- Email complaint

**Example webhook payload** (sent by Mautic):
```json
{
  "mautic.lead_post_save_update": [
    {
      "lead": {
        "id": 123,
        "email": "user@example.com"
      },
      "event": "unsubscribe"
    }
  ]
}
```

**Response**:
```json
{
  "ok": true,
  "email": "user@example.com",
  "emailStatus": "unsubscribed",
  "marketingOptIn": false,
  "updatedCount": 1,
  "correlationId": "uuid-here"
}
```

## Lead Ingest Integration

The Mautic sync is automatically triggered when leads are created via the `lead-ingest-enhanced` function:

1. Lead is persisted to Supabase
2. Contact is upserted to Mautic (non-blocking)
3. If high-value criteria met, contact is enrolled in campaign (non-blocking)
4. Errors are logged but don't block lead creation

## Design Notes

### OAuth2 Token Caching
- Tokens are cached in `globalThis` for the lifetime of the serverless function instance
- Automatic refresh when token expires (with 60-second buffer)
- Thread-safe for concurrent requests in same instance

### Retry Logic with Exponential Backoff
- 3 retries for failed requests
- Exponential backoff: 1s, 2s, 4s (plus random jitter)
- Retries on 5xx and 429 status codes

### Idempotency
- Contact upsert is idempotent (creates or updates by email)
- Stale-guard prevents overwriting newer Mautic data with older HKI data
- Campaign enrollment is idempotent (Mautic handles duplicates)

### Demo Mode
- Activated when environment variables are missing or contain "placeholder"
- Logs actions but doesn't make external API calls
- Returns success responses with `demoMode: true` flag

### Correlation IDs
- Pass `X-Correlation-ID` header for request tracing
- Auto-generated UUID if not provided
- Included in all log messages and responses

## Testing

Run the test suite:
```bash
# All tests
npm test

# Specific test files
npm test netlify/functions/__tests__/mautic-sync.test.ts
npm test src/lib/mappers/__tests__/hkiToMautic.spec.ts
npm test src/lib/mautic/__tests__/deciders.spec.ts
```

Tests are hermetic and use mocked `fetch` and Supabase clients - no real network calls.

## Next Steps

1. **Configure Mautic OAuth App**:
   - Create API credentials in Mautic under Configuration > API Credentials
   - Use "OAuth 2" with "Client Credentials" grant type
   - Note the Client ID and Client Secret

2. **Set Up Webhook in Mautic**:
   - Go to Settings > Webhooks
   - Create new webhook pointing to `/.netlify/functions/mautic-webhook?secret=YOUR_SECRET`
   - Enable events: Contact unsubscribe, Email bounce, Email complaint

3. **Test Integration**:
   - Use cURL examples above to test sync function
   - Create test lead in HKI and verify it appears in Mautic
   - Trigger unsubscribe in Mautic and verify webhook updates HKI

4. **Monitor Logs**:
   - Check Netlify function logs for errors or warnings
   - Look for `[Mautic]` and `[MauticWebhook]` prefixes
   - Correlation IDs help trace requests across systems

## Troubleshooting

### "Mautic OAuth credentials not configured"
- Ensure `MAUTIC_BASE_URL`, `MAUTIC_CLIENT_ID`, and `MAUTIC_CLIENT_SECRET` are set
- Verify values don't contain "placeholder"

### "Failed to get access token"
- Check Mautic API credentials are valid
- Verify Mautic instance is accessible from Netlify
- Check Mautic OAuth app has required permissions

### "Database update failed"
- Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE` are set
- Verify migration `02-add-marketing-columns.sql` has been applied
- Check service role key has write permissions

### Webhook not receiving events
- Verify webhook secret matches `MAUTIC_WEBHOOK_SECRET`
- Check Mautic webhook configuration for correct URL
- Ensure webhook is enabled in Mautic

## Support

For issues or questions, check:
- Netlify function logs for detailed error messages
- Mautic logs under System Info > Logs
- Test endpoints with cURL to isolate problems
