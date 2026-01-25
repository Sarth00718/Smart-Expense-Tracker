import React, { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, TrendingUp, Lightbulb } from 'lucide-react'
import { analyticsService } from '../services/analyticsService'
import toast from 'react-hot-toast'

const AIAssistant = () => {
  const [suggestions, setSuggestions] = useState('')
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(null)

  useEffect(() => {
    loadSuggestions()
    loadScore()
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
    <div className="space-y-6">
      {/* Financial Health Score */}
      {score && (
        <div className="card bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Financial Health Score
            </h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="12"
                  fill="none"
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
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{score.score}</span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold mb-1">{score.rating}</p>
              <p className="text-white/80">out of {score.maxScore}</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            AI Financial Assistant
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleBudgetTips}
              disabled={loading}
              className="btn btn-secondary"
              title="Get Budget Tips"
            >
              <TrendingUp className="w-5 h-5" />
              Budget Tips
            </button>
            <button
              onClick={handleSpendingForecast}
              disabled={loading}
              className="btn btn-secondary"
              title="Get Spending Forecast"
            >
              <Lightbulb className="w-5 h-5" />
              Forecast
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn btn-secondary"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="spinner mb-4"></div>
            <p className="text-gray-500">Analyzing your expenses...</p>
          </div>
        ) : (
          <div className="prose max-w-none">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  {formatSuggestions(suggestions)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 Pro Tips</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
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

