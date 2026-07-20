resource "aws_lambda_function" "api" {
  function_name    = "${var.project_name}-api"
  filename         = "../backend/lambda_package.zip"
  source_code_hash = filebase64sha256("../backend/lambda_package.zip")
  handler          = "main.handler" # Aponta para a variável Mangum no main.py
  runtime          = "python3.12"
  role             = aws_iam_role.lambda_exec.arn
  timeout          = 30 # Tempo máximo em segundos
  memory_size      = 512 # RAM do Lambda

  environment {
    variables = {
      DATABASE_URL = var.database_url
      SECRET_KEY   = var.secret_key
      FRONTEND_URL = var.frontend_url
      APP_ENV      = var.environment
    }
  }
}

# API Gateway (HTTP API - Mais rápida e barata que a REST API)
resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project_name}-http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [var.frontend_url, "http://localhost:3000"]
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.api.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Permissão para o API Gateway chamar o Lambda
resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}
