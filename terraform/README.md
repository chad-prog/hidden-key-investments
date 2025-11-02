# Terraform Infrastructure Documentation

## Overview

This directory contains Terraform configurations for managing the Hidden Key Investments platform infrastructure across multiple environments.

## Structure

```
terraform/
├── main.tf                    # Root configuration
├── modules/                   # Reusable modules
│   ├── monitoring/           # Sentry & observability
│   ├── database/             # Supabase configuration
│   ├── cicd/                 # GitHub Actions & deployment
│   └── networking/           # CDN & security
└── environments/             # Environment-specific configs
    ├── dev/
    ├── staging/
    └── production/
```

## Prerequisites

1. Install Terraform >= 1.0
2. Configure required credentials:
   - Netlify API token
   - GitHub API token
   - Supabase credentials
   - Sentry DSN (optional)

## Usage

### Initialize Terraform

```bash
cd terraform/environments/dev
terraform init
```

### Plan Changes

```bash
terraform plan \
  -var="netlify_token=$NETLIFY_TOKEN" \
  -var="github_token=$GITHUB_TOKEN" \
  -var="supabase_url=$SUPABASE_URL" \
  -var="supabase_anon_key=$SUPABASE_ANON_KEY" \
  -var="sentry_dsn=$SENTRY_DSN"
```

### Apply Changes

```bash
terraform apply \
  -var="netlify_token=$NETLIFY_TOKEN" \
  -var="github_token=$GITHUB_TOKEN" \
  -var="supabase_url=$SUPABASE_URL" \
  -var="supabase_anon_key=$SUPABASE_ANON_KEY" \
  -var="sentry_dsn=$SENTRY_DSN"
```

### Destroy Resources

```bash
terraform destroy \
  -var="netlify_token=$NETLIFY_TOKEN" \
  -var="github_token=$GITHUB_TOKEN" \
  -var="supabase_url=$SUPABASE_URL" \
  -var="supabase_anon_key=$SUPABASE_ANON_KEY"
```

## Modules

### Monitoring Module
Configures Sentry error tracking and observability settings.

**Outputs:**
- `monitoring_config` - Monitoring configuration
- `alert_channels` - Alert notification channels

### Database Module
Manages Supabase database configuration and backup policies.

**Outputs:**
- `database_config` - Database configuration
- `backup_config` - Backup settings

### CI/CD Module
Defines GitHub Actions workflows and deployment pipelines.

**Outputs:**
- `ci_config` - CI/CD configuration
- `build_config` - Build settings
- `security_config` - Security scanning configuration

### Networking Module
Configures CDN, security headers, and rate limiting.

**Outputs:**
- `cdn_config` - CDN configuration
- `security_headers` - Security headers
- `rate_limiting` - Rate limiting settings

## Environments

### Development
- **Purpose**: Local development and testing
- **Domain**: dev.hidden-key-investments.com
- **Features**: Full logging, demo mode enabled

### Staging
- **Purpose**: Pre-production testing
- **Domain**: staging.hidden-key-investments.com
- **Features**: Production-like configuration, lower rate limits

### Production
- **Purpose**: Live production environment
- **Domain**: hidden-key-investments.com
- **Features**: Optimized performance, strict security, backups enabled

## State Management

For production use, configure remote state storage:

1. Create S3 bucket for state storage
2. Update `main.tf` backend configuration
3. Run `terraform init -migrate-state`

## Best Practices

1. **Always run plan before apply**
2. **Use workspaces for environment isolation**
3. **Store secrets in secure locations** (GitHub Secrets, AWS Secrets Manager)
4. **Review changes in PR before merging**
5. **Document infrastructure changes**

## Troubleshooting

### Common Issues

**Issue**: Provider initialization fails
**Solution**: Ensure API tokens are correctly set

**Issue**: State lock timeout
**Solution**: Check for other active Terraform operations

**Issue**: Module not found
**Solution**: Run `terraform init` to download modules

## Security

- Never commit credentials to version control
- Use environment variables for sensitive data
- Enable state encryption
- Rotate API tokens regularly
- Review security group rules

## Support

For issues or questions:
- Review documentation in `/docs`
- Check GitHub issues
- Contact platform team

## Version History

- v1.0 - Initial infrastructure configuration
- Monitoring, Database, CI/CD, and Networking modules
- Multi-environment support (dev, staging, production)
