/**
 * TodoItem 组件 - 单个待办事项
 * 支持：显示、编辑、切换状态、删除、AI分解
 */

import { useState } from 'react'

function TodoItem({ todo, onToggle, onDelete, onUpdate, onBreakdown }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(todo.text)
  const [isBreaking, setIsBreaking] = useState(false)

  // 保存编辑
  const handleSave = async () => {
    if (editText.trim() && editText !== todo.text) {
      await onUpdate(todo.id, editText.trim())
    }
    setIsEditing(false)
  }

  // 取消编辑
  const handleCancel = () => {
    setEditText(todo.text)
    setIsEditing(false)
  }

  // AI 任务分解
  const handleBreakdown = async () => {
    setIsBreaking(true)
    try {
      await onBreakdown(todo.id)
    } finally {
      setIsBreaking(false)
    }
  }

  return (
    <li className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 transition-all group">
      {/* 复选框 */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer flex-shrink-0"
      />

      {/* 文本内容或编辑框 */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') handleCancel()
            }}
            className="w-full px-2 py-1 border border-indigo-400 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            autoFocus
          />
        ) : (
          <span
            className={`block truncate ${
              todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
            }`}
            onDoubleClick={() => !todo.completed && setIsEditing(true)}
            title="双击编辑"
          >
            {todo.text}
          </span>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-1 flex-shrink-0">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              ✓ 保存
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
            >
              ✕ 取消
            </button>
          </>
        ) : (
          <>
            {/* 编辑按钮 */}
            {!todo.completed && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                title="编辑"
              >
                ✏️ 编辑
              </button>
            )}

            {/* AI 分解按钮 */}
            {!todo.completed && (
              <button
                onClick={handleBreakdown}
                disabled={isBreaking}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  isBreaking
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
                title="AI 任务分解"
              >
                {isBreaking ? '⏳' : '🪄'} AI分解
              </button>
            )}

            {/* 删除按钮 */}
            <button
              onClick={() => onDelete(todo.id)}
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              title="删除"
            >
              🗑️ 删除
            </button>
          </>
        )}
      </div>
    </li>
  )
}

export default TodoItem
