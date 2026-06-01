import { useState, lazy, Suspense, useCallback, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { analyticsService } from '../../../services/analyticsService'
import { TrendingUp, TrendingDown, Wallet, Plus, Receipt, Camera, Mic, ArrowUpRight, Calendar, DollarSign, Zap } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend as RechartsLegend, Tooltip as RechartsTooltip } from 'recharts'
import toast from 'react-hot-toast'
import { StatCard, Card, Button, EmptyState, Modal, Card3DTilt } from '../../ui'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { staggerContainer, staggerItem, fadeInUp } from '../../../utils/animations'
import { useFormState } from '../../../hooks/useFormState'
import { useChartTheme } from '../../../hooks/useChartTheme'
import { useResponsive } from '../../../hooks/useResponsive'
import { CHART_COLORS, CATEGORY_COLORS } from '../../../constants/categories'
import ExpenseForm from '../../forms/ExpenseForm'
import IncomeForm from '../../forms/IncomeForm'
import { expenseService } from '../../../services/expenseService'
import { incomeService } from '../../../services/incomeService'

const VoiceExpenseInput = lazy(() => import('../voice/VoiceExpenseInput'))
const ReceiptScanner    = lazy(() => import('../receipts/ReceiptScanner'))

// ── Initial empty dashboard stats ─────────────────────────────────────────────
const EMPTY_STATS = {
  totalIncome: 0, totalExpenses: 0, netBalance: 0,
  monthIncome: 0, monthExpenses: 0, monthNetBalance: 0,
}

const DashboardHome = () => {
  const { tooltipStyle } = useChartTheme()
  const { lg } = useResponsive()           // SSR-safe — no window.innerWidth in render
  const navigate = useNavigate()

  // ── Server-side analytics (issue #10) ─────────────────────────────────────
  const [dashStats, setDashStats] = useState(EMPTY_STATS)
  const [statsLoading, setStatsLoading] = useState(true)

  // ── Paginated local lists (issue #2) ──────────────────────────────────────
  const [recentExpenses, setRecentExpenses] = useState([])
  const [chartData,      setChartData]      = useState([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setStatsLoading(true)
        const [dashRes, recentRes] = await Promise.all([
          analyticsService.getDashboard(),
          expenseService.getRecent(5),
        ])
        if (cancelled) return

        // Backend returns computed totals — no client calc needed
        const d = dashRes.data
        setDashStats({
          totalIncome:    d.totalIncome    ?? 0,
          totalExpenses:  d.totalExpenses  ?? 0,
          netBalance:     d.netBalance     ?? 0,
          monthIncome:    d.monthIncome    ?? 0,
          monthExpenses:  d.monthExpenses  ?? 0,
          monthNetBalance:d.monthNetBalance?? 0,
        })

        const recent = Array.isArray(recentRes.data?.data)
          ? recentRes.data.data
          : Array.isArray(recentRes.data) ? recentRes.data : []
        setRecentExpenses(recent)

        // Build chart data from category breakdown if provided
        if (d.categoryBreakdown) {
          const chart = Object.entries(d.categoryBreakdown).map(([name, value], i) => ({
            name, value, color: CHART_COLORS[i % CHART_COLORS.length]
          }))
          setChartData(chart)
        }
      } catch (err) {
        if (!cancelled) console.error('Dashboard load error:', err)
      } finally {
        if (!cancelled) setStatsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [showVoiceInput,    setShowVoiceInput]    = useState(false)
  const [showReceiptScanner,setShowReceiptScanner] = useState(false)
  const [showAddExpense,    setShowAddExpense]    = useState(false)
  const [showAddIncome,     setShowAddIncome]     = useState(false)

  const { formData: expenseFormData, setFormData: setExpenseFormData, resetForm: resetExpenseForm } = useFormState({
    date: new Date().toISOString().split('T')[0],
    category: '', amount: '', description: ''
  })

  const { formData: incomeFormData, setFormData: setIncomeFormData, resetForm: resetIncomeForm } = useFormState({
    date: new Date().toISOString().split('T')[0],
    source: 'Salary', amount: '', description: '', isRecurring: false
  })

  // Refresh stats after mutations
  const refreshStats = useCallback(async () => {
    try {
      const [dashRes, recentRes] = await Promise.all([
        analyticsService.getDashboard(),
        expenseService.getRecent(5),
      ])
      const d = dashRes.data
      setDashStats({
        totalIncome:    d.totalIncome    ?? 0,
        totalExpenses:  d.totalExpenses  ?? 0,
        netBalance:     d.netBalance     ?? 0,
        monthIncome:    d.monthIncome    ?? 0,
        monthExpenses:  d.monthExpenses  ?? 0,
        monthNetBalance:d.monthNetBalance?? 0,
      })
      const recent = Array.isArray(recentRes.data?.data)
        ? recentRes.data.data
        : Array.isArray(recentRes.data) ? recentRes.data : []
      setRecentExpenses(recent)
    } catch {}
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    try {
      await expenseService.add(expenseFormData)
      toast.success('Expense added successfully!')
      resetExpenseForm()
      setShowAddExpense(false)
      await refreshStats()
    } catch {
      toast.error('Failed to add expense')
    }
  }, [expenseFormData, resetExpenseForm, refreshStats])

  const handleIncomeSubmit = useCallback(async (e) => {
    e.preventDefault()
    try {
      await incomeService.add(incomeFormData)
      // Professional SaaS feedback — no MoneyRain (issue #4)
      toast.success('Income added successfully! 🎉', { duration: 3500 })
      resetIncomeForm()
      setShowAddIncome(false)
      await refreshStats()
    } catch {
      toast.error('Failed to add income')
    }
  }, [incomeFormData, resetIncomeForm, refreshStats])

  const handleVoiceExpenseCreated = useCallback(async () => {
    await refreshStats()
    setShowVoiceInput(false)
    toast.success('Expense created from voice input!')
  }, [refreshStats])

  const handleReceiptScanned = useCallback(async () => {
    await refreshStats()
    setShowReceiptScanner(false)
  }, [refreshStats])

  // SSR-safe pie radius (issue #5)
  const pieRadius = lg ? 85 : 60

  return (
    <motion.div
      className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-[1600px] mx-auto font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div className="flex flex-col gap-3 sm:gap-4" {...fadeInUp}>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-slate-100 mb-1 sm:mb-2 tracking-tight">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed">
            Here's your financial overview for today
          </p>
        </div>
      </motion.div>

      {/* Stats Cards — data from backend (issue #10) */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <StatCard title="Total Income"    value={`₹${dashStats.totalIncome.toFixed(2)}`}    icon={TrendingUp}   color="green"  animateValue={!statsLoading} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard title="Total Expenses"  value={`₹${dashStats.totalExpenses.toFixed(2)}`}  icon={TrendingDown} color="red"    animateValue={!statsLoading} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard title="Net Balance"     value={`₹${dashStats.netBalance.toFixed(2)}`}     icon={Wallet}       color={dashStats.netBalance >= 0 ? 'blue' : 'orange'} animateValue={!statsLoading} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard title="This Month"      value={`₹${dashStats.monthNetBalance.toFixed(2)}`} icon={TrendingUp}  color="purple" animateValue={!statsLoading} />
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 border border-blue-100 dark:border-slate-600">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2 tracking-tight">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddExpense(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg">
              <Plus className="w-5 h-5" /><span>Add Expense</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddIncome(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg">
              <DollarSign className="w-5 h-5" /><span>Add Income</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => setShowVoiceInput(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-md hover:shadow-lg shadow-violet-500/30">
              <Mic className="w-5 h-5" /><span>Voice</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => setShowReceiptScanner(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 shadow-md hover:shadow-lg shadow-pink-500/30">
              <Camera className="w-5 h-5" /><span>Scan</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.4 }}>
        <Card title="Quick Links" subtitle="Explore more features">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Analytics', icon: TrendingUp, path: '/dashboard/analytics', bg: 'bg-blue-50/80 dark:bg-blue-900/20 hover:bg-blue-100/80 dark:hover:bg-blue-900/30',     iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600' },
              { label: 'Budgets',   icon: Wallet,     path: '/dashboard/budgets',   bg: 'bg-purple-50/80 dark:bg-purple-900/20 hover:bg-purple-100/80 dark:hover:bg-purple-900/30', iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600' },
              { label: 'Goals',     icon: TrendingUp, path: '/dashboard/goals',     bg: 'bg-emerald-50/80 dark:bg-emerald-900/20 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/30', iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
              { label: 'Income',    icon: DollarSign, path: '/dashboard/income',    bg: 'bg-amber-50/80 dark:bg-amber-900/20 hover:bg-amber-100/80 dark:hover:bg-amber-900/30',   iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600' },
              { label: 'Heatmap',   icon: Calendar,   path: '/dashboard/heatmap',   bg: 'bg-rose-50/80 dark:bg-rose-900/20 hover:bg-rose-100/80 dark:hover:bg-rose-900/30',       iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600' },
            ].map(({ label, icon: Icon, path, bg, iconBg }) => (
              <motion.button key={label} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all group ${bg}`}>
                <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold text-gray-900 dark:text-slate-100 text-sm text-center">{label}</span>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}
      >
        {/* Recent Transactions */}
        <div className="lg:col-span-1 xl:col-span-2">
          <Card title="Recent Transactions" subtitle="Your latest expenses"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/expenses')}><span className="hidden sm:inline">View All</span><ArrowUpRight className="w-4 h-4" /></Button>}
          >
            {recentExpenses.length > 0 ? (
              <motion.div className="space-y-2 sm:space-y-3" variants={staggerContainer} initial="initial" animate="animate">
                {recentExpenses.map((expense) => (
                  <motion.div
                    key={expense._id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary-400 hover:shadow-sm transition-all cursor-pointer bg-white dark:bg-slate-800/60"
                    onClick={() => navigate('/dashboard/expenses')}
                    variants={staggerItem}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${CATEGORY_COLORS[expense.category]?.bg || CATEGORY_COLORS.Other.bg}`}>
                        <Receipt className={`w-5 h-5 sm:w-6 sm:h-6 ${CATEGORY_COLORS[expense.category]?.text || CATEGORY_COLORS.Other.text}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm sm:text-base">{expense.category}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 truncate">
                          {expense.description || 'No description'} • {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2 sm:ml-4">
                      <p className="font-semibold text-gray-900 dark:text-slate-100 text-base sm:text-lg tabular-nums tracking-tight">₹{expense.amount.toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState icon={Receipt} title="No transactions yet" description="Your recent expenses will appear here" />
            )}
          </Card>
        </div>

        {/* Category Chart — SSR-safe radius (issue #5) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.4 }}>
          <Card3DTilt>
            <Card title="Spending by Category" subtitle="All time">
              {chartData.length > 0 ? (
                <div className="w-full" style={{ minHeight: '240px', height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={240}>
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" labelLine={false}
                        outerRadius={pieRadius}
                        fill="#8884d8" dataKey="value">
                        {chartData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.color} />))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `₹${value.toFixed(2)}`} contentStyle={tooltipStyle} />
                      <RechartsLegend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState icon={Receipt} title="No expenses yet" description="Add your first expense to see the breakdown" />
              )}
            </Card>
          </Card3DTilt>
        </motion.div>
      </motion.div>

      {/* Add Expense Modal */}
      <Modal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)} title="Add New Expense" size="md">
        <ExpenseForm formData={expenseFormData} onChange={setExpenseFormData} onSubmit={handleSubmit} />
      </Modal>

      {/* Voice Input Modal */}
      <Modal isOpen={showVoiceInput} onClose={() => setShowVoiceInput(false)} size="lg" showCloseButton={false} noPadding>
        <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="spinner border-4 w-8 h-8"></div></div>}>
          <VoiceExpenseInput onExpenseCreated={handleVoiceExpenseCreated} onClose={() => setShowVoiceInput(false)} />
        </Suspense>
      </Modal>

      {/* Receipt Scanner Modal */}
      <Modal isOpen={showReceiptScanner} onClose={() => setShowReceiptScanner(false)} size="xl" showCloseButton={false} noPadding>
        <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="spinner border-4 w-8 h-8"></div></div>}>
          <ReceiptScanner onSuccess={handleReceiptScanned} />
        </Suspense>
      </Modal>

      {/* Add Income Modal */}
      <Modal isOpen={showAddIncome} onClose={() => setShowAddIncome(false)} title="Add New Income" size="md">
        <IncomeForm formData={incomeFormData} onChange={setIncomeFormData} onSubmit={handleIncomeSubmit} />
      </Modal>
    </motion.div>
  )
}

export default DashboardHome
