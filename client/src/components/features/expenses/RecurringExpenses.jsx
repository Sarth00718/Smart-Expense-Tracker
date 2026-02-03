import { useState, useEffect } from 'react'
import { Plus, Repeat, Trash2, Edit2, X, Save } from 'lucide-react'
import { useExpense } from '../../../context/ExpenseContext'
import toast from 'react-hot-toast'

const RecurringExpenses = ({ onClose }) => {
  const { addExpense } = useExpense()
  const [templates, setTemplates] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    description: ''
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = () => {
    const saved = localStorage.getItem('recurringExpenses')
    if (saved) {
      setTemplates(JSON.parse(saved))
    }
  }

  const saveTemplates = (newTemplates) => {
    localStorage.setItem('recurringExpenses', JSON.stringify(newTemplates))
    setTemplates(newTemplates)
  }

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.category || !formData.amount) {
      toast.error('Please fill all required fields')
      return
    }

    const newTemplate = {
      id: editingTemplate?.id || Date.now(),
      ...formData
    }

    let updatedTemplates
    if (editingTemplate) {
      updatedTemplates = templates.map(t => t.id === editingTemplate.id ? newTemplate : t)
      toast.success('Template updated!')
    } else {
      updatedTemplates = [...templates, newTemplate]
      toast.success('Template saved!')
    }

    saveTemplates(updatedTemplates)
    resetForm()
  }

  const handleDeleteTemplate = (id) => {
    if (window.confirm('Delete this template?')) {
      const updatedTemplates = templates.filter(t => t.id !== id)
      saveTemplates(updatedTemplates)
      toast.success('Template deleted')
    }
  }

  const handleEditTemplate = (template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      category: template.category,
      amount: template.amount,
      description: template.description || ''
    })
    setShowForm(true)
  }

  const handleQuickAdd = async (template) => {
    try {
      await addExpense({
        date: new Date().toISOString().split('T')[0],
        category: template.category,
        amount: template.amount,
        description: template.description || template.name
      })
      toast.success(`Added ${template.name}!`)
    } catch (error) {
      toast.error('Failed to add expense')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', category: '', amount: '', description: '' })
    setEditingTemplate(null)
    setShowForm(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Repeat className="w-6 h-6 text-primary" />
              Recurring Expenses
            </h2>
            <p className="text-sm text-gray-600 mt-1">Save and quickly add frequent expenses</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {/* Add/Edit Template Form */}
          {showForm ? (
            <div className="card bg-blue-50 border-2 border-blue-200">
              <h3 className="font-bold mb-4 text-blue-900">
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Daily Rickshaw"
                    className="input w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input w-full"
                    >
                      <option value="">Select</option>
                      <option value="Food">Food</option>
                      <option value="Travel">Travel</option>
                      <option value="Transport">Transport</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Bills">Bills</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Education">Education</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      className="input w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    className="input w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveTemplate} className="btn btn-primary flex-1">
                    <Save className="w-4 h-4" />
                    {editingTemplate ? 'Update' : 'Save'} Template
                  </button>
                  <button onClick={resetForm} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full btn btn-primary"
            >
              <Plus className="w-5 h-5" />
              Create New Template
            </button>
          )}

          {/* Templates List */}
          {templates.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Repeat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No recurring expenses yet</p>
              <p className="text-sm text-gray-400">Create templates for expenses you add frequently</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Your Templates</h3>
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="card hover:shadow-md transition-shadow border-2 border-gray-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 mb-1">{template.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className={`badge badge-${template.category.toLowerCase()}`}>
                          {template.category}
                        </span>
                        <span className="font-semibold text-gray-900">₹{template.amount}</span>
                        {template.description && (
                          <span className="text-gray-500">• {template.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleQuickAdd(template)}
                        className="btn btn-primary text-sm py-2 px-3"
                        title="Quick Add"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 Tips</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Create templates for expenses you add daily (like transport, meals)</li>
              <li>• Use the "Quick Add" button to add an expense with today's date</li>
              <li>• Edit templates anytime to update amounts or categories</li>
              <li>• Templates are saved locally in your browser</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecurringExpenses
