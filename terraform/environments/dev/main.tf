# Development Environment Configuration

module "monitoring" {
  source = "../../modules/monitoring"
  
  environment  = "dev"
  sentry_dsn   = var.sentry_dsn
  project_name = "hidden-key-investments-dev"
}

module "database" {
  source = "../../modules/database"
  
  environment       = "dev"
  supabase_url      = var.supabase_url
  supabase_anon_key = var.supabase_anon_key
}

module "cicd" {
  source = "../../modules/cicd"
  
  environment       = "dev"
  github_repository = "chad-prog/hidden-key-investments"
}

module "networking" {
  source = "../../modules/networking"
  
  environment = "dev"
  domain_name = "dev.hidden-key-investments.com"
}

output "dev_config" {
  description = "Development environment configuration"
  value = {
    monitoring = module.monitoring.monitoring_config
    database   = module.database.database_config
    cicd       = module.cicd.ci_config
    networking = module.networking.cdn_config
  }
}
