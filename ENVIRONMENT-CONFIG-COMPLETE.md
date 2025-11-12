# Environment Variables Configuration Guide

**Last Updated:** November 3, 2025  
**Status:** ✅ All Services Configured

---

## Overview

This guide documents all environment variables required for the Hidden Key Investments platform, including Sentry, Supabase, SendGrid, and Twilio integrations that are already configured in your production and staging environments.

---

## 🔐 Service Status

| Service | Status | Environments | Notes |
|---------|--------|--------------|-------|
| **Sentry** | ✅ Configured | Production + Staging | Error tracking & performance monitoring |
| **Supabase** | ✅ Configured | Production + Staging | PostgreSQL database |
| **SendGrid** | ✅ Configured | Production | Email service |
| **Twilio** | ✅ Configured | Production | SMS service |
| **Netlify** | ✅ Active | Production + Staging | Hosting & functions |

---

## 🎯 Sentry Configuration

### Production Environment
**DSN:** `https://79e4085bbf4152dd973edbe18aa52f65@o4510262352871424.ingest.us.sentry.io/4510262378692608`

**Netlify Environment Variable:**
```bash
VITE_SENTRY_DSN=https://79e4085bbf4152dd973edbe18aa52f65@o4510262352871424.ingest.us.sentry.io/4510262378692608
```

### Staging Environment
**DSN:** `https://6fb86f672df3d5f15eb76c2b5dec7849@o4510262352871424.ingest.us.sentry.io/4510277236424704`

**Netlify Environment Variable:**
```bash
VITE_SENTRY_DSN=https://6fb86f672df3d5f15eb76c2b5dec7849@o4510262352871424.ingest.us.sentry.io/4510277236424704
```

### Features Enabled
- ✅ **Error Tracking** - Automatic error capture and reporting
- ✅ **Performance Monitoring** - Transaction tracking (10% sampling in production)
- ✅ **Session Replay** - Visual replay of user sessions (10% sampling in production)
- ✅ **Environment Tagging** - Separate production and staging data
- ✅ **Source Maps** - Readable error stack traces

### Configuration in Code
Location: `src/main.tsx`
```typescript
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: environment === 'production' ? 0.1 : 0.5,
  replaysOnErrorSampleRate: 1.0,
});
```

---

## 🗄️ Supabase Configuration

### Database Connection
Supabase is configured for both frontend and backend (serverless functions).

### Frontend Variables (VITE_ prefix)
These are embedded in the client bundle and are safe to expose:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

### Backend Variables (No prefix)
These are used in Netlify Functions and are server-side only:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

### Configuration in Code
Location: `src/lib/supabaseClient.ts`
```typescript
const supabaseUrl = typeof window !== 'undefined'
  ? (import.meta.env.VITE_SUPABASE_URL || '')
  : (process.env.SUPABASE_URL || '');
  
const supabaseAnonKey = typeof window !== 'undefined'
  ? (import.meta.env.VITE_SUPABASE_ANON_KEY || '')
  : (process.env.SUPABASE_ANON_KEY || '');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Database Schema
Location: `supabase-sql/01-setup.sql`
- ✅ 7 tables created
- ✅ Indexes configured
- ✅ Row Level Security ready

---

## 📧 SendGrid Configuration (Email)

### Production Variables
**Status:** ✅ Configured in Netlify

```bash
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Hidden Key Investments
```

### Function Endpoint
`/.netlify/functions/sendgrid`

### Features
- ✅ Transactional email sending
- ✅ Template support with variable substitution
- ✅ HTML email content
- ✅ Demo mode for local development

### Configuration in Code
Location: `netlify/functions/sendgrid.ts`
```typescript
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
await sgMail.send({
  to,
  from: {
    email: process.env.SENDGRID_FROM_EMAIL,
    name: process.env.SENDGRID_FROM_NAME,
  },
  subject,
  html: content,
});
```

---

## 📱 Twilio Configuration (SMS)

### Production Variables
**Status:** ✅ Configured in Netlify

```bash
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### Function Endpoint
`/.netlify/functions/twilio-sms`

### Features
- ✅ SMS message sending
- ✅ Phone number validation (E.164 format)
- ✅ Template support with variable substitution
- ✅ Multi-segment message support
- ✅ Demo mode for local development

### Configuration in Code
Location: `netlify/functions/twilio-sms.ts`
```typescript
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

await client.messages.create({
  body: message,
  to: to,
  from: process.env.TWILIO_PHONE_NUMBER,
});
```

---

## 🌐 Netlify Configuration

### Build Settings
```toml
[build]
command = "npm install --include=dev && npm run build"
publish = "dist"

[build.environment]
NODE_VERSION = "22"
SECRETS_SCAN_OMIT_PATHS = "netlify/functions/__tests__/**:docs/**:*.md:scripts/**"
```

### Context-Specific Settings

#### Production Context (main branch)
```toml
[context.production]
environment = { NODE_ENV = "production" }
```

**Required Environment Variables:**
- `VITE_SENTRY_DSN` - Production Sentry DSN
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_URL` - Supabase URL (for functions)
- `SUPABASE_ANON_KEY` - Supabase anon key (for functions)
- `SENDGRID_API_KEY` - SendGrid API key
- `SENDGRID_FROM_EMAIL` - From email address
- `SENDGRID_FROM_NAME` - From name
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number

#### Staging Context (staging branch)
```toml
[context.staging]
environment = { NODE_ENV = "staging" }
```

**Required Environment Variables:**
- `VITE_SENTRY_DSN` - Staging Sentry DSN (different from production)
- All other variables same as production

---

## 🔒 Security Best Practices

### Variable Naming Convention

#### VITE_ Prefix (Client-Side - PUBLIC)
- ⚠️ **Embedded in client bundle**
- ⚠️ **Publicly accessible in browser**
- ✅ Use for public API keys (Supabase anon key, Sentry DSN)
- ❌ Never use for secrets (API keys, auth tokens)

Examples:
```bash
VITE_SENTRY_DSN=...           # OK - Public DSN
VITE_SUPABASE_URL=...         # OK - Public URL
VITE_SUPABASE_ANON_KEY=...    # OK - Public anon key
```

#### No Prefix (Server-Side - PRIVATE)
- ✅ **Only accessible in serverless functions**
- ✅ **Never exposed to client**
- ✅ Use for sensitive API keys

Examples:
```bash
SENDGRID_API_KEY=...          # Good - Server only
TWILIO_AUTH_TOKEN=...         # Good - Server only
SUPABASE_URL=...              # Good - Server only
```

### GitHub Secrets
All sensitive variables should also be stored in GitHub Secrets for CI/CD:

1. Go to Repository Settings > Secrets and variables > Actions
2. Add the following secrets:
   - `VITE_SENTRY_DSN`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SENDGRID_API_KEY`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`

### Netlify Environment Variables
All variables configured in Netlify Dashboard:

1. Go to Site Settings > Environment variables
2. Set context-specific variables (Production vs Staging)
3. Mark sensitive variables as "Secret"

---

## 🧪 Local Development Setup

### Step 1: Copy .env.example
```bash
cp .env.example .env
```

### Step 2: Configure Local Variables
Edit `.env` and add your local/development credentials:

```bash
# Sentry (optional for local dev - use staging DSN)
VITE_SENTRY_DSN=https://6fb86f672df3d5f15eb76c2b5dec7849@o4510262352871424.ingest.us.sentry.io/4510277236424704

# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Leave empty to use demo mode
VITE_MAILCHIMP_API_KEY=
VITE_AIRTABLE_API_KEY=
```

### Step 3: Run Development Server
```bash
npm install
npm run dev
```

### Demo Mode
If optional services are not configured, the app runs in demo mode:
- ✅ All UI features work
- ✅ Mock data provided
- ✅ No real API calls
- ✅ Perfect for testing

---

## 📊 Monitoring & Observability

### Sentry Dashboard
**Production:** https://sentry.io/organizations/hidden-key-investments/issues/?project=4510262378692608

**Staging:** https://sentry.io/organizations/hidden-key-investments/issues/?project=4510277236424704

### What Sentry Tracks
1. **JavaScript Errors** - Uncaught exceptions, promise rejections
2. **Network Errors** - Failed API calls, timeouts
3. **Performance Issues** - Slow page loads, API latency
4. **User Sessions** - Session replays for debugging
5. **Custom Events** - Environment validation failures

### Supabase Dashboard
Access your Supabase project dashboard to:
- View database tables and data
- Monitor API usage
- Check query performance
- Manage authentication (when enabled)

### Netlify Dashboard
Monitor deployments and functions:
- Build logs and status
- Function invocations and errors
- Environment variable management
- Deploy previews for PRs

---

## 🚨 Troubleshooting

### Sentry Not Tracking Errors

**Check 1:** Verify VITE_SENTRY_DSN is set
```bash
# In browser console
console.log(import.meta.env.VITE_SENTRY_DSN)
```

**Check 2:** Check browser console for Sentry initialization
```
🔍 Sentry error tracking initialized
📊 Environment: production
🎯 DSN configured: https://79e4085bbf4152dd97...
```

**Check 3:** Test error capture
```javascript
// In browser console
throw new Error('Test Sentry error');
```

### Supabase Connection Failed

**Check 1:** Verify environment variables
```javascript
// In browser console
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Check 2:** Test connection
```javascript
import { supabase } from '@/lib/supabaseClient';
const { data, error } = await supabase.from('leads').select('count');
console.log(data, error);
```

### SendGrid/Twilio Not Working

**Check 1:** Verify Netlify function logs
1. Go to Netlify Dashboard
2. Functions tab
3. Check invocation logs

**Check 2:** Test function locally
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Run functions locally
netlify dev

# Test email endpoint
curl -X POST http://localhost:8888/.netlify/functions/sendgrid \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","content":"Hello"}'
```

### Demo Mode Not Working

**Check:** Environment validation warnings
```javascript
// Check console for:
// "⚠️ Running in demo mode with limited functionality"
```

If demo mode is not activating when it should, check `src/lib/envValidation.ts`.

---

## 📝 Quick Reference

### All Environment Variables

#### Frontend (VITE_ prefix - public)
```bash
VITE_SENTRY_DSN=<sentry_dsn>
VITE_SUPABASE_URL=<supabase_url>
VITE_SUPABASE_ANON_KEY=<supabase_anon_key>
VITE_APP_VERSION=1.0.0
VITE_FEATURE_ERRORTRACKING=true
VITE_FEATURE_PERFORMANCEMONITORING=true

# Optional
VITE_MAILCHIMP_API_KEY=<mailchimp_key>
VITE_AIRTABLE_API_KEY=<airtable_key>
VITE_FORMSPREE_FORM_ID=<formspree_id>
```

#### Backend (No prefix - private)
```bash
SUPABASE_URL=<supabase_url>
SUPABASE_ANON_KEY=<supabase_anon_key>
SENDGRID_API_KEY=<sendgrid_key>
SENDGRID_FROM_EMAIL=<from_email>
SENDGRID_FROM_NAME=<from_name>
TWILIO_ACCOUNT_SID=<twilio_sid>
TWILIO_AUTH_TOKEN=<twilio_token>
TWILIO_PHONE_NUMBER=<twilio_number>
```

### Verification Commands
```bash
# Check build with env vars
npm run build

# Run tests
npm test

# Check for env validation
npm run dev
# Then check browser console

# Lint code
npm run lint
```

---

## 🎯 Current Status Summary

### ✅ Configured Services
1. **Sentry** - Both production and staging DSNs configured
2. **Supabase** - Database client configured for frontend and backend
3. **SendGrid** - Email service configured in Netlify
4. **Twilio** - SMS service configured in Netlify
5. **Netlify** - Build and deployment configured

### 🔧 Implementation Status
- ✅ Sentry initialized in `src/main.tsx`
- ✅ Supabase client in `src/lib/supabaseClient.ts`
- ✅ SendGrid function in `netlify/functions/sendgrid.ts`
- ✅ Twilio function in `netlify/functions/twilio-sms.ts`
- ✅ Environment validation in `src/lib/envValidation.ts`
- ✅ Demo mode fallback for all services

### 📦 Next Steps
1. ✅ All services are configured and ready to use
2. ✅ Build and tests passing with new configuration
3. ✅ Deploy to production to activate Sentry tracking
4. Monitor Sentry dashboard for any issues
5. Test email/SMS functionality in production

---

**Status:** ✅ All services configured and operational  
**Last Verified:** November 3, 2025  
**Ready for:** Production deployment
