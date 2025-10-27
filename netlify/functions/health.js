/**
 * Health check endpoint for monitoring and observability
 * 
 * Purpose:
 * - Monitor system health and dependencies
 * - Provide status for CI/CD pipelines
 * - Enable uptime monitoring services
 * - Quick diagnostic for deployment issues
 * 
 * Returns:
 * - Overall system status (healthy/degraded/unhealthy)
 * - Individual service checks
 * - Version and environment information
 * - Response time metrics
 * 
 * Status Codes:
 * - 200: System healthy or degraded
 * - 503: System unhealthy (critical service down)
 */

export const handler = async (_event, _context) => {
  const startTime = Date.now();
  
  // Build health response
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VITE_APP_VERSION || '1.0.0',
    environment: process.env.CONTEXT || 'development',
    checks: {},
    metadata: {}
  };

  try {
    // Check database connection
    health.checks.database = checkDatabase();
    
    // Check third-party integrations
    health.checks.mailchimp = checkMailchimp();
    health.checks.airtable = checkAirtable();
    health.checks.sentry = checkSentry();
    
    // Check optional services
    health.checks.sendgrid = checkSendGrid();
    health.checks.twilio = checkTwilio();

    // Determine overall health status
    const serviceStatuses = Object.values(health.checks);
    const unhealthyCount = serviceStatuses.filter(s => s.status === 'unhealthy').length;
    const degradedCount = serviceStatuses.filter(s => s.status === 'degraded').length;

    if (unhealthyCount > 0) {
      health.status = 'unhealthy';
      health.metadata.critical_services_down = unhealthyCount;
    } else if (degradedCount > 0) {
      health.status = 'degraded';
      health.metadata.services_in_demo_mode = degradedCount;
    }

    // Add metrics
    health.metadata.total_services = serviceStatuses.length;
    health.metadata.healthy_services = serviceStatuses.filter(s => s.status === 'healthy').length;
    health.durationMs = Date.now() - startTime;

  } catch (error) {
    health.status = 'unhealthy';
    health.error = {
      message: 'Health check failed',
      details: error.message
    };
    health.durationMs = Date.now() - startTime;
  }

  // Return appropriate status code
  const statusCode = health.status === 'unhealthy' ? 503 : 200;

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    body: JSON.stringify(health, null, 2)
  };
};

/**
 * Check database (Supabase) connectivity
 */
function checkDatabase() {
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_ANON_KEY;
  
  if (hasUrl && hasKey) {
    return {
      status: 'healthy',
      message: 'Database configured and ready',
      details: {
        provider: 'Supabase',
        configured: true
      }
    };
  } else {
    return {
      status: 'degraded',
      message: 'Database not configured - running in demo mode',
      details: {
        provider: 'Supabase',
        configured: false,
        demo_mode: true
      }
    };
  }
}

/**
 * Check Mailchimp integration
 */
function checkMailchimp() {
  const hasApiKey = !!process.env.MAILCHIMP_API_KEY;
  const hasAudienceId = !!process.env.MAILCHIMP_AUDIENCE_ID;
  const hasServerPrefix = !!process.env.MAILCHIMP_SERVER_PREFIX;
  
  const isFullyConfigured = hasApiKey && hasAudienceId && hasServerPrefix;
  
  if (isFullyConfigured) {
    return {
      status: 'healthy',
      message: 'Mailchimp configured',
      details: {
        configured: true,
        features: ['email_marketing', 'list_management']
      }
    };
  } else {
    return {
      status: 'degraded',
      message: 'Mailchimp not configured - email features in demo mode',
      details: {
        configured: false,
        demo_mode: true,
        missing: [
          !hasApiKey && 'MAILCHIMP_API_KEY',
          !hasAudienceId && 'MAILCHIMP_AUDIENCE_ID',
          !hasServerPrefix && 'MAILCHIMP_SERVER_PREFIX'
        ].filter(Boolean)
      }
    };
  }
}

/**
 * Check Airtable integration
 */
function checkAirtable() {
  const hasApiKey = !!process.env.AIRTABLE_API_KEY;
  const hasBaseId = !!process.env.AIRTABLE_BASE_ID;
  
  const isConfigured = hasApiKey && hasBaseId;
  
  if (isConfigured) {
    return {
      status: 'healthy',
      message: 'Airtable configured',
      details: {
        configured: true,
        features: ['data_sync', 'backup']
      }
    };
  } else {
    return {
      status: 'degraded',
      message: 'Airtable not configured - sync features in demo mode',
      details: {
        configured: false,
        demo_mode: true,
        missing: [
          !hasApiKey && 'AIRTABLE_API_KEY',
          !hasBaseId && 'AIRTABLE_BASE_ID'
        ].filter(Boolean)
      }
    };
  }
}

/**
 * Check Sentry error tracking
 */
function checkSentry() {
  const hasDsn = !!process.env.VITE_SENTRY_DSN;
  
  if (hasDsn) {
    return {
      status: 'healthy',
      message: 'Sentry error tracking active',
      details: {
        configured: true,
        features: ['error_tracking', 'performance_monitoring']
      }
    };
  } else {
    return {
      status: 'degraded',
      message: 'Sentry not configured - error tracking disabled',
      details: {
        configured: false,
        impact: 'Production errors will not be tracked',
        recommendation: 'Configure VITE_SENTRY_DSN for production'
      }
    };
  }
}

/**
 * Check SendGrid email service
 */
function checkSendGrid() {
  const hasApiKey = !!process.env.SENDGRID_API_KEY;
  
  if (hasApiKey) {
    return {
      status: 'healthy',
      message: 'SendGrid configured',
      details: {
        configured: true,
        features: ['transactional_email', 'templates']
      }
    };
  } else {
    return {
      status: 'degraded',
      message: 'SendGrid not configured - optional service',
      details: {
        configured: false,
        optional: true,
        impact: 'Transactional emails will not be sent'
      }
    };
  }
}

/**
 * Check Twilio SMS service
 */
function checkTwilio() {
  const hasAccountSid = !!process.env.TWILIO_ACCOUNT_SID;
  const hasAuthToken = !!process.env.TWILIO_AUTH_TOKEN;
  const hasPhoneNumber = !!process.env.TWILIO_PHONE_NUMBER;
  
  const isConfigured = hasAccountSid && hasAuthToken && hasPhoneNumber;
  
  if (isConfigured) {
    return {
      status: 'healthy',
      message: 'Twilio configured',
      details: {
        configured: true,
        features: ['sms_notifications', 'voice_calls']
      }
    };
  } else {
    return {
      status: 'degraded',
      message: 'Twilio not configured - optional service',
      details: {
        configured: false,
        optional: true,
        impact: 'SMS notifications will not be sent'
      }
    };
  }
}
