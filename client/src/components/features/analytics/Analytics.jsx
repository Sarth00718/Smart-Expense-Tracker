import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { 
  TrendingUp, BarChart3, PieChart, Activity, 
  DollarSign, TrendingDown, Zap, Calendar, Target, Wallet, CreditCard, ArrowUpCircle, ArrowDownCircle
} from 'lucide-react'
import { useExpense } from '../../../context/ExpenseContext'
import { useIncome } from '../../../context/IncomeContext'
import { analyticsService } from '../../../services/analyticsService'
import { Card } from '../../ui'
import SpendingHeatmap from './SpendingHeatmap'
import { 
  AreaChart, BarChart, PieChart as RechartsPie, LineChart, Line, ComposedChart,
  Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, Pie, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval, startOfWeek, endOfWeek, eachWeekOfInterval } from 'date-fns'

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

// New Chart Components
const MonthlyComparisonChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
    <ComposedChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#6b7280" />
      <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
      <Legend />
      <Bar dataKey="income" fill="#38b000" name="Income" radius={[8, 8, 0, 0]} />
      <Bar dataKey="expenses" fill="#f72585" name="Expenses" radius={[8, 8, 0, 0]} />
      <Line type="monotone" dataKey="savings" stroke="#4361ee" strokeWidth={3} name="Savings" />
    </ComposedChart>
  </ResponsiveContainer>
))

const WeeklySpendingChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#6b7280" />
      <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
      <Bar dataKey="amount" fill="#7209b7" radius={[8, 8, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
))

const CategoryRadarChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
    <RadarChart data={data}>
      <PolarGrid stroke="#e5e7eb" />
      <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
      <PolarRadiusAxis tick={{ fontSize: 11 }} />
      <Radar name="Spending" dataKey="value" stroke="#4361ee" fill="#4361ee" fillOpacity={0.6} />
      <Tooltip />
    </RadarChart>
  </ResponsiveContainer>
))

const IncomeSourcesChart = memo(({ data, colors }) => (
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

const CumulativeChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#f8961e" stopOpacity={0.8}/>
          <stop offset="95%" stopColor="#f8961e" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#6b7280" />
      <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" />
      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
      <Area type="monotone" dataKey="cumulative" stroke="#f8961e" strokeWidth={2} fillOpacity={1} fill="url(#colorCumulative)" />
    </AreaChart>
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

  // Calculate monthly comparison data (last 6 months)
  const monthlyComparisonData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      
      const monthExpenses = (expenses || []).filter(exp => {
        const expDate = new Date(exp.date)
        return expDate >= monthStart && expDate <= monthEnd
      })
      
      const monthIncome = (income || []).filter(inc => {
        const incDate = new Date(inc.date)
        return incDate >= monthStart && incDate <= monthEnd
      })
      
      const totalExpenses = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      const totalIncome = monthIncome.reduce((sum, inc) => sum + inc.amount, 0)
      
      months.push({
        month: format(monthDate, 'MMM'),
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalIncome - totalExpenses
      })
    }
    return months
  }, [expenses, income])

  // Calculate weekly spending data
  const weeklySpendingData = useMemo(() => {
    const { expenses } = filteredData
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const weekData = daysOfWeek.map(day => ({ day, amount: 0 }))
    
    expenses.forEach(exp => {
      const dayIndex = new Date(exp.date).getDay()
      weekData[dayIndex].amount += exp.amount
    })
    
    return weekData
  }, [filteredData])

  // Calculate category radar data
  const categoryRadarData = useMemo(() => {
    return categoryData.slice(0, 6).map(cat => ({
      category: cat.name,
      value: cat.value
    }))
  }, [categoryData])

  // Calculate income sources data
  const incomeSourcesData = useMemo(() => {
    const { income } = filteredData
    const sourceMap = {}
    
    income.forEach(inc => {
      sourceMap[inc.source] = (sourceMap[inc.source] || 0) + inc.amount
    })
    
    return Object.entries(sourceMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredData])

  // Calculate cumulative spending data
  const cumulativeData = useMemo(() => {
    const { expenses, startDate, endDate } = filteredData
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    let cumulative = 0
    
    return days.map(day => {
      const dayExpenses = expenses.filter(exp => 
        format(new Date(exp.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      )
      const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      cumulative += dayTotal
      
      return {
        date: format(day, 'MMM dd'),
        cumulative: cumulative
      }
    })
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
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto font-sans">
      
      {/* ========== HEADER SECTION ========== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-1 sm:mb-2 tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">
            Comprehensive insights into your financial patterns
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'thisMonth', label: 'This Month' },
            { value: 'lastMonth', label: 'Last Month' },
            { value: 'last3Months', label: '3 Months' },
            { value: 'last6Months', label: '6 Months' }
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

      {/* ========== STATISTICS OVERVIEW ========== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 sm:p-4 hover:shadow-lg transition-shadow">
          <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
          <p className="text-white/80 text-xs sm:text-sm tracking-tight">Total Income</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 tabular-nums tracking-tight">₹{statistics.totalIncome.toFixed(0)}</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white p-3 sm:p-4 hover:shadow-lg transition-shadow">
          <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
          <p className="text-white/80 text-xs sm:text-sm tracking-tight">Total Expenses</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 tabular-nums tracking-tight">₹{statistics.totalExpenses.toFixed(0)}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white p-3 sm:p-4 hover:shadow-lg transition-shadow">
          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
          <p className="text-white/80 text-xs sm:text-sm tracking-tight">Net Savings</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 tabular-nums tracking-tight">₹{statistics.netSavings.toFixed(0)}</p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white p-3 sm:p-4 hover:shadow-lg transition-shadow">
          <Activity className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
          <p className="text-white/80 text-xs sm:text-sm tracking-tight">Avg Daily</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 tabular-nums tracking-tight">₹{statistics.avgDaily.toFixed(0)}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 sm:p-4 hover:shadow-lg transition-shadow">
          <PieChart className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
          <p className="text-white/80 text-xs sm:text-sm tracking-tight">Categories</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 tabular-nums tracking-tight">{statistics.categoryCount}</p>
        </div>
        <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-3 sm:p-4 hover:shadow-lg transition-shadow">
          <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
          <p className="text-white/80 text-xs sm:text-sm tracking-tight">Transactions</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 tabular-nums tracking-tight">{statistics.transactionCount}</p>
        </div>
      </div>

      {/* ========== PRIMARY CHARTS SECTION ========== */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 tracking-tight">Spending Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Spending Trend */}
          <Card title="Daily Spending Trend" subtitle="Track your daily expenses" icon={TrendingUp}>
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
          <Card title="Category Distribution" subtitle="Where your money goes" icon={PieChart}>
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
      </div>

      {/* ========== SPENDING HEATMAP ========== */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 tracking-tight">Spending Calendar</h2>
        <SpendingHeatmap />
      </div>

      {/* ========== FINANCIAL TRENDS SECTION ========== */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 tracking-tight">Financial Trends</h2>
        
        {/* Monthly Comparison - Full Width */}
        <div className="mb-6">
          <Card title="Monthly Comparison" subtitle="Income vs Expenses over 6 months" icon={BarChart3}>
            <div className="w-full" style={{ minHeight: '256px', height: '320px' }}>
              {monthlyComparisonData.length > 0 ? (
                <MonthlyComparisonChart data={monthlyComparisonData} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Cumulative Spending */}
        <Card title="Cumulative Spending" subtitle="Running total over selected period" icon={TrendingUp}>
          <div className="w-full" style={{ minHeight: '256px', height: '320px' }}>
            {cumulativeData.length > 0 ? (
              <CumulativeChart data={cumulativeData} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No data available
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ========== DETAILED ANALYSIS SECTION ========== */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 tracking-tight">Detailed Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Weekly Spending Pattern */}
          <Card title="Weekly Pattern" subtitle="Spending by day of week" icon={Calendar}>
            <div className="w-full" style={{ minHeight: '256px', height: '280px' }}>
              {weeklySpendingData.length > 0 ? (
                <WeeklySpendingChart data={weeklySpendingData} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data
                </div>
              )}
            </div>
          </Card>

          {/* Category Radar */}
          <Card title="Category Radar" subtitle="Multi-dimensional view" icon={Target}>
            <div className="w-full" style={{ minHeight: '256px', height: '280px' }}>
              {categoryRadarData.length > 0 ? (
                <CategoryRadarChart data={categoryRadarData} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data
                </div>
              )}
            </div>
          </Card>

          {/* Income Sources */}
          <Card title="Income Sources" subtitle="Revenue breakdown" icon={Wallet}>
            <div className="w-full" style={{ minHeight: '256px', height: '280px' }}>
              {incomeSourcesData.length > 0 ? (
                <IncomeSourcesChart data={incomeSourcesData} colors={COLORS} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No income data
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ========== COMPARISON & BREAKDOWN SECTION ========== */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 tracking-tight">Financial Breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Income vs Expense */}
          <Card title="Income vs Expense" subtitle="Financial balance overview" icon={BarChart3}>
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
          <Card title="Top Spending Categories" subtitle="Your biggest expense areas" icon={BarChart3}>
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
      </div>

      {/* ========== INSIGHTS & PREDICTIONS SECTION ========== */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 tracking-tight">Smart Insights</h2>
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
      </div>

      {/* ========== PREDICTIONS SECTION ========== */}
      {predictions.length > 0 && (
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 tracking-tight">Future Predictions</h2>
          <Card title="🔮 Spending Forecast" subtitle="AI-powered predictions">
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
        </div>
      )}
    </div>
  )
}

export default Analytics
