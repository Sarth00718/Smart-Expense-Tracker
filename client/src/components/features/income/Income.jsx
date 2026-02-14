import React, { useState, useEffect } from 'react'
import { useIncome } from '../../../context/IncomeContext'
import { incomeService } from '../../../services/incomeService'
import { DollarSign, Plus, Edit2, Trash2, TrendingUp, Calendar, Repeat, X } from 'lucide-react'
import { Card, Button, StatCard, EmptyState } from '../../ui'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const Income = () => {
  const { income, loading, pagination, loadIncome, addIncome, updateIncome, deleteIncome } = useIncome()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [summary, setSummary] = useState(null)
  
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income entry?')) return
    
    try {
      await deleteIncome(id)
      toast.success('Income deleted successfully')
      fetchSummary()
    } catch (error) {
      console.error('Failed to delete income:', error)
      toast.error('Failed to delete income')
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

  const getSourceBadgeClass = (source) => {
    const classes = {
      Salary: 'bg-blue-100 text-blue-700',
      Freelance: 'bg-purple-100 text-purple-700',
      Investment: 'bg-green-100 text-green-700',
      Business: 'bg-orange-100 text-orange-700',
      Gift: 'bg-pink-100 text-pink-700',
      Bonus: 'bg-indigo-100 text-indigo-700',
      Rental: 'bg-yellow-100 text-yellow-700',
      Other: 'bg-gray-100 text-gray-700'
    }
    return classes[source] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2 flex items-center gap-3 tracking-tight">
            <DollarSign className="w-8 h-8 text-green-600" />
            Income Tracker
          </h1>
          <p className="text-gray-600 text-lg">Track and manage your income sources</p>
        </div>
        
        <Button 
          variant="primary" 
          size="md"
          icon={Plus}
          onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm(); }}
        >
          {showForm ? 'Cancel' : 'Add Income'}
        </Button>
      </div>

      {/* Summary Cards */}
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

      {/* Add/Edit Income Form */}
      {showForm && (
        <Card 
          title={editingId ? 'Edit Income' : 'Add New Income'}
          icon={Plus}
          subtitle="Enter your income details"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                  Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="input w-full"
                  required
                >
                  {sources.map(src => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input w-full text-lg"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-tight">
                Description (Optional)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add a note about this income"
                className="input w-full"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mr-3"
                />
                <div className="flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Recurring Income</span>
                </div>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="primary" fullWidth size="lg">
                {editingId ? 'Update Income' : 'Add Income'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Income List */}
      <Card title="Income History" subtitle="All your income entries">
        {income.length === 0 ? (
          <EmptyState
            icon={DollarSign}
            title="No income entries yet"
            description="Start tracking your income to see it here"
          />
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-widest">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-widest">Source</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-widest">Amount</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-widest hidden sm:table-cell">Description</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-widest hidden md:table-cell">Recurring</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {income.map(incomeItem => (
                  <tr key={incomeItem._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-gray-700 font-medium">
                      {format(new Date(incomeItem.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`badge ${getSourceBadgeClass(incomeItem.source)}`}>
                        {incomeItem.source}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-green-600 text-base sm:text-lg tabular-nums tracking-tight">
                      ₹{incomeItem.amount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-gray-600 hidden sm:table-cell">
                      {incomeItem.description || <span className="text-gray-400 italic">No description</span>}
                    </td>
                    <td className="py-4 px-6 text-center hidden md:table-cell">
                      {incomeItem.isRecurring ? (
                        <span className="inline-flex items-center gap-1 text-blue-600">
                          <Repeat className="w-4 h-4" />
                          <span className="text-sm font-medium">Yes</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(incomeItem)} 
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all hover:scale-110"
                          title="Edit income"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(incomeItem._id)} 
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all hover:scale-110"
                          title="Delete income"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm font-medium text-gray-700">
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
      </Card>
    </div>
  )
}

export default Income
