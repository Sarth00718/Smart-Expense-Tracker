import { useState, useEffect } from 'react'
import { useExpense } from '../context/ExpenseContext'
import { analyticsService } from '../services/analyticsService'
import { TrendingUp, TrendingDown, Wallet, Plus, Receipt, Camera, Mic, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Doughnut, Line } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js'
import toast from 'react-hot-toast'
import { StatCard, Card, Button, EmptyState, Modal } from './ui'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import VoiceExpenseInput from './VoiceExpenseInput'
import ReceiptScanner from './ReceiptScanner'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement)

const DashboardHome = () => {
  const { expenses, addExpense, fetchExpenses } = useExpense()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [showReceiptScanner, setShowReceiptScanner] = useState(false)
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
      <div className="flex items-center justify-center h-96">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600">Here's your financial overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={`₹${stats?.totalIncome?.toFixed(2) || '0.00'}`}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Total Expenses"
          value={`₹${stats?.totalExpenses?.toFixed(2) || '0.00'}`}
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="Net Balance"
          value={`₹${stats?.netBalance?.toFixed(2) || '0.00'}`}
          icon={Wallet}
          color={(stats?.netBalance || 0) >= 0 ? 'blue' : 'orange'}
        />
        <StatCard
          title="This Month"
          value={`₹${stats?.monthNetBalance?.toFixed(2) || '0.00'}`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" padding="default">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => document.getElementById('add-expense-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
              <Plus className="w-6 h-6 text-primary group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Add Expense</span>
          </button>
          
          <button
            onClick={() => setShowVoiceInput(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-500 group-hover:scale-110 transition-all">
              <Mic className="w-6 h-6 text-purple-600 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Voice Input</span>
          </button>
          
          <button
            onClick={() => setShowReceiptScanner(true)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-500 group-hover:scale-110 transition-all">
              <Camera className="w-6 h-6 text-green-600 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Scan Receipt</span>
          </button>
          
          <button
            onClick={() => navigate('/dashboard/heatmap')}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 group-hover:scale-110 transition-all">
              <TrendingUp className="w-6 h-6 text-blue-600 group-hover:text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">Heatmap</span>
          </button>
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Expense Form */}
        <Card 
          id="add-expense-form"
          title="Add New Expense" 
          icon={Plus}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                  <option value="">Select</option>
                  <option value="Food">Food</option>
                  <option value="Travel">Travel</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Bills">Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
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
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What was this expense for?"
                className="input w-full"
              />
            </div>

            <Button type="submit" variant="primary" fullWidth icon={Plus}>
              Add Expense
            </Button>
          </form>
        </Card>

        {/* Category Chart */}
        <Card title="Spending by Category">
          {Object.keys(categoryData).length > 0 ? (
            <div className="h-64">
              <Doughnut 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: { size: 11 }
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
      </div>

      {/* Recent Transactions */}
      <Card 
        title="Recent Transactions" 
        action={
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard/expenses')}
          >
            View All
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        }
      >
        {recentExpenses.length > 0 ? (
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <div 
                key={expense._id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-primary hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    expense.category === 'Food' ? 'bg-orange-100' :
                    expense.category === 'Travel' ? 'bg-blue-100' :
                    expense.category === 'Shopping' ? 'bg-pink-100' :
                    'bg-gray-100'
                  }`}>
                    <Receipt className={`w-6 h-6 ${
                      expense.category === 'Food' ? 'text-orange-600' :
                      expense.category === 'Travel' ? 'text-blue-600' :
                      expense.category === 'Shopping' ? 'text-pink-600' :
                      'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{expense.category}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{expense.amount.toFixed(2)}</p>
                  {expense.description && (
                    <p className="text-sm text-gray-500">{expense.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description="Your recent expenses will appear here"
          />
        )}
      </Card>

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
    </div>
  )
}

export default DashboardHome
