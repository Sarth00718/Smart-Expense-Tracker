import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Send, Bot, User, Mic, MicOff, Plus, Clock, TrendingUp, TrendingDown,
  DollarSign, Target, Sparkles, Lightbulb, RefreshCw, X, Brain, Zap,
  ShoppingBag, MessageSquare, Activity, Wallet, PieChart, Calendar
} from 'lucide-react'
import { useExpense } from '../../../context/ExpenseContext'
import { useIncome } from '../../../context/IncomeContext'
import { PageHeader } from '../../ui'
import toast from 'react-hot-toast'
import api from '../../../services/api'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const fmt = (n) => n?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) ?? '0'

function buildWelcomeMessage(expenses, income) {
  const now = new Date()
  const cm = now.getMonth()
  const catTotals = (expenses || []).reduce((a, e) => { a[e.category] = (a[e.category] || 0) + e.amount; return a }, {})
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Food'
  const mInc = (income || []).filter(i => new Date(i.date).getMonth() === cm).reduce((s, i) => s + i.amount, 0)
  const incK = mInc > 0 ? `₹${Math.round(mInc / 1000)}K` : '₹20K'
  return `👋 Hi! I'm your **AI Finance Assistant**.\n\nI analyze your real expense data to answer questions instantly.\n\n**Try asking:**\n• "How much did I spend on ${topCat.toLowerCase()} this month?"\n• "What is my savings rate?"\n• "Where did I overspend in ${MONTH_NAMES[cm]}?"\n• "Suggest a budget plan for ${incK} salary"\n• "Compare this month vs last month"\n• "Can I afford ₹5,000 this month?"`
}

function parseInline(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs font-mono">$1</code>')
}

function buildChips(expenses, income) {
  const now = new Date()
  const cm = now.getMonth()
  const mInc = (income || []).filter(i => new Date(i.date).getMonth() === cm).reduce((s, i) => s + i.amount, 0)
  const incAmt = mInc > 0 ? Math.round(mInc / 1000) * 1000 : 20000
  const catTotals = (expenses || []).reduce((a, e) => { a[e.category] = (a[e.category] || 0) + e.amount; return a }, {})
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Food'
  return [
    { label: '⚠️ Where did I overspend?', query: 'Where did I overspend this month?', color: 'red' },
    { label: `🍽️ ${topCat} spending?`, query: `How much did I spend on ${topCat} this month?`, color: 'blue' },
    { label: '📊 Top categories?', query: 'What are my top spending categories this month?', color: 'purple' },
    { label: `💰 Budget for ₹${Math.round(incAmt / 1000)}K?`, query: `Suggest budget plan for ₹${incAmt.toLocaleString('en-IN')} salary`, color: 'green' },
    { label: '📈 My savings rate?', query: 'What is my savings rate this month?', color: 'orange' },
    { label: '🔄 This vs last month?', query: 'Compare this month vs last month expenses', color: 'teal' },
  ]
}

function SnapshotCards({ expenses, income }) {
  const now = new Date()
  const cy = now.getFullYear()
  const cm = now.getMonth()
  const startOfMonth = new Date(cy, cm, 1)
  const lm = cm === 0 ? 11 : cm - 1
  const ly = cm === 0 ? cy - 1 : cy
  const startLast = new Date(ly, lm, 1)
  const endLast = new Date(ly, lm + 1, 0, 23, 59, 59)

  const mExp = (expenses || []).filter(e => new Date(e.date) >= startOfMonth).reduce((s, e) => s + e.amount, 0)
  const mInc = (income || []).filter(i => new Date(i.date) >= startOfMonth).reduce((s, i) => s + i.amount, 0)
  const lmExp = (expenses || []).filter(e => { const d = new Date(e.date); return d >= startLast && d <= endLast }).reduce((s, e) => s + e.amount, 0)
  const balance = mInc - mExp
  const sr = mInc > 0 ? ((balance / mInc) * 100) : null
  const expChange = lmExp > 0 ? ((mExp - lmExp) / lmExp * 100) : null

  const cards = [
    {
      icon: DollarSign,
      label: `${MONTH_NAMES[cm].slice(0, 3)} Income`,
      value: `₹${fmt(mInc)}`,
      sub: mInc === 0 ? 'No income yet' : null,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: TrendingDown,
      label: `${MONTH_NAMES[cm].slice(0, 3)} Expenses`,
      value: `₹${fmt(mExp)}`,
      sub: expChange !== null ? (expChange >= 0 ? `▲ ${expChange.toFixed(1)}% vs last month` : `▼ ${Math.abs(expChange).toFixed(1)}% vs last month`) : null,
      subColor: expChange !== null ? (expChange >= 0 ? 'text-red-500' : 'text-green-500') : null,
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      icon: TrendingUp,
      label: 'Net Balance',
      value: `₹${fmt(balance)}`,
      sub: balance >= 0 ? 'You\'re in surplus' : 'Deficit — review spending',
      subColor: balance >= 0 ? 'text-emerald-500' : 'text-red-500',
      gradient: balance >= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600',
    },
    {
      icon: Target,
      label: 'Savings Rate',
      value: sr !== null ? `${sr.toFixed(1)}%` : 'N/A',
      sub: sr !== null ? (sr >= 20 ? '20%+ target met' : sr > 0 ? 'Below 20% target' : 'Spending > Income ⚠️') : 'Add income first',
      subColor: sr !== null ? (sr >= 20 ? 'text-emerald-500' : sr > 0 ? 'text-amber-500' : 'text-red-500') : 'text-gray-400',
      gradient: 'from-violet-500 to-purple-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ icon: Icon, label, value, sub, subColor, gradient }) => (
        <div key={label} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 tabular-nums">{value}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{label}</p>
          {sub && <p className={`text-xs mt-1.5 font-medium ${subColor || 'text-gray-400'}`}>{sub}</p>}
        </div>
      ))}
    </div>
  )
}

function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  const lines = (msg.content || '').split('\n')
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fadeIn`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md ${isUser ? 'bg-gradient-to-br from-indigo-500 to-violet-600' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${isUser ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-md' : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-200 dark:border-slate-700 rounded-tl-md'}`}>
        {lines.map((line, i) => (
          <span key={i}>
            <span dangerouslySetInnerHTML={{ __html: parseInline(line) }} />
            {i < lines.length - 1 && <br />}
          </span>
        ))}
        {msg.timestamp && (
          <p className={`text-[10px] mt-2 ${isUser ? 'text-white/60' : 'text-gray-400 dark:text-slate-500'}`}>
            {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}

function Typing() {
  return (
    <div className="flex gap-3 animate-fadeIn">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-md">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl rounded-tl-md px-5 py-3 shadow-md">
        <div className="flex gap-1.5 items-center">
          {[0, 150, 300].map(delay => (
            <span key={delay} className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
          ))}
          <span className="text-xs text-gray-500 dark:text-slate-400 ml-2">AI is thinking…</span>
        </div>
      </div>
    </div>
  )
}

function InsightsPanel({ expenses, income, tabContent, loading, onRefresh, onBudgetTips, onForecast }) {
  const [activeTab, setActiveTab] = useState('general')
  const [tabLoading, setTabLoading] = useState({ general: false, budget: false, forecast: false })

  const now = new Date()
  const cy = now.getFullYear()
  const cm = now.getMonth()
  const startOfMonth = new Date(cy, cm, 1)
  const mExp = (expenses || []).filter(e => new Date(e.date) >= startOfMonth).reduce((s, e) => s + e.amount, 0)
  const mInc = (income || []).filter(i => new Date(i.date) >= startOfMonth).reduce((s, i) => s + i.amount, 0)
  const balance = mInc - mExp
  const sr = mInc > 0 ? ((balance / mInc) * 100) : null
  const catMap = {}
  ;(expenses || []).filter(e => new Date(e.date) >= startOfMonth).forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount })
  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]

  const localInsights = useMemo(() => {
    const items = []
    if (sr === null) items.push({ t: 'warning', icon: DollarSign, title: 'Add Income', msg: `No income logged for ${MONTH_NAMES[cm]}. Add income to unlock savings analysis.` })
    else if (sr < 0) items.push({ t: 'danger', icon: TrendingDown, title: 'Overspending', msg: `You've exceeded income by ₹${fmt(Math.abs(balance))} this month.` })
    else if (sr < 20) items.push({ t: 'warning', icon: Target, title: 'Savings Rate', msg: `${sr.toFixed(1)}% saved this month.` })
    else items.push({ t: 'success', icon: TrendingUp, title: 'Savings', msg: `Saving ${sr.toFixed(1)}% of income this month.` })
    if (topCat) items.push({ t: 'info', icon: ShoppingBag, title: 'Top Spend', msg: `${topCat[0]} is your biggest category: ₹${fmt(topCat[1])}.` })
    const avgD = mExp / Math.max(1, now.getDate())
    if (mExp > 0) items.push({ t: 'info', icon: Activity, title: 'Daily Average', msg: `₹${fmt(avgD)}/day average in ${MONTH_NAMES[cm]}.` })
    return items
  }, [expenses, income])

  const colorMap = {
    success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400',
    warning: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
    danger: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    info: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  }

  const tabs = [
    { id: 'general', label: '💡 General', action: null },
    { id: 'budget', label: '💳 Budget', action: onBudgetTips },
    { id: 'forecast', label: '🔮 Forecast', action: onForecast },
  ]

  const switchTab = async (tab) => {
    setActiveTab(tab)
    const t = tabs.find(x => x.id === tab)
    if (t?.action && !tabContent[tab]) {
      setTabLoading(p => ({ ...p, [tab]: true }))
      await t.action()
      setTabLoading(p => ({ ...p, [tab]: false }))
    }
  }

  const renderContent = (text) => {
    if (!text) return null
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-slate-400 mt-3 mb-1">{line.slice(4)}</h3>
      if (line.startsWith('## ')) return <h2 key={i} className="text-sm font-bold text-gray-800 dark:text-slate-200 mt-3 mb-1">{line.slice(3)}</h2>
      if (line.startsWith('• ') || line.startsWith('- '))
        return <li key={i} className="text-xs text-gray-600 dark:text-slate-400 ml-3 list-disc leading-relaxed my-0.5" dangerouslySetInnerHTML={{ __html: parseInline(line.slice(2)) }} />
      if (line.trim() === '') return <div key={i} className="my-1" />
      return <p key={i} className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed my-0.5" dangerouslySetInnerHTML={{ __html: parseInline(line) }} />
    })
  }

  const curLoading = loading || tabLoading[activeTab]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg overflow-hidden h-full flex flex-col">
      <div className="px-4 pt-4 pb-3 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-slate-800 dark:to-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-slate-100">Smart Insights</p>
          </div>
          <button onClick={onRefresh} className="w-8 h-8 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="flex gap-1 p-1 bg-white/60 dark:bg-slate-700/50 rounded-lg">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => switchTab(tab.id)}
              className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-0">
        {curLoading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-400">Generating insights…</p>
          </div>
        ) : tabContent[activeTab] ? (
          <ul className="list-none p-0 m-0 space-y-0.5">{renderContent(tabContent[activeTab])}</ul>
        ) : (
          <>
            {localInsights.map((ins, i) => (
              <div key={i} className={`border rounded-lg p-3 flex items-start gap-2.5 ${colorMap[ins.t]} hover:shadow-md transition-shadow`}>
                <ins.icon className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold">{ins.title}</p>
                  <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{ins.msg}</p>
                </div>
              </div>
            ))}
            {activeTab === 'general' && (
              <button onClick={onRefresh}
                className="w-full mt-2 py-2.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-1.5">
                <Zap className="w-4 h-4" /> Get AI insights
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function PersonalizedTips({ expenses, income }) {
  const now = new Date()
  const cy = now.getFullYear()
  const cm = now.getMonth()
  const startOfMonth = new Date(cy, cm, 1)
  const mExp = (expenses || []).filter(e => new Date(e.date) >= startOfMonth).reduce((s, e) => s + e.amount, 0)
  const mInc = (income || []).filter(i => new Date(i.date) >= startOfMonth).reduce((s, i) => s + i.amount, 0)
  const catMap = {}
  ;(expenses || []).filter(e => new Date(e.date) >= startOfMonth).forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount })
  const topCat = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]

  const tips = useMemo(() => {
    const t = []
    if (mInc === 0) t.push({ icon: '💸', text: `No income logged for ${MONTH_NAMES[cm]}. Add income to track savings.` })
    if (mExp > mInc && mInc > 0) t.push({ icon: '⚠️', text: `Overspending by ₹${fmt(mExp - mInc)} this month. Review your budget!` })
    if (topCat) t.push({ icon: '📌', text: `${topCat[0]} is your top spend: ₹${fmt(topCat[1])} (${mExp > 0 ? ((topCat[1] / mExp) * 100).toFixed(0) : 0}% of expenses).` })
    const avg = mExp / Math.max(1, now.getDate())
    if (mExp > 0) t.push({ icon: '📅', text: `Daily average in ${MONTH_NAMES[cm]}: ₹${fmt(avg)}.` })
    return t.slice(0, 4)
  }, [expenses, income])

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <p className="text-sm font-bold text-gray-900 dark:text-slate-100">Personalized Tips</p>
      </div>
      <div className="space-y-2">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-700/50 dark:to-slate-700/30 hover:shadow-md transition-shadow">
            <span className="text-lg shrink-0 leading-none mt-0.5">{tip.icon}</span>
            <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function HistoryDrawer({ conversations, onLoad, onClose }) {
  return (
    <div className="absolute inset-0 z-20 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-80 bg-white dark:bg-slate-800 h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-slate-800 dark:to-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm font-bold text-gray-900 dark:text-slate-100">Chat History</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {(!conversations || conversations.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-slate-500">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No previous chats</p>
              <p className="text-xs mt-1">Start a conversation to see history</p>
            </div>
          ) : conversations.map((c, i) => (
            <button key={i} onClick={() => onLoad(c.conversationId)}
              className="w-full text-left p-3 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-violet-50 dark:hover:from-slate-700 dark:hover:to-slate-700 transition-all group border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{c.title || 'Conversation'}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{c.messages?.length || 0} messages</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function InputBar({ value, onChange, onSend, onVoice, isListening, isVoiceSupported, isLoading }) {
  const ref = useRef(null)
  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() } }
  
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = Math.min(ref.current.scrollHeight, 120) + 'px'
    }
  }, [value])

  return (
    <div className="flex items-end gap-2 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-900/50 dark:to-slate-900/30 border-t border-gray-200 dark:border-slate-700">
      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyPress={handleKey}
        rows={1}
        placeholder="Ask about expenses, savings rate, budget recommendations…"
        className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-gray-800 dark:text-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500 shadow-sm"
        style={{ maxHeight: '120px', minHeight: '44px' }}
      />
      {isVoiceSupported && (
        <button
          onClick={onVoice}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shadow-md ${isListening ? 'bg-red-500 text-white animate-pulse shadow-red-300 dark:shadow-red-900' : 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:shadow-lg'}`}>
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      )}
      <button
        onClick={onSend}
        disabled={!value.trim() || isLoading}
        className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-indigo-300 dark:hover:shadow-indigo-900 transition-all active:scale-95 shadow-md">
        <Send className="w-5 h-5" />
      </button>
    </div>
  )
}

export default function AIAssistant() {
  const { expenses } = useExpense()
  const { income } = useIncome()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceOK, setVoiceOK] = useState(false)
  const [tabContent, setTabContent] = useState({ general: '', budget: '', forecast: '' })
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [conversations, setConversations] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    setMessages([{ role: 'assistant', content: buildWelcomeMessage(expenses, income), timestamp: new Date() }])
  }, [])

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    setVoiceOK(true)
    const r = new SR()
    r.continuous = false
    r.interimResults = false
    r.lang = 'en-IN'
    r.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false) }
    r.onerror = () => setIsListening(false)
    r.onend = () => setIsListening(false)
    recognitionRef.current = r
  }, [])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, chatLoading])
  useEffect(() => { loadSuggestions(); loadConversations() }, [])

  const loadConversations = async () => {
    try {
      const r = await api.get('/ai/conversations')
      setConversations(r.data.conversations || [])
    } catch (_) { }
  }

  const loadSuggestions = async () => {
    setInsightsLoading(true)
    try {
      const r = await api.get('/ai/suggestions?type=general')
      setTabContent(p => ({ ...p, general: r.data.suggestions || '' }))
    } catch (_) { }
    finally { setInsightsLoading(false) }
  }

  const loadBudgetTips = async () => {
    setInsightsLoading(true)
    try {
      const r = await api.get('/ai/suggestions?type=budget')
      setTabContent(p => ({ ...p, budget: r.data.suggestions || '' }))
    } catch (_) { }
    finally { setInsightsLoading(false) }
  }

  const loadForecast = async () => {
    setInsightsLoading(true)
    try {
      const r = await api.get('/ai/suggestions?type=forecast')
      setTabContent(p => ({ ...p, forecast: r.data.suggestions || '' }))
    } catch (_) { }
    finally { setInsightsLoading(false) }
  }

  const loadConversation = async (id) => {
    try {
      const r = await api.get(`/ai/conversations/${id}`)
      setMessages((r.data.conversation?.messages || []).map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp })))
      setConversationId(id)
      setShowHistory(false)
    } catch (_) {
      toast.error('Failed to load conversation')
    }
  }

  const sendMessage = useCallback(async (override) => {
    const msg = (override || input).trim()
    if (!msg) return
    setMessages(p => [...p, { role: 'user', content: msg, timestamp: new Date() }])
    setInput('')
    setChatLoading(true)
    try {
      const r = await api.post('/ai/chat', { message: msg, conversationId })
      setMessages(p => [...p, { role: 'assistant', content: r.data.response || r.data.message || 'Could not process request.', timestamp: new Date() }])
      if (r.data.conversationId && !conversationId) setConversationId(r.data.conversationId)
      loadConversations()
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', content: `❌ ${e.response?.data?.error || e.message || 'Something went wrong. Please try again.'}`, timestamp: new Date() }])
    } finally {
      setChatLoading(false)
    }
  }, [input, conversationId])

  const newChat = () => {
    setConversationId(null)
    setMessages([{ role: 'assistant', content: buildWelcomeMessage(expenses, income), timestamp: new Date() }])
  }

  const toggleVoice = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleRefresh = () => {
    setTabContent({ general: '', budget: '', forecast: '' })
    loadSuggestions()
  }

  const chips = buildChips(expenses, income)
  const chipColors = {
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30',
    purple: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/30',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900/30',
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <PageHeader
          icon={Brain}
          gradient="from-indigo-500 to-violet-600"
          title="AI Finance Assistant"
          subtitle="Powered by intelligent NLP · Ask anything about your finances"
          actions={
            <div className="flex gap-2">
              <button
                onClick={() => setShowHistory(true)}
                className="h-10 px-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow-md">
                <Clock className="w-4 h-4" /> History
              </button>
              <button
                onClick={newChat}
                className="h-10 px-4 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-300 dark:hover:shadow-indigo-900 transition-all flex items-center gap-2 text-sm font-medium shadow-md active:scale-95">
                <Plus className="w-4 h-4" /> New Chat
              </button>
            </div>
          }
        />

        {/* Snapshot Cards */}
        <SnapshotCards expenses={expenses} income={income} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chat Panel - 2/3 width */}
          <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl overflow-hidden relative" style={{ height: '600px' }}>
            
            {/* History Drawer */}
            {showHistory && <HistoryDrawer conversations={conversations} onLoad={loadConversation} onClose={() => setShowHistory(false)} />}

            {/* Chat Header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-slate-800 dark:to-slate-800 flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-slate-100">Chat</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {messages.filter(m => m.role === 'user').length} messages · {conversationId ? 'Saved conversation' : 'New session'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 min-h-0 bg-gradient-to-b from-gray-50/30 to-white dark:from-slate-900/30 dark:to-slate-800">
              {messages.map((m, i) => <Bubble key={i} msg={m} />)}
              {chatLoading && <Typing />}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Chips */}
            <div className="px-5 py-3 border-t border-gray-200 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">Quick questions</p>
              <div className="flex flex-wrap gap-2">
                {chips.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(c.query)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all font-medium shadow-sm hover:shadow-md ${chipColors[c.color]}`}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <InputBar
              value={input}
              onChange={setInput}
              onSend={() => sendMessage()}
              onVoice={toggleVoice}
              isListening={isListening}
              isVoiceSupported={voiceOK}
              isLoading={chatLoading}
            />
          </div>

          {/* Right Panel - 1/3 width */}
          <div className="flex flex-col gap-4" style={{ height: '600px' }}>
            <div className="flex-1 min-h-0">
              <InsightsPanel
                expenses={expenses}
                income={income}
                tabContent={tabContent}
                loading={insightsLoading}
                onRefresh={handleRefresh}
                onBudgetTips={loadBudgetTips}
                onForecast={loadForecast}
              />
            </div>
            <div className="shrink-0">
              <PersonalizedTips expenses={expenses} income={income} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
