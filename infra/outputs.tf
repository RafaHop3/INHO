output "api_base_url" {
  description = "A URL base da sua API Serverless"
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "api_docs_url" {
  description = "A URL do Swagger UI do FastAPI"
  value       = "${aws_apigatewayv2_stage.default.invoke_url}docs"
}
