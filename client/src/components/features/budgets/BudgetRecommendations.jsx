import { useState, useEffect } from 'react'
import { budgetRecommendationService } from '../../../services/budgetRecommendationService'
import { budgetService } from '../../../services/budgetService'
import toast from 'react-hot-toast'
import { Lightbulb, TrendingUp, Calendar } from 'lucide-react'

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

  const applyRecommendation = async (category, amount) => {
    try {
      await budgetService.setBudget({ category, monthlyBudget: amount })
      toast.success(`Budget set for ${category}!`)
    } catch (error) {
      toast.error('Failed to apply recommendation')
    }
  }

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
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
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 tracking-tight font-sans">💡 Budget Recommendations</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-medium text-yellow-800">No Expense Data</h3>
              <p className="mt-2 text-sm sm:text-base text-yellow-700">
                {recommendations?.message || 'Start tracking your expenses to get personalized budget recommendations.'}
              </p>
              <p className="mt-2 text-xs sm:text-sm text-yellow-600">
                Add expenses in different categories, and we'll analyze your spending patterns to suggest optimal budgets!
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-base font-semibold text-blue-900 mb-1">
              Smart Budget Recommendations
            </h3>
            <p className="text-sm text-blue-700">
              Based on {recommendations.monthsAnalyzed} month{recommendations.monthsAnalyzed > 1 ? 's' : ''} of your spending history
              {recommendations.monthsAnalyzed === 1 && ' (Track more months for better accuracy)'}
            </p>
          </div>
        </div>
      </div>

      {/* Single Month Warning */}
      {recommendations.monthsAnalyzed === 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-700">
                These recommendations are based on limited data (1 month). Continue tracking your expenses for more accurate and personalized budget suggestions!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="text-gray-600 text-xs sm:text-sm mb-1">Total Recommended Budget</h3>
          <p className="text-xl sm:text-2xl font-bold text-blue-600">₹{recommendations.totalRecommendedBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="text-gray-600 text-xs sm:text-sm mb-1">Avg Monthly Income</h3>
          <p className="text-xl sm:text-2xl font-bold text-green-600">₹{recommendations.avgMonthlyIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 sm:col-span-2 lg:col-span-1">
          <h3 className="text-gray-600 text-xs sm:text-sm mb-1">Potential Savings</h3>
          <p className="text-xl sm:text-2xl font-bold text-purple-600">
            ₹{Math.max(0, recommendations.avgMonthlyIncome - recommendations.totalRecommendedBudget).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.recommendations.map((rec, index) => (
          <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{rec.category}</h3>
                <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {rec.monthsAnalyzed} month{rec.monthsAnalyzed > 1 ? 's' : ''} of data • {rec.dataPoints} transaction{rec.dataPoints > 1 ? 's' : ''}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border ${getConfidenceColor(rec.confidence)}`}>
                {rec.confidence.toUpperCase()} CONFIDENCE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Current Average</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{rec.currentAverage.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs sm:text-sm text-blue-600 mb-1">Recommended Budget</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">₹{rec.recommendedAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 mb-4 border border-gray-200">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 mb-1">Why this amount?</p>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{rec.reasoning}</p>
                </div>
              </div>
            </div>

            {rec.recommendedAmount > rec.currentAverage && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-600 mb-4 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <TrendingUp className="w-4 h-4 flex-shrink-0" />
                <span>Buffer added: ₹{(rec.recommendedAmount - rec.currentAverage).toLocaleString()} for spending variability</span>
              </div>
            )}

            <button
              onClick={() => applyRecommendation(rec.category, rec.recommendedAmount)}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow"
            >
              Apply This Budget
            </button>
          </div>
        ))}
      </div>

      {/* Usage Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How to Use These Recommendations
        </h3>
        <ul className="space-y-2 text-xs sm:text-sm text-green-800">
          <li className="flex items-start gap-2">
            <span className="font-semibold min-w-[20px]">1.</span>
            <span>Review each category's recommended budget and the reasoning behind it</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold min-w-[20px]">2.</span>
            <span>Click "Apply This Budget" to automatically set the recommended amount</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold min-w-[20px]">3.</span>
            <span>Adjust the amounts based on your personal financial goals and circumstances</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold min-w-[20px]">4.</span>
            <span>Track your spending in the "My Budgets" tab and adjust as needed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold min-w-[20px]">5.</span>
            <span>Continue tracking expenses to improve recommendation accuracy over time</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default BudgetRecommendations
