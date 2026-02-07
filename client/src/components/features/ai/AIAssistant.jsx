import { useState, useEffect, useRef } from 'react'
import { Sparkles, RefreshCw, Lightbulb, Send, Bot, User, Mic, MicOff } from 'lucide-react'
import { analyticsService } from '../../../services/analyticsService'
import { Card, Button } from '../../ui'
import toast from 'react-hot-toast'
import api from '../../../services/api'

const AIAssistant = () => {
  const [suggestions, setSuggestions] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(false)
  const chatEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    loadSuggestions()
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

  const loadSuggestions = async (type = 'general') => {
    try {
      setLoading(true)
      const response = await analyticsService.getAISuggestions()
      setSuggestions(response.data.suggestions || 'No suggestions available')
    } catch (error) {
      console.error('Error loading suggestions:', error)
      setSuggestions('Unable to load AI suggestions. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    toast.promise(
      loadSuggestions('general'),
      {
        loading: 'Generating new suggestions...',
        success: 'Suggestions refreshed!',
        error: 'Failed to refresh suggestions'
      }
    )
  }

  const handleBudgetTips = () => {
    toast.promise(
      loadSuggestions('budget'),
      {
        loading: 'Getting budget tips...',
        success: 'Budget tips loaded!',
        error: 'Failed to load budget tips'
      }
    )
  }

  const handleSpendingForecast = () => {
    toast.promise(
      loadSuggestions('forecast'),
      {
        loading: 'Generating spending forecast...',
        success: 'Forecast generated!',
        error: 'Failed to generate forecast'
      }
    )
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault()
    if (!userInput.trim()) return

    const userMessage = userInput.trim()
    setUserInput('')
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatLoading(true)

    try {
      const response = await api.post('/ai/chat', { message: userMessage })

      // Add AI response to chat
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.response 
      }])
    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Sorry, I encountered an error. Please try again.' 
      }])
      toast.error('Failed to get response')
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
          <h3 key={index} className="text-lg font-bold text-gray-800 mt-4 mb-2">
            {line.replace('##', '').trim()}
          </h3>
        )
      }
      // Check if it's a bullet point
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <li key={index} className="ml-4 text-gray-700 mb-1">
            {line.replace(/^[•-]\s*/, '')}
          </li>
        )
      }
      // Check if it's a numbered point
      if (/^\d+\./.test(line.trim())) {
        return (
          <li key={index} className="ml-4 text-gray-700 mb-1">
            {line.replace(/^\d+\.\s*/, '')}
          </li>
        )
      }
      // Regular text
      if (line.trim()) {
        return (
          <p key={index} className="text-gray-700 mb-2">
            {line}
          </p>
        )
      }
      return null
    })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Bot className="w-8 h-8 text-primary" />
          AI Finance Assistant
        </h1>
        <p className="text-gray-600 text-lg">Get personalized financial insights and advice powered by AI</p>
      </div>

      {/* Conversational Finance Bot */}
      <Card 
        title="AI Chat Assistant" 
        icon={Sparkles}
        subtitle="Ask me anything about your finances"
      >
        {/* Chat Messages */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 h-96 overflow-y-auto mb-5 space-y-4 border border-gray-200">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-primary to-blue-600 text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
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
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
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
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask me anything about your finances..."
              className="input w-full pr-12"
              disabled={chatLoading}
            />
            {isVoiceSupported && (
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={chatLoading}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${
                  isListening 
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
          <Button 
            type="submit" 
            variant="primary"
            size="md"
            disabled={chatLoading || !userInput.trim()}
            icon={Send}
          >
            Send
          </Button>
        </form>

        {/* Quick Questions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setUserInput("Where did I overspend this month?")}
            className="text-sm px-4 py-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
          >
            ⚠️ Where did I overspend?
          </button>
          <button
            onClick={() => setUserInput("Suggest budget plan for ₹20,000 salary")}
            className="text-sm px-4 py-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
          >
            💰 Budget plan for ₹20K
          </button>
          <button
            onClick={() => setUserInput("What are my top spending categories?")}
            className="text-sm px-4 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
          >
            📊 Top categories?
          </button>
          <button
            onClick={() => setUserInput("How much did I spend on food last month?")}
            className="text-sm px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            🍔 Food spending?
          </button>
          <button
            onClick={() => setUserInput("Can I afford a ₹5,000 phone this month?")}
            className="text-sm px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
          >
            📱 Can I afford ₹5K?
          </button>
        </div>
      </Card>

      {/* AI Suggestions */}
      <Card 
        title="Smart Insights" 
        icon={Lightbulb}
        subtitle="AI-powered financial recommendations"
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBudgetTips}
              disabled={loading}
              icon={Lightbulb}
            >
              Budget Tips
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSpendingForecast}
              disabled={loading}
              icon={Sparkles}
            >
              Forecast
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        }
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="spinner mb-4"></div>
            <p className="text-gray-500">Analyzing your expenses...</p>
          </div>
        ) : (
          <div className="prose max-w-none">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  {formatSuggestions(suggestions)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
          <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Pro Tips
          </h4>
          <ul className="text-sm text-yellow-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>Track expenses daily for better insights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>Set realistic budgets for each category</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>Review your spending patterns weekly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>Use the receipt scanner for quick entry</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

export default AIAssistant

