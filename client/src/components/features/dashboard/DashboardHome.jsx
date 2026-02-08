import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useExpense } from '../../../context/ExpenseContext'
import { analyticsService } from '../../../services/analyticsService'
import { TrendingUp, TrendingDown, Wallet, Plus, Receipt, Camera, Mic, ArrowUpRight } from 'lucide-react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import toast from 'react-hot-toast'
import { StatCard, Card, Button, EmptyState, Modal, SkeletonCard, SkeletonList } from '../../ui'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import VoiceExpenseInput from '../voice/VoiceExpenseInput'
import ReceiptScanner from '../receipts/ReceiptScanner'
import { staggerContainer, staggerItem, fadeInUp } from '../../../utils/animations'

ChartJS.register(ArcElement, Tooltip, Legend)

const DashboardHome = () => {
  const { expenses, addExpense, fetchExpenses } = useExpense()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [showReceiptScanner, setShowReceiptScanner] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
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
    } catch (error) {
      toast.error('Failed to add expense')
    }
  }

  const handleVoiceExpenseCreated = () => {
    fetchExpenses()
    setShowVoiceInput(false)
    toast.success('Expense created from voice input!')
  }

  const handleReceiptScanned = () => {
    fetchExpenses()
    setShowReceiptScanner(false)
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
        '#4361ee', '#7209b7', '#f72585', '#4cc9f0',
        '#f8961e', '#38b000', '#ff006e', '#8338ec'
      ],
      borderWidth: 0
    }]
  }

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
      className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-[1600px] mx-auto"
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Here's your financial overview for today</p>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="primary" 
            size="sm"
            icon={Plus}
            onClick={() => setShowAddExpense(true)}
          >
            <span className="hidden xs:inline">Add Expense</span>
            <span className="xs:hidden">Add</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            icon={Mic}
            onClick={() => setShowVoiceInput(true)}
          >
            Voice
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            icon={Camera}
            onClick={() => setShowReceiptScanner(true)}
          >
            Scan
          </Button>
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

      {/* Main Content Grid */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        {/* Left Column - Recent Transactions (2/3 width) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Recent Transactions */}
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
                      <p className="font-bold text-gray-900 text-base sm:text-lg">₹{expense.amount.toFixed(2)}</p>
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

        {/* Right Column - Chart & Quick Links (1/3 width) */}
        <div className="space-y-4 sm:space-y-6">
          {/* Category Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Card title="Spending by Category" subtitle="This month">
              {Object.keys(categoryData).length > 0 ? (
                <div className="h-64 sm:h-72">
                  <Doughnut 
                    data={chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 10,
                            padding: 10,
                            font: { size: 10 }
                          }
                        }
                      }
                    }}
                  />
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

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Card title="Quick Links" subtitle="Explore more features">
              <div className="space-y-1.5 sm:space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard/analytics')}
                  className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">Analytics</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-primary" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard/budgets')}
                  className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">Budgets</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-primary" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard/goals')}
                  className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">Goals</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-primary" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard/analytics')}
                  className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm sm:text-base">Analytics</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-primary" />
                </motion.button>
              </div>
            </Card>
          </motion.div>
        </div>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
    </motion.div>
  )
}

export default DashboardHome
