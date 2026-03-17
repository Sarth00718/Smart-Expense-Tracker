import { memo } from 'react'
import { Plus, Repeat } from 'lucide-react'
import { Button } from '../ui'
import { INCOME_SOURCES } from '../../constants/categories'

const IncomeForm = memo(({ formData, onChange, onSubmit, submitLabel = 'Add Income' }) => {
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
            Source
          </label>
          <select
            value={formData.source}
            onChange={(e) => handleChange('source', e.target.value)}
            required
            className="input w-full"
          >
            {INCOME_SOURCES.map(source => (
              <option key={source.value} value={source.value}>{source.label}</option>
            ))}
          </select>
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
          placeholder="Add a note about this income"
          className="input w-full"
        />
      </div>

      <div className="flex items-center">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isRecurring || false}
            onChange={(e) => handleChange('isRecurring', e.target.checked)}
            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mr-3"
          />
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Recurring Income</span>
          </div>
        </label>
      </div>

      <Button type="submit" variant="primary" fullWidth icon={Plus} size="lg">
        {submitLabel}
      </Button>
    </form>
  )
})

IncomeForm.displayName = 'IncomeForm'

export default IncomeForm
