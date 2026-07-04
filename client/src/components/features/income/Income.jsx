import { useState, useEffect } from 'react'
import { useIncome } from '../../../context/IncomeContext'
import { incomeService } from '../../../services/incomeService'
import { DollarSign, Plus, Edit2, Trash2, TrendingUp, Calendar, Repeat, X } from 'lucide-react'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, Input, EmptyState, SkeletonList, Separator, StatCard, PageHeader,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Checkbox,
} from '../../ui'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const Income = () => {
  const { income, loading, pagination, loadIncome, addIncome, updateIncome, deleteIncome } = useIncome()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [summary, setSummary] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: 'Salary',
    amount: '',
    description: '',
    isRecurring: false
  })

  const sources = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Bonus', 'Rental', 'Other']

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      const response = await incomeService.getSummary()
      setSummary(response.data)
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await updateIncome(editingId, formData)
        toast.success('Income updated successfully')
      } else {
        await addIncome(formData)
        toast.success('Income added successfully')
      }
      setShowForm(false)
      setEditingId(null)
      resetForm()
      fetchSummary()
    } catch (error) {
      console.error('Failed to save income:', error)
      toast.error(error.response?.data?.error || 'Failed to save income')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (incomeItem) => {
    setFormData({
      date: new Date(incomeItem.date).toISOString().split('T')[0],
      source: incomeItem.source,
      amount: incomeItem.amount,
      description: incomeItem.description,
      isRecurring: incomeItem.isRecurring
    })
    setEditingId(incomeItem._id)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteIncome(deleteTarget)
      toast.success('Income deleted successfully')
      fetchSummary()
    } catch (error) {
      console.error('Failed to delete income:', error)
      toast.error('Failed to delete income')
    } finally {
      setDeleteTarget(null)
    }
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      source: 'Salary',
      amount: '',
      description: '',
      isRecurring: false
    })
  }

  const handlePageChange = (newPage) => {
    loadIncome({ page: newPage, limit: pagination.limit })
  }

  const getSourceVariant = (source) => {
    const variants = {
      Salary: 'default',
      Freelance: 'secondary',
      Investment: 'success',
      Business: 'warning',
      Gift: 'outline',
      Bonus: 'default',
      Rental: 'warning',
      Other: 'outline'
    }
    return variants[source] || 'default'
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <SkeletonList rows={5} />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        icon={DollarSign}
        gradient="from-emerald-500 to-teal-600"
        title="Income Tracker"
        subtitle="Track and manage your income sources"
        actions={
          <Button
            variant="default"
            size="default"
            icon={showForm ? X : Plus}
            onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm() }}
          >
            {showForm ? 'Cancel' : 'Add Income'}
          </Button>
        }
      />

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <StatCard
            title="Total Income"
            value={`₹${summary.total_income.toFixed(2)}`}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="This Month"
            value={`₹${summary.this_month.toFixed(2)}`}
            icon={Calendar}
            color="blue"
          />
          <StatCard
            title="Income Sources"
            value={summary.sources.length}
            icon={DollarSign}
            color="purple"
          />
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm shrink-0">
                <Plus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>{editingId ? 'Edit Income' : 'Add New Income'}</CardTitle>
                <CardDescription>Enter your income details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Source</label>
                  <Select
                    value={formData.source}
                    onValueChange={(v) => setFormData({ ...formData, source: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {sources.map(src => (
                        <SelectItem key={src} value={src}>{src}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Amount (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className="text-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description (Optional)</label>
                <Input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add a note about this income"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer gap-3">
                  <Checkbox
                    checked={formData.isRecurring}
                    onCheckedChange={(v) => setFormData({ ...formData, isRecurring: v === true })}
                  />
                  <div className="flex items-center gap-2">
                    <Repeat className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Recurring Income</span>
                  </div>
                </label>
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button type="submit" size="lg" className="flex-1" loading={submitting}>
                  {editingId ? 'Update Income' : 'Add Income'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => { setShowForm(false); setEditingId(null); resetForm() }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Income History</CardTitle>
          <CardDescription>All your income entries</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {income.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No income entries yet"
              description="Start tracking your income to see it here"
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="hidden sm:table-cell">Description</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Recurring</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {income.map(incomeItem => (
                    <TableRow key={incomeItem._id}>
                      <TableCell className="font-medium">
                        {format(new Date(incomeItem.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSourceVariant(incomeItem.source)}>
                          {incomeItem.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-success tabular-nums tracking-tight">
                        ₹{incomeItem.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {incomeItem.description || <span className="italic text-muted-foreground/60">No description</span>}
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        {incomeItem.isRecurring ? (
                          <span className="inline-flex items-center gap-1 text-primary">
                            <Repeat className="w-4 h-4" />
                            <span className="text-sm font-medium">Yes</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(incomeItem)}
                            title="Edit income"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(incomeItem._id)}
                            title="Delete income"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-4 p-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium text-muted-foreground">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Income" size="sm">
        <p className="text-muted-foreground mb-6">Are you sure you want to delete this income entry?</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}

export default Income
