@echo off
echo ========================================
echo 🚀 Vela 项目启动脚本
echo ========================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo ✅ Node.js 版本:
node --version
echo.

REM 检查后端 .env 文件
if not exist "backend\.env" (
    echo ⚠️  后端 .env 文件不存在，正在复制模板...
    copy "backend\.env.example" "backend\.env"
    echo.
    echo ⚠️  请编辑 backend\.env 文件并填入 Supabase 凭证
    echo 按任意键打开 .env 文件...
    pause >nul
    notepad "backend\.env"
)

REM 检查前端 .env.local 文件
if not exist "frontend\.env.local" (
    echo ⚠️  前端 .env.local 文件不存在，正在复制模板...
    copy "frontend\.env.example" "frontend\.env.local"
)

echo.
echo ========================================
echo 📦 安装依赖（如需要）
echo ========================================
echo.

REM 检查后端依赖
if not exist "backend\node_modules" (
    echo 正在安装后端依赖...
    cd backend
    call npm install
    cd ..
    echo ✅ 后端依赖安装完成
) else (
    echo ✅ 后端依赖已存在
)

REM 检查前端依赖
if not exist "frontend\node_modules" (
    echo 正在安装前端依赖...
    cd frontend
    call npm install
    cd ..
    echo ✅ 前端依赖安装完成
) else (
    echo ✅ 前端依赖已存在
)

echo.
echo ========================================
echo 🚀 启动服务
echo ========================================
echo.
echo 正在启动后端服务器（新窗口）...
start "Vela Backend" cmd /k "cd backend && npm run start:dev"

timeout /t 3 /nobreak >nul

echo 正在启动前端服务器（新窗口）...
start "Vela Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo ✅ 服务启动完成！
echo ========================================
echo.
echo 后端 API: http://localhost:3000/api
echo 前端应用: http://localhost:5173
echo.
echo 提示：
echo - 两个服务将在新窗口中运行
echo - 按 Ctrl+C 可以停止各自的服务
echo - 关闭窗口将停止对应的服务
echo.
echo ========================================

pause
