import { memo } from 'react'
import { Plus } from 'lucide-react'
import { Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui'
import { EXPENSE_CATEGORIES } from '../../constants/categories'

const ExpenseForm = memo(({ formData, onChange, onSubmit, submitLabel = 'Add Expense', loading }) => {
  const handleChange = (field, value) => {
    onChange({ ...formData, [field]: value })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
            Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            required
            className="input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
            Category
          </label>
          <Select
            value={formData.category}
            onValueChange={(v) => handleChange('category', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
          Amount (₹)
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          required
          placeholder="0.00"
          className="input w-full text-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
          Description (Optional)
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="What was this expense for?"
          className="input w-full"
        />
      </div>

      <Button type="submit" variant="primary" fullWidth icon={Plus} size="lg" loading={loading} disabled={loading}>
        {submitLabel}
      </Button>
    </form>
  )
})

ExpenseForm.displayName = 'ExpenseForm'

export default ExpenseForm
