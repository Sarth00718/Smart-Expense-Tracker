import { useState, useEffect } from 'react'
import { Target, Plus, Trash2, TrendingUp, Calendar, DollarSign, Edit2, X } from 'lucide-react'
import { goalService } from '../../../services/goalService'
import { Card, Button, EmptyState, LoadingSpinner, PageHeader, Modal } from '../../ui'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-gray-600 dark:text-slate-400 mb-6">{message}</p>
    <div className="flex gap-3">
      <Button variant="outline" fullWidth onClick={onClose}>Cancel</Button>
      <Button variant="danger" fullWidth onClick={onConfirm}>Delete</Button>
    </div>
  </Modal>
)

const Goals = () => {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: ''
  })
  const [updateAmount, setUpdateAmount] = useState('')
  const [editData, setEditData] = useState({ name: '', targetAmount: '', deadline: '' })

  useEffect(() => { loadGoals() }, [])

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
    setSubmitting(true)
    try {
      await goalService.addGoal(formData)
      toast.success('Goal added successfully!')
      setFormData({ name: '', targetAmount: '', currentAmount: '0', deadline: '' })
      setShowForm(false)
      loadGoals()
    } catch (error) {
      toast.error('Failed to add goal')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await goalService.updateGoal(selectedGoal._id, { currentAmount: parseFloat(updateAmount) })
      toast.success('Progress updated!')
      setShowUpdateModal(false)
      setSelectedGoal(null)
      setUpdateAmount('')
      loadGoals()
    } catch (error) {
      toast.error('Failed to update goal')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await goalService.updateGoal(selectedGoal._id, {
        name: editData.name,
        targetAmount: parseFloat(editData.targetAmount),
        deadline: editData.deadline || null
      })
      toast.success('Goal updated!')
      setShowEditModal(false)
      setSelectedGoal(null)
      loadGoals()
    } catch (error) {
      toast.error('Failed to update goal')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      await goalService.deleteGoal(selectedGoal._id)
      toast.success('Goal deleted')
      setShowDeleteModal(false)
      setSelectedGoal(null)
      loadGoals()
    } catch (error) {
      toast.error('Failed to delete goal')
    }
  }

  const openUpdateModal = (goal) => {
    setSelectedGoal(goal)
    setUpdateAmount(goal.current.toString())
    setShowUpdateModal(true)
  }

  const openEditModal = (goal) => {
    setSelectedGoal(goal)
    setEditData({
      name: goal.name,
      targetAmount: goal.target.toString(),
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : ''
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (goal) => {
    setSelectedGoal(goal)
    setShowDeleteModal(true)
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  if (loading) return <LoadingSpinner size="lg" text="Loading goals..." />

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans">
      <PageHeader
        icon={Target}
        gradient="from-violet-500 to-indigo-600"
        title="Savings Goals"
        subtitle="Set and track your financial goals"
        actions={
          <Button variant="primary" size="md" icon={showForm ? undefined : Plus}
            onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Goal'}
          </Button>
        }
      />

      {/* Add Goal Form */}
      {showForm && (
        <Card title="Create New Goal" icon={Plus} subtitle="Set a target and track your progress">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">Goal Name</label>
              <input type="text" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required placeholder="e.g., Emergency Fund, Vacation, New Laptop" className="input w-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">Target Amount (₹)</label>
                <input type="number" step="0.01" min="0.01" value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  required placeholder="50000.00" className="input w-full text-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">Current Amount (₹)</label>
                <input type="number" step="0.01" min="0" value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  placeholder="0.00" className="input w-full text-lg" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">Deadline (Optional)</label>
              <input type="date" value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="input w-full" />
            </div>
            <Button type="submit" variant="primary" fullWidth size="lg" icon={Plus} loading={submitting}>
              Create Goal
            </Button>
          </form>
        </Card>
      )}

      {/* Goals Grid */}
      <Card title="Your Goals" subtitle={`${goals.length} active ${goals.length === 1 ? 'goal' : 'goals'}`}>
        {goals.length === 0 ? (
          <EmptyState icon={Target} title="No savings goals yet"
            description="Create your first goal to start tracking your progress" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <div key={goal._id} className="p-6 border-2 border-gray-200 dark:border-slate-600 rounded-xl hover:border-primary dark:hover:border-primary hover:shadow-lg transition-all dark:bg-slate-800/40">
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
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEditModal(goal)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all hover:scale-110"
                      title="Edit Goal">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => openDeleteModal(goal)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110"
                      title="Delete Goal">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-slate-400 font-medium">₹{goal.current.toFixed(2)}</span>
                    <span className="text-gray-400 dark:text-slate-500">/ ₹{goal.target.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden mb-2">
                    <div className={`h-full transition-all duration-500 ${getProgressColor(goal.percentage)}`}
                      style={{ width: `${Math.min(goal.percentage, 100)}%` }} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-bold ${goal.percentage >= 100 ? 'text-green-600' : goal.percentage >= 75 ? 'text-blue-600' : goal.percentage >= 50 ? 'text-yellow-600' : 'text-orange-600'}`}>
                      {goal.percentage.toFixed(1)}%
                    </span>
                    {goal.percentage >= 100 && <span className="text-green-600 font-semibold text-sm">🎉 Goal Achieved!</span>}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 mb-5 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-slate-400">Remaining:</span>
                    <span className="font-bold text-gray-900 dark:text-slate-100">₹{(goal.target - goal.current).toFixed(2)}</span>
                  </div>
                  {goal.neededPerDay > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-slate-400">Save per day:</span>
                      <span className="font-bold text-primary">₹{goal.neededPerDay.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Button variant="primary" fullWidth icon={TrendingUp} onClick={() => openUpdateModal(goal)}>
                  Update Progress
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Update Progress Modal */}
      <Modal isOpen={showUpdateModal} onClose={() => { setShowUpdateModal(false); setSelectedGoal(null) }}
        title="Update Progress" size="sm">
        {selectedGoal && (
          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <p className="text-gray-600 dark:text-slate-400 font-medium">{selectedGoal.name}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">Current Amount (₹)</label>
              <input type="number" step="0.01" min="0" value={updateAmount}
                onChange={(e) => setUpdateAmount(e.target.value)}
                required autoFocus className="input w-full text-lg" />
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">Target: ₹{selectedGoal.target.toFixed(2)}</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" fullWidth
                onClick={() => { setShowUpdateModal(false); setSelectedGoal(null) }}>Cancel</Button>
              <Button type="submit" variant="primary" fullWidth size="lg" loading={submitting}>Update</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Edit Goal Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedGoal(null) }}
        title="Edit Goal" size="sm">
        {selectedGoal && (
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Goal Name</label>
              <input type="text" value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                required autoFocus className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Target Amount (₹)</label>
              <input type="number" step="0.01" min="0.01" value={editData.targetAmount}
                onChange={(e) => setEditData({ ...editData, targetAmount: e.target.value })}
                required className="input w-full text-lg" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Deadline (Optional)</label>
              <input type="date" value={editData.deadline}
                onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                className="input w-full" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" fullWidth
                onClick={() => { setShowEditModal(false); setSelectedGoal(null) }}>Cancel</Button>
              <Button type="submit" variant="primary" fullWidth loading={submitting}>Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedGoal(null) }}
        onConfirm={handleDelete}
        title="Delete Goal"
        message={`Are you sure you want to delete "${selectedGoal?.name}"? This cannot be undone.`}
      />
    </div>
  )
}

export default Goals
