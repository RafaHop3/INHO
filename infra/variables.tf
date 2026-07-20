variable "aws_region" {
  default = "us-east-1"
}

variable "project_name" {
  default = "inho"
}

variable "environment" {
  default = "production"
}

variable "database_url" {
  description = "A URL do Neon.tech (deve usar a porta 6543 / PgBouncer)"
  type        = string
  sensitive   = true
}

variable "secret_key" {
  description = "Chave secreta para assinar os JWTs"
  type        = string
  sensitive   = true
}

variable "frontend_url" {
  description = "URL do frontend no Vercel/Netlify para CORS"
  type        = string
}
