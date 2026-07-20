# build_lambda.ps1
# Script de build LOCAL para Windows/PowerShell.
# Use este script UMA VEZ para validar a infra manualmente.
# Após isso, o CI/CD (deploy.yml) assume o build automaticamente.
#
# Uso: .\build_lambda.ps1
# Requisito: Python 3.12 instalado e pip disponível no PATH

$ErrorActionPreference = "Stop"
$BackendPath = "$PSScriptRoot\backend"
$PackagePath = "$BackendPath\package"
$ZipPath     = "$BackendPath\lambda_package.zip"

Write-Host "==> Limpando build anterior..." -ForegroundColor Cyan
if (Test-Path $PackagePath) { Remove-Item $PackagePath -Recurse -Force }
if (Test-Path $ZipPath)     { Remove-Item $ZipPath -Force }

Write-Host "==> Instalando dependências no diretório package/..." -ForegroundColor Cyan
pip install --target $PackagePath -r "$BackendPath\requirements.txt"

Write-Host "==> Copiando código-fonte..." -ForegroundColor Cyan
Copy-Item -Path "$BackendPath\*.py" -Destination $PackagePath -Force

$Dirs = @("core", "db", "models", "routers", "schemas", "services", "migrations")
foreach ($dir in $Dirs) {
    $src = "$BackendPath\$dir"
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $PackagePath -Recurse -Force
        Write-Host "  Copiado: $dir" -ForegroundColor Gray
    }
}

Write-Host "==> Criando lambda_package.zip..." -ForegroundColor Cyan
Compress-Archive -Path "$PackagePath\*" -DestinationPath $ZipPath -Force

$size = (Get-Item $ZipPath).Length / 1MB
Write-Host "==> Pronto! lambda_package.zip criado ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
Write-Host ""
Write-Host "Próximo passo:" -ForegroundColor Yellow
Write-Host "  cd infra" -ForegroundColor Yellow
Write-Host "  terraform init" -ForegroundColor Yellow
Write-Host "  terraform apply" -ForegroundColor Yellow
