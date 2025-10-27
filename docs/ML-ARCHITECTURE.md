# ML & Predictive Analytics Architecture

## Overview

This document outlines the architecture for the ML-powered scoring, valuation, and predictive analytics system for the Hidden Key Investments platform.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Data Collection Layer                    │
├─────────────────────────────────────────────────────────────┤
│  Events → Kafka/Kinesis → S3 Data Lake → Feature Store     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Feature Engineering                       │
├─────────────────────────────────────────────────────────────┤
│  • Lead Features        • Property Features                  │
│  • Engagement Metrics   • Market Data                        │
│  • Historical Patterns  • External Enrichment                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      ML Model Layer                          │
├─────────────────────────────────────────────────────────────┤
│  • Lead Scoring Model   • Value Prediction Model             │
│  • Conversion Predictor • Time-to-Close Model                │
│  • Investor Match Model • Risk Assessment Model              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Inference & Serving                       │
├─────────────────────────────────────────────────────────────┤
│  REST API → Model Registry → Cached Predictions             │
└─────────────────────────────────────────────────────────────┘
```

## Core ML Models

### 1. Lead Scoring Model

**Purpose**: Predict lead-to-deal conversion probability

**Features**:
- Lead source quality
- Contact engagement level
- Property characteristics
- Market conditions
- Historical conversion rates
- Time decay factors

**Model Type**: Gradient Boosting (XGBoost/LightGBM)

**Output**:
- Score: 0-100
- Confidence: 0.0-1.0
- Feature importance breakdown
- Recommended actions

**Retraining**: Weekly with A/B testing

**Metrics**:
- AUC-ROC > 0.85
- Precision @ K (top 20%) > 0.75
- Calibration error < 0.05

---

### 2. Property Valuation Model

**Purpose**: Estimate property value and investment potential

**Features**:
- Location data (ZIP, neighborhood)
- Property specs (sqft, beds, baths)
- Comparable sales
- Market trends
- Days on market
- Renovation potential

**Model Type**: Ensemble (Random Forest + Neural Network)

**Output**:
- Estimated value
- Confidence interval (80%, 95%)
- Comparable properties
- Value drivers

**Retraining**: Monthly

**Metrics**:
- MAPE < 10%
- R² > 0.85
- 95% CI coverage > 93%

---

### 3. Conversion Time Predictor

**Purpose**: Estimate time from lead to closed deal

**Features**:
- Lead quality score
- Financing complexity
- Property type
- Market velocity
- Investor experience level
- Communication frequency

**Model Type**: Survival Analysis (Cox Proportional Hazards)

**Output**:
- Expected days to close
- Probability distribution
- Risk factors
- Acceleration opportunities

**Retraining**: Bi-weekly

**Metrics**:
- Concordance Index > 0.72
- Calibration within 15%

---

### 4. Investor Match Model

**Purpose**: Match leads with ideal investor profiles

**Features**:
- Property characteristics
- Investment size
- Risk profile
- Geographic preferences
- Past investment history
- Response patterns

**Model Type**: Collaborative Filtering + Content-Based

**Output**:
- Top 5 investor matches
- Match scores (0-100)
- Match reasoning
- Alternative options

**Retraining**: Weekly

**Metrics**:
- Precision @ 5 > 0.60
- Mean Reciprocal Rank > 0.70

---

## Feature Store

### Technology Stack

**Options**:
1. **Feast** (Recommended for MVP)
   - Open source
   - Redis for online serving
   - S3/Parquet for offline storage

2. **Tecton** (Enterprise)
   - Managed service
   - Built-in monitoring
   - Advanced transformations

### Feature Categories

#### Entity: Lead
```yaml
lead_recency:
  type: float
  description: Days since lead created
  
lead_engagement_score:
  type: float
  description: 0-100 engagement score based on interactions
  
lead_source_quality:
  type: float
  description: Historical conversion rate for lead source
```

#### Entity: Property
```yaml
property_value_estimate:
  type: float
  description: Estimated property value in USD
  
neighborhood_appreciation_rate:
  type: float
  description: 12-month appreciation percentage
  
comparable_properties_count:
  type: int
  description: Number of similar properties in area
```

#### Entity: Investor
```yaml
investor_average_deal_size:
  type: float
  description: Average investment amount
  
investor_response_rate:
  type: float
  description: Percentage of opportunities responded to
  
investor_close_rate:
  type: float
  description: Percentage of deals closed
```

---

## Training Pipeline

### Infrastructure

```python
# training_pipeline.py
from feast import FeatureStore
import mlflow
import xgboost as xgb

def train_lead_scoring_model():
    # 1. Load features
    fs = FeatureStore(repo_path=".")
    features = fs.get_historical_features(
        entity_df=leads_df,
        features=[
            "lead_features:recency",
            "lead_features:engagement_score",
            "property_features:value_estimate"
        ]
    ).to_df()
    
    # 2. Train model
    model = xgb.XGBClassifier(...)
    model.fit(X_train, y_train)
    
    # 3. Evaluate
    metrics = evaluate_model(model, X_test, y_test)
    
    # 4. Register in MLflow
    with mlflow.start_run():
        mlflow.log_params(model.get_params())
        mlflow.log_metrics(metrics)
        mlflow.xgboost.log_model(model, "model")
        
        # Transition to production if better
        if metrics['auc'] > current_production_auc:
            client.transition_model_version_stage(
                name="lead_scoring",
                version=version,
                stage="Production"
            )
```

### Schedule

- **Daily**: Feature computation for online serving
- **Weekly**: Lead scoring, investor matching models
- **Bi-weekly**: Conversion time prediction
- **Monthly**: Property valuation model
- **Quarterly**: Full model architecture review

---

## Inference API

### Architecture

```
Client Request
    ↓
API Gateway (Rate Limiting, Auth)
    ↓
Model Serving (BentoML/TorchServe)
    ↓
Feature Store (Redis Cache)
    ↓
Response with Prediction
```

### Example Endpoint

**POST** `/api/v1/ml/score-lead`

```json
{
  "leadId": "lead_abc123"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "leadId": "lead_abc123",
    "score": 85,
    "confidence": 0.92,
    "factors": {
      "property_value": 0.35,
      "engagement_level": 0.28,
      "market_conditions": 0.22,
      "lead_source": 0.15
    },
    "recommendation": "high-priority",
    "predictedConversion": 0.68,
    "estimatedTimeToClose": 45,
    "modelVersion": "v1.2.3",
    "computedAt": "2025-10-27T07:46:34.325Z"
  }
}
```

### Performance SLAs

- **Latency**: p95 < 200ms
- **Throughput**: 100 req/sec
- **Availability**: 99.9%

---

## Monitoring & Drift Detection

### Key Metrics

1. **Model Performance**
   - Accuracy, AUC, precision, recall
   - Calibration error
   - Feature importance stability

2. **Data Quality**
   - Missing value rates
   - Outlier detection
   - Feature distribution shifts

3. **Business Metrics**
   - Prediction accuracy vs. actual outcomes
   - Impact on conversion rates
   - ROI of ML-driven decisions

### Drift Detection

```python
from evidently.dashboard import Dashboard
from evidently.tabs import DataDriftTab

def monitor_drift(reference_data, production_data):
    dashboard = Dashboard(tabs=[DataDriftTab()])
    dashboard.calculate(reference_data, production_data)
    
    if dashboard.get_drift_detected():
        trigger_retraining()
        notify_ml_team()
```

**Thresholds**:
- Feature drift: KS test p-value < 0.05
- Prediction drift: PSI > 0.2
- Performance degradation: AUC drop > 5%

**Actions**:
- Alert ML team
- Trigger immediate retraining
- Rollback to previous model version
- Investigate data pipeline

---

## Data Pipeline

### Collection

```python
# event_collector.py
import kafka
from datetime import datetime

def track_event(event_type, entity_id, properties):
    event = {
        "timestamp": datetime.utcnow().isoformat(),
        "eventType": event_type,
        "entityId": entity_id,
        "properties": properties,
        "source": "api"
    }
    
    # Send to Kafka
    producer.send('events', value=event)
    
    # Also store in data lake
    s3_client.put_object(
        Bucket='data-lake',
        Key=f'events/{date}/{event_id}.json',
        Body=json.dumps(event)
    )
```

### ETL Process

**Tool**: Apache Airflow or Prefect

**Daily DAG**:
1. Extract raw events from S3
2. Transform and clean data
3. Compute features
4. Update feature store
5. Generate data quality reports

---

## Security & Privacy

### Data Protection

- **PII Encryption**: All personal data encrypted at rest (AES-256)
- **Access Control**: Role-based access to ML features and models
- **Audit Logging**: All model predictions and feature accesses logged
- **Data Retention**: Automated deletion after retention period

### Model Security

- **Input Validation**: All inputs sanitized and validated
- **Rate Limiting**: Prevent model abuse
- **Model Versioning**: Track all model versions and deployments
- **A/B Testing**: Gradual rollout with safety checks

### Compliance

- **GDPR**: Right to explanation for automated decisions
- **Fair Lending**: Regular bias audits for protected classes
- **Model Cards**: Documentation of model capabilities and limitations

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
- [ ] Set up data lake (S3)
- [ ] Implement event tracking
- [ ] Create initial feature definitions
- [ ] Set up MLflow for experiment tracking

### Phase 2: First Model (Weeks 5-8)
- [ ] Build lead scoring model
- [ ] Deploy feature store (Feast + Redis)
- [ ] Create inference API
- [ ] Implement basic monitoring

### Phase 3: Additional Models (Weeks 9-16)
- [ ] Property valuation model
- [ ] Conversion time predictor
- [ ] Investor matching model
- [ ] Advanced monitoring and drift detection

### Phase 4: Production Hardening (Weeks 17-20)
- [ ] A/B testing framework
- [ ] Automated retraining pipeline
- [ ] Comprehensive dashboards
- [ ] Performance optimization

---

## Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Feature Store | Feast | Open source, Redis integration |
| Model Training | Python (scikit-learn, XGBoost) | Industry standard |
| Experiment Tracking | MLflow | Open source, comprehensive |
| Model Serving | BentoML | REST API, easy deployment |
| Orchestration | Apache Airflow | Workflow management |
| Monitoring | Evidently + Grafana | Drift detection, visualization |
| Data Lake | S3 + Parquet | Cost-effective, scalable |
| Online Cache | Redis | Low-latency feature serving |

---

## Cost Estimates

### AWS Infrastructure (Monthly)

- S3 Data Lake: $100
- Redis ElastiCache: $150
- EC2 for Model Training: $200
- API Gateway: $50
- CloudWatch: $30
- **Total**: ~$530/month

### SaaS Services (Monthly)

- MLflow (self-hosted): $0
- Feast (self-hosted): $0
- BentoML (self-hosted): $0
- **Total**: $0 (all open source)

### Alternative (Managed Services)

- Tecton: $1,500+/month
- SageMaker: $1,000+/month
- DataRobot: $3,000+/month

**Recommendation**: Start with open-source stack, migrate to managed services as scale increases.
