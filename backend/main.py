"""
健壮的 AI 待办事项管理 - 后端 API (FastAPI)
支持 SQLite 持久化、完整 CRUD 操作、AI 日报生成、AI 任务分解
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import httpx
import os
from typing import List
import asyncio
import database

# ========== 初始化 ==========
app = FastAPI(title="Robust AI Todo API")

# 初始化 SQLite 数据库
database.init_database()

# CORS 配置（允许前端跨域请求）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== 数据模型 ==========
class TodoCreate(BaseModel):
    text: str

class TodoUpdate(BaseModel):
    text: str

class Todo(BaseModel):
    id: int
    text: str
    completed: bool

# ========== 辅助函数 ==========
def get_ai_api_key() -> str:
    """从环境变量获取 AI API Key"""
    api_key = os.getenv("AI_API_KEY", "")
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="服务器未配置 AI_API_KEY 环境变量，请在后端设置此密钥"
        )
    return api_key

# ========== 阶段 1: 基础 CRUD API 端点 ==========

@app.get("/")
async def root():
    """健康检查端点"""
    todos = database.get_all_todos()
    return {
        "message": "Robust AI Todo API is running with SQLite", 
        "todos_count": len(todos),
        "database": "SQLite (todos.db)"
    }

@app.get("/todos", response_model=List[Todo])
async def get_todos():
    """获取所有待办事项（从 SQLite）"""
    todos = database.get_all_todos()
    return todos

@app.post("/todos", response_model=Todo)
async def create_todo(todo: TodoCreate):
    """添加新的待办事项（保存到 SQLite）"""
    if not todo.text.strip():
        raise HTTPException(status_code=400, detail="待办事项内容不能为空")
    
    new_todo = database.create_todo(todo.text.strip())
    return new_todo

@app.delete("/todos/{todo_id}")
async def delete_todo(todo_id: int):
    """删除待办事项（从 SQLite）"""
    success = database.delete_todo(todo_id)
    if not success:
        raise HTTPException(status_code=404, detail="待办事项不存在")
    return {"message": "删除成功", "id": todo_id}

@app.put("/todos/{todo_id}/toggle", response_model=Todo)
async def toggle_todo(todo_id: int):
    """切换待办事项的完成状态（在 SQLite 中）"""
    updated_todo = database.toggle_todo(todo_id)
    if not updated_todo:
        raise HTTPException(status_code=404, detail="待办事项不存在")
    return updated_todo

# ========== 阶段 3: 编辑功能 ==========

@app.put("/todos/{todo_id}/text", response_model=Todo)
async def update_todo_text(todo_id: int, todo_update: TodoUpdate):
    """更新待办事项的文本内容（在 SQLite 中）"""
    if not todo_update.text.strip():
        raise HTTPException(status_code=400, detail="待办事项内容不能为空")
    
    updated_todo = database.update_todo_text(todo_id, todo_update.text.strip())
    if not updated_todo:
        raise HTTPException(status_code=404, detail="待办事项不存在")
    return updated_todo

# ========== 阶段 5: AI 功能 - 生成工作日报 ==========

@app.post("/generate-report")
async def generate_report():
    """生成工作日报（基于未完成的待办事项）"""
    api_key = get_ai_api_key()
    
    # 从 SQLite 获取所有未完成的任务
    incomplete_todos = database.get_incomplete_todos()
    
    if not incomplete_todos:
        return {"report": "🎉 太棒了！你已经完成了所有待办事项！"}
    
    # 构建待办事项文本
    todo_text = "\n".join([
        f"{i + 1}. {todo['text']}"
        for i, todo in enumerate(incomplete_todos)
    ])
    
    # 改进的 AI 提示词，确保列出所有待办事项
    request_body = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "system",
                "content": "你是一个工作总结助手。请根据用户提供的待办事项列表，生成一份简洁、专业的工作日报。日报必须包含：**待办事项：** 部分逐条列出所有待办事项，然后添加 **总结：** 和 **备注：** 部分。"
            },
            {
                "role": "user",
                "content": f"""请为以下待办事项生成工作日报，必须在 **待办事项：** 部分完整列出所有事项：

{todo_text}

请严格按照以下格式生成日报：

**工作日报**

**日期：** [今天的日期]

**待办事项：**

1. [第一项任务]
2. [第二项任务]
...

**总结：**
[简要总结今天的工作重点]

**备注：**
[添加任何额外的注释或特别事项]"""
            }
        ]
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.zhizengzeng.com/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                },
                json=request_body
            )
            response.raise_for_status()
            data = response.json()
            report_text = data["choices"][0]["message"]["content"]
            return {"report": report_text}
    
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"AI API 调用失败: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成日报失败: {str(e)}")

@app.post("/generate-report-stream")
async def generate_report_stream():
    """生成工作日报（流式输出）- 前端逐字显示"""
    api_key = get_ai_api_key()
    
    # 从 SQLite 获取所有未完成的任务
    incomplete_todos = database.get_incomplete_todos()
    
    if not incomplete_todos:
        # 非流式返回
        async def simple_generator():
            yield "🎉 太棒了！你已经完成了所有待办事项！"
        
        return StreamingResponse(
            simple_generator(),
            media_type="text/plain; charset=utf-8"
        )
    
    # 构建待办事项文本
    todo_text = "\n".join([
        f"{i + 1}. {todo['text']}"
        for i, todo in enumerate(incomplete_todos)
    ])
    
    # 流式生成器
    async def stream_generator():
        request_body = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "你是一个工作总结助手。请根据用户提供的待办事项列表，生成一份简洁、专业的工作日报。日报必须包含：**待办事项：** 部分逐条列出所有待办事项，然后添加 **总结：** 和 **备注：** 部分。"
                },
                {
                    "role": "user",
                    "content": f"""请为以下待办事项生成工作日报，必须在 **待办事项：** 部分完整列出所有事项：

{todo_text}

请严格按照以下格式生成日报：

**工作日报**

**日期：** [今天的日期]

**待办事项：**

1. [第一项任务]
2. [第二项任务]
...

**总结：**
[简要总结今天的工作重点]

**备注：**
[添加任何额外的注释或特别事项]"""
                }
            ],
            "stream": True  # 启用流式输出
        }
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream(
                    "POST",
                    "https://api.zhizengzeng.com/v1/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {api_key}"
                    },
                    json=request_body
                ) as response:
                    response.raise_for_status()
                    
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:]  # 移除 "data: " 前缀
                            
                            if data_str == "[DONE]":
                                break
                            
                            try:
                                import json
                                data = json.loads(data_str)
                                
                                if "choices" in data and len(data["choices"]) > 0:
                                    delta = data["choices"][0].get("delta", {})
                                    content = delta.get("content", "")
                                    
                                    if content:
                                        yield content
                                        await asyncio.sleep(0.01)  # 模拟打字效果
                            except json.JSONDecodeError:
                                continue
        
        except httpx.HTTPStatusError as e:
            yield f"\n\n❌ AI API 调用失败: {e.response.status_code}"
        except Exception as e:
            yield f"\n\n❌ 生成日报失败: {str(e)}"
    
    return StreamingResponse(
        stream_generator(),
        media_type="text/plain; charset=utf-8"
    )

# ========== 阶段 5: AI 功能 - 任务分解 ==========

@app.post("/todos/{todo_id}/breakdown")
async def breakdown_todo(todo_id: int):
    """使用 AI 将一个复杂任务分解为多个子任务"""
    api_key = get_ai_api_key()
    
    # 获取原任务
    todos = database.get_all_todos()
    original_todo = next((t for t in todos if t["id"] == todo_id), None)
    
    if not original_todo:
        raise HTTPException(status_code=404, detail="待办事项不存在")
    
    task_text = original_todo["text"]
    
    # AI 提示词
    request_body = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "system",
                "content": "你是一个任务规划专家。请将用户提供的复杂任务分解为 3-7 个具体的、可执行的子任务。每个子任务用一行表示，不要编号，不要多余的解释。"
            },
            {
                "role": "user",
                "content": f"请将以下任务分解为具体的子任务（每行一个，不要编号）：\n\n{task_text}"
            }
        ]
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.zhizengzeng.com/v1/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                },
                json=request_body
            )
            response.raise_for_status()
            data = response.json()
            ai_response = data["choices"][0]["message"]["content"]
            
            # 解析 AI 返回的子任务
            subtasks = []
            lines = ai_response.strip().split('\n')
            
            for line in lines:
                # 清理行内容（移除编号、前导空格等）
                cleaned = line.strip()
                # 移除常见的编号格式
                import re
                cleaned = re.sub(r'^\d+[\.\)、]\s*', '', cleaned)
                cleaned = re.sub(r'^[-•*]\s*', '', cleaned)
                
                if cleaned and len(cleaned) > 2:
                    subtasks.append(cleaned)
            
            # 批量添加子任务到数据库
            if subtasks:
                added_tasks = database.create_bulk_todos(subtasks)
                return {
                    "message": f"成功分解为 {len(added_tasks)} 个子任务",
                    "count": len(added_tasks),
                    "subtasks": added_tasks
                }
            else:
                raise HTTPException(status_code=500, detail="AI 未能生成有效的子任务")
    
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"AI API 调用失败: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"任务分解失败: {str(e)}")

# ========== 服务器启动 ==========
if __name__ == "__main__":
    import uvicorn
    
    # 检查环境变量
    api_key = os.getenv("AI_API_KEY", "")
    
    print("=" * 60)
    print("🚀 健壮的 AI 待办事项管理 - 后端服务器")
    print("=" * 60)
    print(f"💾 数据库: SQLite (todos.db)")
    if not api_key:
        print("⚠️  请先设置环境变量: export AI_API_KEY='your_api_key_here'")
    print(f"📡 API 文档地址: http://localhost:8001/docs")
    print(f"📡 后端运行在: http://localhost:8001")
    print("=" * 60)
    
    uvicorn.run(app, host="0.0.0.0", port=8001)
