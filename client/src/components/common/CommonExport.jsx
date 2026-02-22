import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, FileJson, File, Calendar, X, Loader } from 'lucide-react'
import { Modal, Button } from '../ui'
import { exportService } from '../../services/exportService'
import toast from 'react-hot-toast'

const CommonExport = () => {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [exportType, setExportType] = useState('all') // all, expenses, income

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
            await exportService.exportExpensesCSV(params.startDate, params.endDate)
            successMessage = 'Expenses exported to CSV'
          } else if (exportType === 'income') {
            await exportService.exportIncomeCSV(params.startDate, params.endDate)
            successMessage = 'Income exported to CSV'
          } else {
            await exportService.exportAllDataCSV(params.startDate, params.endDate)
            successMessage = 'All data exported to CSV'
          }
          break

        case 'excel':
          if (exportType === 'expenses') {
            await exportService.exportExpensesExcel(params.startDate, params.endDate)
            successMessage = 'Expenses exported to Excel'
          } else if (exportType === 'income') {
            await exportService.exportIncomeExcel(params.startDate, params.endDate)
            successMessage = 'Income exported to Excel'
          } else {
            await exportService.exportAllDataExcel(params.startDate, params.endDate)
            successMessage = 'All data exported to Excel'
          }
          break

        case 'json':
          if (exportType === 'expenses') {
            await exportService.exportExpensesJSON(params.startDate, params.endDate)
            successMessage = 'Expenses exported to JSON'
          } else if (exportType === 'income') {
            await exportService.exportIncomeJSON(params.startDate, params.endDate)
            successMessage = 'Income exported to JSON'
          } else {
            await exportService.exportAllData(params.startDate, params.endDate)
            successMessage = 'All data exported to JSON'
          }
          break

        case 'pdf':
          await exportService.exportComprehensivePDF(params.startDate, params.endDate)
          successMessage = 'Comprehensive PDF report generated'
          break

        default:
          throw new Error('Invalid export format')
      }

      toast.success(successMessage)
      setShowModal(false)
      setDateRange({ startDate: '', endDate: '' })
    } catch (error) {
      console.error('Export error:', error)
      toast.error(error.message || 'Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Export Button in Header */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 hover:border-gray-400 dark:hover:border-slate-500 transition-all shadow-sm hover:shadow tap-target"
        title="Export Financial Data"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {/* Export Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary to-[#3a0ca3] text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight font-sans">Export Financial Data</h2>
                    <p className="text-white/80 text-sm mt-1">Download your financial data in multiple formats</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/20 dark:hover:bg-white/10 rounded-lg transition-colors"
                  disabled={loading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Date Range Filter */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date Range (Optional)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      className="input w-full"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      className="input w-full"
                      disabled={loading}
                    />
                  </div>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                  Leave empty to export all data
                </p>
              </div>

              {/* Export Type Selection */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">Select Data Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setExportType('all')}
                    disabled={loading}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      exportType === 'all'
                        ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-md'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <File className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">All Data</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Complete financial data</p>
                  </button>
                  <button
                    onClick={() => setExportType('expenses')}
                    disabled={loading}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      exportType === 'expenses'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <FileText className="w-6 h-6 mx-auto mb-2 text-red-500" />
                    <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">Expenses Only</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Expense records</p>
                  </button>
                  <button
                    onClick={() => setExportType('income')}
                    disabled={loading}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      exportType === 'income'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                        : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <FileText className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <p className="font-semibold text-sm text-gray-900 dark:text-slate-100">Income Only</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">Income records</p>
                  </button>
                </div>
              </div>

              {/* Export Format Options */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">Choose Export Format</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* CSV Export */}
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={loading}
                    className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-slate-600 rounded-lg hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-slate-100">CSV Format</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">Excel, Google Sheets compatible</p>
                    </div>
                  </button>

                  {/* Excel Export */}
                  <button
                    onClick={() => handleExport('excel')}
                    disabled={loading}
                    className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-slate-600 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileSpreadsheet className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-slate-100">Excel Format</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">Native Excel with multiple sheets</p>
                    </div>
                  </button>

                  {/* JSON Export */}
                  <button
                    onClick={() => handleExport('json')}
                    disabled={loading}
                    className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-slate-600 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileJson className="w-8 h-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-slate-100">JSON Format</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">Raw data for developers</p>
                    </div>
                  </button>

                  {/* Comprehensive PDF Report */}
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={loading || exportType !== 'all'}
                    className="flex items-center gap-3 p-4 border-2 border-gray-200 dark:border-slate-600 rounded-lg hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <File className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-slate-100">Comprehensive PDF</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">
                        {exportType === 'all' ? 'Full report with charts' : 'Only available for "All Data"'}
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 text-sm">📋 What's Included?</h4>
                <ul className="text-xs text-gray-700 dark:text-slate-300 space-y-1">
                  {exportType === 'all' && (
                    <>
                      <li>✓ All expenses with categories and descriptions</li>
                      <li>✓ All income records with sources</li>
                      <li>✓ Budget allocations and tracking</li>
                      <li>✓ Savings goals and progress</li>
                      <li>✓ Financial summary and statistics</li>
                      <li>✓ Analytics charts (PDF only)</li>
                    </>
                  )}
                  {exportType === 'expenses' && (
                    <>
                      <li>✓ Expense date, category, and amount</li>
                      <li>✓ Descriptions and payment methods</li>
                      <li>✓ Tags and recurring status</li>
                    </>
                  )}
                  {exportType === 'income' && (
                    <>
                      <li>✓ Income date, source, and amount</li>
                      <li>✓ Descriptions and recurring status</li>
                    </>
                  )}
                </ul>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Loader className="w-5 h-5 animate-spin text-primary" />
                  <p className="text-sm font-medium text-primary dark:text-blue-400">Generating export...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CommonExport
