import { useState, useEffect, useMemo, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import {
  TrendingUp, BarChart3, BarChart2, PieChart, Activity,
  DollarSign, TrendingDown, Zap, Calendar, Target, Wallet
} from 'lucide-react'
import { useExpense } from '../../../context/ExpenseContext'
import { useIncome } from '../../../context/IncomeContext'
import { useChartTheme } from '../../../hooks/useChartTheme'
import { analyticsService } from '../../../services/analyticsService'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Separator, PageHeader } from '../../ui'
import SpendingHeatmap from './SpendingHeatmap'
import { SpendingTrendChart, CategoryPieChart, MonthlyComparisonChart, WeeklySpendingChart, CategoryRadarChart } from './charts'
import {
  BarChart, PieChart as RechartsPie,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Bar
} from 'recharts'
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval } from 'date-fns'
import { CHART_COLORS } from '../../../constants/categories'

const timeRanges = [
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3Months', label: '3 Months' },
  { value: 'last6Months', label: '6 Months' }
]

const Analytics = () => {
  const { expenses } = useExpense()
  const { income } = useIncome()
  const { gridColor, axisColor, tooltipStyle } = useChartTheme()
  const location = useLocation()
  const [patterns, setPatterns] = useState([])
  const [predictions, setPredictions] = useState([])
  const [timeRange, setTimeRange] = useState('thisMonth')
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('view') === 'heatmap') {
      setTimeout(() => {
        const heatmapSection = document.getElementById('spending-heatmap')
        if (heatmapSection) {
          heatmapSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 500)
    }
  }, [location])

  const loadAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true)
      const [patternsRes, predictionsRes] = await Promise.all([
        analyticsService.getPatterns(),
        analyticsService.getPredictions(3)
      ])
      setPatterns(patternsRes.data.patterns || [])
      setPredictions(predictionsRes.data.predictions || [])
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [])

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
    <div className="flex items-center justify-center h-full text-muted-foreground">{msg}</div>
  )

  const statCards = [
    { icon: DollarSign, label: 'Total Income', value: `\u20B9${statistics.totalIncome.toFixed(0)}`, grad: 'from-blue-500 to-blue-600' },
    { icon: TrendingDown, label: 'Total Expenses', value: `\u20B9${statistics.totalExpenses.toFixed(0)}`, grad: 'from-red-500 to-red-600' },
    { icon: TrendingUp, label: 'Net Savings', value: `\u20B9${statistics.netSavings.toFixed(0)}`, grad: 'from-green-500 to-green-600' },
    { icon: Activity, label: 'Avg Daily', value: `\u20B9${statistics.avgDaily.toFixed(0)}`, grad: 'from-orange-500 to-orange-600' },
    { icon: PieChart, label: 'Categories', value: statistics.categoryCount, grad: 'from-purple-500 to-purple-600' },
    { icon: Calendar, label: 'Transactions', value: statistics.transactionCount, grad: 'from-indigo-500 to-indigo-600' },
  ]

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">

      <PageHeader
        icon={BarChart2}
        gradient="from-cyan-500 to-blue-600"
        title="Analytics Dashboard"
        subtitle="Comprehensive insights into your financial patterns"
        actions={
          <Tabs>
            <TabsList>
              {timeRanges.map(opt => (
                <TabsTrigger
                  key={opt.value}
                  value={opt.value}
                  activeTab={timeRange}
                  onClick={setTimeRange}
                >
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      />

      <Separator />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map(({ icon: Icon, label, value, grad }) => (
          <Card key={label} className={`bg-gradient-to-br ${grad} text-white`}>
            <CardContent className="p-4">
              <Icon className="w-5 h-5 mb-2 opacity-90" />
              <p className="text-white/80 text-xs tracking-tight">{label}</p>
              <p className="text-lg font-semibold mt-1 tabular-nums tracking-tight">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Spending Overview */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 tracking-tight">Spending Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Daily Spending Trend</CardTitle>
                  <CardDescription>Track your daily expenses</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full" style={{ minHeight: '256px', height: '320px' }}>
                {filteredData.expenses.length > 0 ? <SpendingTrendChart data={spendingTrendData} /> : emptyMsg('No expense data available')}
              </div>
            </CardContent>
          </Card>
          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <PieChart className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Where your money goes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full" style={{ minHeight: '256px', height: '320px' }}>
                {categoryData.length > 0 ? <CategoryPieChart data={categoryData} /> : emptyMsg('No category data available')}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Spending Heatmap */}
      <section id="spending-heatmap">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 tracking-tight">Spending Calendar</h2>
        <Card hover>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>Spending Calendar</CardTitle>
                <CardDescription>View your spending activity on a calendar heatmap</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <SpendingHeatmap />
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Financial Trends */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 tracking-tight">Financial Trends</h2>
        <Card hover>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle>Monthly Comparison</CardTitle>
                <CardDescription>Income vs Expenses over 6 months</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="w-full" style={{ minHeight: '256px', height: '320px' }}>
              {monthlyComparisonData.length > 0 ? <MonthlyComparisonChart data={monthlyComparisonData} /> : emptyMsg('No data available')}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Detailed Analysis */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 tracking-tight">Detailed Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Weekly Pattern</CardTitle>
                  <CardDescription>Spending by day of week</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full" style={{ minHeight: '256px', height: '280px' }}>
                {weeklySpendingData.length > 0 ? <WeeklySpendingChart data={weeklySpendingData} /> : emptyMsg('No data')}
              </div>
            </CardContent>
          </Card>
          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Category Radar</CardTitle>
                  <CardDescription>Multi-dimensional view</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full" style={{ minHeight: '256px', height: '280px' }}>
                {categoryRadarData.length > 0 ? <CategoryRadarChart data={categoryRadarData} /> : emptyMsg('No data')}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Financial Breakdown */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 tracking-tight">Financial Breakdown</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Income vs Expense</CardTitle>
                  <CardDescription>Financial balance overview</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Top Spending Categories</CardTitle>
                  <CardDescription>Your biggest expense areas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.slice(0, 5).map((cat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{cat.name}</span>
                      <span className="text-sm font-semibold text-foreground tabular-nums">₹{cat.value.toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${categoryData.length > 0 ? (cat.value / categoryData[0].value) * 100 : 0}%`, backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                    </div>
                  </div>
                ))}
                {categoryData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No category data available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Smart Insights & Behavioral Patterns */}
      <section>
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 tracking-tight">Smart Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Smart Insights</CardTitle>
                    <CardDescription>AI-powered analysis</CardDescription>
                  </div>
                </div>
                <Badge variant="default">AI</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <Badge variant="warning" className="mb-2">Spending</Badge>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-1">Spending Pattern</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Average daily spending: ₹{statistics.avgDaily.toFixed(0)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Badge variant="success" className="mb-2">Savings</Badge>
                  <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-1">Savings Rate</p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {statistics.totalIncome > 0 ? `${((statistics.netSavings / statistics.totalIncome) * 100).toFixed(1)}% of your income` : "Add income data to track your savings rate"}
                  </p>
                </div>
                <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
                  <Badge variant="default" className="mb-2">Top Category</Badge>
                  <p className="text-sm font-semibold text-violet-900 dark:text-violet-300 mb-1">Top Category</p>
                  <p className="text-sm text-violet-700 dark:text-violet-400">
                    {categoryData.length > 0 ? `${categoryData[0].name}: ₹${categoryData[0].value.toFixed(0)}` : "No category data available yet"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle>Behavioral Patterns</CardTitle>
                  <CardDescription>Your spending habits</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {patterns.length > 0 ? (
                <div className="space-y-3">
                  {patterns.slice(0, 3).map((pattern, index) => (
                    <div key={index} className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">
                          {pattern.type === 'weekend_splurging' ? '\uD83C\uDF89' : pattern.type === 'impulse_buying' ? '\uD83D\uDECD\uFE0F' : '\uD83D\uDCCA'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">{pattern.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Impact: {pattern.impact}</p>
                          <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">\uD83D\uDCA1 {pattern.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No behavioral patterns detected yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Future Predictions */}
      {predictions.length > 0 && (
        <>
          <Separator />
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 tracking-tight">Future Predictions</h2>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Spending Forecast</CardTitle>
                      <CardDescription>AI-powered predictions</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">Forecast</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {predictions.slice(0, 3).map((pred, index) => (
                    <div key={index} className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
                      <p className="text-sm text-violet-600 dark:text-violet-400 font-semibold mb-1">{pred.month || `Month ${index + 1}`}</p>
                      <p className="text-xl sm:text-2xl font-bold text-violet-900 dark:text-violet-200">₹{pred.predictedAmount?.toFixed(2) || '0.00'}</p>
                      <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">Confidence: {pred.confidence || 'medium'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}

export default Analytics
