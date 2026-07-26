import { useState } from 'react'
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  File,
  Calendar,
  Loader
} from 'lucide-react'
import { Modal, Input } from '../ui'
import { exportService } from '../../services/exportService'
import toast from 'react-hot-toast'

const CommonExport = () => {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  const [exportType, setExportType] = useState('all')

  const handleExport = async (format) => {
    try {
      setLoading(true)

      const params = {
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined
      }

      let successMessage = ''

      switch (format) {
        case 'csv':
          if (exportType === 'expenses') {
            await exportService.exportExpensesCSV(
              params.startDate,
              params.endDate
            )
            successMessage = 'Expenses exported to CSV'
          } else if (exportType === 'income') {
            await exportService.exportIncomeCSV(
              params.startDate,
              params.endDate
            )
            successMessage = 'Income exported to CSV'
          } else {
            await exportService.exportAllDataCSV(
              params.startDate,
              params.endDate
            )
            successMessage = 'All data exported to CSV'
          }
          break

        case 'excel':
          if (exportType === 'expenses') {
            await exportService.exportExpensesExcel(
              params.startDate,
              params.endDate
            )
            successMessage = 'Expenses exported to Excel'
          } else if (exportType === 'income') {
            await exportService.exportIncomeExcel(
              params.startDate,
              params.endDate
            )
            successMessage = 'Income exported to Excel'
          } else {
            await exportService.exportAllDataExcel(
              params.startDate,
              params.endDate
            )
            successMessage = 'All data exported to Excel'
          }
          break

        case 'json':
          if (exportType === 'expenses') {
            await exportService.exportExpensesJSON(
              params.startDate,
              params.endDate
            )
            successMessage = 'Expenses exported to JSON'
          } else if (exportType === 'income') {
            await exportService.exportIncomeJSON(
              params.startDate,
              params.endDate
            )
            successMessage = 'Income exported to JSON'
          } else {
            await exportService.exportAllData(
              params.startDate,
              params.endDate
            )
            successMessage = 'All data exported to JSON'
          }
          break

        case 'pdf':
          await exportService.exportComprehensivePDF(
            params.startDate,
            params.endDate
          )
          successMessage = 'Comprehensive PDF report generated'
          break

        default:
          throw new Error('Invalid export format')
      }

      toast.success(successMessage)

      setShowModal(false)

      setDateRange({
        startDate: '',
        endDate: ''
      })
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error.message || 'Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  const exportTypes = [
    {
      key: 'all',
      title: 'All Data',
      description: 'Complete financial data',
      icon: File,
      activeClass:
        'border-primary bg-primary/10 dark:bg-primary/20 shadow-lg shadow-primary/10'
    },
    {
      key: 'expenses',
      title: 'Expenses Only',
      description: 'Expense records',
      icon: FileText,
      activeClass:
        'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-lg shadow-red-500/10'
    },
    {
      key: 'income',
      title: 'Income Only',
      description: 'Income records',
      icon: FileText,
      activeClass:
        'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/10'
    }
  ]

  const exportFormats = [
    {
      key: 'csv',
      title: 'CSV Format',
      description: 'Excel, Google Sheets compatible',
      icon: FileText,
      color:
        'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      key: 'excel',
      title: 'Excel Format',
      description: 'Native Excel with multiple sheets',
      icon: FileSpreadsheet,
      color:
        'hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      key: 'json',
      title: 'JSON Format',
      description: 'Raw data for developers',
      icon: FileJson,
      color:
        'hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      key: 'pdf',
      title: 'Comprehensive PDF',
      description:
        exportType === 'all'
          ? 'Full report with charts'
          : 'Only available for "All Data"',
      icon: File,
      color:
        'hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400'
    }
  ]

  return (
    <>
      {/* Header Export Button */}
      <button
        onClick={() => setShowModal(true)}
        className="group flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-slate-200 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-gray-50 dark:hover:bg-slate-700 hover:shadow-md"
        title="Export Financial Data"
      >
        <Download className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {/* Export Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => !loading && setShowModal(false)}
        title="Export Financial Data"
        size="lg"
      >
        <div className="space-y-6">
          {/* Date Range */}
          <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-900/10 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                  Date Range
                </h3>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Optional filter for exports
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                  Start Date
                </label>

                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      startDate: e.target.value
                    })
                  }
                  disabled={loading}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                  End Date
                </label>

                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({
                      ...dateRange,
                      endDate: e.target.value
                    })
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-blue-700 dark:text-blue-400">
              Leave empty to export complete data
            </p>
          </div>

          {/* Export Types */}
          <div>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                Select Data Type
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Choose which records you want to export
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {exportTypes.map((type) => {
                const Icon = type.icon

                return (
                  <button
                    key={type.key}
                    onClick={() => setExportType(type.key)}
                    disabled={loading}
                    className={`group rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                      exportType === type.key
                        ? type.activeClass
                        : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary/40'
                    }`}
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-700">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {type.title}
                    </h4>

                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                      {type.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Export Formats */}
          <div>
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
                Choose Export Format
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Select your preferred download format
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {exportFormats.map((format) => {
                const Icon = format.icon

                return (
                  <button
                    key={format.key}
                    onClick={() => handleExport(format.key)}
                    disabled={
                      loading ||
                      (format.key === 'pdf' && exportType !== 'all')
                    }
                    className={`group flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${format.color} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-700">
                      <Icon className={`h-7 w-7 ${format.iconColor}`} />
                    </div>

                    <div className="flex-1 text-left">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                        {format.title}
                      </h4>

                      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                        {format.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Included Info */}
          <div className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 p-5">
            <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-slate-100">
              📋 Included In Export
            </h4>

            <ul className="space-y-2 text-xs text-gray-700 dark:text-slate-300">
              {exportType === 'all' && (
                <>
                  <li>✓ Expenses with categories and descriptions</li>
                  <li>✓ Income records with detailed sources</li>
                  <li>✓ Budget tracking and allocations</li>
                  <li>✓ Savings goals and progress reports</li>
                  <li>✓ Financial summaries and statistics</li>
                  <li>✓ Charts and analytics (PDF only)</li>
                </>
              )}

              {exportType === 'expenses' && (
                <>
                  <li>✓ Expense dates and categories</li>
                  <li>✓ Payment methods and descriptions</li>
                  <li>✓ Tags and recurring information</li>
                </>
              )}

              {exportType === 'income' && (
                <>
                  <li>✓ Income dates and sources</li>
                  <li>✓ Complete transaction details</li>
                </>
              )}
            </ul>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <Loader className="h-5 w-5 animate-spin text-primary" />

              <p className="text-sm font-medium text-primary">
                Generating export file...
              </p>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default CommonExport