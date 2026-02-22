import { useState, useEffect, useRef } from 'react'
import { Sparkles, RefreshCw, Lightbulb, Send, Bot, User, Mic, MicOff, MessageSquare, Plus, Trash2, Clock } from 'lucide-react'
import { analyticsService } from '../../../services/analyticsService'
import { Card, Button } from '../../ui'
import toast from 'react-hot-toast'
import api from '../../../services/api'

const AIAssistant = () => {
  const [loading, setLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)
  const [tabContent, setTabContent] = useState({
    general: '',
    budget: '',
    forecast: ''
  })
  const [currentType, setCurrentType] = useState('general')
  const [conversationId, setConversationId] = useState(null)
  const [conversations, setConversations] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [lastError, setLastError] = useState(null)
  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)

  // Function to format markdown in chat messages
  const formatChatMessage = (text) => {
    let formatted = text
    // Replace **bold** with <strong>
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Replace *italic* with <em>
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    // Replace `code` with <code>
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-black/10 rounded text-xs font-mono">$1</code>')
    return formatted
  }

  useEffect(() => {
    loadSuggestions()
    loadConversations()
    // Add welcome message
    setChatMessages([{
      role: 'assistant',
      content: '👋 Hi! I\'m your AI Finance Assistant. Ask me anything about your expenses!\n\nTry asking:\n• "Where did I overspend this month?"\n• "Suggest budget plan for ₹20,000 salary"\n• "What are my top spending categories?"\n• "How much did I spend on food last month?"\n• "Can I afford a ₹5,000 phone this month?"\n\n🎤 You can also use voice input!'
    }])

    // Check for voice recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsVoiceSupported(true)
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setUserInput(transcript)
        setIsListening(false)
        toast.success('Voice captured!')
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.')
        } else if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable it in browser settings.')
        } else {
          toast.error('Voice recognition error. Please try again.')
        }
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const loadConversations = async () => {
    try {
      const response = await api.get('/ai/conversations')
      setConversations(response.data.conversations || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadConversation = async (convId) => {
    try {
      const response = await api.get(`/ai/conversations/${convId}`)
      const conv = response.data.conversation

      setConversationId(conv.conversationId)
      setChatMessages(conv.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })))
      setShowHistory(false)
      toast.success('Conversation loaded!')
    } catch (error) {
      console.error('Error loading conversation:', error)
      toast.error('Failed to load conversation')
    }
  }

  const startNewConversation = async () => {
    try {
      const response = await api.post('/ai/conversations/new')
      setConversationId(response.data.conversationId)
      setChatMessages([{
        role: 'assistant',
        content: '👋 Hi! I\'m your AI Finance Assistant. Ask me anything about your expenses!'
      }])
      toast.success('New conversation started!')
    } catch (error) {
      console.error('Error starting new conversation:', error)
      setConversationId(null)
    }
  }

  const deleteConversation = async (convId) => {
    try {
      await api.delete(`/ai/conversations/${convId}`)
      setConversations(prev => prev.filter(c => c.conversationId !== convId))

      if (conversationId === convId) {
        startNewConversation()
      }

      toast.success('Conversation deleted!')
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast.error('Failed to delete conversation')
    }
  }

  const loadSuggestions = async (type = 'general') => {
    try {
      setLoading(true)
      setCurrentType(type)
      const response = await analyticsService.getAISuggestions(type)
      const content = response.data.suggestions || 'No suggestions available'

      // Update specific tab content based on type
      setTabContent(prev => ({
        ...prev,
        [type]: content
      }))

      return content
    } catch (error) {
      console.error('Error loading suggestions:', error)
      const errorMsg = 'Unable to load AI suggestions. Please try again later.'
      setTabContent(prev => ({
        ...prev,
        [type]: errorMsg
      }))
      return errorMsg
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await toast.promise(
      loadSuggestions(currentType),
      {
        loading: 'Generating new suggestions...',
        success: 'Suggestions refreshed!',
        error: 'Failed to refresh suggestions'
      }
    )
  }

  const handleBudgetTips = async () => {
    return await loadSuggestions('budget')
  }

  const handleSpendingForecast = async () => {
    return await loadSuggestions('forecast')
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!userInput.trim()) return

    const userMessage = userInput.trim()
    setUserInput('')
    setLastError(null)

    // Add user message to chat immediately
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatLoading(true)

    try {
      const response = await api.post('/ai/chat', {
        message: userMessage,
        conversationId: conversationId
      })

      // Update conversation ID if new
      if (response.data.conversationId && !conversationId) {
        setConversationId(response.data.conversationId)
      }

      // Add AI response to chat
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response
      }])

      // Reload conversations list
      loadConversations()
    } catch (error) {
      console.error('Chat error:', error)

      // Restore user input so they can edit and retry
      setUserInput(userMessage)

      // Remove the user message from chat since it failed
      setChatMessages(prev => prev.slice(0, -1))

      // Show detailed error message
      const errorMessage = error.response?.data?.error || error.message || 'Failed to get response'
      setLastError(errorMessage)

      toast.error(`Error: ${errorMessage}. Your message has been restored for editing.`, {
        duration: 5000
      })
    } finally {
      setChatLoading(false)
    }
  }

  const handleVoiceInput = () => {
    if (!isVoiceSupported) {
      toast.error('Voice recognition not supported in this browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    try {
      setIsListening(true)
      recognitionRef.current.start()
      toast.success('Listening... Speak now!', {
        icon: '🎤',
        duration: 2000
      })
    } catch (error) {
      console.error('Voice input error:', error)
      setIsListening(false)
      toast.error('Failed to start voice recognition')
    }
  }

  useEffect(() => {
    // Only scroll if we have more than 1 message (avoid initial scroll on mount)
    if (chatMessages.length > 1) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [chatMessages])

  const formatSuggestions = (text) => {
    // Split by lines and format
    const lines = text.split('\n')
    return lines.map((line, index) => {
      // Check if it's a header (starts with ##)
      if (line.startsWith('##')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-800 dark:text-slate-200 mt-4 mb-2 tracking-tight">
            {line.replace('##', '').trim()}
          </h3>
        )
      }
      // Check if it's a bullet point
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <li key={index} className="ml-4 text-gray-700 dark:text-slate-300 mb-2 leading-relaxed">
            {line.replace(/^[•\-*]\s*/, '')}
          </li>
        )
      }
      // Check if it's a numbered point
      if (/^\d+\./.test(line.trim())) {
        return (
          <li key={index} className="ml-4 text-gray-700 dark:text-slate-300 mb-2 leading-relaxed">
            {line.replace(/^\d+\.\s*/, '')}
          </li>
        )
      }
      // Regular text
      if (line.trim()) {
        return (
          <p key={index} className="text-gray-700 dark:text-slate-300 mb-2 leading-relaxed">
            {line}
          </p>
        )
      }
      return null
    })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-slate-100 mb-2 flex items-center gap-3 tracking-tight">
            <Bot className="w-8 h-8 text-primary" />
            AI Finance Assistant
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed">Get personalized financial insights and advice powered by AI</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            icon={MessageSquare}
          >
            History ({conversations.length})
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={startNewConversation}
            icon={Plus}
          >
            New Chat
          </Button>
        </div>
      </div>

      {/* Conversation History Sidebar */}
      {showHistory && (
        <Card title="Conversation History" icon={Clock}>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No previous conversations</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.conversationId}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${conversationId === conv.conversationId
                    ? 'border-primary bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-slate-600 hover:border-blue-300 bg-white dark:bg-slate-700'
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => loadConversation(conv.conversationId)}
                    >
                      <p className="font-medium text-gray-900 dark:text-slate-100 truncate">{conv.title}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        {new Date(conv.lastMessageAt).toLocaleDateString()} • {conv.messages.length} messages
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteConversation(conv.conversationId)
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Conversational Finance Bot */}
      <Card
        title="AI Chat Assistant"
        icon={Sparkles}
        subtitle="Ask me anything about your finances"
      >
        {/* Chat Messages */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-4 h-96 overflow-y-auto mb-5 space-y-4 border border-gray-200 dark:border-slate-700">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                ? 'bg-gradient-to-br from-primary to-blue-600 text-white'
                : 'bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 dark:text-slate-100'
                }`}>
                <div
                  className="text-sm whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatChatMessage(msg.content) }}
                />
              </div>
              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center flex-shrink-0 shadow-md">
                  <User className="w-5 h-5 text-gray-700" />
                </div>
              )}
            </div>
          ))}
          {chatLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl p-4 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleChatSubmit} className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value)
                if (lastError) setLastError(null) // Clear error when user starts typing
              }}
              placeholder="Ask me anything about your finances..."
              className="input w-full pr-24"
              disabled={chatLoading}
              autoFocus={userInput.length > 0}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              {userInput && !chatLoading && (
                <button
                  type="button"
                  onClick={() => {
                    setUserInput('')
                    setLastError(null)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Clear input"
                >
                  ✕
                </button>
              )}
              {isVoiceSupported && (
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={chatLoading}
                  className={`p-2 rounded-full transition-all ${isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isListening ? 'Stop listening' : 'Voice input'}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
          </div>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={chatLoading || !userInput.trim()}
            icon={Send}
          >
            {chatLoading ? 'Sending...' : 'Send'}
          </Button>
        </form>

        {/* Error Message */}
        {lastError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-red-500 text-xl">❌</span>
              <div className="flex-1">
                <p className="text-sm text-red-700 font-semibold mb-1">Error processing your request</p>
                <p className="text-xs text-red-600 mb-2">{lastError}</p>

                {lastError.includes('AI_NOT_CONFIGURED') || lastError.includes('API key') ? (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
                    <p className="font-semibold text-yellow-800 mb-2">🔧 Setup Required:</p>
                    <ol className="list-decimal list-inside space-y-1 text-yellow-700">
                      <li>Get a free API key from <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900">console.groq.com</a></li>
                      <li>Add it to your <code className="bg-yellow-100 px-1 rounded">server/.env</code> file as <code className="bg-yellow-100 px-1 rounded">GROQ_API_KEY=your_key</code></li>
                      <li>Restart your server</li>
                    </ol>
                  </div>
                ) : (
                  <p className="text-xs text-red-500 mt-2">Your message has been restored above. You can edit it and try again.</p>
                )}
              </div>
              <button
                onClick={() => setLastError(null)}
                className="text-red-400 hover:text-red-600 transition-colors text-lg leading-none"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Quick Questions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setUserInput("Where did I overspend this month?")}
            className="text-sm px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            ⚠️ Where did I overspend?
          </button>
          <button
            onClick={() => setUserInput("Suggest budget plan for ₹20,000 salary")}
            className="text-sm px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            💰 Budget plan for ₹20K
          </button>
          <button
            onClick={() => setUserInput("What are my top spending categories?")}
            className="text-sm px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
          >
            📊 Top categories?
          </button>
          <button
            onClick={() => setUserInput("How much did I spend on food last month?")}
            className="text-sm px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            🍔 Food spending?
          </button>
          <button
            onClick={() => setUserInput("Can I afford a ₹5,000 phone this month?")}
            className="text-sm px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
          >
            📱 Can I afford ₹5K?
          </button>
        </div>
      </Card>

      {/* Smart Insights with Tabs */}
      <SmartInsightsCard
        tabContent={tabContent}
        loading={loading}
        currentType={currentType}
        onRefresh={handleRefresh}
        onBudgetTips={handleBudgetTips}
        onForecast={handleSpendingForecast}
        onTabChange={setCurrentType}
      />
    </div>
  )
}

// Smart Insights Card Component with Tabs
const SmartInsightsCard = ({ tabContent, loading, currentType, onRefresh, onBudgetTips, onForecast, onTabChange }) => {
  const [activeTab, setActiveTab] = useState('general')
  const [tabLoading, setTabLoading] = useState({
    general: false,
    budget: false,
    forecast: false
  })

  const handleTabClick = async (tab) => {
    setActiveTab(tab)
    onTabChange(tab)

    // Load content if not already loaded
    if (tab === 'budget' && !tabContent.budget) {
      setTabLoading(prev => ({ ...prev, budget: true }))
      await onBudgetTips()
      setTabLoading(prev => ({ ...prev, budget: false }))
    } else if (tab === 'forecast' && !tabContent.forecast) {
      setTabLoading(prev => ({ ...prev, forecast: true }))
      await onForecast()
      setTabLoading(prev => ({ ...prev, forecast: false }))
    }
  }

  const formatContent = (text) => {
    if (!text) return null

    // Function to parse markdown-style formatting
    const parseMarkdown = (line) => {
      // Replace **bold** with <strong>
      let formatted = line.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')

      // Replace *italic* with <em>
      formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')

      // Replace `code` with <code>
      formatted = formatted.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">$1</code>')

      return formatted
    }

    const lines = text.split('\n')
    return lines.map((line, index) => {
      // Headers (## or ###)
      if (line.startsWith('###')) {
        return (
          <h4 key={index} className="text-base font-semibold text-gray-800 dark:text-slate-200 mt-3 mb-2 tracking-tight">
            {line.replace('###', '').trim()}
          </h4>
        )
      }
      if (line.startsWith('##')) {
        return (
          <h3 key={index} className="text-lg font-semibold text-gray-800 dark:text-slate-200 mt-4 mb-2 tracking-tight">
            {line.replace('##', '').trim()}
          </h3>
        )
      }

      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const content = line.replace(/^[•\-*]\s*/, '').trim()
        const formattedContent = parseMarkdown(content)
        return (
          <div key={index} className="flex items-start gap-3 mb-3 p-3 bg-white dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-600 transition-colors">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p
              className="text-gray-700 dark:text-slate-300 leading-relaxed flex-1"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          </div>
        )
      }

      // Numbered points
      if (/^\d+\./.test(line.trim())) {
        const content = line.replace(/^\d+\.\s*/, '').trim()
        const formattedContent = parseMarkdown(content)
        const number = line.match(/^\d+/)[0]
        return (
          <div key={index} className="flex items-start gap-3 mb-3 p-3 bg-white dark:bg-slate-700 rounded-lg border border-gray-100 dark:border-slate-600 hover:border-blue-200 dark:hover:border-blue-600 transition-colors">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
              {number}
            </div>
            <p
              className="text-gray-700 dark:text-slate-300 leading-relaxed flex-1"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          </div>
        )
      }

      // Regular text with markdown formatting
      if (line.trim()) {
        const formattedContent = parseMarkdown(line)
        return (
          <p
            key={index}
            className="text-gray-700 dark:text-slate-300 mb-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        )
      }
      return null
    })
  }

  const tabs = [
    { id: 'general', label: 'Smart Insights', icon: Lightbulb },
    { id: 'budget', label: 'Budget Tips', icon: Lightbulb },
    { id: 'forecast', label: 'Forecast', icon: Sparkles }
  ]

  return (
    <Card>
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 tracking-tight">Smart Insights</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400">AI-powered financial recommendations</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading || tabLoading[activeTab] ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="spinner mb-4"></div>
          <p className="text-gray-500 dark:text-slate-400">
            {activeTab === 'budget' ? 'Generating budget tips...' :
              activeTab === 'forecast' ? 'Analyzing spending patterns...' :
                'Analyzing your expenses...'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main Content Area */}
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            {activeTab === 'general' && (
              <div className="space-y-2">
                {tabContent.general ? (
                  formatContent(tabContent.general)
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-slate-400">Loading smart insights...</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'budget' && (
              <div className="space-y-2">
                {tabContent.budget ? (
                  formatContent(tabContent.budget)
                ) : (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-slate-400">Click this tab to load personalized budget recommendations</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'forecast' && (
              <div className="space-y-2">
                {tabContent.forecast ? (
                  formatContent(tabContent.forecast)
                ) : (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-slate-400">Click this tab to generate spending predictions</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pro Tips Section */}
          <div className="p-5 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-3 flex items-center gap-2 tracking-tight">
              <Lightbulb className="w-5 h-5" />
              Pro Tips
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">💡</span>
                <span className="text-sm text-yellow-700 dark:text-yellow-400">Track expenses daily for better insights</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">💰</span>
                <span className="text-sm text-yellow-700 dark:text-yellow-400">Set realistic budgets for each category</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">📊</span>
                <span className="text-sm text-yellow-700 dark:text-yellow-400">Review your spending patterns weekly</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">📸</span>
                <span className="text-sm text-yellow-700 dark:text-yellow-400">Use the receipt scanner for quick entry</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default AIAssistant

