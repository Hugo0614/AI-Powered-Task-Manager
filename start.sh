#!/bin/bash

# AI 待办事项管理 - 一键启动脚本

echo "=========================================="
echo "🚀 AI 待办事项管理 - 启动中..."
echo "=========================================="

# 设置项目根目录
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VENV_PYTHON="$PROJECT_ROOT/.venv/bin/python"

# 检查虚拟环境
if [ ! -f "$VENV_PYTHON" ]; then
    echo "❌ 错误: 虚拟环境不存在"
    echo "请先创建虚拟环境: python3 -m venv .venv"
    exit 1
fi

# 设置默认 API Key（如果未设置）
if [ -z "$AI_API_KEY" ]; then
    export AI_API_KEY='sk-zk2288cfdc4cfed0a25c60de764ca3c2f2768ef75ada88ce'
    echo "✅ 已设置默认 AI_API_KEY"
fi

# 启动后端
echo ""
echo "📡 启动后端服务器..."
cd "$PROJECT_ROOT/backend"
AI_API_KEY="$AI_API_KEY" "$VENV_PYTHON" main.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ 后端已启动 (PID: $BACKEND_PID)"
cd "$PROJECT_ROOT"

# 等待后端启动
echo "⏳ 等待后端初始化..."
sleep 3

# 检查后端是否成功启动
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ 后端启动失败，查看日志: backend/backend.log"
    exit 1
fi

# 启动前端
echo ""
echo "🎨 启动前端开发服务器..."
cd "$PROJECT_ROOT/frontend"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ 前端已启动 (PID: $FRONTEND_PID)"
cd "$PROJECT_ROOT"

# 等待前端启动
sleep 2

echo ""
echo "=========================================="
echo "✅ 启动完成！"
echo "=========================================="
echo "📡 后端地址: http://localhost:8001"
echo "📚 API 文档: http://localhost:8001/docs"
echo "🎨 前端地址: http://localhost:5173"
echo "=========================================="
echo ""
echo "📝 日志文件:"
echo "   后端: backend/backend.log"
echo "   前端: frontend/frontend.log"
echo ""
echo "🛑 停止服务: ./stop.sh"
echo "   或直接运行: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "进程 ID:"
echo "   后端: $BACKEND_PID"
echo "   前端: $FRONTEND_PID"
echo ""

# 保存 PID 到文件
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo "✅ 所有服务已在后台运行"

# 捕获退出信号，清理进程
trap "echo ''; echo '🛑 停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# 保持脚本运行
wait
