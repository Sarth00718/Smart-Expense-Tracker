import React, { useState, useEffect } from 'react'
import { Target, Plus, Trash2, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { goalService } from '../../../services/goalService'
import { Card, Button, EmptyState, LoadingSpinner } from '../../ui'
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
    return <LoadingSpinner size="lg" text="Loading goals..." />
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-slate-100 mb-2 flex items-center gap-3 tracking-tight">
            <Target className="w-8 h-8 text-primary" />
            Savings Goals
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-lg">Set and track your financial goals</p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add Goal'}
        </Button>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <Card
          title="Create New Goal"
          icon={Plus}
          subtitle="Set a target and track your progress"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
                Goal Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Emergency Fund, Vacation, New Laptop"
                className="input w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
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
                  className="input w-full text-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
                  Current Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  placeholder="0.00"
                  className="input w-full text-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="input w-full"
              />
            </div>

            <Button type="submit" variant="primary" fullWidth size="lg" icon={Plus}>
              Create Goal
            </Button>
          </form>
        </Card>
      )}

      {/* Goals Grid */}
      <Card title="Your Goals" subtitle={`${goals.length} active ${goals.length === 1 ? 'goal' : 'goals'}`}>
        {goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No savings goals yet"
            description="Create your first goal to start tracking your progress"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <div key={goal.id} className="p-6 border-2 border-gray-200 dark:border-slate-600 rounded-xl hover:border-primary dark:hover:border-primary hover:shadow-lg transition-all dark:bg-slate-800/40">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2 tracking-tight">{goal.name}</h3>
                    {goal.deadline && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(goal.deadline), 'MMM dd, yyyy')}</span>
                        {goal.daysLeft !== null && (
                          <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                            {goal.daysLeft} days left
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id, goal.name)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110 flex-shrink-0"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-slate-400 font-medium">
                      ₹{goal.current.toFixed(2)}
                    </span>
                    <span className="text-gray-400 dark:text-slate-500">
                      / ₹{goal.target.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-500 ${getProgressColor(goal.percentage)}`}
                      style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-bold ${goal.percentage >= 100 ? 'text-green-600' :
                        goal.percentage >= 75 ? 'text-blue-600' :
                          goal.percentage >= 50 ? 'text-yellow-600' :
                            'text-orange-600'
                      }`}>
                      {goal.percentage.toFixed(1)}%
                    </span>
                    {goal.percentage >= 100 && (
                      <span className="text-green-600 font-semibold text-sm">🎉 Goal Achieved!</span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-5 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-slate-400">Remaining:</span>
                    <span className="font-bold text-gray-900 dark:text-slate-100">
                      ₹{(goal.target - goal.current).toFixed(2)}
                    </span>
                  </div>
                  {goal.neededPerDay > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-slate-400">Save per day:</span>
                      <span className="font-bold text-primary">
                        ₹{goal.neededPerDay.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Update Button */}
                <Button
                  variant="primary"
                  fullWidth
                  icon={TrendingUp}
                  onClick={() => openUpdateModal(goal)}
                >
                  Update Progress
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Update Modal */}
      {showUpdateModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-slate-100 tracking-tight">Update Progress</h3>
                <p className="text-gray-600 dark:text-slate-400">{selectedGoal.name}</p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
                  Current Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                  required
                  className="input w-full text-lg"
                />
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                  Target: ₹{selectedGoal.target.toFixed(2)}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" fullWidth size="lg">
                  Update
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowUpdateModal(false)
                    setSelectedGoal(null)
                    setUpdateAmount('')
                  }}
                  className="px-6"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Goals
