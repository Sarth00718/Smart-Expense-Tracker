import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, RefreshCw, TrendingUp, Lightbulb, Send, Bot, User } from 'lucide-react'
import { analyticsService } from '../services/analyticsService'
import toast from 'react-hot-toast'
import api from '../services/api'

const AIAssistant = () => {
  const [suggestions, setSuggestions] = useState('')
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [userInput, setUserInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    loadSuggestions()
    loadScore()
    // Add welcome message
    setChatMessages([{
      role: 'assistant',
      content: '👋 Hi! I\'m your AI Finance Assistant. Ask me anything about your expenses!\n\nTry asking:\n• "How much did I spend on food last month?"\n• "Can I afford a ₹5,000 phone this month?"\n• "What are my top spending categories?"\n• "Show me my recent expenses"'
    }])
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

  const loadScore = async () => {
    try {
      const response = await analyticsService.getScore()
      setScore(response.data)
    } catch (error) {
      console.error('Error loading score:', error)
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Conversational Finance Bot */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Chat with AI Finance Bot
          </h2>
        </div>

        {/* Chat Messages */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 h-64 sm:h-80 lg:h-96 overflow-y-auto mb-4 space-y-3 sm:space-y-4">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              )}
              <div className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 ${
                msg.role === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-white border border-gray-200'
              }`}>
                <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {chatLoading && (
            <div className="flex gap-2 sm:gap-3 justify-start">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleChatSubmit} className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask me anything..."
            className="input flex-1 text-sm sm:text-base"
            disabled={chatLoading}
          />
          <button 
            type="submit" 
            className="btn btn-primary px-3 sm:px-4"
            disabled={chatLoading || !userInput.trim()}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>

        {/* Quick Questions */}
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setUserInput("How much did I spend on food last month?")}
            className="text-xs px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
          >
            Food spending?
          </button>
          <button
            onClick={() => setUserInput("Can I afford a ₹5,000 phone this month?")}
            className="text-xs px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
          >
            Afford ₹5,000?
          </button>
          <button
            onClick={() => setUserInput("What are my top spending categories?")}
            className="text-xs px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
          >
            Top categories?
          </button>
        </div>
      </div>

      {/* Financial Health Score */}
      {score && (
        <div className="card bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              Financial Health Score
            </h3>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="10"
                  fill="none"
                  className="sm:hidden"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="white"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${(score.score / 100) * 263.89} 263.89`}
                  strokeLinecap="round"
                  className="sm:hidden"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="12"
                  fill="none"
                  className="hidden sm:block"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="white"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(score.score / 100) * 351.86} 351.86`}
                  strokeLinecap="round"
                  className="hidden sm:block"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl sm:text-4xl font-bold">{score.score}</span>
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold mb-1">{score.rating}</p>
              <p className="text-white/80 text-sm sm:text-base">out of {score.maxScore}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            AI Financial Assistant
          </h2>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={handleBudgetTips}
              disabled={loading}
              className="flex-1 sm:flex-none btn btn-secondary text-xs sm:text-sm"
              title="Get Budget Tips"
            >
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Budget Tips</span>
              <span className="sm:hidden">Budget</span>
            </button>
            <button
              onClick={handleSpendingForecast}
              disabled={loading}
              className="flex-1 sm:flex-none btn btn-secondary text-xs sm:text-sm"
              title="Get Spending Forecast"
            >
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Forecast</span>
              <span className="sm:inline">Forecast</span>
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex-1 sm:flex-none btn btn-secondary text-xs sm:text-sm"
              title="Refresh Suggestions"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="spinner mb-4"></div>
            <p className="text-gray-500 text-sm sm:text-base">Analyzing your expenses...</p>
          </div>
        ) : (
          <div className="prose max-w-none">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 sm:p-6 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1 text-sm sm:text-base">
                  {formatSuggestions(suggestions)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2 text-sm sm:text-base">💡 Pro Tips</h4>
          <ul className="text-xs sm:text-sm text-yellow-700 space-y-1">
            <li>• Track expenses daily for better insights</li>
            <li>• Set realistic budgets for each category</li>
            <li>• Review your spending patterns weekly</li>
            <li>• Use the receipt scanner for quick entry</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant

