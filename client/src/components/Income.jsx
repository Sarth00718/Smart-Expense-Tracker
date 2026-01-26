import React, { useState, useEffect } from 'react'
import { useIncome } from '../context/IncomeContext'
import { incomeService } from '../services/incomeService'
import toast from 'react-hot-toast'

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

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">💰 Income Tracker</h2>
        <button 
          onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm(); }} 
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Income'}
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Total Income</h3>
            <p className="text-2xl font-bold text-green-600">₹{summary.total_income.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">This Month</h3>
            <p className="text-2xl font-bold text-green-600">₹{summary.this_month.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm">Sources</h3>
            <p className="text-2xl font-bold">{summary.sources.length}</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4">{editingId ? 'Edit Income' : 'Add New Income'}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Source *</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {sources.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm font-medium">Recurring Income</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              {editingId ? 'Update' : 'Add'} Income
            </button>
            <button 
              type="button" 
              onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }} 
              className="w-full sm:w-auto bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading income...</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {income.length === 0 ? (
              <p className="text-center py-8 text-gray-500">No income entries yet. Add your first income!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Date</th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Source</th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 hidden sm:table-cell">Description</th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 hidden md:table-cell">Recurring</th>
                      <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {income.map(incomeItem => (
                      <tr key={incomeItem._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{new Date(incomeItem.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs sm:text-sm whitespace-nowrap">
                            {incomeItem.source}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600 text-sm">₹{incomeItem.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm hidden sm:table-cell">{incomeItem.description || '-'}</td>
                        <td className="px-4 py-3 text-sm hidden md:table-cell">{incomeItem.isRecurring ? '✓' : '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit(incomeItem)} 
                              className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(incomeItem._id)} 
                              className="text-red-600 hover:text-red-800 text-xs sm:text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm sm:text-base">Page {pagination.page} of {pagination.pages}</span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="w-full sm:w-auto px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Income
