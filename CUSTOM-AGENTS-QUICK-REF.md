# Quick Reference: Working with Custom Agents

> **TL;DR:** Delegate tasks to specialized AI agents for faster, better results!

## 🎯 What Are Custom Agents?

Custom agents are specialized AI assistants configured with specific expertise to handle different aspects of platform development. Think of them as your expert team members.

## 🤖 Your Team

| Agent | When to Use | File Location |
|-------|-------------|---------------|
| **Elite Frontend Developer** | React components, UI, dashboards | `.github/agents/Elite-Frontend-Developer.yaml` |
| **Elite Backend Developer** | APIs, serverless functions, databases | `.github/agents/Elite-Backend-Developer.yaml` |
| **Elite ML Engineer** | Machine learning models, analytics | `.github/agents/Elite-ML-Engineer.yaml` |
| **Elite Integration Specialist** | Third-party APIs, webhooks | `.github/agents/Elite-Integration-Specialist.yaml` |
| **Elite DevOps Engineer** | Infrastructure, CI/CD, monitoring | `.github/agents/Elite-DevOps-Engineer.yaml` |
| **Elite Database Architect** | Schema design, query optimization | `.github/agents/Elite-Database-Architect.yaml` |
| **Email Template Builder** | Email templates, marketing | `.github/agents/Email-Template-Builder-Specialist.yaml` |

## 💡 How to Delegate

### 1. **Identify Your Need**
What are you trying to build?
- UI component? → **Frontend Developer**
- API endpoint? → **Backend Developer**
- ML model? → **ML Engineer**
- API integration? → **Integration Specialist**
- Infrastructure? → **DevOps Engineer**
- Database work? → **Database Architect**
- Email template? → **Email Template Builder**

### 2. **Provide Clear Instructions**

**❌ Bad Example:**
"Build a dashboard"

**✅ Good Example:**
"Build an Analytics Dashboard for the Lead Management page that includes:
- 4 KPI cards: Total Leads, Conversion Rate, Pipeline Value, Average Deal Size
- Line chart showing lead trends (last 30 days) using Recharts
- Table of 10 most recent activities with pagination
- Follow existing patterns in src/pages/LeadManagement.tsx
- Must work in demo mode (no API keys required)
- Include Vitest tests with >80% coverage
- Mobile-responsive design"

### 3. **Include Context**

Always mention:
- **What** - Specific deliverables
- **Why** - Business purpose
- **Where** - Files to reference
- **How** - Patterns to follow
- **Constraints** - Requirements/limitations

## 📝 Quick Examples

### Example 1: Frontend Task
```
I need the Elite Frontend Developer to build a PropertyCard component that:
- Displays property image, address, price, and key metrics
- Uses Radix UI Card component as base
- Follows the styling patterns in src/components/crm/InvestorProfile.tsx
- Includes hover effects and click handlers
- Has TypeScript interfaces for all props
- Includes comprehensive Vitest tests
- Works in demo mode with mock data
```

### Example 2: Backend Task
```
I need the Elite Backend Developer to create a lead-enrichment serverless function that:
- Accepts POST requests with lead data
- Validates input using Zod schema
- Calls Attom Data API to enrich property information
- Stores enriched data in PostgreSQL via Supabase
- Returns standardized response format
- Includes error handling with retry logic
- Logs all operations with correlation IDs
- Has comprehensive integration tests
- Follows patterns in netlify/functions/lead-ingest-enhanced.js
```

### Example 3: Integration Task
```
I need the Elite Integration Specialist to integrate the DocuSign API for e-signatures:
- Implement OAuth 2.0 authentication flow
- Create function to send documents for signature
- Build webhook handler for status updates
- Implement retry logic with exponential backoff
- Handle rate limiting (10 requests/minute)
- Support demo mode with mock responses
- Include comprehensive tests with mocks
- Follow webhook patterns in netlify/functions/webhook-inbound.js
```

## 🎓 Best Practices

### ✅ DO
- Be specific about requirements
- Provide existing code references
- Define success criteria
- Mention testing requirements
- Include security considerations

### ❌ DON'T
- Use vague descriptions
- Skip context and examples
- Forget about tests
- Ignore error handling
- Assume domain knowledge

## 🚀 Common Scenarios

### Scenario 1: Building a New Feature
1. **Frontend Agent** → Build UI components
2. **Backend Agent** → Create API endpoints
3. **Database Agent** → Design schema if needed
4. **DevOps Agent** → Add monitoring

### Scenario 2: Adding Third-Party Service
1. **Integration Agent** → Implement API client
2. **Backend Agent** → Add business logic
3. **Frontend Agent** → Add UI controls
4. **DevOps Agent** → Add health checks

### Scenario 3: ML Feature
1. **ML Agent** → Build and train model
2. **Backend Agent** → Create scoring endpoint
3. **Database Agent** → Design feature storage
4. **Frontend Agent** → Display predictions

## 📚 More Resources

- **[.github/agents/README.md](.github/agents/README.md)** - Full agent documentation
- **[CUSTOM-AGENT-GUIDE.md](CUSTOM-AGENT-GUIDE.md)** - Detailed guide and templates
- **[HOW-AI-HELPS-YOUR-VISION.md](HOW-AI-HELPS-YOUR-VISION.md)** - Platform overview
- **[IMPLEMENTATION-ROADMAP.md](IMPLEMENTATION-ROADMAP.md)** - Development phases

## 🎯 Quick Start Checklist

- [ ] Identify which agent(s) you need
- [ ] Read the agent's configuration file
- [ ] Prepare clear, specific instructions
- [ ] Include references to existing code
- [ ] Define success criteria and tests
- [ ] Delegate the task
- [ ] Review the output

---

**Remember:** The more specific and clear your instructions, the better the results! 🚀

For detailed examples and templates, see [CUSTOM-AGENT-GUIDE.md](CUSTOM-AGENT-GUIDE.md).
