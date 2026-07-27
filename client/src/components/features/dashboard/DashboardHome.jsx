import { useState, lazy, Suspense, useCallback, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { analyticsService } from '../../../services/analyticsService'
import {
  TrendingUp, TrendingDown, Wallet, Plus, Receipt, Camera, Mic,
  ArrowUpRight, DollarSign, Zap, BarChart3, Target, Inbox, RefreshCw
} from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend as RechartsLegend, Tooltip as RechartsTooltip } from 'recharts'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, SkeletonCard, CommonPageContainer } from '../../ui'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useChartTheme } from '../../../hooks/useChartTheme'
import { useResponsive } from '../../../hooks/useResponsive'
import { CHART_COLORS } from '../../../constants/categories'
import { useCategories } from '../../../context/CategoryContext'
import { expenseService } from '../../../services/expenseService'
import { incomeService } from '../../../services/incomeService'
import ExpenseForm from '../../forms/ExpenseForm'
import IncomeForm from '../../forms/IncomeForm'
import Modal from '../../ui/Modal'

const VoiceExpenseInput = lazy(() => import('../voice/VoiceExpenseInput'))
const ReceiptScanner = lazy(() => import('../receipts/ReceiptScanner'))

const EMPTY_STATS = {
  totalIncome: 0, totalExpenses: 0, netBalance: 0,
  monthIncome: 0, monthExpenses: 0, monthNetBalance: 0,
}

const colorMap = {
  green: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  red: { bg: 'bg-red-500/10', text: 'text-red-500' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
}

const KPICard = ({ title, value, icon: Icon, color, delay, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 sm:p-6 hover:shadow-md transition-all duration-200"
  >
    <div className="flex items-start justify-between mb-3">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className={`w-10 h-10 rounded-xl ${colorMap[color]?.bg || 'bg-muted'} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${colorMap[color]?.text || 'text-muted-foreground'}`} />
      </div>
    </div>
    <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">{value}</p>
    {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
  </motion.div>
)

const gradientMap = {
  blue: 'from-blue-500 to-blue-600',
  emerald: 'from-emerald-500 to-teal-600',
  violet: 'from-violet-500 to-purple-600',
  pink: 'from-pink-500 to-rose-600',
}

const QuickActionButton = ({ icon: Icon, label, color, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.03, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all bg-gradient-to-r ${gradientMap[color] || 'from-primary to-primary/80'} text-white shadow-md hover:shadow-lg`}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden sm:inline">{label}</span>
  </motion.button>
)

const DashboardHome = () => {
  const { tooltipStyle } = useChartTheme()
  const { lg } = useResponsive()
  const navigate = useNavigate()
  const { getCategoryColor, getCategoryEmoji } = useCategories()

  const [dashStats, setDashStats] = useState(EMPTY_STATS)
  const [statsLoading, setStatsLoading] = useState(true)
  const [recentExpenses, setRecentExpenses] = useState([])
  const [chartData, setChartData] = useState([])

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
        const d = dashRes.data
        setDashStats({
          totalIncome: d.totalIncome ?? 0, totalExpenses: d.totalExpenses ?? 0,
          netBalance: d.netBalance ?? 0, monthIncome: d.monthIncome ?? 0,
          monthExpenses: d.monthExpenses ?? 0, monthNetBalance: d.monthNetBalance ?? 0,
        })
        const recent = Array.isArray(recentRes.data?.data) ? recentRes.data.data : Array.isArray(recentRes.data) ? recentRes.data : []
        setRecentExpenses(recent)
        if (d.categoryBreakdown) {
          const chart = Object.entries(d.categoryBreakdown).map(([name, value], i) => ({
            name, value, color: CHART_COLORS[i % CHART_COLORS.length]
          }))
          setChartData(chart)
        }
      } catch (err) {
        if (!cancelled) console.error('Dashboard load error:', err)
      } finally { if (!cancelled) setStatsLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [showReceiptScanner, setShowReceiptScanner] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddIncome, setShowAddIncome] = useState(false)

  const [expenseFormData, setExpenseFormData] = useState({
    date: new Date().toISOString().split('T')[0], category: '', amount: '', description: ''
  })
  const [incomeFormData, setIncomeFormData] = useState({
    date: new Date().toISOString().split('T')[0], source: 'Salary', amount: '', description: '', isRecurring: false
  })

  const resetExpenseForm = () => setExpenseFormData({ date: new Date().toISOString().split('T')[0], category: '', amount: '', description: '' })
  const resetIncomeForm = () => setIncomeFormData({ date: new Date().toISOString().split('T')[0], source: 'Salary', amount: '', description: '', isRecurring: false })

  const refreshStats = useCallback(async () => {
    try {
      const [dashRes, recentRes] = await Promise.all([analyticsService.getDashboard(), expenseService.getRecent(5)])
      const d = dashRes.data
      setDashStats({ totalIncome: d.totalIncome ?? 0, totalExpenses: d.totalExpenses ?? 0, netBalance: d.netBalance ?? 0, monthIncome: d.monthIncome ?? 0, monthExpenses: d.monthExpenses ?? 0, monthNetBalance: d.monthNetBalance ?? 0 })
      const recent = Array.isArray(recentRes.data?.data) ? recentRes.data.data : Array.isArray(recentRes.data) ? recentRes.data : []
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
    } catch { toast.error('Failed to add expense') }
  }, [expenseFormData, refreshStats])

  const handleIncomeSubmit = useCallback(async (e) => {
    e.preventDefault()
    try {
      await incomeService.add(incomeFormData)
      toast.success('Income added successfully!')
      resetIncomeForm()
      setShowAddIncome(false)
      await refreshStats()
    } catch { toast.error('Failed to add income') }
  }, [incomeFormData, refreshStats])

  const handleVoiceExpenseCreated = useCallback(async () => {
    await refreshStats()
    setShowVoiceInput(false)
    toast.success('Expense created from voice input!')
  }, [refreshStats])

  const handleReceiptScanned = useCallback(async () => {
    await refreshStats()
    setShowReceiptScanner(false)
  }, [refreshStats])

  const pieRadius = lg ? 85 : 60

  return (
    <CommonPageContainer>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">Here's your financial overview for today</p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshStats} icon={RefreshCw}>Refresh</Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Income" value={`₹${dashStats.totalIncome.toFixed(2)}`} icon={TrendingUp} color="green" delay={0.1} />
        <KPICard title="Total Expenses" value={`₹${dashStats.totalExpenses.toFixed(2)}`} icon={TrendingDown} color="red" delay={0.15} />
        <KPICard title="Net Balance" value={`₹${dashStats.netBalance.toFixed(2)}`} icon={Wallet} color={dashStats.netBalance >= 0 ? 'blue' : 'orange'} delay={0.2} subtitle={dashStats.netBalance >= 0 ? 'Positive balance' : 'Negative balance'} />
        <KPICard title="This Month" value={`₹${dashStats.monthNetBalance.toFixed(2)}`} icon={BarChart3} color="purple" delay={0.25} />
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
        <Card className="bg-gradient-to-r from-primary/5 via-purple-600/5 to-pink-500/5 border-primary/10">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <QuickActionButton icon={Plus} label="Add Expense" color="blue" onClick={() => setShowAddExpense(true)} />
              <QuickActionButton icon={DollarSign} label="Add Income" color="emerald" onClick={() => setShowAddIncome(true)} />
              <QuickActionButton icon={Mic} label="Voice" color="violet" onClick={() => setShowVoiceInput(true)} />
              <QuickActionButton icon={Camera} label="Scan" color="pink" onClick={() => setShowReceiptScanner(true)} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Analytics', icon: TrendingUp, path: '/dashboard/analytics', color: 'from-blue-500 to-blue-600' },
          { label: 'Budgets', icon: Wallet, path: '/dashboard/budgets', color: 'from-purple-500 to-purple-600' },
          { label: 'Goals', icon: Target, path: '/dashboard/goals', color: 'from-emerald-500 to-teal-600' },
          { label: 'Income', icon: DollarSign, path: '/dashboard/income', color: 'from-amber-500 to-orange-600' },
          { label: 'Heatmap', icon: BarChart3, path: '/dashboard/analytics?view=heatmap', color: 'from-rose-500 to-pink-600' },
        ].map(({ label, icon: Icon, path, color }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(path)}
            className="flex flex-col items-center justify-center p-4 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-foreground text-sm text-center">{label}</span>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest expenses</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/expenses')}>
                View All <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentExpenses.length > 0 ? (
                <div className="space-y-2">
                  {recentExpenses.map((expense) => (
                    <motion.div
                      key={expense._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
                      onClick={() => navigate('/dashboard/expenses')}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getCategoryColor(expense.category).bg}`}>
                          <span className="text-lg">{getCategoryEmoji(expense.category)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-foreground">{expense.category}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {expense.description || 'No description'} • {format(new Date(expense.date), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="font-semibold text-foreground tabular-nums">₹{Number(expense.amount).toFixed(2)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <Inbox className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No transactions yet</p>
                  <p className="text-xs text-muted-foreground">Your recent expenses will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>All time</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="w-full" style={{ height: '280px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={pieRadius} fill="#8884d8" dataKey="value">
                        {chartData.map((entry) => (<Cell key={`cell-${entry.name}`} fill={entry.color} />))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `₹${value.toFixed(2)}`} contentStyle={tooltipStyle} />
                      <RechartsLegend verticalAlign="bottom" height={36} iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <Inbox className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No expenses yet</p>
                  <p className="text-xs text-muted-foreground">Add your first expense to see the breakdown</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={showAddExpense} onClose={() => { setShowAddExpense(false); resetExpenseForm() }} title="Add New Expense" size="md">
        <ExpenseForm formData={expenseFormData} onChange={setExpenseFormData} onSubmit={handleSubmit} />
      </Modal>

      <Modal isOpen={showAddIncome} onClose={() => { setShowAddIncome(false); resetIncomeForm() }} title="Add New Income" size="md">
        <IncomeForm formData={incomeFormData} onChange={setIncomeFormData} onSubmit={handleIncomeSubmit} />
      </Modal>

      <Modal isOpen={showVoiceInput} onClose={() => setShowVoiceInput(false)} size="lg" showCloseButton={false} noPadding>
        <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="spinner w-8 h-8" /></div>}>
          <VoiceExpenseInput onExpenseCreated={handleVoiceExpenseCreated} onClose={() => setShowVoiceInput(false)} />
        </Suspense>
      </Modal>

      <Modal isOpen={showReceiptScanner} onClose={() => setShowReceiptScanner(false)} size="xl" showCloseButton={false} noPadding>
        <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="spinner w-8 h-8" /></div>}>
          <ReceiptScanner onSuccess={handleReceiptScanned} />
        </Suspense>
      </Modal>
    </CommonPageContainer>
  )
}

export default DashboardHome
