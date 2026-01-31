import { useState, useMemo } from 'react'
import { useExpense } from '../context/ExpenseContext'
import { expenseService } from '../services/expenseService'
import { Trash2, Calendar, Edit2, X, Download, Trash, Search, ArrowUpDown, Filter, Repeat } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'
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

  const handleExportToExcel = () => {
    if (expenses.length === 0) {
      toast.error('No expenses to export')
      return
    }

    const exportData = expenses.map(exp => ({
      Date: format(new Date(exp.date), 'yyyy-MM-dd'),
      Category: exp.category,
      Description: exp.description || '',
      Amount: exp.amount
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses')
    
    const fileName = `expenses_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    toast.success('Expenses exported successfully!')
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
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={() => setShowRecurring(true)} 
          className="btn bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Repeat className="w-4 h-4" />
          Recurring Expenses
        </button>
        <button 
          onClick={() => setShowAdvancedSearch(true)} 
          className="btn bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Filter className="w-4 h-4" />
          Advanced Search
        </button>
        <button onClick={handleExportToExcel} className="btn btn-primary">
          <Download className="w-4 h-4" />
          Export to Excel
        </button>
        <button 
          onClick={() => setShowNLSearch(!showNLSearch)} 
          className="btn btn-secondary"
        >
          <Search className="w-4 h-4" />
          Natural Language Search
        </button>
        {expenses.length > 0 && (
          <button onClick={handleClearAll} className="btn bg-red-600 hover:bg-red-700 text-white">
            <Trash className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Natural Language Search */}
      {showNLSearch && (
        <div className="card bg-blue-50 border-2 border-blue-200">
          <h3 className="font-bold mb-3 text-blue-900">🔍 Natural Language Search</h3>
          <p className="text-sm text-blue-700 mb-3">
            Try: "food over 500 last week" or "shopping this month" or "travel expenses"
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={nlQuery}
              onChange={(e) => setNlQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleNaturalLanguageSearch()}
              placeholder="e.g., food over ₹500 last week"
              className="input flex-1"
            />
            <button onClick={handleNaturalLanguageSearch} className="btn btn-primary">
              Search
            </button>
            {nlResults && (
              <button onClick={clearNLSearch} className="btn btn-secondary">
                Clear
              </button>
            )}
          </div>
          {nlResults && (
            <div className="mt-3 p-3 bg-white rounded border border-blue-300">
              <p className="text-sm font-semibold text-blue-900">
                Found {nlResults.count} expenses matching "{nlResults.query}"
              </p>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Expense History</h2>
          
          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-2">
            {/* Period Filter */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilterPeriod('all')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filterPeriod === 'all' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterPeriod('month')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filterPeriod === 'month' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                This Month
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input py-1 text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="category">Sort by Category</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn btn-secondary py-1 px-3"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by category or description..."
              className="input pl-10 w-full"
            />
          </div>
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No expenses yet. Add your first expense!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedExpenses.map((expense) => (
                  editingExpense === expense._id ? (
                    <tr key={expense._id} className="border-b border-gray-100 bg-blue-50">
                        <td colSpan="5" className="py-4 px-4">
                          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                              required
                              className="input"
                            />
                            <select
                              value={editForm.category}
                              onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                              required
                              className="input"
                            >
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
                            <input
                              type="text"
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              placeholder="Description"
                              className="input"
                            />
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={editForm.amount}
                              onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                              required
                              className="input"
                            />
                            <div className="flex gap-2">
                              <button type="submit" className="btn btn-primary flex-1">
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="btn btn-secondary"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      <tr key={expense._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`badge ${getCategoryBadgeClass(expense.category)}`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {expense.description || 'No description'}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          ₹{expense.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(expense)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(expense._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
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

      {/* Advanced Search Results Banner */}
      {advancedSearchResults && (
        <div className="card bg-green-50 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-green-900 mb-1">Advanced Search Results</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
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
            <button
              onClick={clearAdvancedSearch}
              className="btn btn-secondary"
            >
              Clear Results
            </button>
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
