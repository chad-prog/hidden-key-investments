/**
 * Main entry point for the React application
 * Renders the App component into the DOM
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { validateEnv } from './lib/envValidation';

// Validate environment configuration on startup
const envValidation = validateEnv();
if (!envValidation.success) {
  console.error('❌ Environment validation failed:', envValidation.errors);
  console.warn('⚠️ Running in demo mode with limited functionality');
} else {
  console.log('✅ Environment validation passed');
}

// Display any warnings
if (envValidation.warnings.length > 0) {
  console.warn('Environment warnings:', envValidation.warnings);
}

// Log Sentry status
if (import.meta.env.VITE_SENTRY_DSN) {
  console.log('🔍 Sentry DSN configured');
  console.log('💡 To enable Sentry error tracking: npm install @sentry/react');
  console.log('💡 Then uncomment Sentry initialization in src/main.tsx');
} else {
  console.log('ℹ️ Sentry not configured (VITE_SENTRY_DSN not set)');
}

// To enable Sentry, uncomment the following code after installing @sentry/react:
/*
if (import.meta.env.VITE_SENTRY_DSN) {
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE || 'development',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      release: import.meta.env.VITE_APP_VERSION || 'unknown',
    });
    console.log('✅ Sentry initialized');
  }).catch((err) => {
    console.warn('⚠️ Failed to initialize Sentry:', err.message);
  });
}
*/

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);