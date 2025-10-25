/**
 * 语言翻译工具
 * 支持简体中文和繁体中文
 */

export const translations = {
  simplified: {
    // App title and subtitle
    appTitle: "✨ 健壮的 AI 待办事项管理",
    appSubtitle: "💾 SQLite 持久化 | 🤖 AI 智能助手 | 🎯 完整功能",
    
    // Connection status
    backend: "后端",
    connected: "已连接",
    totalItems: "共",
    pending: "待办",
    completed: "完成",
    
    // Input and buttons
    inputPlaceholder: "输入新的待办事项...（按 Enter 快速添加）",
    addButton: "➕ 添加",
    
    // Filters
    filterAll: "📋 全部",
    filterActive: "⏳ 待办",
    filterCompleted: "✅ 已完成",
    
    // List headers
    allItems: "📋 所有事项",
    activeItems: "⏳ 待办事项",
    completedItems: "✅ 已完成事项",
    doubleClickHint: "(双击任务可编辑)",
    
    // Empty states
    noTodos: "暂无待办事项，快来添加一个吧！",
    noActive: "🎉 太棒了！没有待办事项了！",
    noCompleted: "还没有完成任何事项",
    
    // AI Report
    aiReport: "🤖 AI 工作日报",
    generateReport: "📝 生成日报",
    generating: "🔄 生成中...",
    reportHint: "💡 提示：AI 会根据所有待办事项生成专业的工作日报",
    reportPlaceholder: "点击下方按钮生成工作日报...",
    
    // TodoItem
    edit: "✏️ 编辑",
    save: "✓ 保存",
    cancel: "✕ 取消",
    delete: "🗑️ 删除",
    aiBreakdown: "🪄 AI分解",
    editHint: "双击编辑",
    
    // Alerts and confirmations
    emptyWarning: "⚠️ 请输入待办事项内容！",
    deleteConfirm: "确定要删除这个待办事项吗？",
    deleteAllConfirm: "⚠️ 确定要删除所有待办事项吗？此操作无法撤销！",
    deleteAllButton: "🗑️ 删除全部",
    deleteAllSuccess: "成功删除所有待办事项",
    
    // Language selector
    language: "语言",
    languageSimplified: "简体中文",
    languageTraditional: "繁體中文",
    
    // Units
    items: "项"
  },
  
  traditional: {
    // App title and subtitle
    appTitle: "✨ 健壯的 AI 待辦事項管理",
    appSubtitle: "💾 SQLite 持久化 | 🤖 AI 智能助手 | 🎯 完整功能",
    
    // Connection status
    backend: "後端",
    connected: "已連接",
    totalItems: "共",
    pending: "待辦",
    completed: "完成",
    
    // Input and buttons
    inputPlaceholder: "輸入新的待辦事項...（按 Enter 快速添加）",
    addButton: "➕ 添加",
    
    // Filters
    filterAll: "📋 全部",
    filterActive: "⏳ 待辦",
    filterCompleted: "✅ 已完成",
    
    // List headers
    allItems: "📋 所有事項",
    activeItems: "⏳ 待辦事項",
    completedItems: "✅ 已完成事項",
    doubleClickHint: "(雙擊任務可編輯)",
    
    // Empty states
    noTodos: "暫無待辦事項，快來添加一個吧！",
    noActive: "🎉 太棒了！沒有待辦事項了！",
    noCompleted: "還沒有完成任何事項",
    
    // AI Report
    aiReport: "🤖 AI 工作日報",
    generateReport: "📝 生成日報",
    generating: "🔄 生成中...",
    reportHint: "💡 提示：AI 會根據所有待辦事項生成專業的工作日報",
    reportPlaceholder: "點擊下方按鈕生成工作日報...",
    
    // TodoItem
    edit: "✏️ 編輯",
    save: "✓ 保存",
    cancel: "✕ 取消",
    delete: "🗑️ 刪除",
    aiBreakdown: "🪄 AI分解",
    editHint: "雙擊編輯",
    
    // Alerts and confirmations
    emptyWarning: "⚠️ 請輸入待辦事項內容！",
    deleteConfirm: "確定要刪除這個待辦事項嗎？",
    deleteAllConfirm: "⚠️ 確定要刪除所有待辦事項嗎？此操作無法撤銷！",
    deleteAllButton: "🗑️ 刪除全部",
    deleteAllSuccess: "成功刪除所有待辦事項",
    
    // Language selector
    language: "語言",
    languageSimplified: "简体中文",
    languageTraditional: "繁體中文",
    
    // Units
    items: "項"
  }
}

export const useTranslation = (language = 'simplified') => {
  return translations[language] || translations.simplified
}
