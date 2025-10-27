# Environment Variables & Secret Management Guide

## Overview

This document outlines all environment variables required for the Hidden Key Investments platform, their purpose, and how to manage them securely across different environments.

## Security Principles

1. **Never commit secrets to Git** - Use `.env` files locally and they are gitignored
2. **Use Netlify Environment Variables** for production/staging secrets
3. **Use GitHub Secrets** for CI/CD pipeline
4. **VITE_ prefix variables are PUBLIC** - They get embedded in the client bundle
5. **Server-side secrets** should NOT have the VITE_ prefix

## Required Environment Variables

### Client-Side Variables (Public - VITE_ prefix)

These are embedded in the built JavaScript bundle and are visible to users:

#### Mailchimp Integration
```bash
VITE_MAILCHIMP_API_KEY=your_key_here        # Mailchimp API key
VITE_MAILCHIMP_SERVER_PREFIX=us8            # Your Mailchimp data center (e.g., us8, us14)
VITE_MAILCHIMP_AUDIENCE_ACCREDITED=id       # Audience ID for accredited investors
VITE_MAILCHIMP_AUDIENCE_FIRST_TIME=id       # Audience ID for first-time investors
VITE_MAILCHIMP_AUDIENCE_PASSIVE=id          # Audience ID for passive investors
VITE_MAILCHIMP_AUDIENCE_TEXAS=id            # Audience ID for Texas-based investors
VITE_MAILCHIMP_AUDIENCE_GENERAL=id          # General audience ID
```

#### Airtable Integration
```bash
VITE_AIRTABLE_API_KEY=your_key_here         # Airtable API key
VITE_AIRTABLE_BASE_INVESTOR_LEADS=base_id   # Base ID for investor leads
VITE_AIRTABLE_BASE_INVESTOR_INTERACTIONS=id # Base ID for interactions
VITE_AIRTABLE_BASE_PROPERTY_TRACKER=id      # Base ID for property tracking
```

#### Formspree (Form Submissions)
```bash
VITE_FORMSPREE_FORM_ID=your_form_id         # Formspree form ID
# OR
VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/your_form_id  # Full endpoint URL
```

### Server-Side Variables (Private - No VITE_ prefix)

These are only accessible in Netlify Functions and never exposed to the client:

#### Supabase Database
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_key  # For admin operations
```

#### Future Integrations
```bash
# ML/Analytics
ML_API_KEY=your_ml_service_key

# Document Signing
DOCUSIGN_API_KEY=your_docusign_key
HELLOSIGN_API_KEY=your_hellosign_key

# SMS Notifications
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

## Setup Instructions

### Local Development

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your development API keys in `.env`

3. Start the dev server:
   ```bash
   npm run dev
   ```

**Demo Mode**: If variables are not set or contain placeholder values, the app runs in safe demo mode with simulated integrations.

### Netlify Production/Staging

1. Navigate to your Netlify site dashboard
2. Go to **Site settings** > **Environment variables**
3. Add all required variables for your environment
4. Deploy or trigger a rebuild

**Best Practice**: Use different API keys/accounts for staging vs production.

### GitHub Actions CI/CD

Required secrets for the CI pipeline:

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Add the following secrets:
   - `NETLIFY_AUTH_TOKEN` - For automated deployments
   - `SUPABASE_URL` - For running integration tests
   - `SUPABASE_ANON_KEY` - For running integration tests

## Environment-Specific Configuration

### Development
- Uses `.env` file
- Demo mode enabled by default
- No real API calls unless keys are provided

### Staging
- Uses Netlify environment variables
- Should use test/sandbox API keys
- Isolated Supabase database

### Production
- Uses Netlify environment variables
- Production API keys only
- Production Supabase database
- All monitoring and alerting enabled

## Verification

To verify your environment setup:

1. **Check build**: `npm run build` - Should complete without errors
2. **Run tests**: `npm test` - Tests should pass
3. **Check for exposed secrets**: Never see actual API keys in browser DevTools

## Troubleshooting

### "API key not found" errors
- Check that environment variables are set correctly
- For VITE_ variables, rebuild after changes
- For server variables, restart Netlify dev server

### Demo mode when it shouldn't be
- Ensure variables don't contain placeholder text like `your_key_here`
- Check for typos in variable names
- Verify variables are set in the correct environment (Netlify dashboard)

### Changes not reflected
- VITE_ variables require a rebuild: `npm run build`
- Server variables require function restart
- Clear browser cache if needed

## Security Checklist

- [ ] All production secrets stored in Netlify environment variables
- [ ] No secrets committed to Git (check with `git log -p | grep -i "api.*key"`)
- [ ] Different API keys used for staging vs production
- [ ] VITE_ prefix only used for non-sensitive configuration
- [ ] GitHub Secrets configured for CI/CD
- [ ] Team members use their own development API keys
- [ ] Regular rotation of API keys (quarterly recommended)
- [ ] Monitoring enabled for unauthorized API usage

## Additional Resources

- [Netlify Environment Variables Docs](https://docs.netlify.com/environment-variables/overview/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase Environment Setup](https://supabase.com/docs/guides/cli/local-development)
