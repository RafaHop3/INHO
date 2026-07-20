# compute.tf — REMOVED (Serverless Edition)
#
# ECS Fargate, ECR, and the Application Load Balancer have been replaced by:
#   - AWS Lambda  (infra/lambda.tf)
#   - API Gateway HTTP API (infra/lambda.tf)
#
# The deployment artifact is now a .zip file built by CI/CD,
# not a Docker image pushed to ECR.
