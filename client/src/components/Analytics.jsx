import { useState, useEffect, useMemo } from 'react'
import { 
  TrendingUp, BarChart3, PieChart, Calendar, Activity, 
  Download, Grid, List, Filter 
} from 'lucide-react'
import { useExpense } from '../context/ExpenseContext'
import { useIncome } from '../context/IncomeContext'
import { analyticsService } from '../services/analyticsService'
import { 
  LineChart, BarChart, PieChart as RechartsPie, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend as RechartsLegend, 
  ResponsiveContainer, Cell, Pie, Bar, Line
} from 'recharts'
import { format, startOfMonth, endOfMonth, subMonths, eachDayOfInterval } from 'date-fns'
import toast from 'react-hot-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const Analytics = () => {
  const { expenses } = useExpense()
  const { income } = useIncome()
  const [patterns, setPatterns] = useState([])
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('thisMonth')
  const [viewMode, setViewMode] = useState('grid')

  // Color palette
  const COLORS = ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#f8961e', '#38b000', '#ff006e', '#8338ec']

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
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
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

  // Calculate spending trend data for advanced tab
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
        amount: total,
        count: dayExpenses.length
      }
    })
  }, [filteredData])

  // Calculate category data for recharts
  const rechartsCategory = useMemo(() => {
    const { expenses } = filteredData
    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {})

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredData])

  // Calculate income vs expense
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

  // Calculate spending heatmap
  const heatmapData = useMemo(() => {
    const { expenses, startDate, endDate } = filteredData
    const days = eachDayOfInterval({ start: startDate, end: endDate })
    
    return days.map(day => {
      const dayExpenses = expenses.filter(exp => 
        format(new Date(exp.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      )
      const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      
      return {
        date: format(day, 'yyyy-MM-dd'),
        day: format(day, 'EEE'),
        amount: total,
        intensity: total > 0 ? Math.min(total / 1000, 1) : 0
      }
    })
  }, [filteredData])

  // Calculate statistics
  const statistics = useMemo(() => {
    const { expenses, income } = filteredData
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0)
    const avgDaily = expenses.length > 0 ? totalExpense / expenses.length : 0
    const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0
    const lowestExpense = expenses.length > 0 ? Math.min(...expenses.map(e => e.amount)) : 0

    return {
      totalExpense,
      totalIncome,
      netSavings: totalIncome - totalExpense,
      avgDaily,
      highestExpense,
      lowestExpense,
      transactionCount: expenses.length
    }
  }, [filteredData])

  // Export to PDF
  const exportToPDF = async () => {
    try {
      toast.loading('Generating PDF...')
      const element = document.getElementById('analytics-content')
      const canvas = await html2canvas(element, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      
      toast.dismiss()
      toast.success('PDF exported successfully!')
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to export PDF')
      console.error(error)
    }
  }

  // Export to PNG
  const exportToPNG = async () => {
    try {
      toast.loading('Generating image...')
      const element = document.getElementById('analytics-content')
      const canvas = await html2canvas(element, { scale: 2 })
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.png`
        link.click()
        URL.revokeObjectURL(url)
        
        toast.dismiss()
        toast.success('Image exported successfully!')
      })
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to export image')
      console.error(error)
    }
  }

  // Calculate monthly spending trend for overview
  const monthlyTrendData = useMemo(() => {
    const safeExpenses = expenses || []
    
    if (safeExpenses.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Monthly Spending',
          data: [],
          borderColor: '#4361ee',
          backgroundColor: 'rgba(67, 97, 238, 0.1)',
          tension: 0.4,
          fill: true
        }]
      }
    }

    const monthlyData = {}
    safeExpenses.forEach(exp => {
      if (exp && exp.date && exp.amount) {
        const month = new Date(exp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        monthlyData[month] = (monthlyData[month] || 0) + exp.amount
      }
    })

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => 
      new Date(a) - new Date(b)
    ).slice(-6) // Last 6 months

    return {
      labels: sortedMonths,
      datasets: [{
        label: 'Monthly Spending',
        data: sortedMonths.map(m => monthlyData[m] || 0),
        borderColor: '#4361ee',
        backgroundColor: 'rgba(67, 97, 238, 0.1)',
        tension: 0.4,
        fill: true
      }]
    }
  }, [expenses])

  // Calculate category breakdown for overview
  const categoryBreakdownData = useMemo(() => {
    const safeExpenses = expenses || []
    
    if (safeExpenses.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Spending by Category',
          data: [],
          backgroundColor: []
        }]
      }
    }

    const categoryData = {}
    safeExpenses.forEach(exp => {
      if (exp && exp.category && exp.amount) {
        categoryData[exp.category] = (categoryData[exp.category] || 0) + exp.amount
      }
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
  }, [expenses])

  // Calculate daily average
  const getDailyAverage = () => {
    if (!expenses || expenses.length === 0) return 0
    const dates = expenses.map(e => new Date(e.date))
    const minDate = new Date(Math.min(...dates))
    const maxDate = new Date(Math.max(...dates))
    const days = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1
    const total = expenses.reduce((sum, e) => sum + e.amount, 0)
    return (total / days).toFixed(2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            Analytics
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into your finances</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {(activeTab === 'overview' || activeTab === 'advanced') && (
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input py-2 text-sm"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="last3Months">Last 3 Months</option>
              <option value="last6Months">Last 6 Months</option>
              <option value="thisYear">This Year</option>
            </select>
          )}

          {activeTab === 'advanced' && (
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="btn btn-secondary py-2 px-3"
              title="Toggle View"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={exportToPNG}
            className="btn btn-secondary py-2 px-3"
            title="Export as PNG"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={exportToPDF}
            className="btn btn-primary py-2 px-3"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-1 font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`pb-3 px-1 font-medium transition-colors border-b-2 ${
              activeTab === 'advanced'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Advanced
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`pb-3 px-1 font-medium transition-colors border-b-2 ${
              activeTab === 'insights'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Insights
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div id="analytics-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
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
                  {expenses && expenses.length > 0 ? new Set(expenses.map(e => e.category)).size : 0}
                </p>
              </div>
              <div className="card bg-gradient-to-br from-green-500 to-green-700 text-white">
                <Calendar className="w-8 h-8 mb-2" />
                <p className="text-white/80 text-sm">Total Transactions</p>
                <p className="text-3xl font-bold mt-1">{expenses ? expenses.length : 0}</p>
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
                  {expenses && expenses.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={spendingTrendData.slice(-6)}>
                        <defs>
                          <linearGradient id="colorAmountOverview" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4361ee" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="amount" stroke="#4361ee" fillOpacity={1} fill="url(#colorAmountOverview)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="card">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Category Breakdown
                </h3>
                <div className="h-64">
                  {expenses && expenses.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rechartsCategory.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill="#4361ee">
                          {rechartsCategory.slice(0, 8).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="card bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200">
              <h3 className="text-xl font-bold mb-4 text-orange-800">💡 Key Insights</h3>
              {expenses && expenses.length > 0 ? (
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
              ) : (
                <p className="text-orange-700">No expense data available yet. Start tracking your expenses to see insights!</p>
              )}
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <p className="text-xs opacity-90 mb-1">Total Expense</p>
                <p className="text-xl font-bold">₹{statistics.totalExpense.toFixed(0)}</p>
              </div>
              <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                <p className="text-xs opacity-90 mb-1">Total Income</p>
                <p className="text-xl font-bold">₹{statistics.totalIncome.toFixed(0)}</p>
              </div>
              <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <p className="text-xs opacity-90 mb-1">Net Savings</p>
                <p className="text-xl font-bold">₹{statistics.netSavings.toFixed(0)}</p>
              </div>
              <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <p className="text-xs opacity-90 mb-1">Avg Daily</p>
                <p className="text-xl font-bold">₹{statistics.avgDaily.toFixed(0)}</p>
              </div>
              <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                <p className="text-xs opacity-90 mb-1">Highest</p>
                <p className="text-xl font-bold">₹{statistics.highestExpense.toFixed(0)}</p>
              </div>
              <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <p className="text-xs opacity-90 mb-1">Transactions</p>
                <p className="text-xl font-bold">{statistics.transactionCount}</p>
              </div>
            </div>

            {/* Dashboard */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Spending Trend */}
              <div className="card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Spending Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={spendingTrendData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4361ee" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4361ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="amount" stroke="#4361ee" fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Category Breakdown */}
              <div className="card">
                <h3 className="text-lg font-bold mb-4">Category Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={rechartsCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {rechartsCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>

              {/* Income vs Expense */}
              <div className="card">
                <h3 className="text-lg font-bold mb-4">Income vs Expense</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incomeVsExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#4361ee">
                      {incomeVsExpenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Spending Heatmap */}
              <div className="card">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Spending Heatmap
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {heatmapData.slice(0, 35).map((day, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded flex flex-col items-center justify-center text-xs cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: day.amount > 0 
                          ? `rgba(67, 97, 238, ${day.intensity})` 
                          : '#f3f4f6'
                      }}
                      title={`${day.date}: ₹${day.amount.toFixed(0)}`}
                    >
                      <span className={day.amount > 0 ? 'text-white font-semibold' : 'text-gray-400'}>
                        {format(new Date(day.date), 'd')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 text-xs text-gray-600">
                  <span>Less</span>
                  <div className="flex gap-1">
                    {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: `rgba(67, 97, 238, ${intensity})` }}
                      />
                    ))}
                  </div>
                  <span>More</span>
                </div>
              </div>

              {/* Top Categories */}
              <div className="card">
                <h3 className="text-lg font-bold mb-4">Top Spending Categories</h3>
                <div className="space-y-3">
                  {rechartsCategory.slice(0, 5).map((cat, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{cat.name}</span>
                        <span className="text-sm font-bold">₹{cat.value.toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(cat.value / rechartsCategory[0].value) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Average */}
              <div className="card">
                <h3 className="text-lg font-bold mb-4">Daily Average Spending</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={spendingTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <RechartsLegend />
                    <Line type="monotone" dataKey="amount" stroke="#4361ee" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insights */}
            <div className="card bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                AI Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Spending Pattern</p>
                  <p className="font-semibold text-gray-900">
                    {statistics.avgDaily > 500 
                      ? "You're spending above average daily" 
                      : "You're maintaining good spending habits"}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Savings Rate</p>
                  <p className="font-semibold text-gray-900">
                    {statistics.totalIncome > 0 
                      ? `${((statistics.netSavings / statistics.totalIncome) * 100).toFixed(1)}% of income saved`
                      : "No income data available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
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
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={predictions.map(pred => ({
                      month: pred.month || 'N/A',
                      amount: pred.predictedAmount || 0
                    }))}>
                      <defs>
                        <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#7c3aed" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorPrediction)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
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

            {/* No Data Message */}
            {patterns.length === 0 && predictions.length === 0 && (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Insights Available Yet</h3>
                <p className="text-gray-600">Add more expenses to generate behavioral patterns and predictions</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics

