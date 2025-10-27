# Phase 3-7: Advanced Features Implementation Guide

**Timeline**: Weeks 7-20 (14 weeks)  
**Status**: Design & Planning Phase  
**Prerequisites**: Phase 2 Complete  
**Last Updated**: 2025-10-27

## Overview

This guide covers the advanced features that transform the platform from MVP to enterprise-grade system with ML, AI orchestration, document management, and scale capabilities.

---

## Phase 3: Data Enrichment & Automation (Weeks 7-10)

### Priority: **HIGH** 🔥
### Timeline: 4 weeks
### ROI: Medium-High (improves data quality, reduces manual work)

### 3.1 Property Data Enrichment

**Goal**: Automatically enhance lead property data

**Services to Integrate**:

#### Option 1: Attom Data Solutions
- Property details (beds, baths, sqft, year built)
- Ownership records
- Sales history
- Tax assessment
- Market value estimates
- **Cost**: ~$99-299/month
- **API**: REST API with good documentation

#### Option 2: CoreLogic
- Comprehensive property data
- Ownership and liens
- Property characteristics
- **Cost**: Enterprise pricing (quote required)
- **API**: SOAP/REST

#### Option 3: County Records APIs
- Free/low-cost option
- Varies by county
- May require multiple integrations
- **Cost**: Free - $50/month
- **Reliability**: Varies

**Implementation Strategy**:

```typescript
// src/lib/services/enrichmentService.ts

interface EnrichmentProvider {
  name: string;
  enrichProperty(address: PropertyAddress): Promise<PropertyData>;
  validateAddress(address: string): Promise<boolean>;
}

class AttomEnrichmentProvider implements EnrichmentProvider {
  private apiKey: string;
  private baseUrl = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';

  async enrichProperty(address: PropertyAddress): Promise<PropertyData> {
    const response = await fetch(
      `${this.baseUrl}/property/detail?address1=${address.street}&address2=${address.city},${address.state}`,
      {
        headers: {
          'apikey': this.apiKey,
          'Accept': 'application/json'
        }
      }
    );

    const data = await response.json();
    
    return {
      bedrooms: data.building.rooms.beds,
      bathrooms: data.building.rooms.baths,
      sqft: data.building.size.livingsize,
      yearBuilt: data.building.summary.yearbuilt,
      lotSize: data.lot.lotsize1,
      estimatedValue: data.assessment.market.mktttlvalue,
      lastSaleDate: data.sale.saleSearchDate,
      lastSalePrice: data.sale.amount.saleamt,
      ownerName: data.owner.owner1full,
      taxAmount: data.assessment.tax.taxyear,
      // ... more fields
    };
  }
}

export class EnrichmentService {
  private providers: EnrichmentProvider[];
  private queue: EnrichmentQueue;

  async enrichLead(leadId: string): Promise<void> {
    // 1. Get lead from database
    const lead = await this.getLeadFromDb(leadId);
    
    // 2. Queue enrichment job (rate limiting)
    await this.queue.add({
      leadId,
      address: lead.property.address,
      priority: 'normal'
    });
  }

  async processEnrichment(job: EnrichmentJob): Promise<void> {
    try {
      // 3. Call provider API
      const enrichedData = await this.providers[0].enrichProperty(job.address);
      
      // 4. Update lead in database
      await this.updateLeadPropertyData(job.leadId, enrichedData);
      
      // 5. Log activity
      await this.logActivity({
        leadId: job.leadId,
        type: 'enrichment_completed',
        details: { provider: this.providers[0].name }
      });
      
      // 6. Track cost
      await this.trackApiCost({
        provider: this.providers[0].name,
        cost: 0.10, // per API call
        timestamp: new Date()
      });
    } catch (error) {
      // Handle errors, retry logic
      await this.handleEnrichmentError(job, error);
    }
  }
}
```

**Queue Processing**:

```typescript
// src/lib/queue/enrichmentQueue.ts
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL);

export const enrichmentQueue = new Queue('enrichment', { connection });

// Worker process (runs in background)
const worker = new Worker(
  'enrichment',
  async (job) => {
    const enrichmentService = new EnrichmentService();
    await enrichmentService.processEnrichment(job.data);
  },
  {
    connection,
    concurrency: 5, // Process 5 jobs at a time
    limiter: {
      max: 10, // Max 10 requests
      duration: 1000, // per second (rate limiting)
    }
  }
);
```

**Backend Function**:

```javascript
// netlify/functions/enrichment-trigger.js
import { enrichmentQueue } from '../../src/lib/queue/enrichmentQueue.js';

export async function handler(event) {
  const { leadId } = JSON.parse(event.body);
  
  // Add to queue
  await enrichmentQueue.add('enrich-lead', { leadId });
  
  return {
    statusCode: 202, // Accepted
    body: JSON.stringify({
      message: 'Enrichment queued',
      leadId
    })
  };
}
```

**Admin Dashboard Component**:

```typescript
// src/components/admin/EnrichmentMonitor.tsx
export function EnrichmentMonitor() {
  const { stats } = useEnrichmentStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrichment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            label="Queued"
            value={stats.queued}
            icon={<Clock />}
          />
          <MetricCard
            label="Processing"
            value={stats.processing}
            icon={<Activity />}
          />
          <MetricCard
            label="Completed Today"
            value={stats.completedToday}
            icon={<CheckCircle />}
          />
          <MetricCard
            label="API Cost Today"
            value={`$${stats.costToday.toFixed(2)}`}
            icon={<DollarSign />}
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Recent Enrichments</h3>
          <EnrichmentTable jobs={stats.recentJobs} />
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 3.2 Contact Validation

**Goal**: Verify email and phone numbers

**Services to Integrate**:

#### Email Validation
- **ZeroBounce**: $16/month for 2,000 validations
- **NeverBounce**: Pay-as-you-go, $0.008/email
- **AbstractAPI**: Free tier available

**Features**:
- Syntax validation
- Domain validation
- Mailbox existence check
- Disposable email detection
- Role email detection (info@, admin@)
- Free email provider detection

#### Phone Validation
- **Twilio Lookup**: $0.005 per lookup
- **AbstractAPI**: $0.001 per lookup
- **NumVerify**: Free tier available

**Features**:
- Format validation
- Carrier lookup
- Line type (mobile, landline, VoIP)
- Location data
- Validity check

**Implementation**:

```typescript
// src/lib/services/validationService.ts

export class ValidationService {
  async validateEmail(email: string): Promise<EmailValidation> {
    // Use ZeroBounce API
    const response = await fetch(
      `https://api.zerobounce.net/v2/validate?api_key=${API_KEY}&email=${email}`,
    );
    const data = await response.json();

    return {
      email,
      valid: data.status === 'valid',
      status: data.status, // valid, invalid, catch-all, unknown, disposable
      subStatus: data.sub_status,
      freeEmail: data.free_email,
      disposable: data.status === 'disposable',
      score: data.zerobounce_quality_score, // 0-10
      didYouMean: data.did_you_mean, // Suggest correction
    };
  }

  async validatePhone(phone: string): Promise<PhoneValidation> {
    // Use Twilio Lookup API
    const client = new TwilioClient(ACCOUNT_SID, AUTH_TOKEN);
    const lookup = await client.lookups.v1
      .phoneNumbers(phone)
      .fetch({ type: ['carrier'] });

    return {
      phone,
      valid: true,
      formatted: lookup.phoneNumber,
      countryCode: lookup.countryCode,
      carrier: lookup.carrier.name,
      type: lookup.carrier.type, // mobile, landline, voip
    };
  }

  async validateAddress(address: PropertyAddress): Promise<AddressValidation> {
    // Use SmartyStreets API
    const response = await fetch('https://us-street.api.smartystreets.com/street-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        street: address.street,
        city: address.city,
        state: address.state,
        zipcode: address.zip,
      }]),
    });

    const [result] = await response.json();

    return {
      valid: result.analysis.dpv_match_code === 'Y',
      standardized: {
        street: result.delivery_line_1,
        city: result.components.city_name,
        state: result.components.state_abbreviation,
        zip: result.components.zipcode,
        plus4: result.components.plus4_code,
      },
      metadata: {
        latitude: result.metadata.latitude,
        longitude: result.metadata.longitude,
        precision: result.metadata.precision,
      },
    };
  }
}
```

**Auto-validation on Lead Creation**:

```typescript
// netlify/functions/lead-ingest-enhanced.js
// Add validation step

async function handler(event) {
  const leadData = JSON.parse(event.body);

  // Validate inputs
  const validation = LeadCreateSchema.parse(leadData);

  // NEW: Auto-validate contact info
  const validationService = new ValidationService();
  
  if (leadData.contact?.email) {
    const emailValidation = await validationService.validateEmail(
      leadData.contact.email
    );
    leadData.contact.emailValidation = emailValidation;
    
    // Reject if invalid
    if (!emailValidation.valid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Invalid email address',
          suggestion: emailValidation.didYouMean,
        }),
      };
    }
  }

  // Similar for phone...

  // Continue with lead creation
  const lead = await createLead(leadData);
  
  return {
    statusCode: 201,
    body: JSON.stringify(lead),
  };
}
```

---

### 3.3 Event Tracking & Analytics

**Goal**: Track user actions and generate insights

**Implementation**:

```typescript
// src/lib/analytics/eventTracker.ts

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  leadId?: string;
  opportunityId?: string;
  properties?: Record<string, any>;
  timestamp: Date;
}

export class EventTracker {
  async track(event: AnalyticsEvent): Promise<void> {
    // Store in database
    await supabase.from('analytics_events').insert({
      event: event.event,
      user_id: event.userId,
      lead_id: event.leadId,
      opportunity_id: event.opportunityId,
      properties: event.properties,
      timestamp: event.timestamp,
    });

    // Also send to external analytics (optional)
    if (window.analytics) {
      window.analytics.track(event.event, event.properties);
    }
  }
}

// Usage throughout app
const tracker = new EventTracker();

// Track lead creation
tracker.track({
  event: 'lead_created',
  leadId: lead.id,
  properties: {
    source: lead.source,
    hasProperty: !!lead.property,
  },
  timestamp: new Date(),
});

// Track stage change
tracker.track({
  event: 'opportunity_stage_changed',
  opportunityId: opp.id,
  properties: {
    fromStage: oldStage,
    toStage: newStage,
    dealValue: opp.value,
  },
  timestamp: new Date(),
});
```

**Analytics Dashboard Queries**:

```sql
-- Top lead sources by conversion rate
SELECT 
  source,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted,
  ROUND(
    COUNT(CASE WHEN status = 'converted' THEN 1 END)::numeric / COUNT(*)::numeric * 100,
    2
  ) as conversion_rate
FROM leads
GROUP BY source
ORDER BY conversion_rate DESC;

-- Average time in each stage
SELECT 
  stage,
  AVG(
    EXTRACT(EPOCH FROM (closed_at - created_at)) / 86400
  ) as avg_days_in_stage
FROM opportunities
GROUP BY stage;

-- Pipeline value by stage
SELECT 
  stage,
  COUNT(*) as deal_count,
  SUM(expected_value) as total_value
FROM opportunities
WHERE status = 'open'
GROUP BY stage
ORDER BY stage;
```

---

## Phase 4: ML & Predictive Analytics (Weeks 11-18)

### Priority: **STRATEGIC** 🤖
### Timeline: 8 weeks
### ROI: High (long-term competitive advantage)

### 4.1 Data Infrastructure Setup (Weeks 11-12)

**Goal**: Establish data pipeline for ML

**Components**:

1. **Data Lake** (S3 + Parquet)
   ```
   s3://hidden-key-data/
   ├── raw/
   │   ├── leads/
   │   ├── opportunities/
   │   └── activities/
   ├── processed/
   │   ├── features/
   │   └── training/
   └── models/
       ├── lead-scoring/
       └── deal-prediction/
   ```

2. **ETL Pipeline** (dbt or custom)
   ```sql
   -- models/features/lead_features.sql
   SELECT 
     l.id as lead_id,
     l.source,
     l.created_at,
     -- Time-based features
     EXTRACT(HOUR FROM l.created_at) as hour_of_day,
     EXTRACT(DOW FROM l.created_at) as day_of_week,
     -- Contact features
     CASE WHEN l.email IS NOT NULL THEN 1 ELSE 0 END as has_email,
     CASE WHEN l.phone IS NOT NULL THEN 1 ELSE 0 END as has_phone,
     -- Property features
     COALESCE(p.estimated_value, 0) as property_value,
     COALESCE(p.bedrooms, 0) as bedrooms,
     COALESCE(p.bathrooms, 0) as bathrooms,
     -- Engagement features
     COUNT(DISTINCT a.id) as activity_count,
     MAX(a.created_at) as last_activity_date,
     -- Outcome (for training)
     CASE 
       WHEN l.status = 'converted' THEN 1 
       ELSE 0 
     END as converted
   FROM leads l
   LEFT JOIN properties p ON l.property_id = p.id
   LEFT JOIN activities a ON l.id = a.lead_id
   GROUP BY l.id, l.source, l.created_at, l.email, l.phone, l.status,
            p.estimated_value, p.bedrooms, p.bathrooms;
   ```

3. **Feature Store** (Feast or custom)
   ```python
   # features/lead_scoring_features.py
   from feast import Entity, Feature, FeatureView, Field
   from feast.types import Float32, Int64
   
   lead = Entity(name="lead", join_keys=["lead_id"])
   
   lead_features = FeatureView(
       name="lead_features",
       entities=[lead],
       schema=[
           Field(name="property_value", dtype=Float32),
           Field(name="activity_count", dtype=Int64),
           Field(name="has_email", dtype=Int64),
           Field(name="has_phone", dtype=Int64),
           Field(name="bedrooms", dtype=Int64),
           Field(name="bathrooms", dtype=Int64),
       ],
       source=ParquetSource(path="s3://hidden-key-data/processed/features/"),
   )
   ```

---

### 4.2 Model Development (Weeks 13-16)

**Goal**: Train predictive models

**Models to Build**:

#### Model 1: Lead-to-Deal Probability
```python
# ml/models/lead_scoring/train.py
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import mlflow

# Load training data
df = pd.read_parquet('s3://hidden-key-data/processed/training/lead_features.parquet')

# Features and target
X = df[[
    'property_value', 'activity_count', 'has_email', 'has_phone',
    'bedrooms', 'bathrooms', 'hour_of_day', 'day_of_week'
]]
y = df['converted']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train model
with mlflow.start_run():
    model = RandomForestClassifier(n_estimators=100, max_depth=10)
    model.fit(X_train, y_train)
    
    # Evaluate
    score = model.score(X_test, y_test)
    mlflow.log_metric("accuracy", score)
    
    # Save model
    mlflow.sklearn.log_model(model, "lead_scoring_model")
```

#### Model 2: Expected Deal Value
```python
# Regression model to predict deal value
from sklearn.ensemble import GradientBoostingRegressor

model = GradientBoostingRegressor()
model.fit(X_train, y_train_value)
```

#### Model 3: Time-to-Close Prediction
```python
# Survival analysis or regression
from lifelines import CoxPHFitter

cph = CoxPHFitter()
cph.fit(df, duration_col='days_to_close', event_col='closed')
```

#### Model 4: Investor Matching
```python
# Recommendation system
from surprise import SVD, Dataset

# Collaborative filtering to match investors with deals
model = SVD()
model.fit(trainset)
```

---

### 4.3 ML API Service (Weeks 17-18)

**Goal**: Serve predictions in real-time

**FastAPI Service**:

```python
# ml-api/main.py
from fastapi import FastAPI
import mlflow.pyfunc
import pandas as pd

app = FastAPI()

# Load models
lead_scoring_model = mlflow.pyfunc.load_model('models:/lead_scoring/production')
deal_value_model = mlflow.pyfunc.load_model('models:/deal_value/production')

@app.post("/api/score-lead")
async def score_lead(lead_features: dict):
    """Score a lead's probability to convert"""
    
    # Prepare features
    features_df = pd.DataFrame([lead_features])
    
    # Predict
    probability = lead_scoring_model.predict(features_df)[0]
    
    return {
        "lead_id": lead_features["lead_id"],
        "score": float(probability),
        "grade": get_grade(probability),  # A, B, C, D, F
        "recommendation": get_recommendation(probability),
    }

@app.post("/api/predict-deal-value")
async def predict_deal_value(opportunity_features: dict):
    """Predict expected deal value"""
    
    features_df = pd.DataFrame([opportunity_features])
    value = deal_value_model.predict(features_df)[0]
    
    return {
        "opportunity_id": opportunity_features["opportunity_id"],
        "predicted_value": float(value),
        "confidence_interval": [float(value * 0.8), float(value * 1.2)],
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "models_loaded": True}
```

**Deploy on Render.com or Fly.io**:
```bash
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Integration with Frontend**:

```typescript
// src/lib/services/mlService.ts
export class MLService {
  private apiUrl = import.meta.env.VITE_ML_API_URL;

  async scoreLead(leadId: string): Promise<LeadScore> {
    const features = await this.getLeadFeatures(leadId);
    
    const response = await fetch(`${this.apiUrl}/api/score-lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features),
    });

    return response.json();
  }

  async predictDealValue(opportunityId: string): Promise<DealValuePrediction> {
    const features = await this.getOpportunityFeatures(opportunityId);
    
    const response = await fetch(`${this.apiUrl}/api/predict-deal-value`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(features),
    });

    return response.json();
  }
}
```

**Display in UI**:

```typescript
// src/components/crm/LeadScoreCard.tsx
export function LeadScoreCard({ leadId }: { leadId: string }) {
  const { score, loading } = useLeadScore(leadId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Lead Score</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="text-5xl font-bold text-center">
              {score.grade}
            </div>
            <div className="text-sm text-center text-muted-foreground">
              {(score.score * 100).toFixed(1)}% conversion probability
            </div>
            <Progress value={score.score * 100} className="mt-4" />
            <p className="mt-4 text-sm">{score.recommendation}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## Phase 5: AI Orchestration (Weeks 15-20)

### Priority: **STRATEGIC** 🌟
### Timeline: 6 weeks (parallel with ML)
### ROI: High (differentiation, automation)

### 5.1 Orchestrator Service Architecture

**Goal**: Coordinate multiple AI assistants

**Service Structure**:

```
orchestrator/
├── src/
│   ├── router.ts              # Route tasks to assistants
│   ├── context.ts             # Manage shared context
│   ├── assistants/
│   │   ├── steve.ts           # AI Empire Builder
│   │   ├── analyst.ts         # Data analyst
│   │   ├── writer.ts          # Content writer
│   │   ├── researcher.ts      # Research assistant
│   │   └── coordinator.ts     # Task coordinator
│   ├── workflows/
│   │   ├── deal-analysis.ts   # Multi-step deal analysis
│   │   ├── market-research.ts # Market research workflow
│   │   └── investor-match.ts  # Find best investor
│   ├── guardrails/
│   │   ├── safety.ts          # Content safety checks
│   │   ├── validation.ts      # Output validation
│   │   └── compliance.ts      # Legal compliance
│   └── monitoring/
│       ├── metrics.ts         # Performance metrics
│       └── logging.ts         # Audit logging
├── tests/
└── package.json
```

**Task Protocol**:

```typescript
// orchestrator/src/types.ts
export interface Task {
  id: string;
  type: 'analysis' | 'research' | 'content' | 'coordination';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  input: {
    subject: string;  // Lead ID, Opportunity ID, etc.
    context: Record<string, any>;
    requirements: string[];
  };
  assignedTo?: string;  // Assistant ID
  status: 'pending' | 'in_progress' | 'review' | 'complete' | 'failed';
  result?: any;
  createdAt: Date;
  completedAt?: Date;
  needsHumanReview: boolean;
}

export interface Assistant {
  id: string;
  name: string;
  capabilities: string[];
  apiEndpoint: string;
  execute(task: Task): Promise<TaskResult>;
}
```

**Router Implementation**:

```typescript
// orchestrator/src/router.ts
export class TaskRouter {
  private assistants: Map<string, Assistant>;

  async routeTask(task: Task): Promise<Assistant> {
    // Determine which assistant should handle this task
    switch (task.type) {
      case 'analysis':
        return this.assistants.get('analyst');
      case 'research':
        return this.assistants.get('researcher');
      case 'content':
        return this.assistants.get('writer');
      case 'coordination':
        return this.assistants.get('coordinator');
      default:
        return this.assistants.get('steve'); // Default to Steve
    }
  }

  async executTask(task: Task): Promise<TaskResult> {
    const assistant = await this.routeTask(task);
    
    // Execute with monitoring
    const startTime = Date.now();
    const result = await assistant.execute(task);
    const duration = Date.now() - startTime;

    // Log performance
    await this.logExecution({
      taskId: task.id,
      assistant: assistant.id,
      duration,
      success: result.status === 'success',
    });

    // Check if needs human review
    if (this.needsReview(task, result)) {
      await this.queueForReview(task, result);
    }

    return result;
  }
}
```

**Multi-Step Workflow Example**:

```typescript
// orchestrator/src/workflows/deal-analysis.ts
export class DealAnalysisWorkflow {
  async execute(opportunityId: string): Promise<DealAnalysisReport> {
    // Step 1: Gather data (Researcher)
    const data = await this.researcher.execute({
      type: 'research',
      input: {
        subject: opportunityId,
        context: { type: 'opportunity' },
        requirements: [
          'property details',
          'market comparables',
          'neighborhood stats',
        ],
      },
    });

    // Step 2: Analyze (Analyst)
    const analysis = await this.analyst.execute({
      type: 'analysis',
      input: {
        subject: opportunityId,
        context: { ...data.result },
        requirements: [
          'investment potential',
          'risk assessment',
          'ROI projection',
        ],
      },
    });

    // Step 3: Generate report (Writer)
    const report = await this.writer.execute({
      type: 'content',
      input: {
        subject: opportunityId,
        context: { ...data.result, ...analysis.result },
        requirements: [
          'executive summary',
          'detailed analysis',
          'recommendations',
        ],
      },
    });

    // Step 4: Human review gate
    await this.queueForReview({
      opportunityId,
      report: report.result,
      confidence: analysis.result.confidence,
    });

    return report.result;
  }
}
```

---

## Phase 6: Legal & Communications (Weeks 15-18)

### Priority: **MEDIUM**
### Timeline: 4 weeks (parallel)
### ROI: Medium (operational efficiency)

### 6.1 Communication Integration

**SendGrid Email**:
```typescript
// src/lib/services/emailService.ts
import sgMail from '@sendgrid/mail';

export class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(params: EmailParams): Promise<void> {
    const msg = {
      to: params.to,
      from: 'noreply@hiddenkey.io',
      subject: params.subject,
      html: params.html,
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
    };

    await sgMail.send(msg);
    
    // Log activity
    await this.logActivity({
      type: 'email_sent',
      leadId: params.leadId,
      subject: params.subject,
    });
  }

  async sendTemplatedEmail(templateId: string, data: any): Promise<void> {
    // Use SendGrid dynamic templates
    await sgMail.send({
      to: data.to,
      from: 'noreply@hiddenkey.io',
      templateId,
      dynamicTemplateData: data,
    });
  }
}
```

**Twilio SMS**:
```typescript
// src/lib/services/smsService.ts
import twilio from 'twilio';

export class SMSService {
  private client: twilio.Twilio;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  async sendSMS(params: SMSParams): Promise<void> {
    await this.client.messages.create({
      body: params.message,
      to: params.to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });

    // Log activity
    await this.logActivity({
      type: 'sms_sent',
      leadId: params.leadId,
      message: params.message,
    });
  }
}
```

---

### 6.2 Document Management & E-Signature

**DocuSign Integration**:
```typescript
// src/lib/services/docusignService.ts
import docusign from 'docusign-esign';

export class DocuSignService {
  private client: docusign.ApiClient;

  async sendForSignature(params: DocumentParams): Promise<string> {
    // Create envelope
    const envelope = {
      emailSubject: params.subject,
      documents: [{
        documentBase64: params.documentBase64,
        name: params.documentName,
        fileExtension: 'pdf',
        documentId: '1',
      }],
      recipients: {
        signers: [{
          email: params.signerEmail,
          name: params.signerName,
          recipientId: '1',
          tabs: {
            signHereTabs: params.signaturePlaces,
          },
        }],
      },
      status: 'sent',
    };

    const result = await this.client.envelopesApi.createEnvelope(
      ACCOUNT_ID,
      { envelopeDefinition: envelope }
    );

    // Store in database
    await this.saveDocument({
      envelopeId: result.envelopeId,
      opportunityId: params.opportunityId,
      status: 'sent',
    });

    return result.envelopeId;
  }

  async handleWebhook(event: DocuSignWebhook): Promise<void> {
    // Handle signature completion, etc.
    if (event.event === 'envelope-completed') {
      await this.markDocumentSigned(event.envelopeId);
      await this.downloadSignedDocument(event.envelopeId);
    }
  }
}
```

---

## Phase 7: Scale & Observability (Ongoing)

### Priority: **HIGH** (once in production)
### Timeline: Continuous
### ROI: Critical (reliability, performance)

### 7.1 OpenTelemetry Tracing

```typescript
// src/lib/observability/tracing.ts
import { trace } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const provider = new WebTracerProvider();
const exporter = new OTLPTraceExporter({
  url: 'https://otel-collector.hiddenkey.io/v1/traces',
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register();

export const tracer = trace.getTracer('hidden-key-frontend');

// Usage
export async function fetchLeads() {
  const span = tracer.startSpan('fetchLeads');
  try {
    const leads = await api.get('/leads');
    span.setStatus({ code: 0 }); // Success
    return leads;
  } catch (error) {
    span.setStatus({ code: 2, message: error.message }); // Error
    throw error;
  } finally {
    span.end();
  }
}
```

---

### 7.2 Centralized Logging

```typescript
// src/lib/observability/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: {
    service: 'hidden-key-api',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usage with correlation ID
export function logWithContext(message: string, context: any) {
  logger.info(message, {
    correlationId: context.correlationId,
    userId: context.userId,
    ...context,
  });
}
```

---

### 7.3 IaC with Terraform

```hcl
# infrastructure/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# S3 bucket for data lake
resource "aws_s3_bucket" "data_lake" {
  bucket = "hidden-key-data-lake"
  
  versioning {
    enabled = true
  }

  lifecycle_rule {
    enabled = true

    transition {
      days          = 30
      storage_class = "GLACIER"
    }
  }
}

# Redis for queue
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "hidden-key-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}

# RDS for analytics (if needed)
resource "aws_db_instance" "analytics" {
  identifier        = "hidden-key-analytics"
  engine            = "postgres"
  instance_class    = "db.t3.small"
  allocated_storage = 20
  
  db_name  = "analytics"
  username = "admin"
  password = var.db_password
}
```

---

## Summary: Complete Implementation Timeline

| Phase | Weeks | Priority | Deliverables |
|-------|-------|----------|--------------|
| Phase 1 | 0-2 | 🔥 CRITICAL | Infrastructure activation |
| Phase 2 | 2-6 | 🔥 HIGH | Core CRM UI MVP |
| Phase 3 | 7-10 | 🟡 HIGH | Data enrichment & automation |
| Phase 4 | 11-18 | 🟣 STRATEGIC | ML & predictive analytics |
| Phase 5 | 15-20 | 🟣 STRATEGIC | AI orchestration |
| Phase 6 | 15-18 | 🟡 MEDIUM | Legal & communications |
| Phase 7 | Ongoing | 🔥 HIGH | Scale & observability |

**Total Timeline**: 20 weeks to full enterprise platform

---

## Next Actions

1. **This Week**: Complete Phase 1 activation
2. **Next 2 Weeks**: Start Phase 2 MVP development
3. **Weeks 5-10**: Data enrichment and automation
4. **Weeks 11-20**: ML and AI orchestration

**All phases have detailed blueprints ready for implementation!** 🚀
