# Observability Integration Guide

## Overview

This guide helps you integrate observability tools into the Hidden Key Investments platform for production monitoring, error tracking, and performance analysis.

## Quick Start

### 1. Error Tracking with Sentry

**Installation:**
```bash
npm install @sentry/react @sentry/vite-plugin
```

**Configuration:**

Add to your `.env`:
```bash
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your_auth_token  # For source maps
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

**Setup in `src/main.tsx`:**
```typescript
import * as Sentry from "@sentry/react";
import { validateEnv } from "@/lib/envValidation";

// Validate environment
const envValidation = validateEnv();
if (!envValidation.success) {
  console.error('Environment validation failed:', envValidation.errors);
}

// Initialize Sentry if configured
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

**Wrap your app:**
```typescript
const App = Sentry.withProfiler(() => {
  // Your app component
});
```

### 2. Server-side Error Tracking (Netlify Functions)

**In each function:**
```javascript
const Sentry = require('@sentry/node');

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.CONTEXT || 'development',
    tracesSampleRate: 1.0,
  });
}

exports.handler = async (event, context) => {
  try {
    // Your function logic
  } catch (error) {
    Sentry.captureException(error, {
      contexts: {
        netlify: {
          function: context.functionName,
          requestId: context.awsRequestId,
        },
      },
      tags: {
        httpMethod: event.httpMethod,
        path: event.path,
      },
    });
    throw error;
  }
};
```

### 3. Structured Logging

**Use existing logger:**
```typescript
import { logger } from '@/lib/observability';

// Log with correlation ID
logger.info('Lead created', {
  correlationId: request.correlationId,
  leadId: lead.id,
  source: lead.source,
});

logger.error('Failed to enrich lead', {
  correlationId: request.correlationId,
  leadId: lead.id,
  error: error.message,
  stack: error.stack,
});
```

### 4. Performance Monitoring

**Web Vitals:**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics provider
  if (import.meta.env.VITE_ANALYTICS_ID) {
    fetch('/.netlify/functions/analytics', {
      method: 'POST',
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
      }),
    });
  }
  
  // Also send to Sentry
  if (window.Sentry) {
    window.Sentry.captureMessage(`Web Vital: ${metric.name}`, {
      level: metric.rating === 'poor' ? 'warning' : 'info',
      contexts: {
        metric: {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
        },
      },
    });
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 5. Custom Instrumentation

**Track user actions:**
```typescript
import { logger } from '@/lib/observability';

function trackUserAction(action: string, metadata: Record<string, any>) {
  logger.info('User action', {
    action,
    userId: getCurrentUser()?.id,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
  
  // Send to Sentry as breadcrumb
  if (window.Sentry) {
    window.Sentry.addBreadcrumb({
      category: 'user-action',
      message: action,
      data: metadata,
      level: 'info',
    });
  }
}

// Usage
trackUserAction('lead_created', { source: 'website', leadId: '123' });
trackUserAction('workflow_triggered', { workflowId: 'wf_123' });
```

## Logging Best Practices

### Correlation IDs

Always include correlation IDs for request tracing:

```typescript
import { v4 as uuidv4 } from 'uuid';

const correlationId = uuidv4();

// Include in all logs
logger.info('Processing request', { correlationId });

// Include in API calls
fetch('/api/endpoint', {
  headers: {
    'X-Correlation-ID': correlationId,
  },
});

// Include in responses
return {
  ok: true,
  data: result,
  correlationId,
};
```

### Log Levels

Use appropriate log levels:

- **ERROR**: System errors, exceptions, failures requiring attention
- **WARN**: Degraded functionality, using fallbacks, missing optional config
- **INFO**: Important business events (lead created, workflow executed)
- **DEBUG**: Detailed information for troubleshooting (dev only)

```typescript
logger.error('Database connection failed', { error: err.message });
logger.warn('Using demo mode - Supabase not configured');
logger.info('Lead enriched successfully', { leadId, score: 85 });
logger.debug('Fetching property data', { address, source: 'zillow' });
```

### Structured Data

Always log structured data:

```typescript
// ❌ Bad
logger.info(`Lead ${leadId} created from ${source}`);

// ✅ Good
logger.info('Lead created', {
  leadId,
  source,
  email: lead.email,
  propertyValue: lead.property.estimatedValue,
});
```

## Metrics & Alerts

### Key Metrics to Track

1. **API Performance:**
   - Request rate
   - Response time (p50, p95, p99)
   - Error rate
   - Success rate by endpoint

2. **Business Metrics:**
   - Leads created per hour
   - Workflow execution success rate
   - Enrichment success rate
   - Conversion funnel (lead → opportunity → deal)

3. **System Health:**
   - Database connection pool
   - Memory usage
   - CPU usage
   - Queue depth (if using background jobs)

### Setting Up Alerts

**Sentry Alerts:**
1. Go to Sentry → Alerts
2. Create alert rules for:
   - Error rate > 5% in 5 minutes
   - New issue occurs
   - Issue frequency > 100 events in 1 hour

**Netlify Monitoring:**
1. Enable Netlify Analytics
2. Set up deploy notifications
3. Monitor function execution times

### Custom Metrics Endpoint

Create `netlify/functions/metrics.js`:

```javascript
const metrics = {
  leadsCreated: 0,
  workflowsExecuted: 0,
  errors: 0,
};

exports.handler = async (event) => {
  if (event.httpMethod === 'POST') {
    const { metric, value } = JSON.parse(event.body);
    metrics[metric] = (metrics[metric] || 0) + (value || 1);
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify(metrics),
  };
};
```

## Production Checklist

- [ ] Sentry DSN configured in production
- [ ] Source maps uploaded to Sentry
- [ ] Error alerts configured
- [ ] Performance monitoring enabled
- [ ] Session replay enabled (if needed)
- [ ] Custom instrumentation for key flows
- [ ] Log aggregation configured
- [ ] Metrics dashboard created
- [ ] Alert recipients configured
- [ ] Incident response runbook created

## Troubleshooting

### Sentry Not Receiving Events

1. Check DSN is correct in environment variables
2. Verify environment is set correctly (development/production)
3. Check browser console for Sentry initialization errors
4. Verify network requests to Sentry aren't blocked

### High Error Rates

1. Check Sentry for error patterns
2. Review correlation IDs to trace issues
3. Check if errors are from demo mode
4. Verify API keys and configuration

### Performance Issues

1. Check Web Vitals in Sentry
2. Review function execution times in Netlify
3. Check database query performance
4. Look for N+1 queries or missing indexes

## Resources

- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Web Vitals](https://web.dev/vitals/)
- [OpenTelemetry](https://opentelemetry.io/)
- [Netlify Analytics](https://docs.netlify.com/monitor-sites/analytics/)

## Next Steps

1. Install Sentry and configure DSN
2. Add correlation IDs to all API endpoints
3. Instrument key user flows
4. Set up error alerts
5. Create monitoring dashboard
6. Document incident response procedures
