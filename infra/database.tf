# database.tf — REMOVED (Serverless Edition)
#
# The database is now managed externally by Neon.tech (or Supabase).
# Both offer serverless PostgreSQL with a free tier and scale-to-zero.
#
# Configuration:
#   1. Create a free account at https://neon.tech
#   2. Create a project and a database named "inho_db"
#   3. In the Neon dashboard, under "Connection Details", select:
#      → Connection type: Pooled connection (PgBouncer)
#      → This gives you a URL on port 6543 (NOT 5432)
#   4. Copy that pooled URL and set:
#      - Locally:     DATABASE_URL=postgresql+asyncpg://... in backend/.env
#      - Terraform:   database_url = "postgresql+asyncpg://..." in infra/terraform.tfvars
#      - CI/CD:       TF_VAR_database_url GitHub Secret
#
# ⚠️  IMPORTANT: Always use the Pooled URL (port 6543).
# Lambda can spawn 500+ concurrent instances. The pooled URL uses PgBouncer
# to multiplex them into a small set of real DB connections, preventing
# connection exhaustion on your Neon/Supabase instance.
