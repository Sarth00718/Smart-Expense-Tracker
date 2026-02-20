import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, FileJson, Calendar, FileBarChart } from 'lucide-react'
import { exportService } from '../../../services/exportService'
import { Card, Button } from '../../ui'
import toast from 'react-hot-toast'

const DataExport = () => {
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleExport = async (type, format) => {
    try {
      setLoading(true)

      const loadingToast = toast.loading(`Exporting ${type} as ${format.toUpperCase()}...`)

      if (type === 'expenses') {
        if (format === 'csv') {
          await exportService.exportExpensesCSV(startDate, endDate)
        } else if (format === 'json') {
          await exportService.exportExpensesJSON(startDate, endDate)
        } else if (format === 'excel') {
          await exportService.exportExpensesExcel(startDate, endDate)
        }
      } else if (type === 'income') {
        await exportService.exportIncomeCSV(startDate, endDate)
      } else if (type === 'all') {
        if (format === 'json') {
          await exportService.exportAllData(startDate, endDate)
        } else if (format === 'excel') {
          await exportService.exportAllDataExcel(startDate, endDate)
        }
      } else if (type === 'pdf') {
        await exportService.exportComprehensivePDF(startDate, endDate)
      }

      toast.success('Data exported successfully!', { id: loadingToast })
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error.message || 'Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card title="Export Financial Data" icon={Download}>
      <div className="space-y-6">
        {/* Date Range Filter */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date Range (Optional)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Leave empty to export all data
          </p>
        </div>

        {/* Export Expenses */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Export Expenses</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleExport('expenses', 'csv')}
              disabled={loading}
              icon={FileText}
              className="w-full"
            >
              CSV Format
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('expenses', 'excel')}
              disabled={loading}
              icon={FileSpreadsheet}
              className="w-full"
            >
              Excel Format
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('expenses', 'json')}
              disabled={loading}
              icon={FileJson}
              className="w-full"
            >
              JSON Format
            </Button>
          </div>
        </div>

        {/* Export Income */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Export Income</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleExport('income', 'csv')}
              disabled={loading}
              icon={FileText}
              className="w-full"
            >
              CSV Format
            </Button>
          </div>
        </div>

        {/* Export All Data */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Export All Financial Data</h4>
          <p className="text-sm text-gray-600">
            Includes expenses, income, budgets, and goals in a comprehensive report
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="primary"
              onClick={() => handleExport('pdf', 'pdf')}
              disabled={loading}
              icon={FileBarChart}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              PDF Report
            </Button>
            <Button
              variant="primary"
              onClick={() => handleExport('all', 'excel')}
              disabled={loading}
              icon={FileSpreadsheet}
              className="w-full"
            >
              Excel Report
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('all', 'json')}
              disabled={loading}
              icon={FileJson}
              className="w-full"
            >
              JSON Export
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">Export Formats</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <FileBarChart className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span><strong>PDF:</strong> Professional report with charts, insights, and visual analysis</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span><strong>CSV:</strong> Compatible with Excel, Google Sheets, and most spreadsheet apps</span>
            </li>
            <li className="flex items-start gap-2">
              <FileSpreadsheet className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span><strong>Excel:</strong> Native Excel format with multiple sheets and formatting</span>
            </li>
            <li className="flex items-start gap-2">
              <FileJson className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span><strong>JSON:</strong> Raw data format for developers and data analysis</span>
            </li>
          </ul>
        </div>
      </div>
    </Card>
  )
}

export default DataExport
