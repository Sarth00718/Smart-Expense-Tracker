import React, { useState, useEffect } from 'react'
import { PieChart, Plus, Trash2, TrendingDown, TrendingUp, AlertCircle, Lightbulb, Target } from 'lucide-react'
import { budgetService } from '../services/budgetService'
import { budgetRecommendationService } from '../services/budgetRecommendationService'
import toast from 'react-hot-toast'

const Budgets = () => {
  const [activeTab, setActiveTab] = useState('budgets') // 'budgets' or 'recommendations'
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    monthlyBudget: ''
  })
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState(null)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)

  useEffect(() => {
    loadBudgets()
  }, [])

  useEffect(() => {
    if (activeTab === 'recommendations' && !recommendations) {
      loadRecommendations()
    }
  }, [activeTab])

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const response = await budgetService.getBudgets()
      setBudgets(response.data.budgets || [])
    } catch (error) {
      console.error('Error loading budgets:', error)
      toast.error('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  const loadRecommendations = async () => {
    try {
      setLoadingRecommendations(true)
      const response = await budgetRecommendationService.getRecommendations()
      setRecommendations(response.data)
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
      toast.error('Failed to load budget recommendations')
    } finally {
      setLoadingRecommendations(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await budgetService.setBudget(formData)
      toast.success('Budget set successfully!')
      setFormData({ category: '', monthlyBudget: '' })
      setShowForm(false)
      loadBudgets()
    } catch (error) {
      toast.error('Failed to set budget')
    }
  }

  const handleDelete = async (category) => {
    if (window.confirm(`Delete budget for ${category}?`)) {
      try {
        await budgetService.deleteBudget(category)
        toast.success('Budget deleted successfully')
        loadBudgets()
      } catch (error) {
        toast.error('Failed to delete budget')
      }
    }
  }

  const applyRecommendation = async (category, amount) => {
    try {
      await budgetService.setBudget({ category, monthlyBudget: amount })
      toast.success(`Budget set for ${category}!`)
      setActiveTab('budgets')
      loadBudgets()
    } catch (error) {
      toast.error('Failed to apply recommendation')
    }
  }

  const getStatusColor = (status, percentage) => {
    if (status === 'over') return 'text-red-600'
    if (percentage > 80) return 'text-orange-600'
    if (percentage > 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressBarColor = (status, percentage) => {
    if (status === 'over') return 'bg-red-500'
    if (percentage > 80) return 'bg-orange-500'
    if (percentage > 60) return 'bg-yellow-500'
    return 'bg-green-500'
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

  return (
    <div className="p-4 sm:p-6">
      {/* Header with Tabs */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          Budget Management
        </h2>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
              activeTab === 'budgets'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              My Budgets
            </span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
              activeTab === 'recommendations'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              AI Recommendations
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'budgets' ? (
        // Budgets Tab
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold">Your Budgets</h3>
              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                {showForm ? 'Cancel' : 'Add Budget'}
              </button>
            </div>

            {/* Add Budget Form */}
            {showForm && (
              <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="">Select Category</option>
                      <option value="Food">Food</option>
                      <option value="Travel">Travel</option>
                      <option value="Transport">Transport</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills">Bills</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Monthly Budget (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.monthlyBudget}
                      onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                      required
                      placeholder="5000.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4 text-sm sm:text-base">
                  Set Budget
                </button>
              </form>
            )}

            {/* Budget List */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <PieChart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">No budgets set yet. Create your first budget!</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {budgets.map((budget) => (
                  <div key={budget.category} className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-semibold">{budget.category}</h3>
                          {budget.status === 'over' && (
                            <span className="flex items-center gap-1 text-red-600 text-xs sm:text-sm whitespace-nowrap">
                              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              Over Budget
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(budget.category)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span className="text-gray-600">
                          ₹{budget.spent.toFixed(2)} / ₹{budget.budget.toFixed(2)}
                        </span>
                        <span className={`font-semibold ${getStatusColor(budget.status, budget.percentage)}`}>
                          {budget.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getProgressBarColor(budget.status, budget.percentage)}`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      {budget.status === 'over' ? (
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                      )}
                      <span className={getStatusColor(budget.status, budget.percentage)}>
                        {budget.status === 'over' 
                          ? `₹${(budget.spent - budget.budget).toFixed(2)} over budget`
                          : `₹${budget.remaining.toFixed(2)} remaining`
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // AI Recommendations Tab
        <div className="space-y-4">
          {loadingRecommendations ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600 text-sm sm:text-base">Analyzing your spending patterns...</p>
              </div>
            </div>
          ) : !recommendations || !recommendations.hasData ? (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-yellow-800 mb-2">Insufficient Data</h3>
                    <p className="text-xs sm:text-sm text-yellow-700 mb-2">
                      {recommendations?.message || 'We need at least 3 months of expense data to provide accurate budget recommendations.'}
                    </p>
                    <p className="text-xs text-yellow-600">
                      Keep tracking your expenses consistently, and we'll generate personalized recommendations for you!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-gray-600 text-xs sm:text-sm">Total Recommended Budget</h3>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">₹{recommendations.totalRecommendedBudget.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-gray-600 text-xs sm:text-sm">Avg Monthly Income</h3>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">₹{recommendations.avgMonthlyIncome.toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow sm:col-span-2 lg:col-span-1">
                  <h3 className="text-gray-600 text-xs sm:text-sm">Savings Potential</h3>
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">
                    ₹{(recommendations.avgMonthlyIncome - recommendations.totalRecommendedBudget).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Recommendations List */}
              <div className="space-y-3 sm:space-y-4">
                {recommendations.recommendations.map((rec, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold mb-1">{rec.category}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {rec.dataPoints} transactions over {rec.monthsAnalyzed} months
                        </p>
                      </div>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getConfidenceColor(rec.confidence)}`}>
                        {rec.confidence.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Current Average</p>
                        <p className="text-lg sm:text-xl font-bold">₹{rec.currentAverage.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Recommended</p>
                        <p className="text-lg sm:text-xl font-bold text-blue-600">₹{rec.recommendedAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs sm:text-sm font-medium mb-1">💡 Reasoning:</p>
                      <p className="text-xs sm:text-sm text-gray-700">{rec.reasoning}</p>
                    </div>

                    <button
                      onClick={() => applyRecommendation(rec.category, rec.recommendedAmount)}
                      className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                    >
                      Apply This Budget
                    </button>
                  </div>
                ))}
              </div>

              {/* Usage Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm sm:text-base font-medium text-blue-800 mb-2">📊 How to Use</h3>
                <ul className="space-y-1 text-xs sm:text-sm text-blue-700">
                  <li>• Review each category's recommended budget</li>
                  <li>• Click "Apply This Budget" to set it automatically</li>
                  <li>• Adjust based on your personal goals</li>
                  <li>• Track your progress in the "My Budgets" tab</li>
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Budgets

