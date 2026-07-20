# security.tf — REMOVED (Serverless Edition)
#
# Security Groups are a VPC construct. Since we no longer use a VPC,
# there are no Security Groups to manage.
#
# Security is now enforced at two layers:
#   1. IAM (infra/iam.tf)  — Lambda execution role, least-privilege
#   2. API Gateway         — CORS config defined in lambda.tf
#
# If you re-introduce a VPC in the future, restore Security Groups here.
