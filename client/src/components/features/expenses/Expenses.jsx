import { useState, useMemo, useCallback, useEffect } from 'react'
import { useExpense } from '../../../context/ExpenseContext'
import { expenseService } from '../../../services/expenseService'
import { Trash2, Edit2, X, Search, ArrowUpDown, Filter, Plus, Mic, Camera, Receipt, Trash, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import AdvancedSearch from './AdvancedSearch'
import VoiceExpenseInput from '../voice/VoiceExpenseInput'
import ReceiptScanner from '../receipts/ReceiptScanner'
import { useFormState } from '../../../hooks/useFormState'
import { useCategories } from '../../../context/CategoryContext'
import { useIntersectionObserver } from '../../../hooks/useIntersectionObserver'
import ExpenseForm from '../../forms/ExpenseForm'
import { getTodayInputValue, toLocalDateInputValue, toLocalISOString } from '../../../utils/dateUtils'
import { formatCurrency, roundToDecimals } from '../../../utils/mathUtils'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter,
  Input, EmptyState, SkeletonList, Separator,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, CommonPageContainer,
  StatCard
} from '../../ui'
import { PageHeader, LoadingSpinner } from '../../ui'
import { TrendingDown, CalendarDays, Calculator, AlertCircle } from 'lucide-react'
import { analyticsService } from '../../../services/analyticsService'

const Expenses = () => {
  const { expenseCategories, getCategoryColor, getCategoryEmoji } = useCategories()
  const { expenses, deleteExpense, updateExpense, addExpense, loading, loadExpenses, pagination, loadMore } = useExpense()
  const navigate = useNavigate()
  const [editingExpense, setEditingExpense] = useState(null)
  const [editForm, setEditForm] = useState({ date: '', category: '', amount: '', description: '' })
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNLSearch, setShowNLSearch] = useState(false)
  const [nlQuery, setNlQuery] = useState('')
  const [nlResults, setNlResults] = useState(null)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [advancedSearchResults, setAdvancedSearchResults] = useState(null)
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [showReceiptScanner, setShowReceiptScanner] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { formData, setFormData, resetForm } = useFormState({
    date: getTodayInputValue(),
    category: '',
    amount: '',
    description: ''
  })

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteExpense(deleteTarget)
      toast.success('Expense deleted successfully')
    } catch (error) {
      toast.error('Failed to delete expense')
    } finally {
      setDeleteTarget(null)
    }
  }, [deleteExpense, deleteTarget])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addExpense(formData)
      toast.success('Expense added successfully!')
      resetForm()
      setShowAddExpense(false)
    } catch (error) {
      toast.error('Failed to add expense')
    } finally {
      setSubmitting(false)
    }
  }, [formData, addExpense, resetForm])

  const handleVoiceExpenseCreated = useCallback(async () => {
    await loadExpenses(null, { page: pagination.page, limit: pagination.limit })
    setShowVoiceInput(false)
    toast.success('Expense created from voice input!')
  }, [loadExpenses, pagination.page, pagination.limit])

  const handleReceiptScanned = useCallback(async () => {
    await loadExpenses(null, { page: pagination.page, limit: pagination.limit })
    setShowReceiptScanner(false)
  }, [loadExpenses, pagination.page, pagination.limit])

  const handleClearAll = async () => {
    try {
      await expenseService.deleteAll()
      await loadExpenses(null, { page: 1, limit: pagination.limit })
      toast.success('All expenses cleared successfully')
    } catch (error) {
      toast.error('Failed to clear expenses')
    } finally {
      setShowClearConfirm(false)
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
      date: toLocalDateInputValue(expense.date),
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
    setSubmitting(true)
    try {
      // Convert date to ISO string before sending
      const updateData = {
        ...editForm,
        dateISO: toLocalISOString(editForm.date)
      }
      await updateExpense(editingExpense, updateData)
      toast.success('Expense updated successfully')
      cancelEdit()
    } catch (error) {
      toast.error('Failed to update expense')
    } finally {
      setSubmitting(false)
    }
  }



  const { targetRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 })

  useEffect(() => {
    if (isIntersecting && pagination?.page < pagination?.pages && !loading) {
      loadMore()
    }
  }, [isIntersecting, pagination?.page, pagination?.pages, loading, loadMore])

  const [dashStats, setDashStats] = useState({ 
    totalExpenses: 0, 
    monthExpenses: 0, 
    categoryBreakdown: {} 
  })

  // FIX 1: Memory leak prevention with AbortController
  useEffect(() => {
    const controller = new AbortController()
    
    analyticsService.getDashboard()
      .then(res => {
        if (controller.signal.aborted) return
        setDashStats(res.data)
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          console.error('Failed to load dashboard stats:', err)
        }
      })
    
    return () => {
      controller.abort()
    }
  }, [])

  const filteredAndSortedExpenses = useMemo(() => {
    let result = advancedSearchResults
      ? advancedSearchResults.expenses
      : nlResults
        ? nlResults.results
        : [...expenses]

    if (filterPeriod !== 'all') {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      result = result.filter(exp => {
        const expDate = new Date(exp.date)
        return filterPeriod === 'month' ? expDate >= startOfMonth : true
      })
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(exp =>
        exp.category.toLowerCase().includes(query) ||
        (exp.description && exp.description.toLowerCase().includes(query))
      )
    }

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

  // Calculate Summary Stats from Global Analytics with FIX 4: proper rounding
  const totalExpenses = roundToDecimals(dashStats.totalExpenses || 0)
  const monthlyExpenses = roundToDecimals(dashStats.monthExpenses || 0)
  
  // Use pagination total (true count of expenses in db) to get average
  const averageExpense = pagination?.total > 0 
    ? roundToDecimals(totalExpenses / pagination.total) 
    : 0

  const highestCategory = useMemo(() => {
    // FIX 2: Defensive programming for categoryBreakdown
    if (!dashStats.categoryBreakdown || 
        typeof dashStats.categoryBreakdown !== 'object' ||
        Object.keys(dashStats.categoryBreakdown).length === 0) {
      return { name: 'None', amount: 0 }
    }
    const entries = Object.entries(dashStats.categoryBreakdown)
    if (!Array.isArray(entries) || entries.length === 0) {
      return { name: 'None', amount: 0 }
    }
    const top = entries.sort((a, b) => b[1] - a[1])[0]
    return { name: top[0], amount: roundToDecimals(top[1]) }
  }, [dashStats.categoryBreakdown])

  // removed the loading block to allow table to render the first page items alongside the loader at the bottom

  return (
    <CommonPageContainer>
      <PageHeader
        icon={Receipt}
        gradient="from-blue-500 to-indigo-600"
        title="Expense Tracker"
        subtitle="Manage and track all your expenses"
        actions={
          <>
            <Button variant="default" size="default" icon={Plus} onClick={() => setShowAddExpense(true)}>
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
            {expenses.length > 0 && (
              <Button variant="outline" size="default" icon={Trash} onClick={() => setShowClearConfirm(true)}
                className="text-destructive border-destructive/30 hover:bg-destructive/10">
                Clear All
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="Monthly Spending"
          value={formatCurrency(monthlyExpenses)}
          icon={CalendarDays}
          color="orange"
        />
        <StatCard
          title="Average Expense"
          value={formatCurrency(averageExpense)}
          icon={Calculator}
          color="blue"
        />
        <StatCard
          title="Highest Category"
          value={highestCategory.name}
          trendValue={formatCurrency(highestCategory.amount)}
          trend={true}
          icon={AlertCircle}
          color="purple"
        />
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by category or description..."
                icon={Search}
              />
            </div>
            <Button variant="outline" size="default" icon={Filter} onClick={() => setShowAdvancedSearch(true)}>
              Advanced
            </Button>
            <Button variant="outline" size="default" icon={Search} onClick={() => setShowNLSearch(!showNLSearch)}>
              AI Search
            </Button>
          </div>

          {showNLSearch && (
            <div className="bg-muted/50 border border-border rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Search className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1 tracking-tight">AI-Powered Search</h3>
                  <p className="text-sm text-muted-foreground leading-snug">
                    Try: "food over 500 last week" or "shopping this month" or "travel expenses"
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNaturalLanguageSearch()}
                  placeholder="e.g., food over ₹500 last week"
                  className="flex-1"
                />
                <Button variant="default" size="default" onClick={handleNaturalLanguageSearch}>
                  Search
                </Button>
                {nlResults && (
                  <Button variant="outline" size="default" onClick={clearNLSearch}>
                    Clear
                  </Button>
                )}
              </div>
              {nlResults && (
                <div className="mt-3 p-3 bg-card border border-border rounded-lg">
                  <p className="text-sm font-semibold text-foreground">
                    Found {nlResults.count} expenses matching &quot;{nlResults.query}&quot;
                  </p>
                </div>
              )}
            </div>
          )}

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-foreground">Filters:</span>

            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setFilterPeriod('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterPeriod === 'all'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                All Time
              </button>
              <button
                onClick={() => setFilterPeriod('month')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filterPeriod === 'month'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                This Month
              </button>
            </div>

            <div className="flex gap-2 ml-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="amount">Sort by Amount</SelectItem>
                  <SelectItem value="category">Sort by Category</SelectItem>
                </SelectContent>
              </Select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {advancedSearchResults && (
        <Card className="border-green-200 dark:border-green-700/50 bg-green-50 dark:bg-green-900/10">
          <CardContent className="pt-6">
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
              <Button variant="outline" size="sm" onClick={clearAdvancedSearch}>
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        {expenses.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No expenses yet"
            description="Start tracking your expenses to see them here"
            action={
              <Button variant="default" size="default" onClick={() => navigate('/dashboard')}>
                Add Your First Expense
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/6 pl-6">Date</TableHead>
                <TableHead className="w-1/6">Category</TableHead>
                <TableHead className="w-1/3">Description</TableHead>
                <TableHead className="text-right w-1/6">Amount</TableHead>
                <TableHead className="text-center w-1/6 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedExpenses.map((expense) => (
                editingExpense === expense._id ? (
                  <TableRow key={expense._id} className="bg-muted/50">
                    <TableCell colSpan={5} className="p-4">
                      <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1 tracking-tight">Date</label>
                          <Input
                            type="date"
                            value={editForm.date}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1 tracking-tight">Category</label>
                          <Select
                            value={editForm.category}
                            onValueChange={(v) => setEditForm({ ...editForm, category: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {expenseCategories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1 tracking-tight">Description</label>
                          <Input
                            type="text"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Description"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1 tracking-tight">Amount (₹)</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                            required
                          />
                        </div>
                        <div className="flex gap-2 items-end">
                          <Button type="submit" variant="default" className="flex-1" loading={submitting}>
                            Save
                          </Button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </form>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={expense._id}>
                    <TableCell className="font-medium whitespace-nowrap pl-6">
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getCategoryColor(expense.category).bg} ${getCategoryColor(expense.category).text}`}>
                        <span>{getCategoryEmoji(expense.category)}</span>
                        {expense.category}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {expense.description || <span className="text-muted-foreground/50 italic">No description</span>}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground tabular-nums tracking-tight whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell className="text-center pr-6">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => startEdit(expense)}
                          title="Edit expense"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget(expense._id)}
                          title="Delete expense"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {(pagination?.page < pagination?.pages || loading) && (
        <div ref={targetRef} className="py-6 flex justify-center">
          {loading && <LoadingSpinner size="sm" text="Loading more expenses..." />}
        </div>
      )}

      <Dialog open={showAdvancedSearch} onClose={() => setShowAdvancedSearch(false)} size="lg">
        <DialogHeader onClose={() => setShowAdvancedSearch(false)}>
          <DialogTitle>Advanced Search</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <AdvancedSearch
            onSearch={handleAdvancedSearch}
            onClose={() => setShowAdvancedSearch(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showAddExpense} onClose={() => setShowAddExpense(false)} size="md">
        <DialogHeader onClose={() => setShowAddExpense(false)}>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <ExpenseForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showVoiceInput} onClose={() => setShowVoiceInput(false)} size="lg">
        <VoiceExpenseInput
          onExpenseCreated={handleVoiceExpenseCreated}
          onClose={() => setShowVoiceInput(false)}
        />
      </Dialog>

      <Dialog open={showReceiptScanner} onClose={() => setShowReceiptScanner(false)} size="xl">
        <ReceiptScanner onSuccess={handleReceiptScanned} />
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} size="sm">
        <DialogHeader onClose={() => setDeleteTarget(null)}>
          <DialogTitle>Delete Expense</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-muted-foreground">Are you sure you want to delete this expense?</p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={showClearConfirm} onClose={() => setShowClearConfirm(false)} size="sm">
        <DialogHeader onClose={() => setShowClearConfirm(false)}>
          <DialogTitle>Clear All Expenses</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-muted-foreground mb-2">This will permanently delete <span className="font-semibold text-destructive">all your expense data</span>. This cannot be undone.</p>
          <p className="text-sm text-muted-foreground/70">Are you absolutely sure?</p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleClearAll}>Yes, Clear All</Button>
        </DialogFooter>
      </Dialog>
    </CommonPageContainer>
  )
}

export default Expenses
