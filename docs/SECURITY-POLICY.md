# Security Policy & Compliance Guide

## Overview

This document outlines the security policies, compliance requirements, and best practices for the Hidden Key Investments platform.

## Security Principles

### 1. Defense in Depth
Multiple layers of security controls to protect data and systems.

### 2. Least Privilege
Users and systems have only the minimum permissions required.

### 3. Zero Trust
Never trust, always verify - authenticate and authorize all requests.

### 4. Security by Design
Security is built into every feature from the start, not added later.

## Data Classification

### Tier 1: Highly Sensitive
- Social Security Numbers (SSN)
- Bank account details
- Credit card information
- Investment account credentials
- Accreditation documents

**Protection**:
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Access logging and monitoring
- PCI-DSS compliance for payment data
- Regular security audits

### Tier 2: Sensitive
- Investor personal information (name, email, phone)
- Property addresses
- Financial projections
- Investment amounts
- Contract terms

**Protection**:
- Encryption at rest
- Encryption in transit
- Role-based access control
- Audit logging
- Data minimization

### Tier 3: Internal
- Analytics data
- System logs
- Performance metrics
- Non-identifying metadata

**Protection**:
- Access control
- Encryption in transit
- Log retention policies

### Tier 4: Public
- Marketing content
- Public property listings
- General information

**Protection**:
- Version control
- Content validation

## Authentication & Authorization

### User Authentication

**Methods**:
1. **Email/Password** (Primary)
   - Minimum password length: 12 characters
   - Password complexity requirements
   - bcrypt hashing (cost factor: 12)
   - Rate limiting on login attempts

2. **OAuth 2.0** (Planned)
   - Google
   - Microsoft
   - LinkedIn

3. **Multi-Factor Authentication** (Required for admin)
   - TOTP (Time-based One-Time Password)
   - SMS backup (with warnings about security)
   - Recovery codes

### API Authentication

**Current**: API Key-based
```http
X-API-Key: your_api_key_here
```

**Future**: OAuth 2.0 with JWT tokens
```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-Based Access Control (RBAC)

**Roles**:

1. **Super Admin**
   - Full system access
   - User management
   - Security configuration
   - Audit log access

2. **Admin**
   - Lead/opportunity/investor management
   - Workflow configuration
   - Report access
   - User support

3. **Portfolio Manager**
   - View all deals
   - Create opportunities
   - Manage investors
   - Run workflows

4. **Sales Rep**
   - Create leads
   - Update opportunities (assigned)
   - View investors (assigned)
   - Send communications

5. **Investor** (External)
   - View own profile
   - View assigned opportunities
   - Sign documents
   - View analytics (own portfolio)

6. **API Client**
   - Scoped permissions based on API key
   - Rate limited
   - Logged access

**Permission Matrix**:

| Resource | Super Admin | Admin | Portfolio Mgr | Sales Rep | Investor | API Client |
|----------|-------------|-------|---------------|-----------|----------|------------|
| Users | CRUD | R | R | R | - | - |
| Leads | CRUD | CRUD | CRUD | CRU | - | CR |
| Opportunities | CRUD | CRUD | CRUD | RU* | R* | CR |
| Investors | CRUD | CRUD | CRUD | R* | R* | CR |
| Workflows | CRUD | CRUD | R | - | - | R |
| Reports | R | R | R | R* | R* | - |
| Audit Logs | R | R | - | - | - | - |

\* = Only assigned records

## Data Protection

### Encryption

**At Rest**:
- Database: PostgreSQL with encryption enabled
- File storage: S3 with SSE (Server-Side Encryption)
- Backups: Encrypted with separate keys
- Secrets: AWS Secrets Manager or HashiCorp Vault

**In Transit**:
- HTTPS only (TLS 1.3, TLS 1.2 minimum)
- API calls: TLS with certificate pinning
- Database connections: SSL/TLS required
- No unencrypted traffic allowed

### Key Management

**Key Rotation**:
- API keys: Every 90 days (automated)
- Database encryption keys: Annually
- TLS certificates: Auto-renewed (Let's Encrypt)
- Service account keys: Every 180 days

**Key Storage**:
- Production keys: AWS Secrets Manager
- Development keys: 1Password or similar
- Never commit keys to git
- Use environment variables only

### Data Retention

| Data Type | Retention Period | After Retention |
|-----------|------------------|-----------------|
| Active leads | Indefinite | Archive after 2 years inactive |
| Closed opportunities | 7 years | Archive |
| Investor profiles | Life of relationship + 7 years | Delete PII, keep anonymized |
| Communications | 7 years | Archive |
| Audit logs | 7 years | Archive |
| Application logs | 90 days | Delete |
| Performance metrics | 2 years | Aggregate |

### Backup & Recovery

**Backup Schedule**:
- Database: Continuous (point-in-time recovery)
- Full backup: Daily at 2 AM UTC
- Incremental: Every 4 hours
- Off-site replication: Real-time to separate region

**Backup Testing**:
- Restore test: Monthly
- Disaster recovery drill: Quarterly
- Documentation: Updated after each test

**Recovery Time Objectives (RTO)**:
- Critical systems: 1 hour
- Non-critical systems: 4 hours
- Full system: 24 hours

**Recovery Point Objectives (RPO)**:
- Database: 5 minutes
- File storage: 1 hour
- Configuration: 24 hours

## Application Security

### Input Validation

**All inputs must be validated**:
1. Type checking (Zod schemas)
2. Length limits
3. Format validation (email, phone, etc.)
4. Sanitization (remove dangerous characters)
5. Business logic validation

**Example**:
```typescript
import { z } from 'zod';

const LeadInputSchema = z.object({
  email: z.string().email().max(255),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/).optional(),
  notes: z.string().max(5000).optional(),
});

// Validate before processing
const result = LeadInputSchema.safeParse(input);
if (!result.success) {
  throw new ValidationError(result.error.errors);
}
```

### Output Encoding

**Prevent XSS (Cross-Site Scripting)**:
- React: Automatic escaping
- API responses: JSON encoding
- Database queries: Parameterized queries only
- HTML generation: Use templating with auto-escaping

### SQL Injection Prevention

**Rules**:
1. Always use parameterized queries
2. Never concatenate user input into SQL
3. Use ORM (Prisma, TypeORM) when possible
4. Validate input before database operations

**Example**:
```javascript
// ❌ NEVER DO THIS
const query = `SELECT * FROM leads WHERE email = '${userInput}'`;

// ✅ DO THIS
const query = 'SELECT * FROM leads WHERE email = $1';
const result = await db.query(query, [userInput]);
```

### CSRF Protection

**Methods**:
- CSRF tokens for state-changing operations
- SameSite cookie attribute
- Verify Origin/Referer headers
- Use custom headers for AJAX

### Security Headers

**Required headers** (configured in netlify.toml):
```http
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## API Security

### Rate Limiting

**Limits by endpoint**:
- Authentication: 5 requests/minute
- Lead creation: 100 requests/hour
- Read operations: 1000 requests/hour
- Admin operations: 500 requests/hour

**Rate limit headers**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635345600
```

### API Key Management

**Generation**:
- Cryptographically random (32+ bytes)
- Hashed before storage (bcrypt)
- Associated with specific scopes

**Rotation**:
- Automated warnings 7 days before expiration
- Grace period: 7 days with both keys active
- Forced rotation after 90 days

**Revocation**:
- Immediate upon request
- Automatic after suspicious activity
- Logged in audit trail

## Compliance

### GDPR (General Data Protection Regulation)

**Rights**:
1. **Right to Access**: Provide all personal data on request
2. **Right to Rectification**: Allow correction of inaccurate data
3. **Right to Erasure**: Delete data upon request (with legal exceptions)
4. **Right to Portability**: Export data in machine-readable format
5. **Right to Object**: Stop processing for specific purposes
6. **Right to Explanation**: Explain automated decisions

**Implementation**:
- Data export API endpoint
- Data deletion workflow (with retention checks)
- Consent management system
- Privacy policy and notices
- Data Processing Agreements (DPA) with vendors

### CCPA (California Consumer Privacy Act)

**Requirements**:
- Privacy policy disclosure
- Right to know what data is collected
- Right to delete personal information
- Right to opt-out of data sales
- Non-discrimination for exercising rights

### Fair Lending Laws

**Compliance**:
- No discrimination based on protected classes
- Regular bias audits of ML models
- Documented decision criteria
- Adverse action notices when required

### SOC 2 Type II (Planned)

**Trust Service Criteria**:
1. Security
2. Availability
3. Processing Integrity
4. Confidentiality
5. Privacy

**Preparation**:
- Document all security controls
- Implement continuous monitoring
- Regular third-party audits
- Employee security training

## Incident Response

### Incident Classification

**Severity Levels**:

**P0 - Critical**:
- Data breach
- Complete service outage
- Security breach with active exploit
- **Response Time**: Immediate
- **Communication**: All stakeholders within 1 hour

**P1 - High**:
- Partial service outage
- Security vulnerability discovered
- Data integrity issue
- **Response Time**: 30 minutes
- **Communication**: Key stakeholders within 2 hours

**P2 - Medium**:
- Performance degradation
- Non-critical feature broken
- **Response Time**: 2 hours
- **Communication**: Daily updates

**P3 - Low**:
- Minor bugs
- UI issues
- **Response Time**: Next business day
- **Communication**: As needed

### Response Process

1. **Detection**: Monitoring alerts, user reports, security scans
2. **Triage**: Assess severity, impact, and scope
3. **Containment**: Stop the bleeding, isolate affected systems
4. **Investigation**: Root cause analysis, evidence collection
5. **Eradication**: Remove threat, patch vulnerabilities
6. **Recovery**: Restore services, verify integrity
7. **Lessons Learned**: Post-mortem, update playbooks

### Data Breach Response

**Within 1 hour**:
- Activate incident response team
- Contain the breach
- Preserve evidence

**Within 24 hours**:
- Complete initial assessment
- Notify management
- Begin remediation

**Within 72 hours** (GDPR requirement):
- Notify supervisory authority if PII affected
- Notify affected individuals if high risk
- Document incident

### Communication Plan

**Internal**:
- Incident commander
- Engineering team
- Legal
- Executive team

**External**:
- Affected customers (as required)
- Regulatory authorities (as required)
- Public statement (if warranted)

## Security Monitoring

### Logging

**What to log**:
- Authentication attempts (success/failure)
- Authorization failures
- API calls (with correlation IDs)
- Data access (PII reads/writes)
- Configuration changes
- Security events (suspicious activity)

**Log Format** (JSON):
```json
{
  "timestamp": "2025-10-27T07:46:34.325Z",
  "level": "info",
  "correlationId": "uuid",
  "userId": "user_123",
  "action": "lead.create",
  "result": "success",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "metadata": {}
}
```

**Log Retention**:
- Security logs: 7 years
- Application logs: 90 days
- Access logs: 1 year

### Monitoring & Alerts

**Critical Alerts**:
- Multiple failed login attempts (> 5 in 5 minutes)
- API rate limit exceeded (> 150% of limit)
- Unusual data access patterns
- Error rate spike (> 5% of requests)
- Unauthorized access attempts

**Monitoring Tools**:
- Sentry: Error tracking
- Datadog/Grafana: Metrics and dashboards
- CloudWatch: AWS infrastructure
- Supabase: Database monitoring

### Vulnerability Management

**Scanning**:
- Dependency scanning: Daily (GitHub Dependabot)
- Container scanning: On every build (Trivy)
- SAST: On every PR (CodeQL)
- DAST: Weekly (OWASP ZAP)
- Penetration testing: Annually

**Patch Management**:
- Critical vulnerabilities: Within 24 hours
- High vulnerabilities: Within 7 days
- Medium vulnerabilities: Within 30 days
- Low vulnerabilities: Next release cycle

## Security Training

### Onboarding

**All employees**:
- Security awareness training
- Password management
- Phishing recognition
- Incident reporting

**Developers**:
- Secure coding practices
- OWASP Top 10
- API security
- Code review guidelines

**Admins**:
- Access management
- Incident response
- Compliance requirements

### Ongoing Training

- Quarterly security updates
- Annual refresher training
- Simulated phishing exercises
- Security newsletters

## Third-Party Security

### Vendor Assessment

**Requirements**:
1. SOC 2 Type II certification (preferred)
2. GDPR/CCPA compliance
3. Security questionnaire completion
4. Data Processing Agreement (DPA)
5. Regular security audits

**Critical Vendors**:
- Netlify (hosting)
- Supabase (database)
- SendGrid (email)
- Sentry (monitoring)
- AWS (infrastructure)

### API Integration Security

**Requirements**:
- OAuth 2.0 or API key authentication
- TLS for all communications
- Input validation on all responses
- Rate limiting
- Circuit breakers for failures
- Monitoring and logging

## Checklist for New Features

**Before Development**:
- [ ] Threat model completed
- [ ] Security requirements defined
- [ ] Data classification determined
- [ ] Privacy impact assessed

**During Development**:
- [ ] Input validation implemented
- [ ] Output encoding applied
- [ ] Authentication/authorization added
- [ ] Error handling (no sensitive data in errors)
- [ ] Logging added (with PII masking)
- [ ] Tests include security scenarios

**Before Deployment**:
- [ ] Security review completed
- [ ] Vulnerability scan passed
- [ ] Penetration test performed (if high risk)
- [ ] Documentation updated
- [ ] Monitoring/alerts configured
- [ ] Rollback plan documented

## Security Contacts

- **Security Team**: security@hiddenkey.io
- **Bug Bounty**: bugbounty@hiddenkey.io (when available)
- **Emergency**: security-emergency@hiddenkey.io (24/7)

## Version History

- v1.0 (2025-10-27): Initial security policy
- Updates: Quarterly or after major incidents
