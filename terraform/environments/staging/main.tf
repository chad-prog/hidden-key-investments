# Staging Environment Configuration

module "monitoring" {
  source = "../../modules/monitoring"
  
  environment  = "staging"
  sentry_dsn   = var.sentry_dsn
  project_name = "hidden-key-investments-staging"
}

module "database" {
  source = "../../modules/database"
  
  environment       = "staging"
  supabase_url      = var.supabase_url
  supabase_anon_key = var.supabase_anon_key
}

module "cicd" {
  source = "../../modules/cicd"
  
  environment       = "staging"
  github_repository = "chad-prog/hidden-key-investments"
}

module "networking" {
  source = "../../modules/networking"
  
  environment = "staging"
  domain_name = "staging.hidden-key-investments.com"
}

output "staging_config" {
  description = "Staging environment configuration"
  value = {
    monitoring = module.monitoring.monitoring_config
    database   = module.database.database_config
    cicd       = module.cicd.ci_config
    networking = module.networking.cdn_config
  }
}
