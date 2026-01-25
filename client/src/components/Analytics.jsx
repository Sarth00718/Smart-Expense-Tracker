import React, { useState, useEffect } from 'react'
import { TrendingUp, BarChart3, PieChart, Calendar, Activity } from 'lucide-react'
import { useExpense } from '../context/ExpenseContext'
import { analyticsService } from '../services/analyticsService'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const Analytics = () => {
  const { expenses } = useExpense()
  const [patterns, setPatterns] = useState([])
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [expenses])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const [patternsRes, predictionsRes] = await Promise.all([
        analyticsService.getPatterns(),
        analyticsService.getPredictions()
      ])
      setPatterns(patternsRes.data.patterns || [])
      setPredictions(predictionsRes.data.predictions || [])
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate monthly spending trend
  const getMonthlyTrend = () => {
    const monthlyData = {}
    expenses.forEach(exp => {
      const month = new Date(exp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      monthlyData[month] = (monthlyData[month] || 0) + exp.amount
    })

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => 
      new Date(a) - new Date(b)
    ).slice(-6) // Last 6 months

    return {
      labels: sortedMonths,
      datasets: [{
        label: 'Monthly Spending',
        data: sortedMonths.map(m => monthlyData[m]),
        borderColor: '#4361ee',
        backgroundColor: 'rgba(67, 97, 238, 0.1)',
        tension: 0.4,
        fill: true
      }]
    }
  }

  // Calculate category breakdown
  const getCategoryBreakdown = () => {
    const categoryData = {}
    expenses.forEach(exp => {
      categoryData[exp.category] = (categoryData[exp.category] || 0) + exp.amount
    })

    const sortedCategories = Object.entries(categoryData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)

    return {
      labels: sortedCategories.map(([cat]) => cat),
      datasets: [{
        label: 'Spending by Category',
        data: sortedCategories.map(([, amt]) => amt),
        backgroundColor: [
          '#4361ee', '#3a0ca3', '#4cc9f0', '#f72585',
          '#f8961e', '#7209b7', '#38b000', '#ff9e00'
        ]
      }]
    }
  }

  // Calculate daily average
  const getDailyAverage = () => {
    if (expenses.length === 0) return 0
    const dates = expenses.map(e => new Date(e.date))
    const minDate = new Date(Math.min(...dates))
    const maxDate = new Date(Math.max(...dates))
    const days = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1
    const total = expenses.reduce((sum, e) => sum + e.amount, 0)
    return (total / days).toFixed(2)
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <Activity className="w-8 h-8 mb-2" />
          <p className="text-white/80 text-sm">Daily Average</p>
          <p className="text-3xl font-bold mt-1">₹{getDailyAverage()}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-700 text-white">
          <PieChart className="w-8 h-8 mb-2" />
          <p className="text-white/80 text-sm">Total Categories</p>
          <p className="text-3xl font-bold mt-1">
            {new Set(expenses.map(e => e.category)).size}
          </p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-700 text-white">
          <Calendar className="w-8 h-8 mb-2" />
          <p className="text-white/80 text-sm">Total Transactions</p>
          <p className="text-3xl font-bold mt-1">{expenses.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Monthly Spending Trend
          </h3>
          <div className="h-64">
            <Line data={getMonthlyTrend()} options={chartOptions} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Category Breakdown
          </h3>
          <div className="h-64">
            <Bar data={getCategoryBreakdown()} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Behavioral Patterns */}
      {patterns.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">🔍 Behavioral Patterns</h3>
          <div className="space-y-3">
            {patterns.map((pattern, index) => (
              <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{pattern.type === 'weekend_splurging' ? '🎉' : pattern.type === 'impulse_buying' ? '🛍️' : '📊'}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{pattern.description}</p>
                    <p className="text-sm text-gray-600 mt-1">Impact: {pattern.impact}</p>
                    <p className="text-sm text-blue-700 mt-1">💡 {pattern.suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Predictions */}
      {predictions.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">🔮 Future Predictions</h3>
          
          {/* Predictions Chart */}
          <div className="h-64 mb-6">
            <Line 
              data={{
                labels: predictions.map(pred => pred.month || 'N/A'),
                datasets: [{
                  label: 'Predicted Spending',
                  data: predictions.map(pred => pred.predictedAmount || 0),
                  borderColor: '#7c3aed',
                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                  tension: 0.4,
                  fill: true,
                  borderWidth: 3,
                  pointRadius: 5,
                  pointBackgroundColor: '#7c3aed'
                }]
              }}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    display: true,
                    text: 'Predicted Future Spending'
                  }
                }
              }}
            />
          </div>

          {/* Predictions Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {predictions.map((pred, index) => (
              <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-600 font-semibold mb-1">
                  {pred.month || `Month ${index + 1}`}
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  ₹{pred.predictedAmount?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Confidence: {pred.confidence || 'low'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="card bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200">
        <h3 className="text-xl font-bold mb-4 text-orange-800">💡 Key Insights</h3>
        <div className="space-y-2 text-orange-700">
          <p>• Your most expensive category is {
            Object.entries(
              expenses.reduce((acc, e) => {
                acc[e.category] = (acc[e.category] || 0) + e.amount
                return acc
              }, {})
            ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
          }</p>
          <p>• You've tracked {expenses.length} expenses so far</p>
          <p>• Average transaction: ₹{(expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length || 0).toFixed(2)}</p>
        </div>
      </div>
    </div>
  )
}

export default Analytics

