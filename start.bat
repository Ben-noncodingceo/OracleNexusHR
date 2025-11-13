@echo off
chcp 65001 >nul
cls

echo ========================================
echo 🔮 八字命理分析系统启动脚本
echo ========================================
echo.

REM 检查 Node.js 是否已安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未找到 Node.js
    echo 请先安装 Node.js ^(版本 ^>= 14.0.0^)
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i

echo ✅ Node.js 版本: %NODE_VERSION%
echo ✅ npm 版本: %NPM_VERSION%
echo.

REM 检查是否存在 node_modules
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
    echo.
) else (
    echo ✅ 依赖已安装
    echo.
)

REM 启动服务器
echo 🚀 正在启动服务器并打开浏览器...
echo.
echo 💡 提示: 按 Ctrl+C 可以停止服务器
echo.

call npm run launch

pause
