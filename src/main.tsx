/**
 * Main entry point for the React application
 * Renders the App component into the DOM
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import './index.css';
import { validateEnv } from './lib/envValidation';

// Initialize Sentry error tracking if DSN is configured
if (import.meta.env.VITE_SENTRY_DSN) {
  const environment = import.meta.env.MODE || 'development';
  
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in staging/dev
    // Session Replay
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 0.5, // 10% in prod, 50% in staging
    replaysOnErrorSampleRate: 1.0, // Always capture on error
    // Additional configuration
    beforeSend(event) {
      // Don't send errors in local development
      if (environment === 'development') {
        console.log('🔍 Sentry event (dev mode, not sent):', event);
        return null;
      }
      return event;
    },
  });

  console.log('🔍 Sentry error tracking initialized');
  console.log('📊 Environment:', environment);
  console.log('🎯 DSN configured:', import.meta.env.VITE_SENTRY_DSN.substring(0, 30) + '...');
} else {
  console.warn('⚠️ Sentry DSN not configured - error tracking disabled');
}

// Validate environment configuration on startup
const envValidation = validateEnv();
if (!envValidation.success) {
  console.error('❌ Environment validation failed:', envValidation.errors);
  console.warn('⚠️ Running in demo mode with limited functionality');
  
  // Report validation errors to Sentry
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureMessage('Environment validation failed', {
      level: 'warning',
      extra: { errors: envValidation.errors },
    });
  }
} else {
  console.log('✅ Environment validation passed');
}

// Display any warnings
if (envValidation.warnings.length > 0) {
  console.warn('Environment warnings:', envValidation.warnings);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
