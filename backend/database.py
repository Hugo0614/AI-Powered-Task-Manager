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
                completed BOOLEAN NOT NULL DEFAULT 0,
                is_new BOOLEAN NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
    print("✅ 数据库初始化成功")

# ========== CRUD 操作 ==========

def get_all_todos() -> List[Dict]:
    """获取所有待办事项"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, text, completed, is_new, created_at,
                   (julianday('now') - julianday(created_at)) * 24 as hours_since_creation
            FROM todos 
            ORDER BY id DESC
        """)
        rows = cursor.fetchall()
        todos = []
        for row in rows:
            todo = dict(row)
            # Auto-expire 'is_new' flag after 1 hour
            hours = todo.get('hours_since_creation')
            if todo.get('is_new') and hours is not None and hours > 1:
                cursor.execute("UPDATE todos SET is_new = 0 WHERE id = ?", (todo['id'],))
                todo['is_new'] = False
            todos.append(todo)
        conn.commit()
        return todos

def get_incomplete_todos() -> List[Dict]:
    """获取所有未完成的待办事项（用于 AI 日报）"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, text, completed, is_new, created_at 
            FROM todos 
            WHERE completed = 0 
            ORDER BY id DESC
        """)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_todo_by_id(todo_id: int) -> Optional[Dict]:
    """根据 ID 获取单个待办事项"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, text, completed, is_new, created_at 
            FROM todos 
            WHERE id = ?
        """, (todo_id,))
        row = cursor.fetchone()
        return dict(row) if row else None

def create_todo(text: str) -> Dict:
    """创建新的待办事项"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO todos (text, completed, is_new) 
            VALUES (?, 0, 1)
        """, (text,))
        new_id = cursor.lastrowid
        return {"id": new_id, "text": text, "completed": False, "is_new": True}

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
        cursor.execute("""
            SELECT id, text, completed, is_new, created_at 
            FROM todos 
            WHERE id = ?
        """, (todo_id,))
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
        cursor.execute("""
            SELECT id, text, completed, is_new, created_at 
            FROM todos 
            WHERE id = ?
        """, (todo_id,))
        updated_row = cursor.fetchone()
        return dict(updated_row) if updated_row else None

def create_bulk_todos(texts: List[str]) -> List[Dict]:
    """批量创建待办事项（用于 AI 任务分解）"""
    created_todos = []
    with get_db_connection() as conn:
        cursor = conn.cursor()
        for text in texts:
            cursor.execute("""
                INSERT INTO todos (text, completed, is_new) 
                VALUES (?, 0, 1)
            """, (text,))
            new_id = cursor.lastrowid
            created_todos.append({"id": new_id, "text": text, "completed": False, "is_new": True})
    return created_todos

def delete_all_todos() -> int:
    """删除所有待办事项，返回删除的数量"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM todos")
        count = cursor.fetchone()[0]
        cursor.execute("DELETE FROM todos")
        return count
