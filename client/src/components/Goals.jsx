import React, { useState, useEffect } from 'react'
import { Target, Plus, Trash2, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { goalService } from '../services/goalService'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const Goals = () => {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: ''
  })
  const [updateAmount, setUpdateAmount] = useState('')

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      setLoading(true)
      const response = await goalService.getGoals()
      setGoals(response.data.goals || [])
    } catch (error) {
      console.error('Error loading goals:', error)
      toast.error('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await goalService.addGoal(formData)
      toast.success('Goal added successfully!')
      setFormData({ name: '', targetAmount: '', currentAmount: '0', deadline: '' })
      setShowForm(false)
      loadGoals()
    } catch (error) {
      toast.error('Failed to add goal')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await goalService.updateGoal(selectedGoal.id, { currentAmount: parseFloat(updateAmount) })
      toast.success('Goal updated successfully!')
      setShowUpdateModal(false)
      setSelectedGoal(null)
      setUpdateAmount('')
      loadGoals()
    } catch (error) {
      toast.error('Failed to update goal')
    }
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete goal "${name}"?`)) {
      try {
        await goalService.deleteGoal(id)
        toast.success('Goal deleted successfully')
        loadGoals()
      } catch (error) {
        toast.error('Failed to delete goal')
      }
    }
  }

  const openUpdateModal = (goal) => {
    setSelectedGoal(goal)
    setUpdateAmount(goal.current.toString())
    setShowUpdateModal(true)
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Savings Goals
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Cancel' : 'Add Goal'}
          </button>
        </div>

        {/* Add Goal Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Emergency Fund, Vacation, New Laptop"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  required
                  placeholder="50000.00"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  placeholder="0.00"
                  className="input"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-4">
              Add Goal
            </button>
          </form>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No savings goals yet. Create your first goal!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <div key={goal.id} className="p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{goal.name}</h3>
                    {goal.deadline && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                        {goal.daysLeft !== null && (
                          <span className="ml-2 text-primary font-medium">
                            ({goal.daysLeft} days left)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id, goal.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">
                      ₹{goal.current.toFixed(2)} / ₹{goal.target.toFixed(2)}
                    </span>
                    <span className="font-semibold text-primary">
                      {goal.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getProgressColor(goal.percentage)}`}
                      style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Remaining:</span>
                    <span className="font-semibold">
                      ₹{(goal.target - goal.current).toFixed(2)}
                    </span>
                  </div>
                  {goal.neededPerDay > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Save per day:</span>
                      <span className="font-semibold text-primary">
                        ₹{goal.neededPerDay.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Update Button */}
                <button
                  onClick={() => openUpdateModal(goal)}
                  className="btn btn-secondary w-full"
                >
                  <TrendingUp className="w-4 h-4" />
                  Update Progress
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Update Goal Progress</h3>
            <p className="text-gray-600 mb-4">{selectedGoal.name}</p>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                  required
                  className="input"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Target: ₹{selectedGoal.target.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn btn-primary flex-1">
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false)
                    setSelectedGoal(null)
                    setUpdateAmount('')
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Goals

