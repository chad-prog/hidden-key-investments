# Monitoring Module - Sentry & Observability Configuration

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "sentry_dsn" {
  description = "Sentry DSN"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "hidden-key-investments"
}

# Monitoring configuration
locals {
  monitoring_config = {
    sentry_enabled          = var.sentry_dsn != ""
    traces_sample_rate      = var.environment == "production" ? 0.1 : 1.0
    profiles_sample_rate    = var.environment == "production" ? 0.1 : 1.0
    error_reporting_enabled = true
    performance_monitoring  = true
  }
  
  alert_channels = {
    email = "alerts@hidden-key-investments.com"
    slack = "" # Configure Slack webhook if needed
  }
}

output "monitoring_config" {
  description = "Monitoring configuration"
  value = {
    sentry_enabled = local.monitoring_config.sentry_enabled
    environment    = var.environment
    project_name   = var.project_name
  }
}

output "alert_channels" {
  description = "Alert notification channels"
  value       = local.alert_channels
}
