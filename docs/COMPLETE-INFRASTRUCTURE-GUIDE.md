# Complete Infrastructure Setup Guide (95% → 100%)

**Time Required**: 45 minutes  
**Current Status**: 95% Complete  
**Goal**: Achieve 100% infrastructure completion

---

## 📋 Overview

Your platform is **95% complete** with excellent foundations. To reach 100%, you need to:

1. **Add Sentry DSN to Netlify** (15 min) - Enable production error tracking
2. **Set up Staging Environment** (30 min) - Enable safe testing before production

Both tasks involve configuration in external dashboards (Netlify, Sentry, Supabase) - no code changes required!

---

## ✅ Task 1: Activate Sentry Error Monitoring (15 minutes)

### Why This Matters
- Track errors in production before users report them
- Monitor performance and user experience
- Debug issues with full context and stack traces
- **Already integrated in code** - just needs configuration!

### Step-by-Step Setup

#### 1. Create Sentry Account (5 minutes)

1. Go to [sentry.io](https://sentry.io/signup/)
2. Sign up for free account (100k events/month included)
3. Select **"React"** as your platform
4. Note your **DSN** (looks like: `https://xxx@sentry.io/xxx`)

#### 2. Add DSN to Netlify (5 minutes)

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site: **hidden-key-investments**
3. Navigate to: **Site settings** → **Environment variables**
4. Click **"Add a variable"**
5. Add:
   ```
   Key: VITE_SENTRY_DSN
   Value: https://your-actual-dsn@sentry.io/your-project-id
   Scope: All deploy contexts (or specific to Production only)
   ```
6. Click **"Save"**

#### 3. Verify Setup (5 minutes)

1. **Trigger a Deployment**:
   - Go to: **Deploys** tab
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**

2. **Test Error Tracking**:
   - After deploy completes, visit your site
   - Open browser console and run:
     ```javascript
     throw new Error("Sentry test error");
     ```
   - Check Sentry dashboard - you should see the error!

3. **Check Sentry Dashboard**:
   - Go to [Sentry Dashboard](https://sentry.io)
   - Navigate to your project
   - You should see the test error with full context

#### 4. Optional: Add Auth Token for Source Maps (Advanced)

For better debugging with original source code:

1. In Sentry: **Settings** → **Developer Settings** → **Auth Tokens**
2. Create new token with `project:releases` scope
3. Add to Netlify environment variables:
   ```
   SENTRY_AUTH_TOKEN=your_token_here
   SENTRY_ORG=your-org-name
   SENTRY_PROJECT=your-project-name
   ```

### Validation Checklist

- [ ] Sentry account created
- [ ] DSN added to Netlify environment variables
- [ ] Site redeployed successfully
- [ ] Test error visible in Sentry dashboard
- [ ] Error tracking confirmed working

### What You'll Get

✅ **Real-time error monitoring** - Know about issues before users complain  
✅ **Performance insights** - Track page load times and API performance  
✅ **User context** - See what users were doing when errors occurred  
✅ **Release tracking** - Compare error rates across deployments  

---

## ✅ Task 2: Set Up Staging Environment (30 minutes)

### Why This Matters
- Test changes safely before production
- Catch bugs in a production-like environment
- Experiment with new features without risk
- Satisfy enterprise deployment best practices

### Prerequisites

- [ ] Netlify account with site connected
- [ ] GitHub repository access
- [ ] 30 minutes of uninterrupted time

### Option A: Quick Staging Setup (Recommended - 30 min)

Perfect for getting started quickly. Uses branch deploys with shared database.

#### 1. Create Staging Branch (2 minutes)

```bash
# In your local repository
cd /path/to/hidden-key-investments
git checkout main
git pull
git checkout -b staging
git push -u origin staging
```

#### 2. Enable Branch Deploys in Netlify (3 minutes)

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Navigate to: **Site settings** → **Build & Deploy** → **Continuous Deployment**
4. Under **"Branch deploys"**, select:
   - **"Let me add individual branches"**
   - Add branch name: `staging`
5. Click **"Save"**

#### 3. Configure Deploy Contexts (5 minutes)

Your `netlify.toml` already has the configuration! Verify it looks like this:

```toml
[build]
  command = "npm install && npm run build"
  publish = "dist"

# Production context (main branch)
[context.production]
  environment = { NODE_ENV = "production" }

# Staging context (staging branch)
[context.staging]
  environment = { NODE_ENV = "staging" }

# Branch deploy context (feature branches)
[context.branch-deploy]
  environment = { NODE_ENV = "development" }

# Deploy Preview context (pull requests)
[context.deploy-preview]
  environment = { NODE_ENV = "preview" }
```

✅ **Already configured!** - No changes needed.

#### 4. Set Up Staging Database (10 minutes)

**Choice 1: Separate Supabase Project (Recommended)**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New project"**
3. Settings:
   - **Name**: `hidden-key-investments-staging`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Same as your production (for consistency)
4. Wait for project to initialize (2-3 minutes)
5. Get connection details:
   - Go to **Settings** → **API**
   - Copy: **Project URL** and **anon/public key**

**Choice 2: Use Production Database (Quick, but less isolation)**

- Skip this step
- Use same database as production
- Add `staging_` prefix to test data
- ⚠️ Be careful not to delete production data!

#### 5. Add Staging Environment Variables to Netlify (5 minutes)

1. Go to Netlify: **Site settings** → **Environment variables**
2. For staging database, add these with **"Branch deploys: staging"** scope:
   ```
   SUPABASE_URL=https://your-staging-project.supabase.co
   SUPABASE_ANON_KEY=your_staging_anon_key
   ```
3. For shared database, use same variables as production

#### 6. Initialize Staging Database Schema (3 minutes)

If you created a separate staging database:

```bash
# Get the database URL from Supabase dashboard
# Settings → Database → Connection string → URI

# Run schema setup
psql "your-staging-postgres-connection-string" \
  -f supabase-sql/01-setup.sql
```

Or use Supabase SQL Editor:
1. Go to Supabase Dashboard → **SQL Editor**
2. Open `/supabase-sql/01-setup.sql` from your repo
3. Copy and paste into SQL Editor
4. Click **"Run"**

#### 7. Test Staging Deployment (2 minutes)

1. Make a small change to trigger deploy:
   ```bash
   # In staging branch
   echo "# Staging test" >> README.md
   git add README.md
   git commit -m "test: Trigger staging deployment"
   git push
   ```

2. Watch deployment:
   - Go to Netlify → **Deploys** tab
   - Find the staging branch deploy
   - Wait for completion

3. Access staging site:
   - URL format: `https://staging--your-site.netlify.app`
   - Or find in Netlify deploy details

### Option B: Full Staging Setup with CI/CD (45 min)

For complete environment isolation with automated testing.

**Includes:**
- Separate staging database
- Environment-specific secrets
- Automated smoke tests
- Staging-specific monitoring

See: [STAGING-SETUP.md](./STAGING-SETUP.md) for full details.

### Validation Checklist

- [ ] Staging branch created and pushed
- [ ] Branch deploys enabled in Netlify
- [ ] Staging deploy context configured
- [ ] Staging database created (if using separate)
- [ ] Database schema initialized
- [ ] Environment variables configured for staging
- [ ] Staging site accessible at staging URL
- [ ] Test deployment successful

### What You'll Get

✅ **Safe testing environment** - Test before production  
✅ **Production parity** - Same stack, different data  
✅ **Team collaboration** - Share pre-release features  
✅ **Risk reduction** - Catch issues early  

---

## 🧪 Verification Script

Use this script to verify your infrastructure is 100% complete:

```bash
# Run verification
bash scripts/validate-infrastructure.sh
```

Expected output:
```
✅ CI/CD Pipeline: Active
✅ Tests: 101/101 passing
✅ Build: Successful (4.65s)
✅ Sentry: Configured and tracking
✅ Staging: Active and deployed
✅ Environment Variables: All required vars present
✅ Database: Connected and healthy

🎉 Infrastructure: 100% COMPLETE
```

---

## 📊 Before & After Comparison

### Before (95%)
- ✅ CI/CD pipeline running
- ✅ Tests passing
- ✅ Build working
- ✅ Database schema ready
- ❌ Production error tracking (Sentry not active)
- ❌ Staging environment (no safe testing)

### After (100%)
- ✅ CI/CD pipeline running
- ✅ Tests passing
- ✅ Build working
- ✅ Database schema ready
- ✅ **Production error tracking active** 🎉
- ✅ **Staging environment operational** 🎉

---

## 🎯 Success Criteria

You've achieved 100% infrastructure when:

1. ✅ Sentry dashboard shows production errors (even if none yet)
2. ✅ Staging URL is accessible and functional
3. ✅ `bash scripts/validate-infrastructure.sh` passes all checks
4. ✅ You can deploy to staging, test, then promote to production
5. ✅ Team can develop with confidence in staging environment

---

## 🆘 Troubleshooting

### Sentry Not Receiving Errors

**Problem**: No errors showing in Sentry dashboard

**Solutions**:
1. Check DSN is correct in Netlify environment variables
2. Verify you deployed after adding VITE_SENTRY_DSN
3. Check browser console for Sentry initialization errors
4. Test with: `throw new Error("Test error")` in browser console
5. Ensure Sentry project is active (not disabled)

### Staging Deploy Not Triggering

**Problem**: Push to staging branch doesn't trigger deploy

**Solutions**:
1. Check Netlify: **Site settings** → **Build & Deploy**
2. Verify "staging" is listed under branch deploys
3. Look at **Deploys** tab for error messages
4. Check build logs for failures
5. Manually trigger: **Trigger deploy** → **Deploy site**

### Database Connection Fails in Staging

**Problem**: API calls fail with database errors

**Solutions**:
1. Verify SUPABASE_URL and SUPABASE_ANON_KEY are set for staging scope
2. Check variable names exactly match (case-sensitive)
3. Confirm staging database schema is initialized
4. Test connection with: `bash scripts/test-db-connection.sh`
5. Check Supabase project is not paused (auto-pauses after inactivity)

### Environment Variables Not Loading

**Problem**: Variables are undefined in code

**Solutions**:
1. VITE_ variables: Must redeploy after adding
2. Server variables: Must restart functions
3. Check scope: Production vs Branch deploys vs Deploy previews
4. Verify no typos in variable names
5. Check Netlify deploy log for loaded variables

---

## 📚 Additional Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Netlify Deploy Contexts](https://docs.netlify.com/site-deploys/overview/#deploy-contexts)
- [Supabase Database Setup](https://supabase.com/docs/guides/database)

---

## 🎉 What's Next?

Once you complete these tasks (45 min), your infrastructure will be **100% complete**!

**Then you can move to Phase 2: Core Product MVP**
- Build Lead Capture UI (4 hours)
- Create CRM Dashboard (1 day)
- Implement Workflow Builder (2 days)
- Add Email/SMS Integration (1 day)

See: [docs/MVP-IMPLEMENTATION.md](./MVP-IMPLEMENTATION.md) for Phase 2 details.

---

**Questions?** Check existing guides:
- [STAGING-SETUP.md](./STAGING-SETUP.md) - Detailed staging configuration
- [OBSERVABILITY-GUIDE.md](./OBSERVABILITY-GUIDE.md) - Full Sentry setup
- [ENVIRONMENT-VARIABLES.md](./ENVIRONMENT-VARIABLES.md) - All env vars explained
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
