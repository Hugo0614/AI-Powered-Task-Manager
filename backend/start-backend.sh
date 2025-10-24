#!/bin/bash

# AI 待办事项管理 - 后端启动脚本 (适配 Linux 系统)

echo "=========================================="
echo "🚀 启动后端服务器"
echo "=========================================="

# 检查 AI_API_KEY 环境变量
if [ -z "$AI_API_KEY" ]; then
    echo "⚠️  警告: AI_API_KEY 环境变量未设置"
    echo "请运行: export AI_API_KEY='your_api_key_here'"
    echo ""
    echo "💡 我看到你可能设置了 API_API_KEY，应该是 AI_API_KEY"
    echo ""
fi

# 检查是否已安装依赖
echo "📦 检查并安装依赖..."

# 尝试使用虚拟环境（如果已安装 python3-venv）
if command -v python3 &> /dev/null; then
    if [ ! -d "venv" ]; then
        echo "🔧 尝试创建虚拟环境..."
        if python3 -m venv venv 2>/dev/null; then
            echo "✅ 虚拟环境创建成功"
            source venv/bin/activate
            pip install -r requirements.txt
        else
            echo "⚠️  无法创建虚拟环境，使用 --user 安装"
            pip3 install --user -r requirements.txt 2>/dev/null || \
            pip3 install --break-system-packages -r requirements.txt
        fi
    else
        echo "✅ 使用现有虚拟环境"
        source venv/bin/activate
    fi
else
    echo "❌ 未找到 python3，请安装 Python 3"
    exit 1
fi

echo ""
echo "=========================================="
echo "🚀 启动 FastAPI 服务器..."
echo "=========================================="
echo "📡 后端地址: http://localhost:8000"
echo "📚 API 文档: http://localhost:8000/docs"
echo "=========================================="
echo ""

# 使用 python3 而不是 python
if [ -f "venv/bin/python" ]; then
    venv/bin/python main.py
else
    python3 main.py
fi
