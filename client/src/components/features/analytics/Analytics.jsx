import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { 
  TrendingUp, BarChart3, PieChart, Activity, 
  DollarSign, TrendingDown, Zap, Calendar
} from 'lucide-react'
import { useExpense } from '../../../context/ExpenseContext'
import { useIncome } from '../../../context/IncomeContext'
import { analyticsService } from '../../../services/analyticsService'
import { Card } from '../../ui'
import SpendingHeatmap from './SpendingHeatmap'
import { 
  AreaChart, BarChart, PieChart as RechartsPie, 
  Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Pie, Bar
} from 'recharts'
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval } from 'date-fns'

// Memoized chart components
const SpendingTrendChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#4361ee" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6b7280" />
      <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
      <Tooltip 
        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
      />
      <Area type="monotone" dataKey="amount" stroke="#4361ee" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
    </AreaChart>
  </ResponsiveContainer>
))

const CategoryPieChart = memo(({ data, colors }) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
    <RechartsPie>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={window.innerWidth < 640 ? 60 : 90}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Tooltip />
    </RechartsPie>
  </ResponsiveContainer>
))

const Analytics = () => {
  const { expenses } = useExpense()
  const { income } = useIncome()
  const [patterns, setPatterns] = useState([])
  const [predictions, setPredictions] = useState([])
  const [timeRange, setTimeRange] = useState('thisMonth')
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const COLORS = useMemo(() => 
    ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#f8961e', '#38b000', '#ff006e', '#8338ec'],
    []
  )

  const loadAnalytics = useCallback(async () => {
    if (analyticsLoading) return // Prevent duplicate calls
    
    try {
      setAnalyticsLoading(true)
      const [patternsRes, predictionsRes] = await Promise.all([
        analyticsService.getPatterns(),
        analyticsService.getPredictions()
      ])
      setPatterns(patternsRes.data.patterns || [])
      setPredictions(predictionsRes.data.predictions || [])
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [analyticsLoading])

  useEffect(() => {
    // Only load analytics once when component mounts
    if (expenses.length > 0 && patterns.length === 0 && !analyticsLoading) {
      loadAnalytics()
    }
  }, [expenses.length, patterns.length, analyticsLoading, loadAnalytics])

  // Filter data by time range
  const filteredData = useMemo(() => {
    const now = new Date()
    let startDate, endDate

    switch (timeRange) {
      case 'thisMonth':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case 'lastMonth':
        startDate = startOfMonth(subMonths(now, 1))
        endDate = endOfMonth(subMonths(now, 1))
        break
      case 'last3Months':
        startDate = startOfMonth(subMonths(now, 2))
        endDate = endOfMonth(now)
        break
      case 'last6Months':
        startDate = startOfMonth(subMonths(now, 5))
        endDate = endOfMonth(now)
        break
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
    }

    const filteredExpenses = (expenses || []).filter(exp => {
      const expDate = new Date(exp.date)
      return expDate >= startDate && expDate <= endDate
    })

    const filteredIncome = (income || []).filter(inc => {
      const incDate = new Date(inc.date)
      return incDate >= startDate && incDate <= endDate
    })

    return { expenses: filteredExpenses, income: filteredIncome, startDate, endDate }
  }, [expenses, income, timeRange])

  // Calculate spending trend data
  const spendingTrendData = useMemo(() => {
    const { expenses, startDate, endDate } = filteredData
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    
    return days.map(day => {
      const dayExpenses = expenses.filter(exp => 
        format(new Date(exp.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      )
      const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      
      return {
        date: format(day, 'MMM dd'),
        amount: total
      }
    })
  }, [filteredData])

  // Calculate category data
  const categoryData = useMemo(() => {
    const { expenses } = filteredData
    const categoryMap = {}
    
    expenses.forEach(exp => {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount
    })
    
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredData])

  // Calculate income vs expense data
  const incomeVsExpenseData = useMemo(() => {
    const { expenses, income } = filteredData
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0)
    
    return [
      { name: 'Income', value: totalIncome, fill: '#38b000' },
      { name: 'Expense', value: totalExpense, fill: '#f72585' },
      { name: 'Savings', value: Math.max(0, totalIncome - totalExpense), fill: '#4361ee' }
    ]
  }, [filteredData])

  // Calculate statistics
  const statistics = useMemo(() => {
    const { expenses, income } = filteredData
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0)
    const netSavings = totalIncome - totalExpenses
    const avgDaily = totalExpenses / (expenses.length || 1)
    const categoryCount = new Set(expenses.map(exp => exp.category)).size
    const transactionCount = expenses.length + income.length

    return {
      totalExpenses,
      totalIncome,
      netSavings,
      avgDaily,
      categoryCount,
      transactionCount
    }
  }, [filteredData])

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-[1600px] mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-1 sm:mb-2 tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
            Insights into your spending patterns
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'thisMonth', label: 'This Month' },
            { value: 'lastMonth', label: 'Last Month' },
            { value: 'last3Months', label: 'Last 3 Months' },
            { value: 'last6Months', label: 'Last 6 Months' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                timeRange === option.value
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 sm:p-4">
          <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
          <p className="text-white/80 text-xs sm:text-sm tracking-tight">Total Income</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 tabular-nums tracking-tight">₹{statistics.totalIncome.toFixed(0)}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white p-3 sm:p-4">
          <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
          <p className="text-white/80 text-xs sm:text-sm tracking-tight">Total Expenses</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 tabular-nums tracking-tight">₹{statistics.totalExpenses.toFixed(0)}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white p-3 sm:p-4">
          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
          <p className="text-white/80 text-xs sm:text-sm tracking-tight">Net Savings</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 tabular-nums tracking-tight">₹{statistics.netSavings.toFixed(0)}</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white p-3 sm:p-4">
          <Activity className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
          <p className="text-white/80 text-xs sm:text-sm tracking-tight">Avg Daily</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 tabular-nums tracking-tight">₹{statistics.avgDaily.toFixed(0)}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 sm:p-4">
          <PieChart className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
          <p className="text-white/80 text-xs sm:text-sm tracking-tight">Categories</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 tabular-nums tracking-tight">{statistics.categoryCount}</p>
        </div>
        <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-3 sm:p-4">
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
          <p className="text-white/80 text-xs sm:text-sm tracking-tight">Transactions</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 tabular-nums tracking-tight">{statistics.transactionCount}</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Spending Trend */}
        <Card title="Spending Trend" subtitle="Daily spending over time" icon={TrendingUp}>
          <div className="w-full" style={{ minHeight: '256px', height: '320px' }}>
            {filteredData.expenses.length > 0 ? (
              <SpendingTrendChart data={spendingTrendData} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No expense data available
              </div>
            )}
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card title="Category Breakdown" subtitle="Spending by category" icon={PieChart}>
          <div className="w-full" style={{ minHeight: '256px', height: '320px' }}>
            {categoryData.length > 0 ? (
              <CategoryPieChart data={categoryData} colors={COLORS} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No category data available
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Spending Heatmap - Full Width */}
      <SpendingHeatmap />

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Income vs Expense */}
        <Card title="Income vs Expense" subtitle="Financial overview" icon={BarChart3}>
          <div className="w-full" style={{ minHeight: '256px', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
              <BarChart data={incomeVsExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6b7280" />
                <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {incomeVsExpenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Categories */}
        <Card title="Top Spending Categories" subtitle="Your biggest expenses" icon={BarChart3}>
          <div className="space-y-3 sm:space-y-4">
            {categoryData.slice(0, 5).map((cat, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{cat.name}</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 tabular-nums">₹{cat.value.toFixed(0)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${categoryData.length > 0 ? (cat.value / categoryData[0].value) * 100 : 0}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
            {categoryData.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No category data available
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* AI Insights */}
        <Card title="💡 Smart Insights" subtitle="AI-powered analysis">
          <div className="space-y-3">
            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">Spending Pattern</p>
              <p className="text-xs sm:text-sm text-blue-700">
                {statistics.avgDaily > 500 
                  ? "You're spending above average daily. Consider reviewing your expenses." 
                  : "You're maintaining good spending habits. Keep it up!"}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs sm:text-sm font-semibold text-green-900 mb-1">Savings Rate</p>
              <p className="text-xs sm:text-sm text-green-700">
                {statistics.totalIncome > 0 
                  ? `You're saving ${((statistics.netSavings / statistics.totalIncome) * 100).toFixed(1)}% of your income`
                  : "Add income data to track your savings rate"}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs sm:text-sm font-semibold text-purple-900 mb-1">Top Category</p>
              <p className="text-xs sm:text-sm text-purple-700">
                {categoryData.length > 0 
                  ? `Most spending in ${categoryData[0].name} (₹${categoryData[0].value.toFixed(0)})`
                  : "No category data available yet"}
              </p>
            </div>
          </div>
        </Card>

        {/* Behavioral Patterns */}
        <Card title="🔍 Behavioral Patterns" subtitle="Your spending habits">
          {patterns.length > 0 ? (
            <div className="space-y-3">
              {patterns.slice(0, 3).map((pattern, index) => (
                <div key={index} className="p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <span className="text-xl sm:text-2xl">
                      {pattern.type === 'weekend_splurging' ? '🎉' : 
                       pattern.type === 'impulse_buying' ? '🛍️' : '📊'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-xs sm:text-sm">{pattern.description}</p>
                      <p className="text-xs text-gray-600 mt-1">Impact: {pattern.impact}</p>
                      <p className="text-xs text-orange-700 mt-1">💡 {pattern.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Add more expenses to see behavioral patterns</p>
            </div>
          )}
        </Card>
      </div>

      {/* Predictions */}
      {predictions.length > 0 && (
        <Card title="🔮 Future Predictions" subtitle="AI-powered spending forecast">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {predictions.slice(0, 3).map((pred, index) => (
              <div key={index} className="p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs sm:text-sm text-purple-600 font-semibold mb-1">
                  {pred.month || `Month ${index + 1}`}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-purple-900">
                  ₹{pred.predictedAmount?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  Confidence: {pred.confidence || 'medium'}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

export default Analytics
