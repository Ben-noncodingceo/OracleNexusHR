#!/bin/bash

# 八字命理分析系统启动脚本

echo "========================================"
echo "🔮 八字命理分析系统启动脚本"
echo "========================================"
echo ""

# 检查 Node.js 是否已安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请先安装 Node.js (版本 >= 14.0.0)"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"
echo "✅ npm 版本: $(npm -v)"
echo ""

# 检查是否存在 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
    echo ""
else
    echo "✅ 依赖已安装"
    echo ""
fi

# 启动服务器
echo "🚀 正在启动服务器并打开浏览器..."
echo ""
echo "💡 提示: 按 Ctrl+C 可以停止服务器"
echo ""

# 使用 npm run launch 来启动服务器并自动打开浏览器
npm run launch
