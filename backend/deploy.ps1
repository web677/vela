# ========================================
# Vela Backend - Production Deployment Script (Windows)
# ========================================

Write-Host "🚀 Starting Vela Backend Deployment..." -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env and fill in your values." -ForegroundColor Yellow
    exit 1
}

# Load environment variables from .env
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^#].+?)=(.+)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

# Validate required environment variables
$requiredVars = @("SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "JWT_SECRET")

foreach ($var in $requiredVars) {
    if (-not [Environment]::GetEnvironmentVariable($var)) {
        Write-Host "❌ Error: $var is not set in .env file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Environment variables validated" -ForegroundColor Green
Write-Host ""

# Build and start containers
Write-Host "📦 Building Docker image..." -ForegroundColor Cyan
docker-compose build

Write-Host ""
Write-Host "🐳 Starting container..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "⏳ Waiting for service to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if service is running
$containerStatus = docker-compose ps | Select-String "Up"

if ($containerStatus) {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "Backend API: http://localhost:3000/api" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "View logs: docker-compose logs -f vela-api" -ForegroundColor Yellow
    Write-Host "Stop service: docker-compose down" -ForegroundColor Yellow
    Write-Host "=========================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed! Check logs:" -ForegroundColor Red
    docker-compose logs vela-api
    exit 1
}
