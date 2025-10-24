"""
SQLite 数据库管理模块
负责初始化数据库、创建表、以及所有 CRUD 操作
"""

import sqlite3
from typing import List, Dict, Optional
from contextlib import contextmanager

DATABASE_PATH = "todos.db"

@contextmanager
def get_db_connection():
    """数据库连接上下文管理器"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # 允许通过列名访问
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

def init_database():
    """初始化数据库，创建 todos 表"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT 0
            )
        """)
    print("✅ 数据库初始化成功")

# ========== CRUD 操作 ==========

def get_all_todos() -> List[Dict]:
    """获取所有待办事项"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, text, completed FROM todos ORDER BY id DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_incomplete_todos() -> List[Dict]:
    """获取所有未完成的待办事项（用于 AI 日报）"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, text, completed FROM todos WHERE completed = 0 ORDER BY id DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_todo_by_id(todo_id: int) -> Optional[Dict]:
    """根据 ID 获取单个待办事项"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, text, completed FROM todos WHERE id = ?", (todo_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def create_todo(text: str) -> Dict:
    """创建新的待办事项"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO todos (text, completed) VALUES (?, 0)", (text,))
        new_id = cursor.lastrowid
        return {"id": new_id, "text": text, "completed": False}

def delete_todo(todo_id: int) -> bool:
    """删除待办事项"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM todos WHERE id = ?", (todo_id,))
        return cursor.rowcount > 0

def toggle_todo(todo_id: int) -> Optional[Dict]:
    """切换待办事项的完成状态"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        # 先获取当前状态
        cursor.execute("SELECT completed FROM todos WHERE id = ?", (todo_id,))
        row = cursor.fetchone()
        if not row:
            return None
        
        # 切换状态
        new_status = 0 if row["completed"] else 1
        cursor.execute("UPDATE todos SET completed = ? WHERE id = ?", (new_status, todo_id))
        
        # 返回更新后的数据
        cursor.execute("SELECT id, text, completed FROM todos WHERE id = ?", (todo_id,))
        updated_row = cursor.fetchone()
        return dict(updated_row) if updated_row else None

def update_todo_text(todo_id: int, new_text: str) -> Optional[Dict]:
    """更新待办事项的文本内容"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE todos SET text = ? WHERE id = ?", (new_text, todo_id))
        
        if cursor.rowcount == 0:
            return None
        
        # 返回更新后的数据
        cursor.execute("SELECT id, text, completed FROM todos WHERE id = ?", (todo_id,))
        updated_row = cursor.fetchone()
        return dict(updated_row) if updated_row else None

def create_bulk_todos(texts: List[str]) -> List[Dict]:
    """批量创建待办事项（用于 AI 任务分解）"""
    created_todos = []
    with get_db_connection() as conn:
        cursor = conn.cursor()
        for text in texts:
            cursor.execute("INSERT INTO todos (text, completed) VALUES (?, 0)", (text,))
            new_id = cursor.lastrowid
            created_todos.append({"id": new_id, "text": text, "completed": False})
    return created_todos
