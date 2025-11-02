# Database Module - Supabase Configuration

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "supabase_url" {
  description = "Supabase project URL"
  type        = string
}

variable "supabase_anon_key" {
  description = "Supabase anonymous key"
  type        = string
  sensitive   = true
}

# Database configuration
locals {
  db_config = {
    max_connections    = var.environment == "production" ? 100 : 20
    statement_timeout  = "30s"
    connection_timeout = "10s"
    idle_timeout       = "5m"
  }
  
  # Tables managed by this infrastructure
  managed_tables = [
    "leads",
    "opportunities", 
    "investors",
    "activities",
    "workflows",
    "workflow_executions",
    "audit_log"
  ]
}

# Database backup configuration
locals {
  backup_config = {
    enabled           = true
    schedule          = "0 2 * * *" # Daily at 2 AM
    retention_days    = var.environment == "production" ? 30 : 7
    backup_location   = "s3://hidden-key-investments-backups/${var.environment}"
  }
}

output "database_config" {
  description = "Database configuration"
  value = {
    environment   = var.environment
    url           = var.supabase_url
    max_connections = local.db_config.max_connections
    managed_tables  = local.managed_tables
  }
  sensitive = false
}

output "backup_config" {
  description = "Backup configuration"
  value       = local.backup_config
}
