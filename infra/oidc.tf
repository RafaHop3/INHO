# ══════════════════════════════════════════════════════════════════
# infra/oidc.tf
# Configura o GitHub como um Provedor de Identidade Confiável na AWS.
# Rode terraform apply UMA VEZ localmente (com credenciais admin) para
# gerar o AWS_OIDC_ROLE_ARN que o pipeline do GitHub Actions precisa.
#
# ATENÇÃO: Substitua SEU-USUARIO/SEU-REPOSITORIO abaixo pelo nome
# exato do seu repositório no GitHub antes de rodar o apply.
# ══════════════════════════════════════════════════════════════════

# Configura o GitHub como um Provedor de Identidade Confiável na sua conta AWS
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["1c58a3a8518e8759bf075b76b750d4f2df264fcd", "6938fd4d98bab03faadb97b34396831e3780aea1"]
}

# Cria a Role que o GitHub Actions vai assumir
resource "aws_iam_role" "github_actions_role" {
  name = "${var.project_name}-github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRoleWithWebIdentity"
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.github.arn
      }
      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          # ATENÇÃO: Substitua pelo seu repositório exato para impedir que outros repos assumam a role
          "token.actions.githubusercontent.com:sub" = "repo:SEU-USUARIO/SEU-REPOSITORIO:*"
        }
      }
    }]
  })
}

# Permissão para o Terraform rodar (Nível Administrativo para provisionar infraestrutura)
resource "aws_iam_role_policy_attachment" "github_actions_admin" {
  role       = aws_iam_role.github_actions_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

# Imprime o ARN no console para você copiar para o GitHub Secrets
output "aws_oidc_role_arn" {
  value = aws_iam_role.github_actions_role.arn
}
