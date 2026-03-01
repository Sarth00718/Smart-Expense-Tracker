import { useState, useMemo } from 'react'
import { useExpense } from '../../../context/ExpenseContext'
import { expenseService } from '../../../services/expenseService'
import { Trash2, Calendar, Edit2, X, Trash, Search, ArrowUpDown, Filter, Repeat, Plus, Mic, Camera, Receipt } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Button, Modal, LoadingSpinner, PageHeader } from '../../ui'
import { useNavigate } from 'react-router-dom'
import AdvancedSearch from './AdvancedSearch'
import RecurringExpenses from './RecurringExpenses'
import VoiceExpenseInput from '../voice/VoiceExpenseInput'
import ReceiptScanner from '../receipts/ReceiptScanner'

const Expenses = () => {
  const { expenses, deleteExpense, updateExpense, addExpense, loading, fetchExpenses } = useExpense()
  const navigate = useNavigate()
  const [editingExpense, setEditingExpense] = useState(null)
  const [editForm, setEditForm] = useState({
    date: '',
    category: '',
    amount: '',
    description: ''
  })
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNLSearch, setShowNLSearch] = useState(false)
  const [nlQuery, setNlQuery] = useState('')
  const [nlResults, setNlResults] = useState(null)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [advancedSearchResults, setAdvancedSearchResults] = useState(null)
  const [showRecurring, setShowRecurring] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [showReceiptScanner, setShowReceiptScanner] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    description: ''
  })

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id)
        toast.success('Expense deleted successfully')
      } catch (error) {
        toast.error('Failed to delete expense')
      }
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
      await fetchExpenses()
    } catch (error) {
      toast.error('Failed to add expense')
    }
  }

  const handleVoiceExpenseCreated = async () => {
    await fetchExpenses()
    setShowVoiceInput(false)
    toast.success('Expense created from voice input!')
  }

  const handleReceiptScanned = async () => {
    await fetchExpenses()
    setShowReceiptScanner(false)
  }

  const handleClearAll = async () => {
    if (window.confirm('⚠️ Are you sure you want to delete ALL expenses? This action cannot be undone!')) {
      if (window.confirm('This will permanently delete all your expense data. Are you absolutely sure?')) {
        try {
          await expenseService.deleteAll()
          await fetchExpenses()
          toast.success('All expenses cleared successfully')
        } catch (error) {
          toast.error('Failed to clear expenses')
        }
      }
    }
  }

  const handleNaturalLanguageSearch = async () => {
    if (!nlQuery.trim()) {
      toast.error('Please enter a search query')
      return
    }

    try {
      const response = await expenseService.search(nlQuery)
      setNlResults(response.data)
      toast.success(`Found ${response.data.count} matching expenses`)
    } catch (error) {
      toast.error('Search failed')
      console.error(error)
    }
  }

  const clearNLSearch = () => {
    setNlQuery('')
    setNlResults(null)
  }

  const handleAdvancedSearch = (results) => {
    setAdvancedSearchResults(results)
    setShowAdvancedSearch(false)
    toast.success(`Found ${results.expenses.length} expenses`)
  }

  const clearAdvancedSearch = () => {
    setAdvancedSearchResults(null)
  }

  const startEdit = (expense) => {
    setEditingExpense(expense._id)
    setEditForm({
      date: new Date(expense.date).toISOString().split('T')[0],
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description || ''
    })
  }

  const cancelEdit = () => {
    setEditingExpense(null)
    setEditForm({ date: '', category: '', amount: '', description: '' })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await updateExpense(editingExpense, editForm)
      toast.success('Expense updated successfully')
      cancelEdit()
    } catch (error) {
      toast.error('Failed to update expense')
    }
  }

  const getCategoryBadgeClass = (category) => {
    const classes = {
      Food: 'badge-food',
      Travel: 'badge-travel',
      Transport: 'badge-travel',
      Shopping: 'badge-shopping',
      Bills: 'badge-bills',
      Entertainment: 'badge-entertainment',
      Healthcare: 'badge-healthcare',
      Education: 'badge-education',
      Other: 'badge-other'
    }
    return classes[category] || 'badge-other'
  }

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let result = advancedSearchResults
      ? advancedSearchResults.expenses
      : nlResults
        ? nlResults.results
        : [...expenses]

    // Apply time period filter
    if (filterPeriod !== 'all') {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      result = result.filter(exp => {
        const expDate = new Date(exp.date)
        return filterPeriod === 'month' ? expDate >= startOfMonth : true
      })
    }

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(exp =>
        exp.category.toLowerCase().includes(query) ||
        (exp.description && exp.description.toLowerCase().includes(query))
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date)
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'category':
          comparison = a.category.localeCompare(b.category)
          break
        default:
          comparison = 0
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [expenses, nlResults, advancedSearchResults, filterPeriod, searchQuery, sortBy, sortOrder])

  if (loading) {
    return <LoadingSpinner size="lg" text="Loading expenses..." />
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Header Section */}
      <PageHeader
        icon={Receipt}
        gradient="from-blue-500 to-indigo-600"
        title="Expense Tracker"
        subtitle="Manage and track all your expenses"
        actions={
          <>
            <Button variant="primary" size="md" icon={Plus} onClick={() => setShowAddExpense(true)}>
              Add Expense
            </Button>
            <button
              onClick={() => setShowVoiceInput(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
            >
              <Mic className="w-4 h-4" /> Voice
            </button>
            <button
              onClick={() => setShowReceiptScanner(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-pink-500 to-rose-600 text-white hover:from-pink-600 hover:to-rose-700 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95"
            >
              <Camera className="w-4 h-4" /> Scan
            </button>
            <Button variant="outline" size="md" icon={Repeat} onClick={() => setShowRecurring(true)}
              className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-400">
              Recurring
            </Button>
            {expenses.length > 0 && (
              <Button variant="outline" size="md" icon={Trash} onClick={handleClearAll}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:border-red-600 dark:text-red-400">
                Clear All
              </Button>
            )}
          </>
        }
      />

      {/* Search & Filter Section */}
      <div className="card space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by category or description..."
              className="input pl-10 w-full"
            />
          </div>
          <Button
            variant="outline"
            size="md"
            icon={Filter}
            onClick={() => setShowAdvancedSearch(true)}
          >
            Advanced
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={Search}
            onClick={() => setShowNLSearch(!showNLSearch)}
          >
            AI Search
          </Button>
        </div>

        {/* Natural Language Search Panel */}
        {showNLSearch && (
          <div className="bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 dark:border-primary/30 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1 tracking-tight">🔍 AI-Powered Search</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 leading-snug">
                  Try: "food over 500 last week" or "shopping this month" or "travel expenses"
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNaturalLanguageSearch()}
                placeholder="e.g., food over ₹500 last week"
                className="input flex-1"
              />
              <Button
                variant="primary"
                size="md"
                onClick={handleNaturalLanguageSearch}
              >
                Search
              </Button>
              {nlResults && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={clearNLSearch}
                >
                  Clear
                </Button>
              )}
            </div>
            {nlResults && (
              <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-primary/20">
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                  ✓ Found {nlResults.count} expenses matching "{nlResults.query}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200 dark:border-slate-700">
          <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">Filters:</span>

          {/* Period Filter */}
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterPeriod === 'all'
                ? 'bg-white dark:bg-slate-600 text-primary shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              All Time
            </button>
            <button
              onClick={() => setFilterPeriod('month')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterPeriod === 'month'
                ? 'bg-white dark:bg-slate-600 text-primary shadow-sm'
                : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              This Month
            </button>
          </div>

          {/* Sort Controls */}
          <div className="flex gap-2 ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input py-2 text-sm pr-8"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="category">Sort by Category</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn btn-secondary py-2 px-3"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Search Results Banner */}
      {advancedSearchResults && (
        <div className="card border-2 border-green-200 dark:border-green-700/50 bg-green-50 dark:bg-green-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-1 tracking-tight">Advanced Search Results</h3>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-green-700 dark:text-green-400">Total: </span>
                    <span className="font-semibold text-green-900 dark:text-green-200">
                      ₹{advancedSearchResults.stats.total.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700 dark:text-green-400">Count: </span>
                    <span className="font-semibold text-green-900 dark:text-green-200">
                      {advancedSearchResults.stats.count}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700 dark:text-green-400">Average: </span>
                    <span className="font-semibold text-green-900 dark:text-green-200">
                      ₹{advancedSearchResults.stats.average.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAdvancedSearch}
            >
              Clear Results
            </Button>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="card">
        {expenses.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2 tracking-tight">No expenses yet</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">Start tracking your expenses to see them here</p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/dashboard')}
            >
              Add Your First Expense
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/60 border-y border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-slate-300 text-sm uppercase tracking-widest">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-slate-300 text-sm uppercase tracking-widest">Category</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-slate-300 text-sm uppercase tracking-widest">Description</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 dark:text-slate-300 text-sm uppercase tracking-widest">Amount</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-slate-300 text-sm uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filteredAndSortedExpenses.map((expense) => (
                  editingExpense === expense._id ? (
                    <tr key={expense._id} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-700/80">
                      <td colSpan="5" className="py-5 px-6">
                        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 tracking-tight">Date</label>
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                              required
                              className="input"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 tracking-tight">Category</label>
                            <select
                              value={editForm.category}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              required
                              className="input"
                            >
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
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 tracking-tight">Description</label>
                            <input
                              type="text"
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              placeholder="Description"
                              className="input"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1 tracking-tight">Amount (₹)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={editForm.amount}
                              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                              required
                              className="input"
                            />
                          </div>
                          <div className="flex gap-2 items-end">
                            <Button type="submit" variant="primary" className="flex-1">
                              Save
                            </Button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="btn btn-secondary px-3"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={expense._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="py-4 px-6 text-gray-700 dark:text-slate-300 font-medium">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`badge ${getCategoryBadgeClass(expense.category)}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-slate-400">
                        {expense.description || <span className="text-gray-400 dark:text-slate-500 italic">No description</span>}
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-gray-900 dark:text-slate-100 text-base sm:text-lg tabular-nums tracking-tight">
                        ₹{expense.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startEdit(expense)}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                            title="Edit expense"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense._id)}
                            className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                            title="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="my-8">
            <AdvancedSearch
              onSearch={handleAdvancedSearch}
              onClose={() => setShowAdvancedSearch(false)}
            />
          </div>
        </div>
      )}

      {/* Recurring Expenses Modal */}
      {showRecurring && (
        <RecurringExpenses onClose={() => setShowRecurring(false)} />
      )}

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
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
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
          size="lg"
          showCloseButton={false}
          noPadding
        >
          <VoiceExpenseInput
            onExpenseCreated={handleVoiceExpenseCreated}
            onClose={() => setShowVoiceInput(false)}
          />
        </Modal>
      )}

      {showReceiptScanner && (
        <Modal
          isOpen={showReceiptScanner}
          onClose={() => setShowReceiptScanner(false)}
          size="xl"
          showCloseButton={false}
          noPadding
        >
          <ReceiptScanner onSuccess={handleReceiptScanned} />
        </Modal>
      )}
    </div>
  )
}

export default Expenses
