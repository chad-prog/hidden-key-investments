# Networking Module - CDN & Security Configuration

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "domain_name" {
  description = "Primary domain name"
  type        = string
  default     = "hidden-key-investments.com"
}

# Networking configuration
locals {
  cdn_config = {
    enable_cdn          = true
    cache_control       = "public, max-age=31536000, immutable"
    compression_enabled = true
    http2_enabled       = true
    http3_enabled       = true
  }
  
  security_headers = {
    strict_transport_security = "max-age=31536000; includeSubDomains"
    content_security_policy   = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
    x_frame_options          = "DENY"
    x_content_type_options   = "nosniff"
    x_xss_protection         = "1; mode=block"
  }
  
  rate_limiting = {
    enabled         = true
    requests_per_minute = var.environment == "production" ? 1000 : 100
    burst_size          = var.environment == "production" ? 200 : 50
  }
}

output "cdn_config" {
  description = "CDN configuration"
  value       = local.cdn_config
}

output "security_headers" {
  description = "Security headers"
  value       = local.security_headers
}

output "rate_limiting" {
  description = "Rate limiting configuration"
  value       = local.rate_limiting
}
