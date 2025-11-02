# Production Environment Configuration

module "monitoring" {
  source = "../../modules/monitoring"
  
  environment  = "production"
  sentry_dsn   = var.sentry_dsn
  project_name = "hidden-key-investments"
}

module "database" {
  source = "../../modules/database"
  
  environment       = "production"
  supabase_url      = var.supabase_url
  supabase_anon_key = var.supabase_anon_key
}

module "cicd" {
  source = "../../modules/cicd"
  
  environment       = "production"
  github_repository = "chad-prog/hidden-key-investments"
}

module "networking" {
  source = "../../modules/networking"
  
  environment = "production"
  domain_name = "hidden-key-investments.com"
}

output "production_config" {
  description = "Production environment configuration"
  value = {
    monitoring = module.monitoring.monitoring_config
    database   = module.database.database_config
    cicd       = module.cicd.ci_config
    networking = module.networking.cdn_config
  }
}
