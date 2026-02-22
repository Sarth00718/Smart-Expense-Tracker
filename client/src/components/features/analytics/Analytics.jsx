import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import {
  TrendingUp, BarChart3, PieChart, Activity,
  DollarSign, TrendingDown, Zap, Calendar, Target, Wallet
} from 'lucide-react'
import { useExpense } from '../../../context/ExpenseContext'
import { useIncome } from '../../../context/IncomeContext'
import { useTheme } from '../../../context/ThemeContext'
import { analyticsService } from '../../../services/analyticsService'
import { Card } from '../../ui'
import SpendingHeatmap from './SpendingHeatmap'
import {
  AreaChart, BarChart, PieChart as RechartsPie, ComposedChart,
  Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Pie, Bar, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval } from 'date-fns'

// ---------- Memoized chart sub-components ----------

const SpendingTrendChart = memo(({ data, isDark }) => {
  const gridColor = isDark ? '#334155' : '#e5e7eb'
  const axisColor = isDark ? '#94a3b8' : '#6b7280'
  const tooltipStyle = { backgroundColor: isDark ? '#1e293b' : '#fff', border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`, borderRadius: '8px', color: isDark ? '#f1f5f9' : '#111827' }
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#4361ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
        <YAxis tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="amount" stroke="#4361ee" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
      </AreaChart>
    </ResponsiveContainer>
  )
})

const CategoryPieChart = memo(({ data, colors, isDark }) => {
  const tooltipStyle = { backgroundColor: isDark ? '#1e293b' : '#fff', border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`, borderRadius: '8px', color: isDark ? '#f1f5f9' : '#111827' }
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
      <RechartsPie>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={window.innerWidth < 640 ? 60 : 90} fill="#8884d8" dataKey="value">
          {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={colors[index % colors.length]} />))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </RechartsPie>
    </ResponsiveContainer>
  )
})

const MonthlyComparisonChart = memo(({ data, isDark }) => {
  const gridColor = isDark ? '#334155' : '#e5e7eb'
  const axisColor = isDark ? '#94a3b8' : '#6b7280'
  const tooltipStyle = { backgroundColor: isDark ? '#1e293b' : '#fff', border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`, borderRadius: '8px', color: isDark ? '#f1f5f9' : '#111827' }
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
        <YAxis tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        <Bar dataKey="income" fill="#38b000" name="Income" radius={[8, 8, 0, 0]} />
        <Bar dataKey="expenses" fill="#f72585" name="Expenses" radius={[8, 8, 0, 0]} />
        <Line type="monotone" dataKey="savings" stroke="#4361ee" strokeWidth={3} name="Savings" />
      </ComposedChart>
    </ResponsiveContainer>
  )
})

const WeeklySpendingChart = memo(({ data, isDark }) => {
  const gridColor = isDark ? '#334155' : '#e5e7eb'
  const axisColor = isDark ? '#94a3b8' : '#6b7280'
  const tooltipStyle = { backgroundColor: isDark ? '#1e293b' : '#fff', border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`, borderRadius: '8px', color: isDark ? '#f1f5f9' : '#111827' }
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
        <YAxis tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="amount" fill="#7209b7" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
})

const CategoryRadarChart = memo(({ data, isDark }) => {
  const gridColor = isDark ? '#334155' : '#e5e7eb'
  const axisColor = isDark ? '#94a3b8' : '#6b7280'
  const tooltipStyle = { backgroundColor: isDark ? '#1e293b' : '#fff', border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`, borderRadius: '8px', color: isDark ? '#f1f5f9' : '#111827' }
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
      <RadarChart data={data}>
        <PolarGrid stroke={gridColor} />
        <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: axisColor }} />
        <PolarRadiusAxis tick={{ fontSize: 11, fill: axisColor }} />
        <Radar name="Spending" dataKey="value" stroke="#4361ee" fill="#4361ee" fillOpacity={0.6} />
        <Tooltip contentStyle={tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  )
})

const IncomeSourcesChart = memo(({ data, colors, isDark }) => {
  const tooltipStyle = { backgroundColor: isDark ? '#1e293b' : '#fff', border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`, borderRadius: '8px', color: isDark ? '#f1f5f9' : '#111827' }
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
      <RechartsPie>
        <Pie data={data} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={window.innerWidth < 640 ? 60 : 90} fill="#8884d8" dataKey="value">
          {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={colors[index % colors.length]} />))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </RechartsPie>
    </ResponsiveContainer>
  )
})

const CumulativeChart = memo(({ data, isDark }) => {
  const gridColor = isDark ? '#334155' : '#e5e7eb'
  const axisColor = isDark ? '#94a3b8' : '#6b7280'
  const tooltipStyle = { backgroundColor: isDark ? '#1e293b' : '#fff', border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`, borderRadius: '8px', color: isDark ? '#f1f5f9' : '#111827' }
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f8961e" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f8961e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
        <YAxis tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="cumulative" stroke="#f8961e" strokeWidth={2} fillOpacity={1} fill="url(#colorCumulative)" />
      </AreaChart>
    </ResponsiveContainer>
  )
})

// ---------- Main Analytics component ----------

const Analytics = () => {
  const { expenses } = useExpense()
  const { income } = useIncome()
  const { isDark } = useTheme()
  const [patterns, setPatterns] = useState([])
  const [predictions, setPredictions] = useState([])
  const [timeRange, setTimeRange] = useState('thisMonth')
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const COLORS = useMemo(() =>
    ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#f8961e', '#38b000', '#ff006e', '#8338ec'],
    []
  )

  // Computed theme-aware colors used inline
  const gridColor = isDark ? '#334155' : '#e5e7eb'
  const axisColor = isDark ? '#94a3b8' : '#6b7280'
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#fff',
    border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
    borderRadius: '8px',
    color: isDark ? '#f1f5f9' : '#111827'
  }

  const loadAnalytics = useCallback(async () => {
    if (analyticsLoading) return
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
    if (expenses.length > 0 && patterns.length === 0 && !analyticsLoading) {
      loadAnalytics()
    }
  }, [expenses.length, patterns.length, analyticsLoading, loadAnalytics])

  const filteredData = useMemo(() => {
    const now = new Date()
    let startDate, endDate
    switch (timeRange) {
      case 'thisMonth': startDate = startOfMonth(now); endDate = endOfMonth(now); break
      case 'lastMonth': startDate = startOfMonth(subMonths(now, 1)); endDate = endOfMonth(subMonths(now, 1)); break
      case 'last3Months': startDate = startOfMonth(subMonths(now, 2)); endDate = endOfMonth(now); break
      case 'last6Months': startDate = startOfMonth(subMonths(now, 5)); endDate = endOfMonth(now); break
      default: startDate = startOfMonth(now); endDate = endOfMonth(now)
    }
    const filteredExpenses = (expenses || []).filter(exp => { const d = new Date(exp.date); return d >= startDate && d <= endDate })
    const filteredIncome = (income || []).filter(inc => { const d = new Date(inc.date); return d >= startDate && d <= endDate })
    return { expenses: filteredExpenses, income: filteredIncome, startDate, endDate }
  }, [expenses, income, timeRange])

  const spendingTrendData = useMemo(() => {
    const { expenses, startDate, endDate } = filteredData
    return eachDayOfInterval({ start: startDate, end: endDate }).map(day => {
      const total = expenses.filter(exp => format(new Date(exp.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).reduce((s, exp) => s + exp.amount, 0)
      return { date: format(day, 'MMM dd'), amount: total }
    })
  }, [filteredData])

  const categoryData = useMemo(() => {
    const map = {}
    filteredData.expenses.forEach(exp => { map[exp.category] = (map[exp.category] || 0) + exp.amount })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [filteredData])

  const monthlyComparisonData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const md = subMonths(new Date(), i)
      const ms = startOfMonth(md), me = endOfMonth(md)
      const me2 = (expenses || []).filter(e => { const d = new Date(e.date); return d >= ms && d <= me })
      const mi2 = (income || []).filter(i => { const d = new Date(i.date); return d >= ms && d <= me })
      const te = me2.reduce((s, e) => s + e.amount, 0)
      const ti = mi2.reduce((s, i) => s + i.amount, 0)
      months.push({ month: format(md, 'MMM'), income: ti, expenses: te, savings: ti - te })
    }
    return months
  }, [expenses, income])

  const weeklySpendingData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => ({ day: d, amount: 0 }))
    filteredData.expenses.forEach(exp => { days[new Date(exp.date).getDay()].amount += exp.amount })
    return days
  }, [filteredData])

  const categoryRadarData = useMemo(() => categoryData.slice(0, 6).map(c => ({ category: c.name, value: c.value })), [categoryData])

  const incomeSourcesData = useMemo(() => {
    const map = {}
    filteredData.income.forEach(inc => { map[inc.source] = (map[inc.source] || 0) + inc.amount })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [filteredData])

  const cumulativeData = useMemo(() => {
    const { expenses, startDate, endDate } = filteredData
    let cum = 0
    return eachDayOfInterval({ start: startDate, end: endDate }).map(day => {
      const dt = expenses.filter(exp => format(new Date(exp.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')).reduce((s, e) => s + e.amount, 0)
      cum += dt
      return { date: format(day, 'MMM dd'), cumulative: cum }
    })
  }, [filteredData])

  const incomeVsExpenseData = useMemo(() => {
    const te = filteredData.expenses.reduce((s, e) => s + e.amount, 0)
    const ti = filteredData.income.reduce((s, i) => s + i.amount, 0)
    return [
      { name: 'Income', value: ti, fill: '#38b000' },
      { name: 'Expense', value: te, fill: '#f72585' },
      { name: 'Savings', value: Math.max(0, ti - te), fill: '#4361ee' }
    ]
  }, [filteredData])

  const statistics = useMemo(() => {
    const te = filteredData.expenses.reduce((s, e) => s + e.amount, 0)
    const ti = filteredData.income.reduce((s, i) => s + i.amount, 0)
    return {
      totalExpenses: te, totalIncome: ti, netSavings: ti - te,
      avgDaily: te / (filteredData.expenses.length || 1),
      categoryCount: new Set(filteredData.expenses.map(e => e.category)).size,
      transactionCount: filteredData.expenses.length + filteredData.income.length
    }
  }, [filteredData])

  const emptyMsg = (msg) => (
    <div className="flex items-center justify-center h-full text-gray-400 dark:text-slate-500">{msg}</div>
  )

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto font-sans">

      {/* ── HEADER ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-slate-100 mb-1 sm:mb-2 tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed">
            Comprehensive insights into your financial patterns
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'thisMonth', label: 'This Month' },
            { value: 'lastMonth', label: 'Last Month' },
            { value: 'last3Months', label: '3 Months' },
            { value: 'last6Months', label: '6 Months' }
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setTimeRange(opt.value)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${timeRange === opt.value
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── STATS OVERVIEW ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { icon: DollarSign, label: 'Total Income', value: `₹${statistics.totalIncome.toFixed(0)}`, grad: 'from-blue-500 to-blue-600' },
          { icon: TrendingDown, label: 'Total Expenses', value: `₹${statistics.totalExpenses.toFixed(0)}`, grad: 'from-red-500 to-red-600' },
          { icon: TrendingUp, label: 'Net Savings', value: `₹${statistics.netSavings.toFixed(0)}`, grad: 'from-green-500 to-green-600' },
          { icon: Activity, label: 'Avg Daily', value: `₹${statistics.avgDaily.toFixed(0)}`, grad: 'from-orange-500 to-orange-600' },
          { icon: PieChart, label: 'Categories', value: statistics.categoryCount, grad: 'from-purple-500 to-purple-600' },
          { icon: Calendar, label: 'Transactions', value: statistics.transactionCount, grad: 'from-indigo-500 to-indigo-600' },
        ].map(({ icon: Icon, label, value, grad }) => (
          <div key={label} className={`card bg-gradient-to-br ${grad} text-white p-3 sm:p-4 hover:shadow-lg transition-shadow`}>
            <Icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
            <p className="text-white/80 text-xs sm:text-sm tracking-tight">{label}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 tabular-nums tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* ── SPENDING OVERVIEW ──────────────────── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4 tracking-tight">Spending Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card title="Daily Spending Trend" subtitle="Track your daily expenses" icon={TrendingUp}>
            <div className="w-full" style={{ minHeight: '256px', height: '320px' }}>
              {filteredData.expenses.length > 0 ? <SpendingTrendChart data={spendingTrendData} isDark={isDark} /> : emptyMsg('No expense data available')}
            </div>
          </Card>
          <Card title="Category Distribution" subtitle="Where your money goes" icon={PieChart}>
            <div className="w-full" style={{ minHeight: '256px', height: '320px' }}>
              {categoryData.length > 0 ? <CategoryPieChart data={categoryData} colors={COLORS} isDark={isDark} /> : emptyMsg('No category data available')}
            </div>
          </Card>
        </div>
      </div>

      {/* ── SPENDING HEATMAP ───────────────────── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4 tracking-tight">Spending Calendar</h2>
        <SpendingHeatmap />
      </div>

      {/* ── FINANCIAL TRENDS ───────────────────── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4 tracking-tight">Financial Trends</h2>
        <div className="mb-6">
          <Card title="Monthly Comparison" subtitle="Income vs Expenses over 6 months" icon={BarChart3}>
            <div className="w-full" style={{ minHeight: '256px', height: '320px' }}>
              {monthlyComparisonData.length > 0 ? <MonthlyComparisonChart data={monthlyComparisonData} isDark={isDark} /> : emptyMsg('No data available')}
            </div>
          </Card>
        </div>
        <Card title="Cumulative Spending" subtitle="Running total over selected period" icon={TrendingUp}>
          <div className="w-full" style={{ minHeight: '256px', height: '320px' }}>
            {cumulativeData.length > 0 ? <CumulativeChart data={cumulativeData} isDark={isDark} /> : emptyMsg('No data available')}
          </div>
        </Card>
      </div>

      {/* ── DETAILED ANALYSIS ──────────────────── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4 tracking-tight">Detailed Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card title="Weekly Pattern" subtitle="Spending by day of week" icon={Calendar}>
            <div className="w-full" style={{ minHeight: '256px', height: '280px' }}>
              {weeklySpendingData.length > 0 ? <WeeklySpendingChart data={weeklySpendingData} isDark={isDark} /> : emptyMsg('No data')}
            </div>
          </Card>
          <Card title="Category Radar" subtitle="Multi-dimensional view" icon={Target}>
            <div className="w-full" style={{ minHeight: '256px', height: '280px' }}>
              {categoryRadarData.length > 0 ? <CategoryRadarChart data={categoryRadarData} isDark={isDark} /> : emptyMsg('No data')}
            </div>
          </Card>
          <Card title="Income Sources" subtitle="Revenue breakdown" icon={Wallet}>
            <div className="w-full" style={{ minHeight: '256px', height: '280px' }}>
              {incomeSourcesData.length > 0 ? <IncomeSourcesChart data={incomeSourcesData} colors={COLORS} isDark={isDark} /> : emptyMsg('No income data')}
            </div>
          </Card>
        </div>
      </div>

      {/* ── FINANCIAL BREAKDOWN ─────────────────── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4 tracking-tight">Financial Breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card title="Income vs Expense" subtitle="Financial balance overview" icon={BarChart3}>
            <div className="w-full" style={{ minHeight: '256px', height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={256}>
                <BarChart data={incomeVsExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
                  <YAxis tick={{ fontSize: 11, fill: axisColor }} stroke={axisColor} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {incomeVsExpenseData.map((entry, i) => (<Cell key={`cell-${i}`} fill={entry.fill} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Top Spending Categories" subtitle="Your biggest expense areas" icon={BarChart3}>
            <div className="space-y-3 sm:space-y-4">
              {categoryData.slice(0, 5).map((cat, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-slate-300">{cat.name}</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-slate-100 tabular-nums">₹{cat.value.toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${categoryData.length > 0 ? (cat.value / categoryData[0].value) * 100 : 0}%`, backgroundColor: COLORS[index % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
              {categoryData.length === 0 && (
                <div className="text-center py-8 text-gray-400 dark:text-slate-500">No category data available</div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── SMART INSIGHTS ─────────────────────── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4 tracking-tight">Smart Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card title="💡 Smart Insights" subtitle="AI-powered analysis">
            <div className="space-y-3">
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Spending Pattern</p>
                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">
                  {statistics.avgDaily > 500 ? "You're spending above average daily. Consider reviewing your expenses." : "You're maintaining good spending habits. Keep it up!"}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs sm:text-sm font-semibold text-green-900 dark:text-green-300 mb-1">Savings Rate</p>
                <p className="text-xs sm:text-sm text-green-700 dark:text-green-400">
                  {statistics.totalIncome > 0 ? `You're saving ${((statistics.netSavings / statistics.totalIncome) * 100).toFixed(1)}% of your income` : "Add income data to track your savings rate"}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-xs sm:text-sm font-semibold text-purple-900 dark:text-purple-300 mb-1">Top Category</p>
                <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400">
                  {categoryData.length > 0 ? `Most spending in ${categoryData[0].name} (₹${categoryData[0].value.toFixed(0)})` : "No category data available yet"}
                </p>
              </div>
            </div>
          </Card>

          <Card title="🔍 Behavioral Patterns" subtitle="Your spending habits">
            {patterns.length > 0 ? (
              <div className="space-y-3">
                {patterns.slice(0, 3).map((pattern, index) => (
                  <div key={index} className="p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl">
                        {pattern.type === 'weekend_splurging' ? '🎉' : pattern.type === 'impulse_buying' ? '🛍️' : '📊'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-slate-100 text-xs sm:text-sm">{pattern.description}</p>
                        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Impact: {pattern.impact}</p>
                        <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">💡 {pattern.suggestion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 dark:text-slate-500">
                <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Add more expenses to see behavioral patterns</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── PREDICTIONS ────────────────────────── */}
      {predictions.length > 0 && (
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-slate-100 mb-4 tracking-tight">Future Predictions</h2>
          <Card title="🔮 Spending Forecast" subtitle="AI-powered predictions">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {predictions.slice(0, 3).map((pred, index) => (
                <div key={index} className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-semibold mb-1">{pred.month || `Month ${index + 1}`}</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-200">₹{pred.predictedAmount?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Confidence: {pred.confidence || 'medium'}</p>
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
