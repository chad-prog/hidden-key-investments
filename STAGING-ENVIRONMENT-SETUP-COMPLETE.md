# Staging Environment Setup - Complete Guide

**Last Updated:** November 2, 2025  
**Purpose:** Step-by-step guide to set up and configure staging environment using Netlify with isolated database

---

## 🎯 Overview

This guide helps you set up a complete staging environment that mirrors production but uses isolated resources for safe testing. The staging environment automatically deploys from the `staging` branch and includes branch deploy previews for all pull requests.

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
├─────────────────────────────────────────────────────────┤
│  main branch          →  Production (Netlify)           │
│  staging branch       →  Staging (Netlify)              │
│  feature/* branches   →  Deploy Previews (Netlify)      │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                 Netlify Build & Deploy                   │
├─────────────────────────────────────────────────────────┤
│  • Automatic builds on push                             │
│  • Environment-specific variables                        │
│  • Serverless functions deployment                       │
│  • CDN distribution                                      │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│              Database (Supabase Postgres)                │
├─────────────────────────────────────────────────────────┤
│  Production DB  ←→  Production Site                     │
│  Staging DB     ←→  Staging Site + Previews             │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Setup (15 minutes)

### Prerequisites
- ✅ GitHub repository with code
- ✅ Netlify account (free tier works)
- ✅ Supabase account (free tier works)
- ✅ Domain name (optional)

### Step 1: Create Staging Database (5 min)

1. **Login to Supabase** (https://supabase.com)
2. **Create new project:**
   - Click "New project"
   - Name: `hidden-key-staging` (or similar)
   - Database password: Generate strong password
   - Region: Same as production (for consistency)
   - Click "Create new project"
   
3. **Wait for provisioning** (~2 minutes)

4. **Get connection details:**
   - Go to Project Settings → API
   - Copy these values:
     - Project URL: `https://xxxxx.supabase.co`
     - Project API Key (anon public): `eyJhbGc...`
     - Service role key: `eyJhbGc...` (keep secret!)

5. **Set up database schema:**
   ```bash
   # Get connection string from Supabase Settings → Database
   psql "postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres" \
     -f supabase-sql/01-setup.sql
   ```
   
   Or use Supabase SQL Editor:
   - Go to SQL Editor in Supabase dashboard
   - Copy/paste content from `supabase-sql/01-setup.sql`
   - Run query

### Step 2: Configure Netlify Staging (5 min)

#### Option A: New Site (Recommended for separate staging)

1. **Create new Netlify site:**
   - Go to Netlify dashboard
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select repository: `hidden-key-investments`
   - **Branch to deploy:** `staging`
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

2. **Configure site name:**
   - Go to Site settings → General → Site details
   - Click "Change site name"
   - Enter: `hidden-key-staging` (or your preferred name)
   - URL becomes: `https://hidden-key-staging.netlify.app`

#### Option B: Same Site with Branch Deploys

1. **In existing Netlify site:**
   - Go to Site settings → Build & deploy → Continuous deployment
   - Under "Branch deploys", click "Edit settings"
   - Select "Let me add individual branches"
   - Add branch: `staging`
   - Save

2. **Staging URL:**
   - Will be: `https://staging--your-site.netlify.app`

### Step 3: Add Environment Variables (5 min)

1. **Navigate to Environment Variables:**
   - Site settings → Environment variables
   - Click "Add a variable"

2. **Add staging-specific variables:**

   For **Deploy Previews** and **Branch deploys** (staging):
   ```
   Variable                    Value                              Scopes
   ────────────────────────────────────────────────────────────────────────
   VITE_SUPABASE_URL          https://xxxxx.supabase.co          staging, deploy-preview
   VITE_SUPABASE_ANON_KEY     eyJhbGc... (staging key)           staging, deploy-preview
   SUPABASE_SERVICE_ROLE_KEY  eyJhbGc... (staging service key)   staging, deploy-preview
   NODE_ENV                   staging                             staging
   NODE_ENV                   preview                             deploy-preview
   NODE_VERSION               22                                  All scopes
   ```

   **Optional - same across environments:**
   ```
   MAILCHIMP_API_KEY          (if using)                         All scopes
   MAILCHIMP_AUDIENCE_ID      (if using)                         All scopes
   AIRTABLE_API_KEY           (if using)                         All scopes
   VITE_SENTRY_DSN            (staging Sentry project)           staging, deploy-preview
   ```

3. **Important:** Keep production secrets separate:
   - Use `Production` scope for production database
   - Use `Deploy previews` and `Branch deploys` for staging database
   - This ensures previews never touch production data

---

## 🔧 Advanced Configuration

### Branch Deploy Previews for PRs

**Automatic setup** - Already configured in `netlify.toml`:

```toml
[context.deploy-preview]
  environment = { NODE_ENV = "preview" }
```

**How it works:**
1. Create PR against `main` or `staging`
2. Netlify automatically builds deploy preview
3. URL appears in PR comments: `https://deploy-preview-123--site.netlify.app`
4. Uses staging database (from deploy-preview scope)
5. Deleted automatically when PR is merged/closed

### Custom Domains

**Staging subdomain:**
```
1. Go to Domain settings → Add domain alias
2. Add: staging.yourdomain.com
3. Update DNS:
   - Type: CNAME
   - Name: staging
   - Value: your-site.netlify.app
4. Wait for SSL certificate (~1 min)
```

### Build Settings Optimization

**Update `netlify.toml` for staging:**
```toml
# Staging-specific settings
[context.staging]
  environment = { 
    NODE_ENV = "staging",
    VITE_ENABLE_DEBUG = "true",
    VITE_ENABLE_ANALYTICS = "false"
  }
  # Can add staging-specific build command if needed
  command = "npm run build"
```

### Serverless Functions Configuration

**Staging functions** use the same code but connect to staging database:
- Functions read `VITE_SUPABASE_URL` from environment
- No code changes needed
- Test endpoints: `https://staging-site.netlify.app/.netlify/functions/lead-ingest-enhanced`

---

## ✅ Verification Steps

### 1. Verify Staging Deployment

```bash
# Check staging site is live
curl -I https://hidden-key-staging.netlify.app

# Should return 200 OK
```

### 2. Verify Environment Configuration

```bash
# Use provided validation script
bash scripts/validate-staging.sh https://hidden-key-staging.netlify.app

# Or manually check
curl https://hidden-key-staging.netlify.app/.netlify/functions/health
```

### 3. Verify Database Connectivity

```bash
# Check health endpoint includes database check
curl https://hidden-key-staging.netlify.app/.netlify/functions/health | jq

# Should show database: "connected" (or "demo_mode")
```

### 4. Test Full Flow

1. **Create test lead via staging:**
   ```bash
   curl -X POST https://hidden-key-staging.netlify.app/.netlify/functions/lead-ingest-enhanced \
     -H "Content-Type: application/json" \
     -d '{
       "source": "website",
       "contact": {
         "email": "staging-test@example.com",
         "firstName": "Staging",
         "lastName": "Test"
       }
     }'
   ```

2. **Verify in Supabase:**
   - Open staging Supabase dashboard
   - Go to Table Editor → leads
   - Should see new lead entry

3. **Verify UI:**
   - Open staging site: https://hidden-key-staging.netlify.app
   - Check lead appears in dashboard
   - Test filtering, sorting, etc.

---

## 🔄 Workflow Integration

### Recommended Git Workflow

```
developer creates feature → feature/new-feature branch
                         ↓
                    Create PR to staging
                         ↓
               Auto-deploy preview created
                         ↓
                    Review + Test in preview
                         ↓
                 Merge to staging branch
                         ↓
            Staging site auto-updates
                         ↓
              QA testing on staging
                         ↓
            Create PR: staging → main
                         ↓
                    Review + Approve
                         ↓
               Merge to main branch
                         ↓
           Production site auto-updates
```

### Example Commands

```bash
# Create feature branch
git checkout -b feature/add-new-dashboard
# ... make changes ...
git commit -am "Add new dashboard component"
git push origin feature/add-new-dashboard

# Create PR to staging (via GitHub UI)
# → Auto-deploys preview at: deploy-preview-123--site.netlify.app

# After approval, merge to staging
# → Auto-deploys to: staging--site.netlify.app OR hidden-key-staging.netlify.app

# After QA, create PR: staging → main
# → Auto-deploys preview for final review

# After approval, merge to main
# → Auto-deploys to production
```

---

## 🛡️ Security Best Practices

### ✅ DO:
- ✅ Use separate databases for staging and production
- ✅ Use different API keys for third-party services
- ✅ Enable Netlify password protection for staging (optional)
- ✅ Regularly sync staging DB with sanitized production data
- ✅ Monitor staging for errors (use separate Sentry project)
- ✅ Test all changes on staging before production
- ✅ Keep staging environment variables documented

### ❌ DON'T:
- ❌ Use production database credentials in staging
- ❌ Store real customer data in staging
- ❌ Skip testing on staging "just this once"
- ❌ Use production Sentry DSN in staging
- ❌ Allow public access to staging without password (optional)

### Optional: Password Protection

**Enable password protection for staging:**
1. Go to Site settings → Access control
2. Enable "Visitor access control"
3. Add password
4. Staging site now requires password
5. **Note:** This requires paid Netlify plan

---

## 🔄 Maintenance

### Weekly Tasks
- [ ] Verify staging deployments are successful
- [ ] Check staging logs for errors
- [ ] Refresh staging database with sanitized production data

### Monthly Tasks
- [ ] Review and update staging environment variables
- [ ] Audit staging access logs
- [ ] Clean up old deploy previews (automatic after 7 days)
- [ ] Verify staging SSL certificate validity

### Quarterly Tasks
- [ ] Rotate staging database credentials
- [ ] Review and update staging infrastructure
- [ ] Performance audit of staging vs production
- [ ] Update staging configuration documentation

---

## 🐛 Troubleshooting

### Build Failures

**Issue:** Staging build fails but production works
```bash
# Check Netlify build logs
# Common causes:
1. Missing environment variables
2. Different Node version
3. Cache issues

# Solutions:
# Clear cache and rebuild
netlify build --clear-cache

# Or via UI: Deploys → Trigger deploy → Clear cache and deploy site
```

### Database Connection Issues

**Issue:** Can't connect to staging database
```bash
# Verify credentials
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection directly
curl https://xxxxx.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"

# Should return database info
```

### Deploy Preview Not Created

**Issue:** PR created but no deploy preview
```bash
# Check Netlify settings
1. Site settings → Build & deploy → Deploy contexts
2. Ensure "Deploy previews" is set to "Any pull request"
3. Check GitHub app permissions
4. Verify branch is not in ignore list
```

### Environment Variables Not Loading

**Issue:** Variables work in production but not staging
```bash
# Check variable scopes
1. Go to Site settings → Environment variables
2. For each variable, verify it has correct scope:
   - "Deploy previews" or "Branch deploys"
3. Redeploy after adding variables
4. Check build logs for environment loading
```

---

## 📊 Monitoring & Alerts

### Set Up Staging Monitoring

**Option 1: Sentry (Recommended)**
```bash
# Create separate Sentry project for staging
# Add staging-specific DSN to environment variables
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
VITE_SENTRY_ENVIRONMENT=staging
```

**Option 2: Netlify Analytics**
- Enable in Site settings → Analytics
- Free tier includes basic metrics
- Paid tier adds detailed analytics

**Option 3: Custom Health Checks**
```bash
# Set up external monitoring (UptimeRobot, Pingdom, etc.)
# Monitor endpoint: https://staging-site.netlify.app/.netlify/functions/health
# Alert on: Status code != 200, response time > 3s
```

---

## 📚 Related Documentation

- [Secret/ENV Management Guide](SECRET-ENV-MANAGEMENT-GUIDE.md)
- [Deployment Guide](DEPLOYMENT-GUIDE.md)
- [Environment Variables Reference](docs/ENVIRONMENT-VARIABLES.md)
- [CI/CD Configuration](.github/workflows/ci.yml)
- [Netlify Configuration](netlify.toml)

---

## 🎯 Quick Reference

```bash
# Validate staging setup
bash scripts/validate-staging.sh https://hidden-key-staging.netlify.app

# Deploy to staging manually
git push origin staging

# Check staging logs
netlify logs --site hidden-key-staging

# Test staging health
curl https://hidden-key-staging.netlify.app/.netlify/functions/health

# Open staging site
open https://hidden-key-staging.netlify.app
```

---

## ✨ Success Checklist

- [ ] Staging Supabase database created and configured
- [ ] Database schema deployed to staging DB
- [ ] Netlify site created/configured for staging branch
- [ ] Environment variables set with staging scope
- [ ] Deploy previews enabled for PRs
- [ ] First successful deployment to staging
- [ ] Health check endpoint returns 200
- [ ] Can create test lead via API
- [ ] UI displays staging data correctly
- [ ] Serverless functions working in staging
- [ ] SSL certificate valid for staging domain
- [ ] Monitoring/alerts configured (optional)
- [ ] Team notified of staging URL
- [ ] Documentation updated

**When all checked:** Your staging environment is production-ready! 🎉

---

**Need Help?**
- Review [Netlify Documentation](https://docs.netlify.com/)
- Check [Supabase Documentation](https://supabase.com/docs)
- See [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
