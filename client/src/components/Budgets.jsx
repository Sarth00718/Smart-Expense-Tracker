import React, { useState, useEffect } from 'react'
import { PieChart, Plus, Trash2, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react'
import { budgetService } from '../services/budgetService'
import toast from 'react-hot-toast'

const Budgets = () => {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    monthlyBudget: ''
  })

  useEffect(() => {
    loadBudgets()
  }, [])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <PieChart className="w-6 h-6 text-primary" />
            Budget Planning
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Cancel' : 'Add Budget'}
          </button>
        </div>

        {/* Add Budget Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="input"
                >
                  <option value="">Select Category</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills">Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="input"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-4">
              Set Budget
            </button>
          </form>
        )}

        {/* Budget List */}
        {budgets.length === 0 ? (
          <div className="text-center py-12">
            <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No budgets set yet. Create your first budget!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div key={budget.category} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{budget.category}</h3>
                    {budget.status === 'over' && (
                      <span className="flex items-center gap-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Over Budget
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(budget.category)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Budget"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      ₹{budget.spent.toFixed(2)} / ₹{budget.budget.toFixed(2)}
                    </span>
                    <span className={`font-semibold ${getStatusColor(budget.status, budget.percentage)}`}>
                      {budget.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getProgressBarColor(budget.status, budget.percentage)}`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {budget.status === 'over' ? (
                      <TrendingUp className="w-4 h-4 text-red-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    )}
                    <span className={getStatusColor(budget.status, budget.percentage)}>
                      {budget.status === 'over' 
                        ? `₹${(budget.spent - budget.budget).toFixed(2)} over budget`
                        : `₹${budget.remaining.toFixed(2)} remaining`
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Budgets

