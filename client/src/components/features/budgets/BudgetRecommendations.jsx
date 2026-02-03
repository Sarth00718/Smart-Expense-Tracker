import React, { useState, useEffect } from 'react'
import { budgetRecommendationService } from '../../../services/budgetRecommendationService'
import toast from 'react-hot-toast'

const BudgetRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      const response = await budgetRecommendationService.getRecommendations()
      setRecommendations(response.data)
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
      toast.error('Failed to load budget recommendations')
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Analyzing your spending patterns...</p>
        </div>
      </div>
    )
  }

  if (!recommendations || !recommendations.hasData) {
    return (
      <div className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">🎯 AI Budget Recommendations</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-medium text-yellow-800">Insufficient Data</h3>
              <p className="mt-2 text-sm sm:text-base text-yellow-700">
                {recommendations?.message || 'We need at least 3 months of expense data to provide accurate budget recommendations.'}
              </p>
              <p className="mt-2 text-xs sm:text-sm text-yellow-600">
                Keep tracking your expenses consistently, and we'll generate personalized recommendations for you!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">🎯 AI Budget Recommendations</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Based on {recommendations.monthsAnalyzed} months of spending analysis
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-600 text-xs sm:text-sm">Total Recommended Budget</h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">₹{recommendations.totalRecommendedBudget.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-600 text-xs sm:text-sm">Avg Monthly Income</h3>
          <p className="text-xl sm:text-2xl font-bold text-green-600">₹{recommendations.avgMonthlyIncome.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow sm:col-span-2 lg:col-span-1">
          <h3 className="text-gray-600 text-xs sm:text-sm">Savings Potential</h3>
          <p className="text-xl sm:text-2xl font-bold text-purple-600">
            ₹{(recommendations.avgMonthlyIncome - recommendations.totalRecommendedBudget).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.recommendations.map((rec, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold">{rec.category}</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {rec.dataPoints} transactions over {rec.monthsAnalyzed} months
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getConfidenceColor(rec.confidence)}`}>
                {rec.confidence.toUpperCase()} confidence
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Current Average</p>
                <p className="text-xl sm:text-2xl font-bold">₹{rec.currentAverage.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Recommended Budget</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">₹{rec.recommendedAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm font-medium mb-2">💡 Reasoning:</p>
              <p className="text-xs sm:text-sm text-gray-700">{rec.reasoning}</p>
            </div>

            {rec.recommendedAmount > rec.currentAverage && (
              <div className="mt-3 flex items-center text-xs sm:text-sm text-yellow-600">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Buffer added for spending variability</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-blue-800 mb-2">📊 How to Use These Recommendations</h3>
        <ul className="space-y-2 text-xs sm:text-sm text-blue-700">
          <li className="flex items-start">
            <span className="mr-2 font-semibold">1.</span>
            <span>Review each category's recommended budget and reasoning</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-semibold">2.</span>
            <span>Go to the Budgets section to set these recommended amounts</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-semibold">3.</span>
            <span>Adjust based on your personal goals and circumstances</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2 font-semibold">4.</span>
            <span>Track your progress and update budgets as needed</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default BudgetRecommendations
