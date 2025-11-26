# Windows Redis 快速启动脚本

# 1. 下载Redis（如果还没有）
# 访问：https://github.com/tporadowski/redis/releases
# 下载：Redis-x64-5.0.14.1.zip
# 解压到：C:\Redis

# 2. 启动Redis服务器
Write-Host "Starting Redis..." -ForegroundColor Green

if (Test-Path "C:\Redis\redis-server.exe") {
    Start-Process -FilePath "C:\Redis\redis-server.exe" -WindowStyle Normal
    Write-Host "Redis started successfully!" -ForegroundColor Green
    Write-Host "Keep this window open while using the app" -ForegroundColor Yellow
}
else {
    Write-Host "Redis not found at C:\Redis\" -ForegroundColor Red
    Write-Host "Please download from: https://github.com/tporadowski/redis/releases" -ForegroundColor Yellow
}
