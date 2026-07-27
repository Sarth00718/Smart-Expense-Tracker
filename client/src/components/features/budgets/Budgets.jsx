import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { PieChart, Plus, Trash2, TrendingDown, TrendingUp, AlertCircle, Lightbulb, Target, Calendar, ChevronLeft, ChevronRight, Edit2, X, Wallet, BarChart3, AlertTriangle } from 'lucide-react'
import { budgetService } from '../../../services/budgetService'
import { expenseService } from '../../../services/expenseService'
const LazyBudgetRecommendations = lazy(() => import('./BudgetRecommendations'))
import toast from 'react-hot-toast'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, Tabs, TabsList, TabsTrigger, TabsContent,
  Progress, Separator, Input,
  Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter,
  EmptyState, LiquidProgress, PageHeader, StatCard, CommonPageContainer
} from '../../ui'
import { useCategories } from '../../../context/CategoryContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const Budgets = () => {
  const { expenseCategories } = useCategories()
  const [activeTab, setActiveTab] = useState('budgets')
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
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

    const newAmount = parseFloat(formData.monthlyBudget)
    const optimisticBudget = {
      category: formData.category,
      budget: newAmount,
      spent: 0,
      remaining: newAmount,
      percentage: 0,
      status: 'under'
    }

    setBudgets(prev => {
      const exists = prev.find(b => b.category === formData.category)
      if (exists) {
        return prev.map(b => b.category === formData.category ? { 
          ...b, 
          budget: newAmount,
          remaining: Math.max(0, newAmount - b.spent),
          percentage: newAmount > 0 ? (b.spent / newAmount) * 100 : 0,
          status: b.spent > newAmount ? 'over' : 'under'
        } : b)
      }
      return [...prev, optimisticBudget]
    })
    
    setShowAddModal(false)
    setFormData({ category: '', monthlyBudget: '' })

    try {
      await budgetService.setBudget(formData)
      toast.success('Budget set successfully!')
      loadBudgets()
    } catch (error) {
      toast.error('Failed to set budget')
      loadBudgets()
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
    const newAmount = parseFloat(editAmount)

    setBudgets(prev => prev.map(b => {
      if (b.category === editingBudget.category) {
        return {
          ...b,
          budget: newAmount,
          remaining: Math.max(0, newAmount - b.spent),
          percentage: newAmount > 0 ? (b.spent / newAmount) * 100 : 0,
          status: b.spent > newAmount ? 'over' : 'under'
        }
      }
      return b
    }))

    handleEditClose()

    try {
      await budgetService.updateBudget(editingBudget.category, newAmount)
      toast.success('Budget updated successfully!')
      loadBudgets()
    } catch (error) {
      toast.error('Failed to update budget')
      loadBudgets()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (category) => {
    if (window.confirm(`Delete budget for ${category}?`)) {
      setBudgets(prev => prev.filter(b => b.category !== category))
      try {
        await budgetService.deleteBudget(category)
        toast.success('Budget deleted successfully')
        loadBudgets()
      } catch (error) {
        toast.error('Failed to delete budget')
        loadBudgets()
      }
    }
  }

  const getStatusColor = (status, percentage) => {
    if (status === 'over') return 'text-red-600'
    if (percentage > 80) return 'text-orange-600'
    if (percentage > 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressIndicatorColor = (status, percentage) => {
    if (status === 'over') return 'bg-red-500'
    if (percentage > 80) return 'bg-orange-500'
    if (percentage > 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const currentTotalBudget = useMemo(() => budgets.reduce((sum, b) => sum + b.budget, 0), [budgets])
  const currentTotalSpent = useMemo(() => budgets.reduce((sum, b) => sum + b.spent, 0), [budgets])
  const currentTotalRemaining = useMemo(() => budgets.reduce((sum, b) => sum + b.remaining, 0), [budgets])

  const totalBudgetHist = historyData.reduce((sum, item) => sum + item.budget, 0)
  const totalSpentHist = historyData.reduce((sum, item) => sum + item.spent, 0)
  const totalSavedHist = historyData.reduce((sum, item) => sum + item.remaining, 0)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-3 rounded-xl shadow-xl flex flex-col gap-1">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-muted-foreground">Budget:</span>
            <span className="text-sm font-semibold tabular-nums text-foreground">₹{payload[0].value.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span className="text-sm text-muted-foreground">Spent:</span>
            <span className="text-sm font-semibold tabular-nums text-foreground">₹{payload[1].value.toFixed(2)}</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <CommonPageContainer>

      <PageHeader
        icon={Target}
        gradient="from-orange-500 to-amber-600"
        title="Budget Management"
        subtitle="Set budgets, track spending, and meet your financial goals"
        actions={
          activeTab === 'budgets' && (
            <Button
              variant="default"
              size="default"
              icon={Plus}
              onClick={() => setShowAddModal(true)}
            >
              Add Budget
            </Button>
          )
        }
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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : budgets.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <EmptyState
                  icon={PieChart}
                  title="No budgets set yet"
                  description="Create your first budget to start tracking your spending limits."
                  action={
                    <Button variant="default" onClick={() => setShowAddModal(true)}>
                      Create Budget
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Global Metrics for My Budgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title="Total Monthly Budget"
                  value={`₹${currentTotalBudget.toFixed(2)}`}
                  icon={Wallet}
                  color="blue"
                />
                <StatCard
                  title="Total Spent"
                  value={`₹${currentTotalSpent.toFixed(2)}`}
                  icon={TrendingUp}
                  color={currentTotalSpent > currentTotalBudget ? "red" : "orange"}
                />
                <StatCard
                  title="Total Remaining"
                  value={`₹${currentTotalRemaining.toFixed(2)}`}
                  icon={TrendingDown}
                  color="green"
                />
              </div>

              {/* Data Visualization Chart */}
              <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Budget Overview
                  </CardTitle>
                  <CardDescription>Comparison of your allocated budgets vs actual spending</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 pb-2 pl-0 pr-6">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgets} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                        <XAxis
                          dataKey="category"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          tickFormatter={(value) => `₹${value}`}
                          dx={-10}
                        />
                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                        <Legend
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="circle"
                          formatter={(value) => <span className="text-foreground text-sm font-medium">{value}</span>}
                        />
                        <Bar dataKey="budget" name="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="spent" name="Spent" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Budget Cards Grid */}
              <div className="flex items-center justify-between mt-8 mb-4">
                <h3 className="text-lg font-bold tracking-tight text-foreground">Category Breakdown</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {budgets.map((budget) => (
                  <Card key={budget.category} hover className="overflow-hidden border-border/50 group flex flex-col">
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-5 gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <CardTitle className="text-lg font-bold">{budget.category}</CardTitle>
                            {budget.status === 'over' && (
                              <Badge variant="destructive" className="gap-1.5 px-2 py-0.5 text-xs">
                                <AlertTriangle className="w-3 h-3" />
                                Over Budget
                              </Badge>
                            )}
                            {budget.status === 'under' && budget.percentage > 80 && (
                              <Badge variant="warning" className="gap-1.5 px-2 py-0.5 text-xs">
                                <AlertCircle className="w-3 h-3" />
                                Nearly Full
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon-sm" onClick={() => handleEditOpen(budget)} title="Edit Budget">
                            <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(budget.category)} title="Delete Budget">
                            <Trash2 className="w-4 h-4 text-destructive/70 hover:text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            <span className="text-foreground font-semibold tabular-nums">₹{budget.spent.toFixed(2)}</span> / ₹{budget.budget.toFixed(2)}
                          </span>
                          <span className={`text-sm font-bold tabular-nums ${getStatusColor(budget.status, budget.percentage)}`}>
                            {budget.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <LiquidProgress
                          value={budget.spent}
                          max={budget.budget}
                          height={140}
                          color={
                            budget.status === 'over' ? '#ef4444' :
                              budget.percentage > 80 ? '#f97316' :
                                budget.percentage > 60 ? '#eab308' :
                                  '#10b981'
                          }
                        />
                      </div>

                      <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-sm">
                        {budget.status === 'over' ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-destructive" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground font-medium">Excess</span>
                              <span className="text-destructive font-bold tabular-nums">₹{(budget.spent - budget.budget).toFixed(2)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                              <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-500" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground font-medium">Remaining</span>
                              <span className="text-green-600 dark:text-green-500 font-bold tabular-nums">₹{budget.remaining.toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" activeTab={activeTab}>
          <Card>
            <CardHeader className="border-b border-border/40 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Budget History</CardTitle>
                  <CardDescription>Track your spending patterns over time</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between bg-muted/30 p-2 rounded-xl border border-border/50">
                <Button variant="ghost" size="icon" onClick={previousMonth} className="hover:bg-background">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h3 className="text-lg font-bold tracking-tight text-foreground">
                  {format(selectedMonth, 'MMMM yyyy')}
                </h3>
                <Button variant="ghost" size="icon" onClick={nextMonth} disabled={isCurrentMonth()} className="hover:bg-background">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

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
                    <Card className="border-blue-200/50 dark:border-blue-800/50 bg-blue-50/30 dark:bg-blue-950/20 shadow-none">
                      <CardContent className="p-5">
                        <CardDescription className="text-blue-600 dark:text-blue-400 font-semibold mb-2">Total Budget</CardDescription>
                        <p className="text-3xl font-black text-blue-900 dark:text-blue-200 tabular-nums tracking-tight">
                          ₹{totalBudgetHist.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-purple-200/50 dark:border-purple-800/50 bg-purple-50/30 dark:bg-purple-950/20 shadow-none">
                      <CardContent className="p-5">
                        <CardDescription className="text-purple-600 dark:text-purple-400 font-semibold mb-2">Total Spent</CardDescription>
                        <p className="text-3xl font-black text-purple-900 dark:text-purple-200 tabular-nums tracking-tight">
                          ₹{totalSpentHist.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-green-200/50 dark:border-green-800/50 bg-green-50/30 dark:bg-green-950/20 shadow-none">
                      <CardContent className="p-5">
                        <CardDescription className="text-green-600 dark:text-green-400 font-semibold mb-2">Total Saved</CardDescription>
                        <p className="text-3xl font-black text-green-900 dark:text-green-200 tabular-nums tracking-tight">
                          ₹{totalSavedHist.toFixed(2)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {historyData.map((item, index) => (
                      <Card key={index} className="border-border/60 hover:border-border transition-colors shadow-sm">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4 gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-base sm:text-lg">{item.category}</CardTitle>
                                {item.status === 'over' && (
                                  <Badge variant="destructive" className="gap-1 text-xs px-2 py-0.5">
                                    <AlertTriangle className="w-3 h-3" />
                                    Over Budget
                                  </Badge>
                                )}
                                {item.status === 'under' && item.percentage < 80 && (
                                  <Badge variant="success" className="gap-1 text-xs px-2 py-0.5">On Track</Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mb-4 space-y-1.5">
                            <div className="flex justify-between text-sm items-baseline">
                              <span className="text-muted-foreground font-medium">
                                <span className="text-foreground font-semibold">₹{item.spent.toFixed(2)}</span> / ₹{item.budget.toFixed(2)}
                              </span>
                              <span className={`font-bold tabular-nums ${getStatusColor(item.status, item.percentage)}`}>
                                {item.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <Progress
                              value={Math.min(item.percentage, 100)}
                              indicatorClassName={getProgressIndicatorColor(item.status, item.percentage)}
                              className="h-2.5"
                            />
                          </div>

                          <div className="flex items-center gap-2 text-sm pt-2">
                            {item.status === 'over' ? (
                              <div className="flex items-center gap-2 bg-destructive/10 px-3 py-1.5 rounded-lg w-full">
                                <TrendingUp className="w-4 h-4 text-destructive flex-shrink-0" />
                                <span className="text-destructive font-semibold">
                                  ₹{(item.spent - item.budget).toFixed(2)} over budget
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg w-full">
                                <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                                <span className="text-green-600 dark:text-green-500 font-semibold">
                                  ₹{item.remaining.toFixed(2)} saved
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" activeTab={activeTab}>
          <Suspense fallback={<div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">Loading recommendations…</div>}>
            <LazyBudgetRecommendations />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* Add Budget Dialog */}
      <Dialog open={showAddModal} onClose={() => setShowAddModal(false)} size="sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader onClose={() => setShowAddModal(false)}>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">Set New Budget</DialogTitle>
            <DialogDescription>Define a monthly spending limit for a category</DialogDescription>
          </DialogHeader>
          <DialogContent className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-foreground">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all shadow-sm"
              >
                <option value="">Select Category</option>
                {expenseCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-foreground">Monthly Limit (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                  required
                  placeholder="5000.00"
                  className="text-lg pl-8 h-11 font-medium shadow-sm"
                />
              </div>
            </div>
          </DialogContent>
          <DialogFooter className="gap-3 pt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={submitting}>Set Budget</Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Edit Budget Dialog */}
      <Dialog open={!!editingBudget} onClose={handleEditClose} size="sm">
        <form onSubmit={handleEditSubmit}>
          <DialogHeader onClose={handleEditClose}>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Edit2 className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">Edit Budget</DialogTitle>
            <DialogDescription>Adjust the monthly limit for <strong className="text-foreground">{editingBudget?.category}</strong></DialogDescription>
          </DialogHeader>
          <DialogContent className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-sm font-semibold text-foreground">Monthly Limit (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  required
                  autoFocus
                  className="text-lg pl-8 h-11 font-medium shadow-sm"
                  placeholder="5000.00"
                />
              </div>
              <div className="bg-muted/50 p-3 rounded-lg flex items-center justify-between text-sm border border-border/50 mt-3">
                <span className="text-muted-foreground">Current Spent</span>
                <span className="font-semibold text-foreground tabular-nums">₹{editingBudget?.spent?.toFixed(2)}</span>
              </div>
            </div>
          </DialogContent>
          <DialogFooter className="gap-3 pt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={handleEditClose}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={submitting}>Save Changes</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </CommonPageContainer>
  )
}

export default Budgets
