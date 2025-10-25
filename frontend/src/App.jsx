/**
 * 健壮的 AI 待办事项管理 - 主应用组件
 * 包含：完整CRUD、筛选器、编辑功能、AI日报生成、AI任务分解、多语言支持
 */

import { useState, useEffect } from 'react'
import TodoItem from './components/TodoItem'
import { useTranslation } from './translations'

// API 基础 URL
const API_BASE = 'http://localhost:8001'

function App() {
  // ========== 状态管理 ==========
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'active' | 'completed'
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [language, setLanguage] = useState(() => {
    // 从 localStorage 读取语言设置，默认简体中文
    return localStorage.getItem('language') || 'simplified'
  })
  
  const t = useTranslation(language)
  
  // 当语言改变时保存到 localStorage
  useEffect(() => {
    localStorage.setItem('language', language)
    setReport(t.reportPlaceholder)
  }, [language, t.reportPlaceholder])

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
      alert(t.emptyWarning)
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
    if (!confirm(t.deleteConfirm)) return

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

  // 删除所有待办事项
  const deleteAllTodos = async () => {
    if (!confirm(t.deleteAllConfirm)) return

    try {
      const response = await fetch(`${API_BASE}/todos`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('删除失败')
      
      const data = await response.json()
      await fetchTodos()
      setError('')
      alert(`✅ ${data.message}`)
    } catch (err) {
      setError(`❌ ${err.message}`)
      console.error('Delete all todos error:', err)
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language })
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

  // 获取当前日期（格式化为中文）
  const getCurrentDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  }

  // ========== 渲染 UI ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 标题和语言选择器 */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-4xl font-bold text-indigo-900">
              {t.appTitle}
            </h1>
            <p className="text-sm text-gray-500 mt-1">📅 {getCurrentDate()}</p>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <span className="text-sm text-gray-600">{t.language}:</span>
            <button
              onClick={() => setLanguage('simplified')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                language === 'simplified'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.languageSimplified}
            </button>
            <button
              onClick={() => setLanguage('traditional')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                language === 'traditional'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.languageTraditional}
            </button>
          </div>
        </div>
        
        <p className="text-center text-gray-600 mb-8">
          {t.appSubtitle}
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
              🔌 {t.backend}: <code className="bg-gray-100 px-2 py-1 rounded">{API_BASE}</code>
              {todos.length > 0 && <span className="ml-4 text-green-600">✅ {t.connected}</span>}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                📊 {t.totalItems} {stats.total} {t.items} | ⏳ {t.pending} {stats.active} | ✅ {t.completed} {stats.completed}
              </div>
              {stats.total > 0 && (
                <button
                  onClick={deleteAllTodos}
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-semibold shadow-sm"
                  title={t.deleteAllConfirm}
                >
                  {t.deleteAllButton}
                </button>
              )}
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
              placeholder={t.inputPlaceholder}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-base"
            />
            <button
              onClick={addTodo}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-sm"
            >
              {t.addButton}
            </button>
          </div>
        </div>

        {/* 筛选器按钮 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
          <div className="flex gap-2 justify-center">
            {[
              { value: 'all', label: t.filterAll, count: stats.total },
              { value: 'active', label: t.filterActive, count: stats.active },
              { value: 'completed', label: t.filterCompleted, count: stats.completed }
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
              {filter === 'all' && t.allItems}
              {filter === 'active' && t.activeItems}
              {filter === 'completed' && t.completedItems}
            </span>
            <span className="text-sm font-normal text-gray-500">
              {t.doubleClickHint}
            </span>
          </h2>
          
          {filteredTodos.length === 0 ? (
            <p className="text-gray-400 text-center py-12 text-lg">
              {filter === 'all' && t.noTodos}
              {filter === 'active' && t.noActive}
              {filter === 'completed' && t.noCompleted}
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
                  language={language}
                />
              ))}
            </ul>
          )}
        </div>

        {/* AI 工作日报 */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">{t.aiReport}</h2>
            <button
              onClick={generateReport}
              disabled={loading || stats.total === 0}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors shadow-sm ${
                loading || stats.total === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {loading ? t.generating : t.generateReport}
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-5 min-h-[120px] whitespace-pre-wrap text-gray-700 border border-gray-200 leading-relaxed">
            {report}
          </div>

          <p className="text-xs text-gray-500 mt-3">
            {t.reportHint}
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
