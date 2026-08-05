import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Send, Bot, User, Mic, MicOff, Plus, Clock, TrendingUp, TrendingDown,
  DollarSign, Target, Sparkles, Lightbulb, RefreshCw, X, Brain, Zap,
  ShoppingBag, MessageSquare, Activity, ChevronRight
} from 'lucide-react'
import { useExpense } from '../../../context/ExpenseContext'
import { useIncome } from '../../../context/IncomeContext'
import {
  PageHeader, Button, Card, CardHeader, CardTitle, CardDescription,
  CardContent, Badge, Separator, Input, Avatar, AvatarImage, AvatarFallback, CommonPageContainer
} from '../../ui'
import toast from 'react-hot-toast'
import api from '../../../services/api'
import { eventBus, Events } from '../../../utils/eventBus'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const fmt = (n) => n?.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) ?? '0'

function buildWelcomeMessage(expenses, income) {
  const now = new Date()
  const cm = now.getMonth()
  const catTotals = (expenses || []).reduce(
    (a, e) => {
      a[e.category] = (a[e.category] || 0) + e.amount
      return a
    },
    {}
  )
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Food'
  const mInc = (income || [])
    .filter((i) => new Date(i.date).getMonth() === cm)
    .reduce((s, i) => s + i.amount, 0)

  const incK = mInc > 0 ? `₹${Math.round(mInc / 1000)}K` : '₹20K'

  return `👋 Hi! I'm your **AI Finance Assistant**.\n\nI analyze your real expense data to answer questions instantly.\n\n**Try asking:**\n• "How much did I spend on ${topCat.toLowerCase()} this month?"\n• "What is my savings rate?"\n• "Where did I overspend in ${MONTH_NAMES[cm]}?"\n• "Suggest a budget plan for ${incK} salary"\n• "Compare this month vs last month"\n• "Can I afford ₹5,000 this month?"`
}

function parseInline(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">$1</code>'
    )
}

function buildChips(expenses, income) {
  const now = new Date()
  const cm = now.getMonth()

  const mInc = (income || [])
    .filter((i) => new Date(i.date).getMonth() === cm)
    .reduce((s, i) => s + i.amount, 0)

  const incAmt = mInc > 0 ? Math.round(mInc / 1000) * 1000 : 20000

  const catTotals = (expenses || []).reduce(
    (a, e) => {
      a[e.category] = (a[e.category] || 0) + e.amount
      return a
    },
    {}
  )
  const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Food'

  return [
    { label: '⚠️ Where did I overspend?', query: 'Where did I overspend this month?', color: 'red' },
    { label: `🍽️ ${topCat} spending?`, query: `How much did I spend on ${topCat} this month?`, color: 'blue' },
    { label: '📊 Top categories?', query: 'What are my top spending categories this month?', color: 'purple' },
    {
      label: `💰 Budget for ₹${Math.round(incAmt / 1000)}K?`,
      query: `Suggest budget plan for ₹${incAmt.toLocaleString('en-IN')} salary`,
      color: 'green'
    },
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

  const mExp = (expenses || [])
    .filter((e) => new Date(e.date) >= startOfMonth)
    .reduce((s, e) => s + e.amount, 0)

  const mInc = (income || [])
    .filter((i) => new Date(i.date) >= startOfMonth)
    .reduce((s, i) => s + i.amount, 0)

  const lmExp = (expenses || [])
    .filter((e) => {
      const d = new Date(e.date)
      return d >= startLast && d <= endLast
    })
    .reduce((s, e) => s + e.amount, 0)

  const balance = mInc - mExp
  const sr = mInc > 0 ? (balance / mInc) * 100 : null
  const expChange = lmExp > 0 ? ((mExp - lmExp) / lmExp) * 100 : null

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
      sub:
        expChange !== null
          ? expChange >= 0
            ? `▲ ${expChange.toFixed(1)}% vs last month`
            : `▼ ${Math.abs(expChange).toFixed(1)}% vs last month`
          : null,
      subColor:
        expChange !== null
          ? expChange >= 0
            ? 'text-red-500'
            : 'text-green-500'
          : null,
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      icon: TrendingUp,
      label: 'Net Balance',
      value: `₹${fmt(balance)}`,
      sub: balance >= 0 ? "You're in surplus" : 'Deficit — review spending',
      subColor: balance >= 0 ? 'text-emerald-500' : 'text-red-500',
      gradient: balance >= 0 ? 'from-blue-500 to-indigo-600' : 'from-orange-500 to-red-600',
    },
    {
      icon: Target,
      label: 'Savings Rate',
      value: sr !== null ? `${sr.toFixed(1)}%` : 'N/A',
      sub:
        sr !== null
          ? sr >= 20
            ? '20%+ target met'
            : sr > 0
              ? 'Below 20% target'
              : 'Spending > Income ⚠️'
          : 'Add income first',
      subColor:
        sr !== null
          ? sr >= 20
            ? 'text-emerald-500'
            : sr > 0
              ? 'text-amber-500'
              : 'text-red-500'
          : 'text-muted-foreground',
      gradient: 'from-violet-500 to-purple-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ icon: Icon, label, value, sub, subColor, gradient }) => (
        <Card key={label} className="hover:shadow-lg transition-all duration-300">
          <CardContent>
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
            {sub && (
              <p className={`text-xs mt-1.5 font-medium ${subColor || 'text-muted-foreground'}`}>{sub}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function InsightsPanel({ expenses, income, tabContent, loading, onRefresh, onBudgetTips, onForecast }) {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'budget', label: 'Budget Tips' },
    { id: 'forecast', label: 'Forecast' },
  ]

  const handleTab = (id) => {
    setActiveTab(id)
    if (id === 'budget') onBudgetTips && onBudgetTips()
    if (id === 'forecast') onForecast && onForecast()
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold">AI Insights</CardTitle>
          <Button variant="ghost" size="icon-sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-3">
          {tabs.map((t) => (
            <Button
              key={t.id}
              variant={activeTab === t.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleTab(t.id)}
              className="text-xs"
            >
              {t.label}
            </Button>
          ))}
        </div>
        <div className="min-h-[120px]">
          {loading ? (
            <p className="text-xs text-muted-foreground">Loading...</p>
          ) : tabContent?.[activeTab] ? (
            <div className="prose prose-sm dark:prose-invert max-w-full text-xs text-foreground" dangerouslySetInnerHTML={{ __html: parseInline(tabContent[activeTab]) }} />
          ) : (
            <p className="text-xs text-muted-foreground">No insights available. Click Get AI insights.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function Bubble({ msg }) {
  const isUser = msg.role === 'user'
  const lines = (msg.content || '').split('\n')

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fadeIn`}>
      <Avatar className={`w-10 h-10 shadow-md ${isUser ? '' : ''}`}>
        <AvatarFallback className={isUser ? 'bg-gradient-to-br from-indigo-500 to-violet-600' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}>
          {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 text-base leading-relaxed shadow-md ${isUser
            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-md'
            : 'bg-card text-foreground border border-border rounded-tl-md'
          }`}
      >
        {lines.map((line, i) => (
          <span key={i}>
            <span dangerouslySetInnerHTML={{ __html: parseInline(line) }} />
            {i < lines.length - 1 && <br />}
          </span>
        ))}

        {msg.timestamp && (
          <p
            className={`text-[11px] mt-2 ${isUser ? 'text-white/60' : 'text-muted-foreground'
              }`}
          >
            {new Date(msg.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  )
}

function Typing() {
  return (
    <div className="flex gap-3 animate-fadeIn">
      <Avatar className="w-9 h-9 shadow-md">
        <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500">
          <Bot className="w-4 h-4 text-white" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-card border border-border rounded-2xl rounded-tl-md px-5 py-3 shadow-md">
        <div className="flex gap-1.5 items-center">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="w-2 h-2 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">AI is thinking…</span>
        </div>
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
    ; (expenses || []).filter(e => new Date(e.date) >= startOfMonth).forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount })
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
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <CardTitle className="text-sm font-bold">Personalized Tips</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50 hover:shadow-md transition-shadow">
              <span className="text-lg shrink-0 leading-none mt-0.5">{tip.icon}</span>
              <p className="text-xs text-foreground leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function HistoryDrawer({ conversations, onLoad, onClose }) {
  return (
    <div className="absolute inset-0 z-20 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-80 bg-card h-full shadow-2xl flex flex-col border-l border-border">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <p className="text-sm font-bold text-foreground">Chat History</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {(!conversations || conversations.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No previous chats</p>
              <p className="text-xs mt-1">Start a conversation to see history</p>
            </div>
          ) : conversations.map((c, i) => (
            <Button
              key={i}
              variant="ghost"
              className="w-full justify-start h-auto p-3 rounded-lg hover:bg-muted transition-all group border border-transparent hover:border-border"
              onClick={() => onLoad(c.conversationId)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-md">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium text-foreground truncate">{c.title || 'Conversation'}</p>
                  <p className="text-xs text-muted-foreground">{c.messages?.length || 0} messages</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Button>
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
    <div className="flex items-end gap-2 p-4 bg-muted/30 border-t border-border">
      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        rows={1}
        placeholder="Ask about expenses, savings rate, budget recommendations…"
        className="flex-1 resize-none rounded-xl border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/60 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all shadow-sm"
        style={{ maxHeight: '120px', minHeight: '44px' }}
      />
      {isVoiceSupported && (
        <Button
          variant={isListening ? 'destructive' : 'outline'}
          size="icon"
          onClick={onVoice}
          className={`shadow-md ${isListening ? 'animate-pulse' : ''}`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
      )}
      <Button
        onClick={onSend}
        disabled={!value.trim() || isLoading}
        size="icon"
        className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 shadow-md hover:shadow-lg active:scale-95"
      >
        <Send className="w-5 h-5" />
      </Button>
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
  const initialMountRef = useRef(true)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

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

  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false
      return
    }

    if (messages.length > 1 || chatLoading) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, chatLoading])

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
      
      // If the AI response indicates expense categorization or updates, emit event
      // Check if response contains indicators of expense modifications
      const response = r.data.response || r.data.message || ''
      const hasCategorized = response.toLowerCase().includes('categorized') || 
                            response.toLowerCase().includes('category') ||
                            response.toLowerCase().includes('updated expense')
      
      if (hasCategorized || r.data.expensesModified) {
        // Emit event to notify ExpenseContext to refresh
        eventBus.emit(Events.AI_EXPENSE_CATEGORIZED, { 
          conversationId: r.data.conversationId,
          timestamp: new Date()
        })
      }
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
    <CommonPageContainer>
      <PageHeader
        icon={Brain}
        gradient="from-indigo-500 to-violet-600"
        title="AI Finance Assistant"
        subtitle="Powered by intelligent NLP · Ask anything about your finances"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowHistory(true)}
            >
              <Clock className="w-4 h-4" /> History
            </Button>
            <Button
              onClick={newChat}
              className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 shadow-md"
            >
              <Plus className="w-4 h-4" /> New Chat
            </Button>
          </div>
        }
      />

      <SnapshotCards expenses={expenses} income={income} />

      <div className="space-y-6">
        <div className="flex flex-col bg-card rounded-3xl border border-border shadow-xl overflow-hidden relative lg:h-[85vh] min-h-[60vh] w-full">
          {showHistory && <HistoryDrawer conversations={conversations} onLoad={loadConversation} onClose={() => setShowHistory(false)} />}

          <div className="px-5 py-4 border-b border-border flex items-center gap-3 shrink-0">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500">
                <Bot className="w-5 h-5 text-white" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Chat</p>
              <p className="text-xs text-muted-foreground">
                {messages.filter(m => m.role === 'user').length} messages · {conversationId ? 'Saved conversation' : 'New session'}
              </p>
            </div>
            <Badge variant="success" className="gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Online
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 min-h-0 bg-muted/20">
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            {chatLoading && <Typing />}
            <div ref={chatEndRef} />
          </div>

          <div className="px-5 py-3 border-t border-border shrink-0 bg-card">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Quick questions</p>
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

        <div className="mt-6">
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

        <div>
          <PersonalizedTips expenses={expenses} income={income} />
        </div>
      </div>
    </CommonPageContainer>
  )
}
