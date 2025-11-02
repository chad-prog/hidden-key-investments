# CI/CD Module - GitHub Actions & Deployment Configuration

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "github_repository" {
  description = "GitHub repository (owner/repo)"
  type        = string
  default     = "chad-prog/hidden-key-investments"
}

# CI/CD configuration
locals {
  ci_config = {
    test_coverage_threshold = 70
    lint_on_pr             = true
    auto_deploy_staging    = true
    auto_deploy_production = false
    require_approval       = var.environment == "production"
  }
  
  # Build configuration
  build_config = {
    node_version = "18"
    build_timeout = "15m"
    artifact_retention = var.environment == "production" ? 90 : 30
  }
  
  # Security scanning
  security_config = {
    dependency_scan = true
    secret_scan     = true
    code_scan       = true
    trivy_enabled   = true
    codeql_enabled  = true
  }
}

output "ci_config" {
  description = "CI/CD configuration"
  value       = local.ci_config
}

output "build_config" {
  description = "Build configuration"
  value       = local.build_config
}

output "security_config" {
  description = "Security scanning configuration"
  value       = local.security_config
}
