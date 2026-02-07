import { useState, useMemo } from 'react'
import { useExpense } from '../../../context/ExpenseContext'
import { expenseService } from '../../../services/expenseService'
import { Trash2, Calendar, Edit2, X, Trash, Search, ArrowUpDown, Filter, Repeat } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Button, Modal } from '../../ui'
import { useNavigate } from 'react-router-dom'
import AdvancedSearch from './AdvancedSearch'
import RecurringExpenses from './RecurringExpenses'

const Expenses = () => {
  const { expenses, deleteExpense, updateExpense, loading, fetchExpenses } = useExpense()
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Expense History
          </h1>
          <p className="text-gray-600 text-lg">Manage and track all your expenses</p>
        </div>
        
        {/* Primary Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="md"
            icon={Repeat}
            onClick={() => setShowRecurring(true)}
          >
            Recurring
          </Button>
          {expenses.length > 0 && (
            <Button 
              variant="outline" 
              size="md"
              icon={Trash}
              onClick={handleClearAll}
              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-1">🔍 AI-Powered Search</h3>
                <p className="text-sm text-blue-700">
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
              <div className="mt-3 p-3 bg-white rounded-lg border border-blue-300">
                <p className="text-sm font-semibold text-blue-900">
                  ✓ Found {nlResults.count} expenses matching "{nlResults.query}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Filters:</span>
          
          {/* Period Filter */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filterPeriod === 'all' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setFilterPeriod('month')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                filterPeriod === 'month' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
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
        <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-900 mb-1">Advanced Search Results</h3>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-green-700">Total: </span>
                    <span className="font-semibold text-green-900">
                      ₹{advancedSearchResults.stats.total.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700">Count: </span>
                    <span className="font-semibold text-green-900">
                      {advancedSearchResults.stats.count}
                    </span>
                  </div>
                  <div>
                    <span className="text-green-700">Average: </span>
                    <span className="font-semibold text-green-900">
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
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No expenses yet</h3>
            <p className="text-gray-500 mb-6">Start tracking your expenses to see them here</p>
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
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Category</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Description</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Amount</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSortedExpenses.map((expense) => (
                  editingExpense === expense._id ? (
                    <tr key={expense._id} className="bg-gradient-to-r from-blue-50 to-indigo-50">
                        <td colSpan="5" className="py-5 px-6">
                          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Date</label>
                              <input
                                type="date"
                                value={editForm.date}
                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                required
                                className="input"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
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
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                              <input
                                type="text"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                placeholder="Description"
                                className="input"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹)</label>
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
                      <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-gray-700 font-medium">
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`badge ${getCategoryBadgeClass(expense.category)}`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {expense.description || <span className="text-gray-400 italic">No description</span>}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-gray-900 text-lg">
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
    </div>
  )
}

export default Expenses
