import api from './api'
import * as XLSX from 'xlsx'

export const exportService = {
  // Export expenses to CSV
  exportExpensesCSV: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({ format: 'csv' })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await api.get(`/export/expenses?${params}`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Export CSV error:', error)
      throw new Error('Failed to export expenses to CSV')
    }
  },

  // Export expenses to JSON
  exportExpensesJSON: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({ format: 'json' })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await api.get(`/export/expenses?${params}`)

      const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
        type: 'application/json' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `expenses_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Export JSON error:', error)
      throw new Error('Failed to export expenses to JSON')
    }
  },

  // Export expenses to Excel
  exportExpensesExcel: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({ format: 'json' })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await api.get(`/export/expenses?${params}`)
      const data = response.data

      // Create workbook
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(data)

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Expenses')

      // Generate Excel file
      XLSX.writeFile(wb, `expenses_${new Date().toISOString().split('T')[0]}.xlsx`)

    } catch (error) {
      console.error('Export Excel error:', error)
      throw new Error('Failed to export expenses to Excel')
    }
  },

  // Export income to CSV
  exportIncomeCSV: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({ format: 'csv' })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await api.get(`/export/income?${params}`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `income_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Export income CSV error:', error)
      throw new Error('Failed to export income to CSV')
    }
  },

  // Export all financial data
  exportAllData: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({ format: 'json' })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await api.get(`/export/all?${params}`)

      const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
        type: 'application/json' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `financial_data_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Export all data error:', error)
      throw new Error('Failed to export financial data')
    }
  },

  // Export all data to Excel with multiple sheets
  exportAllDataExcel: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({ format: 'json' })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await api.get(`/export/all?${params}`)
      const data = response.data

      // Create workbook
      const wb = XLSX.utils.book_new()

      // Add summary sheet
      const summaryData = [
        ['Export Date', data.exportDate],
        ['Total Expenses', data.summary.totalExpenses],
        ['Total Income', data.summary.totalIncome],
        ['Net Balance', data.summary.totalIncome - data.summary.totalExpenses],
        ['Expense Count', data.summary.expenseCount],
        ['Income Count', data.summary.incomeCount],
        ['Budget Count', data.summary.budgetCount],
        ['Goal Count', data.summary.goalCount]
      ]
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

      // Add expenses sheet
      if (data.expenses.length > 0) {
        const wsExpenses = XLSX.utils.json_to_sheet(data.expenses)
        XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses')
      }

      // Add income sheet
      if (data.income.length > 0) {
        const wsIncome = XLSX.utils.json_to_sheet(data.income)
        XLSX.utils.book_append_sheet(wb, wsIncome, 'Income')
      }

      // Add budgets sheet
      if (data.budgets.length > 0) {
        const wsBudgets = XLSX.utils.json_to_sheet(data.budgets)
        XLSX.utils.book_append_sheet(wb, wsBudgets, 'Budgets')
      }

      // Add goals sheet
      if (data.goals.length > 0) {
        const wsGoals = XLSX.utils.json_to_sheet(data.goals)
        XLSX.utils.book_append_sheet(wb, wsGoals, 'Goals')
      }

      // Generate Excel file
      XLSX.writeFile(wb, `financial_data_${new Date().toISOString().split('T')[0]}.xlsx`)

    } catch (error) {
      console.error('Export all data Excel error:', error)
      throw new Error('Failed to export financial data to Excel')
    }
  },

  // Export income to JSON
  exportIncomeJSON: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({ format: 'json' })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await api.get(`/export/income?${params}`)

      const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
        type: 'application/json' 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `income_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Export income JSON error:', error)
      throw new Error('Failed to export income to JSON')
    }
  },

  // Export income to Excel
  exportIncomeExcel: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({ format: 'json' })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await api.get(`/export/income?${params}`)
      const data = response.data

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(wb, ws, 'Income')
      XLSX.writeFile(wb, `income_${new Date().toISOString().split('T')[0]}.xlsx`)

    } catch (error) {
      console.error('Export income Excel error:', error)
      throw new Error('Failed to export income to Excel')
    }
  },

  // Export all data to CSV (combined)
  exportAllDataCSV: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams({ format: 'csv' })
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await api.get(`/export/all-csv?${params}`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `financial_data_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Export all data CSV error:', error)
      throw new Error('Failed to export financial data to CSV')
    }
  },

  // Export comprehensive PDF report with charts
  exportComprehensivePDF: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await api.get(`/export/comprehensive-pdf?${params}`, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `comprehensive_report_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Export comprehensive PDF error:', error)
      throw new Error('Failed to generate comprehensive PDF report')
    }
  }
}
