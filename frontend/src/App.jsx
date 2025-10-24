/**
 * 健壮的 AI 待办事项管理 - 主应用组件
 * 包含：完整CRUD、筛选器、编辑功能、AI日报生成、AI任务分解
 */

import { useState, useEffect } from 'react'
import TodoItem from './components/TodoItem'

// API 基础 URL
const API_BASE = 'http://localhost:8001'

function App() {
  // ========== 状态管理 ==========
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'active' | 'completed'
  const [report, setReport] = useState('点击下方按钮生成工作日报...')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ========== 初始化加载 ==========
  useEffect(() => {
    fetchTodos()
  }, [])

  // ========== CRUD 功能 ==========

  // 获取所有待办事项
  const fetchTodos = async () => {
    try {
      const response = await fetch(`${API_BASE}/todos`)
      if (!response.ok) throw new Error('获取待办事项失败')
      const data = await response.json()
      setTodos(data)
      setError('')
    } catch (err) {
      setError(`❌ ${err.message}`)
      console.error('Fetch todos error:', err)
    }
  }

  // 添加新待办事项
  const addTodo = async () => {
    if (!inputValue.trim()) {
      alert('⚠️ 请输入待办事项内容！')
      return
    }

    try {
      const response = await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputValue })
      })
      
      if (!response.ok) throw new Error('添加失败')
      
      await fetchTodos() // 重新获取列表
      setInputValue('')
      setError('')
    } catch (err) {
      setError(`❌ ${err.message}`)
      console.error('Add todo error:', err)
    }
  }

  // 切换完成状态
  const toggleTodo = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/todos/${id}/toggle`, {
        method: 'PUT'
      })
      
      if (!response.ok) throw new Error('更新失败')
      
      await fetchTodos()
      setError('')
    } catch (err) {
      setError(`❌ ${err.message}`)
      console.error('Toggle todo error:', err)
    }
  }

  // 删除待办事项
  const deleteTodo = async (id) => {
    if (!confirm('确定要删除这个待办事项吗？')) return

    try {
      const response = await fetch(`${API_BASE}/todos/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('删除失败')
      
      await fetchTodos()
      setError('')
    } catch (err) {
      setError(`❌ ${err.message}`)
      console.error('Delete todo error:', err)
    }
  }

  // 更新待办事项文本
  const updateTodo = async (id, newText) => {
    try {
      const response = await fetch(`${API_BASE}/todos/${id}/text`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newText })
      })
      
      if (!response.ok) throw new Error('更新失败')
      
      await fetchTodos()
      setError('')
    } catch (err) {
      setError(`❌ ${err.message}`)
      console.error('Update todo error:', err)
    }
  }

  // ========== AI 功能 ==========

  // 生成工作日报（流式输出）
  const generateReport = async () => {
    setLoading(true)
    setReport('')
    setError('')

    try {
      const response = await fetch(`${API_BASE}/generate-report-stream`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('生成失败')
      }

      // 流式读取响应
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        accumulatedText += chunk
        setReport(accumulatedText)  // 实时更新显示
      }

    } catch (err) {
      setError(`❌ ${err.message}`)
      setReport('生成失败，请检查后端日志')
      console.error('Generate report error:', err)
    } finally {
      setLoading(false)
    }
  }

  // AI 任务分解
  const breakdownTask = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/todos/${id}/breakdown`, {
        method: 'POST'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'AI 分解失败')
      }

      const data = await response.json()
      alert(`✅ ${data.message}`)
      await fetchTodos() // 刷新列表以显示新的子任务
      setError('')
    } catch (err) {
      setError(`❌ ${err.message}`)
      alert(`AI 分解失败: ${err.message}`)
      console.error('Breakdown error:', err)
    }
  }

  // ========== 筛选逻辑 ==========
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true // 'all'
  })

  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  }

  // ========== 渲染 UI ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 标题 */}
        <h1 className="text-4xl font-bold text-center text-indigo-900 mb-2">
          ✨ 健壮的 AI 待办事项管理
        </h1>
        <p className="text-center text-gray-600 mb-8">
          💾 SQLite 持久化 | 🤖 AI 智能助手 | 🎯 完整功能
        </p>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* 后端连接状态 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              🔌 后端: <code className="bg-gray-100 px-2 py-1 rounded">{API_BASE}</code>
              {todos.length > 0 && <span className="ml-4 text-green-600">✅ 已连接</span>}
            </div>
            <div className="text-sm text-gray-600">
              📊 共 {stats.total} 项 | ⏳ 待办 {stats.active} | ✅ 完成 {stats.completed}
            </div>
          </div>
        </div>

        {/* 添加待办事项 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="输入新的待办事项...（按 Enter 快速添加）"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-base"
            />
            <button
              onClick={addTodo}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-sm"
            >
              ➕ 添加
            </button>
          </div>
        </div>

        {/* 筛选器按钮 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
          <div className="flex gap-2 justify-center">
            {[
              { value: 'all', label: '📋 全部', count: stats.total },
              { value: 'active', label: '⏳ 待办', count: stats.active },
              { value: 'completed', label: '✅ 已完成', count: stats.completed }
            ].map(({ value, label, count }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  filter === value
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* 待办事项列表 */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>
              {filter === 'all' && '📋 所有事项'}
              {filter === 'active' && '⏳ 待办事项'}
              {filter === 'completed' && '✅ 已完成事项'}
            </span>
            <span className="text-sm font-normal text-gray-500">
              (双击任务可编辑)
            </span>
          </h2>
          
          {filteredTodos.length === 0 ? (
            <p className="text-gray-400 text-center py-12 text-lg">
              {filter === 'all' && '暂无待办事项，快来添加一个吧！'}
              {filter === 'active' && '🎉 太棒了！没有待办事项了！'}
              {filter === 'completed' && '还没有完成任何事项'}
            </p>
          ) : (
            <ul className="space-y-3">
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onUpdate={updateTodo}
                  onBreakdown={breakdownTask}
                />
              ))}
            </ul>
          )}
        </div>

        {/* AI 工作日报 */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">🤖 AI 工作日报</h2>
            <button
              onClick={generateReport}
              disabled={loading || stats.active === 0}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors shadow-sm ${
                loading || stats.active === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {loading ? '🔄 生成中...' : '📝 生成日报'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 min-h-[120px] whitespace-pre-wrap text-gray-700 border border-gray-200 leading-relaxed">
            {report}
          </div>

          <p className="text-xs text-gray-500 mt-3">
            �� 提示：AI 会根据未完成的待办事项生成专业的工作日报
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
