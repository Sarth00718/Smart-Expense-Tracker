import { useState } from 'react'
import { Plus, Edit2, Trash2, Tag, Save, X, Smile } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui'
import { useCategories } from '../../../context/CategoryContext'
import toast from 'react-hot-toast'

const CategorySettings = () => {
  const { expenseCategories, incomeCategories, updateCategories, loading } = useCategories()
  const [activeTab, setActiveTab] = useState('expense')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  
  const defaultColors = [
    { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
    { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
    { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-400' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400' },
    { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
    { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
    { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
    { bg: 'bg-fuchsia-100 dark:bg-fuchsia-900/30', text: 'text-fuchsia-600 dark:text-fuchsia-400' },
    { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
    { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-600 dark:text-rose-400' },
    { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-600 dark:text-slate-400' }
  ]

  const [formData, setFormData] = useState({
    value: '',
    label: '',
    emoji: '🏷️',
    color: defaultColors[0]
  })

  const [submitting, setSubmitting] = useState(false)

  const handleOpenAdd = () => {
    setEditingCategory(null)
    setFormData({ value: '', label: '', emoji: '🏷️', color: defaultColors[Math.floor(Math.random() * defaultColors.length)] })
    setShowAddModal(true)
  }

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat)
    setFormData(cat)
    setShowAddModal(true)
  }

  const handleDelete = async (value) => {
    if (window.confirm(`Are you sure you want to delete this category? Past transactions will remain but the category won't be available for new ones.`)) {
      setSubmitting(true)
      try {
        if (activeTab === 'expense') {
          const newCategories = expenseCategories.filter(c => c.value !== value)
          await updateCategories(newCategories, incomeCategories)
        } else {
          const newCategories = incomeCategories.filter(c => c.value !== value)
          await updateCategories(expenseCategories, newCategories)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setSubmitting(false)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.label.trim()) {
      toast.error('Please enter a category label')
      return
    }

    setSubmitting(true)
    try {
      const newValue = formData.label.trim().replace(/[^a-zA-Z0-9]/g, '_')
      const newCategory = {
        value: editingCategory ? editingCategory.value : newValue,
        label: formData.emoji + ' ' + formData.label.trim(),
        emoji: formData.emoji,
        color: formData.color
      }

      if (activeTab === 'expense') {
        let newCats = [...expenseCategories]
        if (editingCategory) {
          newCats = newCats.map(c => c.value === editingCategory.value ? newCategory : c)
        } else {
          if (newCats.some(c => c.value === newCategory.value)) {
            toast.error('A category with this name already exists')
            setSubmitting(false)
            return
          }
          newCats.push(newCategory)
        }
        await updateCategories(newCats, incomeCategories)
      } else {
        let newCats = [...incomeCategories]
        if (editingCategory) {
          newCats = newCats.map(c => c.value === editingCategory.value ? newCategory : c)
        } else {
          if (newCats.some(c => c.value === newCategory.value)) {
            toast.error('A category with this name already exists')
            setSubmitting(false)
            return
          }
          newCats.push(newCategory)
        }
        await updateCategories(expenseCategories, newCats)
      }
      setShowAddModal(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const renderCategoryList = (categories) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {categories.map(cat => (
        <div key={cat.value} className={`p-4 rounded-xl border border-border flex flex-col justify-between hover:shadow-md transition-all ${cat.color.bg}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm shrink-0">
              {cat.emoji || '📦'}
            </div>
            <div className={`font-semibold ${cat.color.text} truncate`}>
              {cat.label.replace(cat.emoji, '').trim()}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-black/5 dark:border-white/5">
            <Button variant="ghost" size="sm" className={`flex-1 h-8 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 ${cat.color.text}`} onClick={() => handleOpenEdit(cat)}>
              <Edit2 className="w-3 h-3 mr-1" /> Edit
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 h-8 bg-white/50 dark:bg-slate-800/50 hover:bg-red-100 hover:text-red-600 text-muted-foreground" onClick={() => handleDelete(cat.value)}>
              <Trash2 className="w-3 h-3 mr-1" /> Delete
            </Button>
          </div>
        </div>
      ))}
      <button 
        onClick={handleOpenAdd}
        className="p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center min-h-[120px] text-muted-foreground hover:text-primary gap-2"
      >
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </div>
        <span className="font-medium text-sm">Add Category</span>
      </button>
    </div>
  )

  if (loading) {
    return <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div></div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Custom Categories</CardTitle>
              <CardDescription>Personalize your expense and income tracking</CardDescription>
            </div>
            <Button onClick={handleOpenAdd} icon={Plus} size="sm">Add New</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="w-full max-w-md">
                <TabsTrigger value="expense" activeTab={activeTab} onClick={setActiveTab}>Expenses</TabsTrigger>
                <TabsTrigger value="income" activeTab={activeTab} onClick={setActiveTab}>Income</TabsTrigger>
              </TabsList>
            </div>
            <div className="p-6">
              <TabsContent value="expense" activeTab={activeTab}>
                {renderCategoryList(expenseCategories)}
              </TabsContent>
              <TabsContent value="income" activeTab={activeTab}>
                {renderCategoryList(incomeCategories)}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showAddModal} onClose={() => setShowAddModal(false)} size="sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader onClose={() => setShowAddModal(false)}>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Tag className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
          </DialogHeader>
          <DialogContent className="space-y-5">
            <div className="flex gap-4">
              <div className="w-20 space-y-2">
                <label className="text-sm font-medium text-foreground">Emoji</label>
                <Input 
                  value={formData.emoji} 
                  onChange={e => setFormData({ ...formData, emoji: e.target.value })} 
                  className="text-center text-xl" 
                  maxLength={2} 
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-foreground">Category Name</label>
                <Input 
                  value={formData.label.replace(formData.emoji, '').trim()} 
                  onChange={e => setFormData({ ...formData, label: e.target.value })} 
                  placeholder="e.g. Groceries" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Color Theme</label>
              <div className="grid grid-cols-5 sm:grid-cols-5 gap-2">
                {defaultColors.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    className={`h-10 rounded-lg ${c.bg} ${c.text} flex items-center justify-center transition-all ${formData.color.bg === c.bg ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'}`}
                  >
                    <div className="w-4 h-4 rounded-full bg-current opacity-20"></div>
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={submitting} className="flex-1">{editingCategory ? 'Save Changes' : 'Create Category'}</Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  )
}

export default CategorySettings
