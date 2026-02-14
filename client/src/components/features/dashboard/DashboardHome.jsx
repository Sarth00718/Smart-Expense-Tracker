import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useExpense } from '../../../context/ExpenseContext'
import { useIncome } from '../../../context/IncomeContext'
import { analyticsService } from '../../../services/analyticsService'
import { TrendingUp, TrendingDown, Wallet, Plus, Receipt, Camera, Mic, ArrowUpRight, Calendar, DollarSign, Zap, Repeat } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend as RechartsLegend, Tooltip as RechartsTooltip } from 'recharts'
import toast from 'react-hot-toast'
import { StatCard, Card, Button, EmptyState, Modal, SkeletonCard, SkeletonList } from '../../ui'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import VoiceExpenseInput from '../voice/VoiceExpenseInput'
import ReceiptScanner from '../receipts/ReceiptScanner'
import { staggerContainer, staggerItem, fadeInUp } from '../../../utils/animations'

const COLORS = ['#4361ee', '#7209b7', '#f72585', '#4cc9f0', '#f8961e', '#38b000', '#ff006e', '#8338ec']

const DashboardHome = () => {
  const { expenses, addExpense, fetchExpenses } = useExpense()
  const { addIncome: addIncomeToContext } = useIncome()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [showReceiptScanner, setShowReceiptScanner] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddIncome, setShowAddIncome] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    description: ''
  })
  const [incomeFormData, setIncomeFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: 'Salary',
    amount: '',
    description: '',
    isRecurring: false
  })

  useEffect(() => {
    loadStats()
  }, [expenses])

  const loadStats = async () => {
    try {
      setLoading(true)
      const response = await analyticsService.getDashboard()
      setStats(response.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
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
      setShowAddExpense(false)
      // Refresh both expenses and stats
      await fetchExpenses()
      await loadStats()
    } catch (error) {
      toast.error('Failed to add expense')
    }
  }

  const handleIncomeSubmit = async (e) => {
    e.preventDefault()
    try {
      await addIncomeToContext(incomeFormData)
      toast.success('Income added successfully!')
      setIncomeFormData({
        date: new Date().toISOString().split('T')[0],
        source: 'Salary',
        amount: '',
        description: '',
        isRecurring: false
      })
      setShowAddIncome(false)
      await loadStats()
    } catch (error) {
      toast.error('Failed to add income')
    }
  }

  const handleVoiceExpenseCreated = async () => {
    await fetchExpenses()
    await loadStats()
    setShowVoiceInput(false)
    toast.success('Expense created from voice input!')
  }

  const handleReceiptScanned = async () => {
    await fetchExpenses()
    await loadStats()
    setShowReceiptScanner(false)
  }

  // Calculate category data for chart
  const categoryData = Array.isArray(expenses) ? expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount
    return acc
  }, {}) : {}

  const chartData = Object.keys(categoryData).map((category, index) => ({
    name: category,
    value: categoryData[category],
    color: COLORS[index % COLORS.length]
  }))

  // Get recent expenses
  const recentExpenses = Array.isArray(expenses) 
    ? [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
    : []

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-[1600px] mx-auto">
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[1, 2, 3, 4].map(i => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <SkeletonList count={3} />
            </div>
            <div>
              <SkeletonCard />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-[1600px] mx-auto font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Section */}
      <motion.div 
        className="flex flex-col gap-3 sm:gap-4"
        {...fadeInUp}
      >
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-1 sm:mb-2 tracking-tight">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg leading-relaxed">Here's your financial overview for today</p>
        </div>
      </motion.div>

      {/* Stats Cards - Primary Metrics */}
      <motion.div 
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <StatCard
            title="Total Income"
            value={`₹${stats?.totalIncome?.toFixed(2) || '0.00'}`}
            icon={TrendingUp}
            color="green"
            animateValue={true}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="Total Expenses"
            value={`₹${stats?.totalExpenses?.toFixed(2) || '0.00'}`}
            icon={TrendingDown}
            color="red"
            animateValue={true}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="Net Balance"
            value={`₹${stats?.netBalance?.toFixed(2) || '0.00'}`}
            icon={Wallet}
            color={(stats?.netBalance || 0) >= 0 ? 'blue' : 'orange'}
            animateValue={true}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="This Month"
            value={`₹${stats?.monthNetBalance?.toFixed(2) || '0.00'}`}
            icon={TrendingUp}
            color="purple"
            animateValue={true}
          />
        </motion.div>
      </motion.div>

      {/* Quick Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 tracking-tight">
            <Zap className="w-4 h-4 text-blue-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddExpense(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Expense</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddIncome(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg"
            >
              <DollarSign className="w-5 h-5" />
              <span>Add Income</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowVoiceInput(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg"
            >
              <Mic className="w-5 h-5" />
              <span>Voice</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowReceiptScanner(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg"
            >
              <Camera className="w-5 h-5" />
              <span>Scan</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Quick Links - Full Width Horizontal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Card title="Quick Links" subtitle="Explore more features">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/analytics')}
              className="flex flex-col items-center justify-center p-4 rounded-xl transition-all group bg-blue-50/80 hover:bg-blue-100/80"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm text-center">Analytics</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/budgets')}
              className="flex flex-col items-center justify-center p-4 rounded-xl transition-all group bg-purple-50/80 hover:bg-purple-100/80"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm text-center">Budgets</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/goals')}
              className="flex flex-col items-center justify-center p-4 rounded-xl transition-all group bg-green-50/80 hover:bg-green-100/80"
            >
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm text-center">Goals</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/income')}
              className="flex flex-col items-center justify-center p-4 rounded-xl transition-all group bg-teal-50/80 hover:bg-teal-100/80"
            >
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm text-center">Income</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard/analytics?view=heatmap')}
              className="flex flex-col items-center justify-center p-4 rounded-xl transition-all group bg-rose-50/80 hover:bg-rose-100/80"
            >
              <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-gray-900 text-sm text-center">Heatmap</span>
            </motion.button>
          </div>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        {/* Recent Transactions */}
        <div className="lg:col-span-1 xl:col-span-2">
          <Card 
            title="Recent Transactions" 
            subtitle="Your latest expenses"
            action={
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard/expenses')}
              >
                <span className="hidden sm:inline">View All</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            }
          >
            {recentExpenses.length > 0 ? (
              <motion.div 
                className="space-y-2 sm:space-y-3"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {recentExpenses.map((expense, index) => (
                  <motion.div 
                    key={expense._id}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => navigate('/dashboard/expenses')}
                    variants={staggerItem}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        expense.category === 'Food' ? 'bg-orange-100' :
                        expense.category === 'Travel' ? 'bg-blue-100' :
                        expense.category === 'Shopping' ? 'bg-pink-100' :
                        expense.category === 'Bills' ? 'bg-purple-100' :
                        expense.category === 'Entertainment' ? 'bg-indigo-100' :
                        'bg-gray-100'
                      }`}>
                        <Receipt className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          expense.category === 'Food' ? 'text-orange-600' :
                          expense.category === 'Travel' ? 'text-blue-600' :
                          expense.category === 'Shopping' ? 'text-pink-600' :
                          expense.category === 'Bills' ? 'text-purple-600' :
                          expense.category === 'Entertainment' ? 'text-indigo-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">{expense.category}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {expense.description || 'No description'} • {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2 sm:ml-4">
                      <p className="font-semibold text-gray-900 text-base sm:text-lg tabular-nums tracking-tight">₹{expense.amount.toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState
                icon={Receipt}
                title="No transactions yet"
                description="Your recent expenses will appear here"
              />
            )}
          </Card>
        </div>

        {/* Category Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Card title="Spending by Category" subtitle="This month">
            {chartData.length > 0 ? (
              <div className="w-full" style={{ minHeight: '240px', height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={240}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={window.innerWidth < 640 ? 60 : window.innerWidth < 1024 ? 70 : 85}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => `₹${value.toFixed(2)}`}
                    />
                    <RechartsLegend 
                      verticalAlign="bottom" 
                      height={36}
                      iconSize={10}
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={Receipt}
                title="No expenses yet"
                description="Add your first expense to see the breakdown"
              />
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* Add Expense Modal */}
      <Modal 
        isOpen={showAddExpense} 
        onClose={() => setShowAddExpense(false)}
        title="Add New Expense"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="input w-full"
              >
                <option value="">Select Category</option>
                <option value="Food">🍔 Food</option>
                <option value="Travel">✈️ Travel</option>
                <option value="Transport">🚗 Transport</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Bills">📄 Bills</option>
                <option value="Entertainment">🎬 Entertainment</option>
                <option value="Healthcare">🏥 Healthcare</option>
                <option value="Education">📚 Education</option>
                <option value="Other">📦 Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
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
              className="input w-full text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
              Description (Optional)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What was this expense for?"
              className="input w-full"
            />
          </div>

          <Button type="submit" variant="primary" fullWidth icon={Plus} size="lg">
            Add Expense
          </Button>
        </form>
      </Modal>

      {/* Voice Input Modal */}
      {showVoiceInput && (
        <Modal 
          isOpen={showVoiceInput} 
          onClose={() => setShowVoiceInput(false)}
          size="md"
          showCloseButton={false}
        >
          <VoiceExpenseInput
            onExpenseCreated={handleVoiceExpenseCreated}
            onClose={() => setShowVoiceInput(false)}
          />
        </Modal>
      )}

      {/* Receipt Scanner Modal */}
      {showReceiptScanner && (
        <Modal 
          isOpen={showReceiptScanner} 
          onClose={() => setShowReceiptScanner(false)}
          size="xl"
          title="Receipt Scanner"
        >
          <ReceiptScanner onSuccess={handleReceiptScanned} />
        </Modal>
      )}

      {/* Add Income Modal */}
      <Modal 
        isOpen={showAddIncome} 
        onClose={() => setShowAddIncome(false)}
        title="Add New Income"
        size="md"
      >
        <form onSubmit={handleIncomeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                Date
              </label>
              <input
                type="date"
                value={incomeFormData.date}
                onChange={(e) => setIncomeFormData({ ...incomeFormData, date: e.target.value })}
                required
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                Source
              </label>
              <select
                value={incomeFormData.source}
                onChange={(e) => setIncomeFormData({ ...incomeFormData, source: e.target.value })}
                required
                className="input w-full"
              >
                <option value="Salary">💼 Salary</option>
                <option value="Freelance">💻 Freelance</option>
                <option value="Investment">📈 Investment</option>
                <option value="Business">🏢 Business</option>
                <option value="Gift">🎁 Gift</option>
                <option value="Bonus">🎉 Bonus</option>
                <option value="Rental">🏠 Rental</option>
                <option value="Other">📦 Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={incomeFormData.amount}
              onChange={(e) => setIncomeFormData({ ...incomeFormData, amount: e.target.value })}
              required
              placeholder="0.00"
              className="input w-full text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
              Description (Optional)
            </label>
            <input
              type="text"
              value={incomeFormData.description}
              onChange={(e) => setIncomeFormData({ ...incomeFormData, description: e.target.value })}
              placeholder="Add a note about this income"
              className="input w-full"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={incomeFormData.isRecurring}
                onChange={(e) => setIncomeFormData({ ...incomeFormData, isRecurring: e.target.checked })}
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mr-3"
              />
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Recurring Income</span>
              </div>
            </label>
          </div>

          <Button type="submit" variant="primary" fullWidth icon={Plus} size="lg">
            Add Income
          </Button>
        </form>
      </Modal>
    </motion.div>
  )
}

export default DashboardHome
