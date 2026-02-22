import { useState, useEffect } from 'react'
import { PieChart, Plus, Trash2, TrendingDown, TrendingUp, AlertCircle, Lightbulb, Target, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { budgetService } from '../../../services/budgetService'
import { expenseService } from '../../../services/expenseService'
import BudgetRecommendations from './BudgetRecommendations'
import toast from 'react-hot-toast'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { LiquidProgress } from '../../ui'

const Budgets = () => {
  const [activeTab, setActiveTab] = useState('budgets')
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    monthlyBudget: ''
  })

  const [historyData, setHistoryData] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  useEffect(() => {
    loadBudgets()
  }, [])

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistoryData()
    }
  }, [activeTab, selectedMonth])

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

  const loadHistoryData = async () => {
    try {
      setLoadingHistory(true)
      const budgetsResponse = await budgetService.getBudgets()
      const currentBudgets = budgetsResponse.data?.budgets || []

      if (currentBudgets.length === 0) {
        setHistoryData([])
        setLoadingHistory(false)
        return
      }

      const monthStart = startOfMonth(selectedMonth)
      const monthEnd = endOfMonth(selectedMonth)
      const expensesResponse = await expenseService.getExpenses({ limit: 10000 })
      const allExpenses = expensesResponse.data?.data || []

      const monthExpenses = allExpenses.filter(exp => {
        const expDate = new Date(exp.date)
        return expDate >= monthStart && expDate <= monthEnd
      })

      const spendingByCategory = monthExpenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount
        return acc
      }, {})

      const history = currentBudgets.map(budget => {
        const spent = spendingByCategory[budget.category] || 0
        const remaining = Math.max(0, budget.budget - spent)
        const percentage = budget.budget > 0 ? (spent / budget.budget) * 100 : 0
        return {
          category: budget.category,
          budget: budget.budget,
          spent,
          remaining,
          percentage,
          status: spent > budget.budget ? 'over' : 'under'
        }
      })

      setHistoryData(history)
    } catch (error) {
      console.error('Failed to load history:', error)
      toast.error('Failed to load budget history')
      setHistoryData([])
    } finally {
      setLoadingHistory(false)
    }
  }

  const previousMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1))
  }

  const nextMonth = () => {
    const now = new Date()
    if (selectedMonth < now) {
      setSelectedMonth(subMonths(selectedMonth, -1))
    }
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return selectedMonth.getMonth() === now.getMonth() &&
      selectedMonth.getFullYear() === now.getFullYear()
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Header with Tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-slate-100 mb-2 flex items-center gap-3 tracking-tight">
              <PieChart className="w-8 h-8 text-primary" />
              Budget Management
            </h1>
            <p className="text-gray-600 dark:text-slate-400 text-lg">Set budgets and track your spending</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-5 py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-all ${activeTab === 'budgets'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
              }`}
          >
            <span className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              My Budgets
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-5 py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-all ${activeTab === 'history'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
              }`}
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              History
            </span>
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-5 py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-all ${activeTab === 'recommendations'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
              }`}
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Smart Recommendations
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'budgets' ? (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900 p-4 sm:p-6 border border-transparent dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">Your Budgets</h3>
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
              <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                <PieChart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-slate-400 text-sm sm:text-base">No budgets set yet. Create your first budget!</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {budgets.map((budget) => (
                  <div key={budget.category} className="p-3 sm:p-4 border border-gray-200 dark:border-slate-600 rounded-lg hover:shadow-md transition-shadow dark:bg-slate-800/50">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100">{budget.category}</h3>
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
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                        title="Delete Budget"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span className="text-gray-600 dark:text-slate-400">
                          ₹{budget.spent.toFixed(2)} / ₹{budget.budget.toFixed(2)}
                        </span>
                        <span className={`font-semibold ${getStatusColor(budget.status, budget.percentage)}`}>
                          {budget.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <LiquidProgress
                        value={budget.spent}
                        max={budget.budget}
                        height={120}
                        color={
                          budget.status === 'over' ? '#ef4444' :
                            budget.percentage > 80 ? '#f97316' :
                              budget.percentage > 60 ? '#eab308' :
                                '#10b981'
                        }
                      />
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
      ) : activeTab === 'history' ? (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-900 p-4 sm:p-6 border border-transparent dark:border-slate-700">
            {/* Month Selector */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 dark:text-slate-100">
                {format(selectedMonth, 'MMMM yyyy')}
              </h3>
              <button
                onClick={nextMonth}
                disabled={isCurrentMonth()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* History Content */}
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : historyData.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-slate-400 text-sm sm:text-base">
                  No budget data for {format(selectedMonth, 'MMMM yyyy')}
                </p>
                <p className="text-gray-400 dark:text-slate-500 text-xs sm:text-sm mt-2">
                  Set budgets in the "My Budgets" tab to track your spending history
                </p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1 tracking-tight">Total Budget</h4>
                    <p className="text-2xl font-semibold text-blue-900 dark:text-blue-200 tabular-nums tracking-tight">
                      ₹{historyData.reduce((sum, item) => sum + item.budget, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <h4 className="text-sm text-purple-600 dark:text-purple-400 font-semibold mb-1 tracking-tight">Total Spent</h4>
                    <p className="text-2xl font-semibold text-purple-900 dark:text-purple-200 tabular-nums tracking-tight">
                      ₹{historyData.reduce((sum, item) => sum + item.spent, 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="text-sm text-green-600 dark:text-green-400 font-semibold mb-1">Total Saved</h4>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-200">
                      ₹{historyData.reduce((sum, item) => sum + item.remaining, 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Budget History List */}
                <div className="space-y-3 sm:space-y-4">
                  {historyData.map((item, index) => (
                    <div key={index} className="p-3 sm:p-4 border border-gray-200 dark:border-slate-600 rounded-lg dark:bg-slate-800/50">
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-slate-100">{item.category}</h3>
                            {item.status === 'over' && (
                              <span className="flex items-center gap-1 text-red-600 text-xs sm:text-sm whitespace-nowrap">
                                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                Over Budget
                              </span>
                            )}
                            {item.status === 'under' && item.percentage < 80 && (
                              <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm whitespace-nowrap">
                                ✓ On Track
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs sm:text-sm mb-1">
                          <span className="text-gray-600 dark:text-slate-400">
                            ₹{item.spent.toFixed(2)} / ₹{item.budget.toFixed(2)}
                          </span>
                          <span className={`font-semibold ${getStatusColor(item.status, item.percentage)}`}>
                            {item.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 sm:h-3 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getProgressBarColor(item.status, item.percentage)}`}
                            style={{ width: `${Math.min(item.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        {item.status === 'over' ? (
                          <>
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                            <span className="text-red-600">
                              ₹{(item.spent - item.budget).toFixed(2)} over budget
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                            <span className="text-green-600">
                              ₹{item.remaining.toFixed(2)} saved
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📊 About This Data</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    This shows your budget performance for {format(selectedMonth, 'MMMM yyyy')}.
                    Use the arrows to navigate between months and track your spending patterns over time.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : activeTab === 'recommendations' ? (
        <BudgetRecommendations />
      ) : null}
    </div>
  )
}

export default Budgets
