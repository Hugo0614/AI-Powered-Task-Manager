"""
数据库迁移脚本 - 添加 is_new 和 created_at 字段
"""
import sqlite3

DATABASE_PATH = "todos.db"

def migrate_database():
    """为现有数据库添加新字段"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    try:
        # 检查是否已经有这些字段
        cursor.execute("PRAGMA table_info(todos)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'is_new' not in columns:
            print("添加 is_new 字段...")
            cursor.execute("ALTER TABLE todos ADD COLUMN is_new BOOLEAN NOT NULL DEFAULT 0")
            print("✅ is_new 字段添加成功")
        else:
            print("✅ is_new 字段已存在")
        
        if 'created_at' not in columns:
            print("添加 created_at 字段...")
            cursor.execute("ALTER TABLE todos ADD COLUMN created_at TIMESTAMP")
            # 更新现有行的 created_at 为当前时间
            cursor.execute("UPDATE todos SET created_at = datetime('now')")
            print("✅ created_at 字段添加成功")
        else:
            print("✅ created_at 字段已存在")
        
        conn.commit()
        print("\n✅ 数据库迁移完成！")
    
    except Exception as e:
        print(f"❌ 迁移失败: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
