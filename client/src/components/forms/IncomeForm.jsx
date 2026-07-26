import { memo } from 'react'
import { Plus } from 'lucide-react'
import { Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Input } from '../ui'
import { useCategories } from '../../context/CategoryContext'

const IncomeForm = memo(({ formData, onChange, onSubmit, submitLabel = 'Add Income', loading }) => {
  const { incomeCategories } = useCategories()
  
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
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
            Source
          </label>
          <Select
            value={formData.source}
            onValueChange={(v) => handleChange('source', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {incomeCategories.map(source => (
                <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
          Amount (₹)
        </label>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          required
          placeholder="0.00"
          className="text-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 tracking-tight">
          Description (Optional)
        </label>
        <Input
          type="text"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Add a note about this income"
        />
      </div>

      <Button type="submit" variant="primary" fullWidth icon={Plus} size="lg" loading={loading} disabled={loading}>
        {submitLabel}
      </Button>
    </form>
  )
})

IncomeForm.displayName = 'IncomeForm'

export default IncomeForm
