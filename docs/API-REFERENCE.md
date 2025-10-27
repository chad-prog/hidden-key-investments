# API Reference

## Overview

This document provides a complete reference for the Hidden Key Investments platform APIs. All APIs follow REST principles with JSON payloads and return standardized responses.

## Base URLs

- **Production**: `https://your-site.netlify.app/.netlify/functions`
- **Staging**: `https://staging--your-site.netlify.app/.netlify/functions`
- **Development**: `http://localhost:8888/.netlify/functions`

## Authentication

Currently, APIs use simple API key authentication. Include your API key in the request headers:

```http
X-API-Key: your_api_key_here
```

### Future: OAuth 2.0

OAuth 2.0 support is planned for v2.0 with the following scopes:
- `leads:read` - Read lead data
- `leads:write` - Create and update leads
- `opportunities:read` - Read opportunity data
- `opportunities:write` - Manage opportunities
- `investors:read` - Read investor profiles
- `investors:write` - Manage investor data
- `workflows:execute` - Trigger workflow executions

## Standard Response Format

All API responses follow this format:

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "metadata": {
    "correlationId": "uuid-v4",
    "timestamp": "2025-10-27T07:46:34.325Z",
    "environment": "production"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": ["Email is required", "Phone format invalid"],
    "timestamp": "2025-10-27T07:46:34.325Z",
    "correlationId": "uuid-v4"
  }
}
```

## API Endpoints

### Lead Management

#### Create Lead

Ingest a new lead into the system with automatic enrichment and workflow triggering.

**Endpoint**: `POST /lead-ingest-enhanced`

**Request Body**:

```json
{
  "source": "website",
  "status": "new",
  "contact": {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@example.com",
    "phone": "+15551234567",
    "preferredContact": "email"
  },
  "property": {
    "address": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip": "78701",
    "type": "single-family"
  },
  "notes": "Interested in investment opportunities"
}
```

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "lead_abc123",
    "status": "new",
    "source": "website",
    "createdAt": "2025-10-27T07:46:34.325Z"
  },
  "metadata": {
    "correlationId": "req_xyz789",
    "enrichmentStatus": "pending",
    "workflowsTriggered": ["welcome-email", "assignment-routing"]
  }
}
```

**Validation Rules**:
- `contact.email` or `contact.phone` is required
- `contact.email` must be valid email format
- `property.state` must be 2-letter state code
- `property.zip` must be valid US ZIP code format

---

#### Get Lead

Retrieve lead details by ID.

**Endpoint**: `GET /lead-ingest-enhanced?id={leadId}`

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "lead_abc123",
    "source": "website",
    "status": "qualified",
    "contact": { /* contact details */ },
    "property": { /* property details */ },
    "enrichment": {
      "ownershipVerified": true,
      "propertyValue": 450000,
      "lastUpdated": "2025-10-27T08:00:00Z"
    },
    "score": 85,
    "createdAt": "2025-10-27T07:46:34.325Z",
    "updatedAt": "2025-10-27T08:00:00Z"
  }
}
```

---

### Opportunity Management

#### Create Opportunity

Convert a lead to an opportunity (deal pipeline).

**Endpoint**: `POST /opportunity`

**Request Body**:

```json
{
  "leadId": "lead_abc123",
  "title": "Austin Multi-Family Investment",
  "stage": "initial-contact",
  "value": 500000,
  "probability": 30,
  "expectedCloseDate": "2025-12-31",
  "notes": "Strong interest, needs financing options"
}
```

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "opp_def456",
    "leadId": "lead_abc123",
    "stage": "initial-contact",
    "value": 500000,
    "probability": 30,
    "expectedCloseDate": "2025-12-31",
    "createdAt": "2025-10-27T07:46:34.325Z"
  }
}
```

---

#### Update Opportunity

Update opportunity stage and details.

**Endpoint**: `PUT /opportunity?id={oppId}`

**Request Body**:

```json
{
  "stage": "proposal",
  "probability": 60,
  "notes": "Proposal sent, awaiting feedback"
}
```

**Response**: `200 OK`

---

#### List Opportunities

Get all opportunities with filtering and pagination.

**Endpoint**: `GET /opportunity?stage={stage}&page={page}&limit={limit}`

**Query Parameters**:
- `stage` (optional): Filter by opportunity stage
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20): Items per page

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    { /* opportunity 1 */ },
    { /* opportunity 2 */ }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### Investor Management

#### Create Investor

Register a new investor profile.

**Endpoint**: `POST /investor`

**Request Body**:

```json
{
  "contact": {
    "firstName": "Jane",
    "lastName": "Investor",
    "email": "jane@example.com",
    "phone": "+15559876543"
  },
  "accreditation": {
    "status": "accredited",
    "verifiedDate": "2025-10-01",
    "method": "income"
  },
  "preferences": {
    "investmentMin": 50000,
    "investmentMax": 500000,
    "riskTolerance": "moderate",
    "preferredMarkets": ["Texas", "Florida"],
    "propertyTypes": ["multi-family", "commercial"]
  }
}
```

**Response**: `201 Created`

---

#### Get Investor

Retrieve investor profile.

**Endpoint**: `GET /investor?id={investorId}`

**Response**: `200 OK`

---

#### Update Investor

Update investor profile and preferences.

**Endpoint**: `PUT /investor?id={investorId}`

**Response**: `200 OK`

---

### Workflow Automation

#### Trigger Workflow

Manually trigger a workflow execution.

**Endpoint**: `POST /workflow-execute` (Coming Soon)

**Request Body**:

```json
{
  "workflowId": "workflow_123",
  "entityType": "lead",
  "entityId": "lead_abc123",
  "context": {
    "source": "manual",
    "reason": "Follow-up required"
  }
}
```

**Response**: `202 Accepted`

```json
{
  "success": true,
  "data": {
    "executionId": "exec_xyz789",
    "status": "running",
    "workflowId": "workflow_123"
  }
}
```

---

### ML Scoring API

#### Get Lead Score

Get ML-powered lead quality score.

**Endpoint**: `POST /ml-score-lead` (Coming Soon)

**Request Body**:

```json
{
  "leadId": "lead_abc123"
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "leadId": "lead_abc123",
    "score": 85,
    "confidence": 0.92,
    "factors": {
      "property_value": 0.35,
      "engagement_level": 0.28,
      "market_conditions": 0.22,
      "lead_source": 0.15
    },
    "recommendation": "high-priority",
    "predictedConversion": 0.68,
    "estimatedTimeToClose": 45
  }
}
```

---

### Analytics & Events

#### Track Event

Record an analytics event.

**Endpoint**: `POST /analytics-event` (Coming Soon)

**Request Body**:

```json
{
  "eventType": "page_view",
  "entityType": "lead",
  "entityId": "lead_abc123",
  "properties": {
    "page": "/opportunities",
    "referrer": "https://google.com"
  },
  "timestamp": "2025-10-27T07:46:34.325Z"
}
```

**Response**: `201 Created`

---

## Webhooks

### Webhook Events

Subscribe to real-time events via webhooks.

#### Available Events

- `lead.created` - New lead created
- `lead.updated` - Lead information updated
- `lead.qualified` - Lead marked as qualified
- `opportunity.created` - New opportunity created
- `opportunity.stage_changed` - Opportunity moved to new stage
- `opportunity.closed` - Opportunity closed (won/lost)
- `investor.created` - New investor registered
- `workflow.completed` - Workflow execution completed

#### Webhook Payload Format

```json
{
  "event": "lead.created",
  "timestamp": "2025-10-27T07:46:34.325Z",
  "data": {
    "id": "lead_abc123",
    /* entity data */
  },
  "metadata": {
    "correlationId": "uuid",
    "environment": "production"
  }
}
```

#### Webhook Security

All webhook payloads include an `X-Webhook-Signature` header for verification:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

---

## Rate Limiting

API rate limits vary by endpoint and authentication level:

| Tier | Requests/min | Requests/hour | Requests/day |
|------|--------------|---------------|--------------|
| Free | 10 | 100 | 1,000 |
| Basic | 60 | 1,000 | 10,000 |
| Pro | 300 | 10,000 | 100,000 |
| Enterprise | Custom | Custom | Custom |

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1635345600
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Invalid or missing API key |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

---

## SDKs & Libraries

### JavaScript/TypeScript

```bash
npm install @hidden-key/api-client
```

```typescript
import { HiddenKeyClient } from '@hidden-key/api-client';

const client = new HiddenKeyClient({
  apiKey: process.env.HIDDEN_KEY_API_KEY,
  environment: 'production'
});

// Create a lead
const lead = await client.leads.create({
  source: 'website',
  contact: { /* ... */ }
});
```

### Python

```bash
pip install hidden-key-api
```

```python
from hidden_key import HiddenKeyClient

client = HiddenKeyClient(
    api_key=os.environ['HIDDEN_KEY_API_KEY'],
    environment='production'
)

# Create a lead
lead = client.leads.create(
    source='website',
    contact={ /* ... */ }
)
```

---

## Support

- **Documentation**: https://docs.hiddenkey.io
- **API Status**: https://status.hiddenkey.io
- **Support Email**: api-support@hiddenkey.io
- **Discord Community**: https://discord.gg/hiddenkey

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Lead management endpoints
- Opportunity pipeline
- Investor profiles
- Basic workflow triggers

### v1.1.0 (Planned)
- ML scoring endpoints
- Advanced analytics
- Webhook subscriptions
- Document management

### v2.0.0 (Future)
- OAuth 2.0 authentication
- GraphQL API
- Real-time subscriptions
- AI orchestration API
