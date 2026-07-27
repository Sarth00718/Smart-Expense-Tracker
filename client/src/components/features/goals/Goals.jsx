import { useState, useEffect } from 'react'
import { Target, Plus, Trash2, TrendingUp, Calendar, DollarSign, Edit2 } from 'lucide-react'
import { goalService } from '../../../services/goalService'
import {
  Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Badge, Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter,
  Progress, Input, EmptyState, PageHeader, LoadingSpinner, CommonPageContainer
} from '../../ui'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => (
  <Dialog open={isOpen} onClose={onClose} size="sm">
    <DialogHeader onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
    </DialogHeader>
    <DialogContent>
      <p className="text-sm text-muted-foreground">{message}</p>
    </DialogContent>
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button variant="destructive" onClick={onConfirm}>Delete</Button>
    </DialogFooter>
  </Dialog>
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
    name: '', targetAmount: '', currentAmount: '0', deadline: ''
  })
  const [updateAmount, setUpdateAmount] = useState('')
  const [editData, setEditData] = useState({ name: '', targetAmount: '', deadline: '' })
  const safeGoals = Array.isArray(goals) ? goals : []
  const showInitialLoader = loading && safeGoals.length === 0

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
    
    const newGoal = {
      _id: `temp-${Date.now()}`,
      name: formData.name,
      target: parseFloat(formData.targetAmount),
      current: parseFloat(formData.currentAmount || 0),
      deadline: formData.deadline || null,
      percentage: (parseFloat(formData.currentAmount || 0) / parseFloat(formData.targetAmount)) * 100,
      daysLeft: null,
      neededPerDay: 0
    }
    
    setGoals(prev => [newGoal, ...prev])
    setFormData({ name: '', targetAmount: '', currentAmount: '0', deadline: '' })
    setShowForm(false)

    try {
      await goalService.addGoal(formData)
      toast.success('Goal added successfully!')
      loadGoals()
    } catch (error) {
      toast.error('Failed to add goal')
      loadGoals()
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    const newCurrent = parseFloat(updateAmount)
    const goalId = selectedGoal._id
    
    setGoals(prev => prev.map(g => {
      if (g._id === goalId) {
        return {
          ...g,
          current: newCurrent,
          percentage: (newCurrent / g.target) * 100
        }
      }
      return g
    }))
    
    setShowUpdateModal(false)
    setSelectedGoal(null)
    setUpdateAmount('')

    try {
      await goalService.updateGoal(goalId, { currentAmount: newCurrent })
      toast.success('Progress updated!')
      loadGoals()
    } catch (error) {
      toast.error('Failed to update goal')
      loadGoals()
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    
    const goalId = selectedGoal._id
    const updatedData = {
      name: editData.name,
      targetAmount: parseFloat(editData.targetAmount),
      deadline: editData.deadline || null
    }

    setGoals(prev => prev.map(g => {
      if (g._id === goalId) {
        return {
          ...g,
          name: updatedData.name,
          target: updatedData.targetAmount,
          deadline: updatedData.deadline,
          percentage: (g.current / updatedData.targetAmount) * 100
        }
      }
      return g
    }))
    
    setShowEditModal(false)
    setSelectedGoal(null)

    try {
      await goalService.updateGoal(goalId, updatedData)
      toast.success('Goal updated!')
      loadGoals()
    } catch (error) {
      toast.error('Failed to update goal')
      loadGoals()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    const goalId = selectedGoal._id
    setGoals(prev => prev.filter(g => g._id !== goalId))
    setShowDeleteModal(false)
    setSelectedGoal(null)

    try {
      await goalService.deleteGoal(goalId)
      toast.success('Goal deleted')
      loadGoals()
    } catch (error) {
      toast.error('Failed to delete goal')
      loadGoals()
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

  return (
    <CommonPageContainer>
      <PageHeader
        icon={Target}
        gradient="from-violet-500 to-indigo-600"
        title="Savings Goals"
        subtitle="Set and track your financial goals"
        actions={
          <Button variant="default" size="default" icon={showForm ? undefined : Plus}
            onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Goal'}
          </Button>
        }
      />

      {showInitialLoader && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoadingSpinner size="sm" text="" />
          <span>Loading your goals…</span>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Goal</CardTitle>
            <CardDescription>Set a target and track your progress</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Goal Name</label>
                <Input type="text" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required placeholder="e.g., Emergency Fund, Vacation, New Laptop" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Target Amount (₹)</label>
                  <Input type="number" step="0.01" min="0.01" value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    required placeholder="50000.00" className="text-lg" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Current Amount (₹)</label>
                  <Input type="number" step="0.01" min="0" value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    placeholder="0.00" className="text-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Deadline (Optional)</label>
                <Input type="date" value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" variant="default" className="w-full" size="lg" icon={Plus} loading={submitting}>
                Create Goal
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
              <CardDescription>{safeGoals.length} active {safeGoals.length === 1 ? 'goal' : 'goals'}</CardDescription>
        </CardHeader>
        <CardContent>
          {safeGoals.length === 0 ? (
            <EmptyState icon={Target} title="No savings goals yet"
              description="Create your first goal to start tracking your progress" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safeGoals.map((goal, index) => (
                <Card hover key={goal._id || `goal-${index}`} className="flex flex-col">
                  <CardHeader className="flex-row items-start justify-between space-y-0 pb-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl mb-1">{goal.name}</CardTitle>
                      {goal.deadline && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(goal.deadline), 'MMM dd, yyyy')}</span>
                          {goal.daysLeft !== null && (
                            <Badge variant="default">{goal.daysLeft} days left</Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEditModal(goal)} title="Edit Goal">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => openDeleteModal(goal)} title="Delete Goal" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground font-medium">₹{goal.current.toFixed(2)}</span>
                        <span className="text-muted-foreground/60">/ ₹{goal.target.toFixed(2)}</span>
                      </div>
                      <Progress value={goal.percentage} indicatorClassName={getProgressColor(goal.percentage)} />
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-lg font-bold ${
                          goal.percentage >= 100 ? 'text-green-600' : goal.percentage >= 75 ? 'text-blue-600' : goal.percentage >= 50 ? 'text-yellow-600' : 'text-orange-600'
                        }`}>
                          {goal.percentage.toFixed(1)}%
                        </span>
                        {goal.percentage >= 100 && <Badge variant="success">Goal Achieved!</Badge>}
                      </div>
                    </div>
                    <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Remaining:</span>
                        <span className="font-bold text-foreground">₹{(goal.target - goal.current).toFixed(2)}</span>
                      </div>
                      {goal.neededPerDay > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Save per day:</span>
                          <span className="font-bold text-primary">₹{goal.neededPerDay.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="default" className="w-full" icon={TrendingUp} onClick={() => openUpdateModal(goal)}>
                      Update Progress
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showUpdateModal} onClose={() => { setShowUpdateModal(false); setSelectedGoal(null) }} size="sm">
        {selectedGoal && (
          <form onSubmit={handleUpdate}>
            <DialogHeader onClose={() => { setShowUpdateModal(false); setSelectedGoal(null) }}>
              <DialogTitle>Update Progress</DialogTitle>
            </DialogHeader>
            <DialogContent className="space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">{selectedGoal.name}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Current Amount (₹)</label>
                <Input type="number" step="0.01" min="0" value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                  required autoFocus className="text-lg" />
                <p className="text-sm text-muted-foreground mt-2">Target: ₹{selectedGoal.target.toFixed(2)}</p>
              </div>
            </DialogContent>
            <DialogFooter>
              <Button type="button" variant="outline"
                onClick={() => { setShowUpdateModal(false); setSelectedGoal(null) }}>Cancel</Button>
              <Button type="submit" variant="default" loading={submitting}>Update</Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>

      <Dialog open={showEditModal} onClose={() => { setShowEditModal(false); setSelectedGoal(null) }} size="sm">
        {selectedGoal && (
          <form onSubmit={handleEdit}>
            <DialogHeader onClose={() => { setShowEditModal(false); setSelectedGoal(null) }}>
              <DialogTitle>Edit Goal</DialogTitle>
            </DialogHeader>
            <DialogContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Goal Name</label>
                <Input type="text" value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  required autoFocus />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Target Amount (₹)</label>
                <Input type="number" step="0.01" min="0.01" value={editData.targetAmount}
                  onChange={(e) => setEditData({ ...editData, targetAmount: e.target.value })}
                  required className="text-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Deadline (Optional)</label>
                <Input type="date" value={editData.deadline}
                  onChange={(e) => setEditData({ ...editData, deadline: e.target.value })} />
              </div>
            </DialogContent>
            <DialogFooter>
              <Button type="button" variant="outline"
                onClick={() => { setShowEditModal(false); setSelectedGoal(null) }}>Cancel</Button>
              <Button type="submit" variant="default" loading={submitting}>Save Changes</Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedGoal(null) }}
        onConfirm={handleDelete}
        title="Delete Goal"
        message={`Are you sure you want to delete "${selectedGoal?.name}"? This cannot be undone.`}
      />
    </CommonPageContainer>
  )
}

export default Goals
