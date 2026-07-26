import { useState, useEffect } from 'react'
import { useIncome } from '../../../context/IncomeContext'
import { useCategories } from '../../../context/CategoryContext'
import { incomeService } from '../../../services/incomeService'
import { DollarSign, Plus, Edit2, Trash2, TrendingUp, Calendar, X } from 'lucide-react'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent,
  Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  Modal, Input, EmptyState, SkeletonList, Separator, StatCard, PageHeader, LoadingSpinner,
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '../../ui'
import { useIntersectionObserver } from '../../../hooks/useIntersectionObserver'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const Income = () => {
  const { incomeCategories, getCategoryColor, getCategoryEmoji } = useCategories()
  const { income, loading, pagination, loadIncome, addIncome, updateIncome, deleteIncome, loadMore } = useIncome()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [summary, setSummary] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: 'Salary',
    amount: '',
    description: ''
  })

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
      description: incomeItem.description
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
      description: ''
    })
  }

  const { targetRef, isIntersecting } = useIntersectionObserver({ threshold: 0.1 })

  useEffect(() => {
    if (isIntersecting && pagination?.page < pagination?.pages && !loading) {
      loadMore()
    }
  }, [isIntersecting, pagination?.page, pagination?.pages, loading, loadMore])



  // removed the loading block to allow table to render the first page items alongside the loader at the bottom

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
                      {incomeCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
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
                    <TableHead className="w-1/6 pl-6">Date</TableHead>
                    <TableHead className="w-1/6">Source</TableHead>
                    <TableHead className="w-1/3">Description</TableHead>
                    <TableHead className="text-right w-1/6">Amount</TableHead>
                    <TableHead className="text-center w-1/6 pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {income.map(incomeItem => (
                    <TableRow key={incomeItem._id}>
                      <TableCell className="font-medium whitespace-nowrap pl-6">
                        {format(new Date(incomeItem.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getCategoryColor(incomeItem.source, 'income').bg} ${getCategoryColor(incomeItem.source, 'income').text}`}>
                          <span>{getCategoryEmoji(incomeItem.source, 'income')}</span>
                          {incomeItem.source}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {incomeItem.description || <span className="italic text-muted-foreground/60">No description</span>}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-success tabular-nums tracking-tight whitespace-nowrap">
                        ₹{incomeItem.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center pr-6">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleEdit(incomeItem)}
                            title="Edit income"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
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

            </>
          )}
        </CardContent>
      </Card>

      {(pagination?.page < pagination?.pages || loading) && (
        <div ref={targetRef} className="py-6 flex justify-center">
          {loading && <LoadingSpinner size="sm" text="Loading more income entries..." />}
        </div>
      )}

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
