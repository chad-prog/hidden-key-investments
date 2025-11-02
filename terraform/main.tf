# Hidden Key Investments - Main Terraform Configuration
# Enterprise Infrastructure as Code

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    netlify = {
      source  = "netlify/netlify"
      version = "~> 0.1"
    }
    github = {
      source  = "integrations/github"
      version = "~> 5.0"
    }
  }

  # Backend configuration for state management
  # Uncomment and configure for production use
  # backend "s3" {
  #   bucket = "hidden-key-investments-terraform-state"
  #   key    = "infrastructure/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

# Variables
variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  default     = "dev"
}

variable "netlify_token" {
  description = "Netlify API token"
  type        = string
  sensitive   = true
}

variable "github_token" {
  description = "GitHub API token"
  type        = string
  sensitive   = true
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

variable "sentry_dsn" {
  description = "Sentry DSN for error tracking"
  type        = string
  sensitive   = true
  default     = ""
}

# Providers
provider "netlify" {
  token = var.netlify_token
}

provider "github" {
  token = var.github_token
}

# Outputs
output "environment" {
  description = "Current environment"
  value       = var.environment
}
