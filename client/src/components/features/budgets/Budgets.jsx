import { useState, useEffect, useCallback } from 'react'
import { PieChart, Plus, Trash2, TrendingDown, TrendingUp, AlertCircle, Lightbulb, Target, Calendar, ChevronLeft, ChevronRight, Edit2, X } from 'lucide-react'
import { budgetService } from '../../../services/budgetService'
import { expenseService } from '../../../services/expenseService'
import BudgetRecommendations from './BudgetRecommendations'
import toast from 'react-hot-toast'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, Tabs, TabsList, TabsTrigger, TabsContent,
  Progress, Separator, Input,
  Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter,
  EmptyState, LiquidProgress, PageHeader
} from '../../ui'
import { EXPENSE_CATEGORIES } from '../../../constants/categories'

const Budgets = () => {
  const [activeTab, setActiveTab] = useState('budgets')
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [editAmount, setEditAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    monthlyBudget: ''
  })

  const [historyData, setHistoryData] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  useEffect(() => {
    loadBudgets()
  }, [])

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistoryData()
    }
  }, [activeTab, selectedMonth])

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true)
      const response = await budgetService.getBudgets()
      setBudgets(response.data.budgets || [])
    } catch (error) {
      console.error('Error loading budgets:', error)
      toast.error('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadHistoryData = useCallback(async () => {
    try {
      setLoadingHistory(true)
      const budgetsResponse = await budgetService.getBudgets()
      const currentBudgets = budgetsResponse.data?.budgets || []

      if (currentBudgets.length === 0) {
        setHistoryData([])
        setLoadingHistory(false)
        return
      }

      const monthStart = startOfMonth(selectedMonth)
      const monthEnd = endOfMonth(selectedMonth)
      const expensesResponse = await expenseService.getExpenses({ limit: 500, startDate: monthStart.toISOString(), endDate: monthEnd.toISOString() })
      const allExpenses = expensesResponse.data?.data || []

      const monthExpenses = allExpenses.filter(exp => {
        const expDate = new Date(exp.date)
        return expDate >= monthStart && expDate <= monthEnd
      })

      const spendingByCategory = monthExpenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount
        return acc
      }, {})

      const history = currentBudgets.map(budget => {
        const spent = spendingByCategory[budget.category] || 0
        const remaining = Math.max(0, budget.budget - spent)
        const percentage = budget.budget > 0 ? (spent / budget.budget) * 100 : 0
        return {
          category: budget.category,
          budget: budget.budget,
          spent,
          remaining,
          percentage,
          status: spent > budget.budget ? 'over' : 'under'
        }
      })

      setHistoryData(history)
    } catch (error) {
      console.error('Failed to load history:', error)
      toast.error('Failed to load budget history')
      setHistoryData([])
    } finally {
      setLoadingHistory(false)
    }
  }, [selectedMonth])

  const previousMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1))
  }

  const nextMonth = () => {
    const now = new Date()
    if (selectedMonth < now) {
      setSelectedMonth(subMonths(selectedMonth, -1))
    }
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return selectedMonth.getMonth() === now.getMonth() &&
      selectedMonth.getFullYear() === now.getFullYear()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await budgetService.setBudget(formData)
      toast.success('Budget set successfully!')
      setFormData({ category: '', monthlyBudget: '' })
      setShowForm(false)
      loadBudgets()
    } catch (error) {
      toast.error('Failed to set budget')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditOpen = (budget) => {
    setEditingBudget(budget)
    setEditAmount(budget.budget.toString())
  }

  const handleEditClose = () => {
    setEditingBudget(null)
    setEditAmount('')
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editAmount || parseFloat(editAmount) <= 0) {
      toast.error('Please enter a valid budget amount')
      return
    }
    setSubmitting(true)
    try {
      await budgetService.updateBudget(editingBudget.category, parseFloat(editAmount))
      toast.success('Budget updated successfully!')
      handleEditClose()
      loadBudgets()
    } catch (error) {
      toast.error('Failed to update budget')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (category) => {
    if (window.confirm(`Delete budget for ${category}?`)) {
      try {
        await budgetService.deleteBudget(category)
        toast.success('Budget deleted successfully')
        loadBudgets()
      } catch (error) {
        toast.error('Failed to delete budget')
      }
    }
  }

  const getStatusColor = (status, percentage) => {
    if (status === 'over') return 'text-red-600'
    if (percentage > 80) return 'text-orange-600'
    if (percentage > 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressBarColor = (status, percentage) => {
    if (status === 'over') return 'bg-red-500'
    if (percentage > 80) return 'bg-orange-500'
    if (percentage > 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getProgressIndicatorColor = (status, percentage) => {
    if (status === 'over') return 'bg-red-500'
    if (percentage > 80) return 'bg-orange-500'
    if (percentage > 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getBadgeVariant = (status, percentage) => {
    if (status === 'over') return 'destructive'
    if (percentage > 80) return 'warning'
    if (percentage > 60) return 'warning'
    return 'success'
  }

  const totalBudget = historyData.reduce((sum, item) => sum + item.budget, 0)
  const totalSpent = historyData.reduce((sum, item) => sum + item.spent, 0)
  const totalSaved = historyData.reduce((sum, item) => sum + item.remaining, 0)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      <PageHeader
        icon={Target}
        gradient="from-orange-500 to-amber-600"
        title="Budget Management"
        subtitle="Set budgets and track your spending"
      />

      <Tabs>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="budgets" activeTab={activeTab} onClick={setActiveTab}>
            <Target className="w-4 h-4" />
            My Budgets
          </TabsTrigger>
          <TabsTrigger value="history" activeTab={activeTab} onClick={setActiveTab}>
            <Calendar className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="recommendations" activeTab={activeTab} onClick={setActiveTab}>
            <Lightbulb className="w-4 h-4" />
            Smart Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="budgets" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <CardTitle>Your Budgets</CardTitle>
                  <CardDescription>Manage your monthly spending limits</CardDescription>
                </div>
                <Button
                  variant={showForm ? 'secondary' : 'default'}
                  icon={showForm ? X : Plus}
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? 'Cancel' : 'Add Budget'}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {showForm && (
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 rounded-xl bg-muted/40 border space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                      >
                        <option value="">Select Category</option>
                        {EXPENSE_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Monthly Budget (₹)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.monthlyBudget}
                        onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                        required
                        placeholder="5000.00"
                        className="text-lg"
                      />
                    </div>
                  </div>
                  <Button type="submit" loading={submitting}>Set Budget</Button>
                </form>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : budgets.length === 0 ? (
                <EmptyState
                  icon={PieChart}
                  title="No budgets set yet"
                  description="Create your first budget to start tracking your spending limits."
                />
              ) : (
                <div className="space-y-3">
                  {budgets.map((budget) => (
                    <Card key={budget.category} hover className="overflow-hidden">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-4 gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <CardTitle className="text-base sm:text-lg">{budget.category}</CardTitle>
                              {budget.status === 'over' && (
                                <Badge variant="destructive" className="gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Over Budget
                                </Badge>
                              )}
                              {budget.status === 'under' && budget.percentage > 80 && (
                                <Badge variant="warning" className="gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Nearly Full
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => handleEditOpen(budget)} title="Edit Budget">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(budget.category)} title="Delete Budget">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">
                              ₹{budget.spent.toFixed(2)} / ₹{budget.budget.toFixed(2)}
                            </span>
                            <span className={`font-semibold tabular-nums ${getStatusColor(budget.status, budget.percentage)}`}>
                              {budget.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <LiquidProgress
                            value={budget.spent}
                            max={budget.budget}
                            height={120}
                            color={
                              budget.status === 'over' ? '#ef4444' :
                                budget.percentage > 80 ? '#f97316' :
                                  budget.percentage > 60 ? '#eab308' :
                                    '#10b981'
                            }
                          />
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          {budget.status === 'over' ? (
                            <>
                              <TrendingUp className="w-4 h-4 text-destructive flex-shrink-0" />
                              <span className="text-destructive font-medium">
                                ₹{(budget.spent - budget.budget).toFixed(2)} over budget
                              </span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-green-600 font-medium">
                                ₹{budget.remaining.toFixed(2)} remaining
                              </span>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" activeTab={activeTab}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Budget History</CardTitle>
                  <CardDescription>Track your spending patterns over time</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon-sm" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {format(selectedMonth, 'MMMM yyyy')}
                </h3>
                <Button variant="outline" size="icon-sm" onClick={nextMonth} disabled={isCurrentMonth()}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Separator />

              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : historyData.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title={`No data for ${format(selectedMonth, 'MMMM yyyy')}`}
                  description={'Set budgets in the "My Budgets" tab to track your spending history.'}
                />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                      <CardContent className="p-4">
                        <CardDescription className="text-blue-600 dark:text-blue-400 font-semibold mb-1">Total Budget</CardDescription>
                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 tabular-nums tracking-tight">
                          ₹{totalBudget.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
                      <CardContent className="p-4">
                        <CardDescription className="text-purple-600 dark:text-purple-400 font-semibold mb-1">Total Spent</CardDescription>
                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-200 tabular-nums tracking-tight">
                          ₹{totalSpent.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                      <CardContent className="p-4">
                        <CardDescription className="text-green-600 dark:text-green-400 font-semibold mb-1">Total Saved</CardDescription>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-200 tabular-nums tracking-tight">
                          ₹{totalSaved.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    {historyData.map((item, index) => (
                      <Card key={index} hover>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-start justify-between mb-3 gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-base sm:text-lg">{item.category}</CardTitle>
                                {item.status === 'over' && (
                                  <Badge variant="destructive" className="gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Over Budget
                                  </Badge>
                                )}
                                {item.status === 'under' && item.percentage < 80 && (
                                  <Badge variant="success" className="gap-1">On Track</Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mb-3 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                ₹{item.spent.toFixed(2)} / ₹{item.budget.toFixed(2)}
                              </span>
                              <span className={`font-semibold tabular-nums ${getStatusColor(item.status, item.percentage)}`}>
                                {item.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={Math.min(item.percentage, 100)}
                              indicatorClassName={getProgressIndicatorColor(item.status, item.percentage)}
                            />
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            {item.status === 'over' ? (
                              <>
                                <TrendingUp className="w-4 h-4 text-destructive flex-shrink-0" />
                                <span className="text-destructive font-medium">
                                  ₹{(item.spent - item.budget).toFixed(2)} over budget
                                </span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-green-600 font-medium">
                                  ₹{item.remaining.toFixed(2)} saved
                                </span>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">About This Data</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      This shows your budget performance for {format(selectedMonth, 'MMMM yyyy')}.
                      Use the arrows to navigate between months and track your spending patterns over time.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" activeTab={activeTab}>
          <BudgetRecommendations />
        </TabsContent>
      </Tabs>

      {/* Edit Budget Dialog */}
      <Dialog open={!!editingBudget} onClose={handleEditClose} size="sm">
        <form onSubmit={handleEditSubmit}>
          <DialogHeader onClose={handleEditClose}>
            <DialogTitle>Edit Budget — {editingBudget?.category}</DialogTitle>
            <DialogDescription>Adjust the monthly limit for this category</DialogDescription>
          </DialogHeader>
          <DialogContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Monthly Budget (₹)</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                required
                autoFocus
                className="text-lg"
                placeholder="5000.00"
              />
              <p className="text-xs text-muted-foreground">
                Current: ₹{editingBudget?.budget?.toFixed(2)} · Spent: ₹{editingBudget?.spent?.toFixed(2)}
              </p>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleEditClose}>Cancel</Button>
            <Button type="submit" loading={submitting}>Save Changes</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  )
}

export default Budgets
