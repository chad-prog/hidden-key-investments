# Mautic Integration

Production-ready integration with Mautic CRM for marketing automation and lead management.

## Overview

This integration provides bidirectional sync between Hidden Key Investments and Mautic CRM:

- **Outbound**: Sync leads from HKI to Mautic contacts
- **Inbound**: Receive webhook events from Mautic for email status updates
- **Enrollment**: Automatically enroll high-value leads in campaigns

## Architecture

### Components

1. **mautic-sync** (`netlify/functions/mautic-sync.ts`)
   - Netlify serverless function for syncing leads to Mautic
   - OAuth2 client_credentials flow with token caching
   - Retry logic with exponential backoff and jitter
   - Actions: `upsert_contact`, `add_to_campaign`, `ping`

2. **mautic-webhook** (`netlify/functions/mautic-webhook.ts`)
   - Webhook receiver for Mautic events
   - Handles unsubscribe, bounce, and complaint events
   - Updates Supabase leads table and activity log

3. **Mappers** (`src/lib/mappers/hkiToMautic.ts`)
   - Pure TypeScript functions for data transformation
   - Maps HKI lead schema to Mautic contact schema
   - Preserves UTM attribution data

4. **Deciders** (`src/lib/mautic/deciders.ts`)
   - Business logic for campaign enrollment
   - Configurable via environment variables

## Quick Start

### 1. Environment Variables

Add these to your `.env` file or Netlify environment:

```bash
# Mautic API Configuration
MAUTIC_BASE_URL=https://your-mautic-instance.com
MAUTIC_CLIENT_ID=your_oauth_client_id
MAUTIC_CLIENT_SECRET=your_oauth_client_secret

# Webhook Security
MAUTIC_WEBHOOK_SECRET=random_secure_string

# Campaign Enrollment (optional)
MAUTIC_ENROLLMENT_ENABLED=true
MAUTIC_HIGH_VALUE_THRESHOLD=70
MAUTIC_CAMPAIGN_HIGH_VALUE=123
MAUTIC_ELIGIBLE_STAGES=qualified,converted

# Supabase (for webhook updates)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Mautic OAuth2 Setup

1. In Mautic, go to **Settings** → **API Credentials**
2. Create new OAuth2 credentials
3. Set callback URL to: `https://your-site.netlify.app/.netlify/functions/mautic-sync`
4. Grant type: **Client Credentials**
5. Copy Client ID and Client Secret to your environment variables

### 3. Mautic Webhook Setup

1. In Mautic, go to **Settings** → **Webhooks**
2. Create new webhook
3. Set POST URL to: `https://your-site.netlify.app/.netlify/functions/mautic-webhook?secret=YOUR_SECRET`
4. Enable these events:
   - `mautic.lead_channel_subscription_changed`
   - `mautic.email_on_bounce`
5. Save webhook

### 4. Database Migration

Run the SQL migration to add marketing columns:

```bash
# Using psql
psql $DATABASE_URL < supabase-sql/02-add-marketing-columns.sql

# Or via Supabase dashboard SQL editor
# Copy and paste contents of 02-add-marketing-columns.sql
```

## API Endpoints

### POST /.netlify/functions/mautic-sync

Sync a lead to Mautic.

**Headers:**
```
Content-Type: application/json
X-Correlation-ID: optional-trace-id
```

**Request Body (upsert_contact):**
```json
{
  "action": "upsert_contact",
  "payload": {
    "id": "uuid",
    "crm_status": "qualified",
    "consent": {
      "marketing_opt_in": true
    },
    "ml": {
      "score": 85
    },
    "contact": {
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone": "+1234567890",
      "company": "ACME Corp"
    },
    "utm": {
      "source": "google",
      "medium": "cpc",
      "campaign": "summer-2024"
    }
  }
}
```

**Request Body (add_to_campaign):**
```json
{
  "action": "add_to_campaign",
  "mauticContactId": "123",
  "campaignId": "456"
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "success": true,
    "contactId": "123",
    "action": "updated"
  },
  "correlationId": "uuid",
  "durationMs": 1234
}
```

### POST /.netlify/functions/mautic-webhook?secret=YOUR_SECRET

Receive Mautic webhook events.

**Headers:**
```
Content-Type: application/json
```

**Request Body (from Mautic):**
```json
{
  "mautic.lead_channel_subscription_changed": [{
    "lead": {
      "id": 123,
      "email": "john@example.com"
    },
    "channel": "email",
    "old_status": "subscribed",
    "new_status": "unsubscribed"
  }]
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "eventsProcessed": 1,
    "eventsFailed": 0,
    "results": [
      {
        "email": "john@example.com",
        "type": "unsubscribe",
        "processed": true
      }
    ]
  },
  "correlationId": "uuid"
}
```

## Testing

### Unit Tests

Run all tests:
```bash
npm test
```

Run function tests only:
```bash
npm run test:functions
```

Run specific test suites:
```bash
npx vitest run src/lib/mappers/__tests__/hkiToMautic.spec.ts
npx vitest run src/lib/mautic/__tests__/deciders.spec.ts
npx vitest run netlify/functions/__tests__/mautic-sync.test.ts
```

### Manual Testing

Test ping endpoint:
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/mautic-sync \
  -H "Content-Type: application/json" \
  -d '{"action":"ping"}'
```

Test upsert_contact (demo mode):
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/mautic-sync \
  -H "Content-Type: application/json" \
  -d '{
    "action": "upsert_contact",
    "payload": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "contact": {
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User"
      }
    }
  }'
```

Test webhook (with secret):
```bash
curl -X POST "https://your-site.netlify.app/.netlify/functions/mautic-webhook?secret=YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "mautic.lead_channel_subscription_changed": [{
      "lead": {
        "id": 123,
        "email": "test@example.com"
      },
      "channel": "email",
      "new_status": "unsubscribed"
    }]
  }'
```

## Demo Mode

When Mautic or Supabase environment variables are missing, functions operate in demo mode:

- **mautic-sync**: Logs actions without making API calls
- **mautic-webhook**: Logs events without updating database

This allows development and testing without external dependencies.

## Design Decisions

### Token Caching

OAuth2 access tokens are cached in `globalThis` to persist across warm Lambda invocations. Tokens are automatically refreshed when they expire (with 60s safety margin).

### Retry Logic

All Mautic API calls use `safeFetch` with:
- 3 retry attempts
- Exponential backoff (1s, 2s, 4s)
- ±20% jitter to prevent thundering herd
- Retries on 5xx and 429 status codes

### UTM Preservation

When updating existing Mautic contacts, the mapper preserves existing UTM values if the incoming lead doesn't have them. This prevents overwriting attribution data.

### Email Status Tracking

The webhook updates `email_status` in the leads table for:
- `unsubscribed`: User opted out
- `bounced`: Hard bounce
- `complained`: Spam complaint

This allows HKI to respect email preferences and avoid deliverability issues.

### Campaign Enrollment

High-value leads are automatically enrolled in campaigns based on:
- Lead score threshold (default: 70)
- CRM status whitelist (default: qualified, converted)
- Configurable via environment variables

## Troubleshooting

### Token Issues

If you see "Failed to get access token" errors:
1. Verify Mautic OAuth2 credentials in environment
2. Check that grant type is "Client Credentials"
3. Ensure Mautic instance is accessible from Netlify
4. Check Mautic logs for authorization errors

### Webhook Not Receiving Events

1. Verify webhook URL includes correct secret parameter
2. Check Mautic webhook logs for delivery failures
3. Ensure webhook is enabled for correct events
4. Test webhook endpoint directly with curl

### Database Update Failures

1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set (not anon key)
2. Check that migration has been run
3. Verify email exists in leads table (case insensitive)
4. Check Supabase logs for permission errors

## Next Steps

1. **Enhanced Mapping**: Add more custom fields to Mautic contact mapping
2. **Two-Way Sync**: Pull Mautic contact updates back to HKI
3. **Segment Sync**: Sync Mautic segments to HKI tags
4. **Campaign Reporting**: Pull campaign metrics into HKI dashboard
5. **Email Templates**: Sync email templates from Mautic
6. **A/B Testing**: Integrate Mautic A/B test results

## Related Documentation

- [Lead Management Guide](./MVP-LEAD-MANAGEMENT-GUIDE.md)
- [Webhook Integration](./WEBHOOK-INTEGRATION.md)
- [Environment Setup](./ENVIRONMENT-SETUP.md)
- [API Reference](./API-REFERENCE.md)
