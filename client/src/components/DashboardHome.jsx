import React, { useState, useEffect } from 'react'
import { useExpense } from '../context/ExpenseContext'
import { analyticsService } from '../services/analyticsService'
import { TrendingUp, Tag, Clock, Calendar, Plus } from 'lucide-react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import toast from 'react-hot-toast'

ChartJS.register(ArcElement, Tooltip, Legend)

const DashboardHome = () => {
  const { expenses, addExpense } = useExpense()
  const [stats, setStats] = useState(null)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    description: ''
  })

  useEffect(() => {
    loadStats()
  }, [expenses])

  const loadStats = async () => {
    try {
      const response = await analyticsService.getDashboard()
      setStats(response.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addExpense(formData)
      toast.success('Expense added successfully!')
      setFormData({
        date: new Date().toISOString().split('T')[0],
        category: '',
        amount: '',
        description: ''
      })
    } catch (error) {
      toast.error('Failed to add expense')
    }
  }

  // Calculate category data for chart
  const categoryData = Array.isArray(expenses) ? expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {}) : {}

  const chartData = {
    labels: Object.keys(categoryData),
    datasets: [{
      data: Object.values(categoryData),
      backgroundColor: [
        '#4361ee', '#3a0ca3', '#4cc9f0', '#f72585',
        '#f8961e', '#7209b7', '#38b000', '#ff9e00'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="card bg-gradient-to-br from-green-500 to-green-700 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <p className="text-white/80 text-xs sm:text-sm">Total Income</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
            ₹{stats?.totalIncome?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-700 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <p className="text-white/80 text-xs sm:text-sm">Total Expenses</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
            ₹{stats?.totalExpenses?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className={`card bg-gradient-to-br ${(stats?.netBalance || 0) >= 0 ? 'from-blue-500 to-blue-700' : 'from-orange-500 to-orange-700'} text-white`}>
          <div className="flex items-center justify-between mb-2">
            <Tag className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <p className="text-white/80 text-xs sm:text-sm">Net Balance</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
            ₹{stats?.netBalance?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <p className="text-white/80 text-xs sm:text-sm">This Month Net</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
            ₹{stats?.monthNetBalance?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Add Expense Form */}
        <div className="card">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Add New Expense
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="input w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="input w-full text-sm"
                >
                  <option value="">Select</option>
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
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="0.00"
                className="input w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What was this expense for?"
                className="input w-full text-sm"
              />
            </div>

            <button type="submit" className="btn btn-primary w-full text-sm sm:text-base">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Add Expense
            </button>
          </form>
        </div>

        {/* Category Chart */}
        <div className="card">
          <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Spending by Category</h2>
          {Object.keys(categoryData).length > 0 ? (
            <div className="h-48 sm:h-64">
              <Doughnut 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: window.innerWidth < 640 ? 'bottom' : 'right',
                      labels: {
                        boxWidth: window.innerWidth < 640 ? 12 : 15,
                        font: {
                          size: window.innerWidth < 640 ? 10 : 12
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-48 sm:h-64 flex items-center justify-center text-gray-400">
              <p className="text-sm sm:text-base text-center px-4">No expenses yet. Add your first expense!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
