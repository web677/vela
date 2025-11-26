# 测试登录API

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  Vela 登录诊断工具" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# 测试API是否可访问
Write-Host "1. 测试API连接..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api" -Method GET -TimeoutSec 5
    Write-Host "   ✅ API可访问" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ API无法访问: $_" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "2. 尝试登录..." -ForegroundColor Yellow

# 登录请求
$loginBody = @{
    email    = "40792jr1nq@qq.com"
    password = "test123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -TimeoutSec 10

    Write-Host "   ✅ 登录成功!" -ForegroundColor Green
    Write-Host "   响应:" -ForegroundColor Gray
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   ❌ 登录失败 (状态码: $statusCode)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   错误详情:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  诊断建议:" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "如果看到401错误，可能原因：" -ForegroundColor Yellow
Write-Host "  1. 用户不存在 - 请先注册账号" -ForegroundColor White
Write-Host "  2. 密码错误 - 请检查密码" -ForegroundColor White
Write-Host "  3. Supabase配置问题 - 请检查.env文件" -ForegroundColor White
Write-Host ""
Write-Host "建议操作：" -ForegroundColor Yellow
Write-Host "  1. 访问 http://localhost:5173/register" -ForegroundColor White
Write-Host "  2. 注册一个新账号" -ForegroundColor White
Write-Host "  3. 然后使用新账号登录" -ForegroundColor White
Write-Host ""
