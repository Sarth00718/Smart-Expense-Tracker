import { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react'
import { expenseService } from '../services/expenseService'
import { useAuth } from './AuthContext'

const ExpenseContext = createContext()

export const useExpense = () => {
  const context = useContext(ExpenseContext)
  if (!context) throw new Error('useExpense must be used within ExpenseProvider')
  return context
}

/**
 * ExpenseProvider — server-side paginated (default page size 20).
 * Does NOT fetch all 10,000 records on load (issue #2).
 * Dashboard stats come from /analytics/dashboard instead.
 */
export const ExpenseProvider = ({ children }) => {
  const { user } = useAuth()
  const [expenses,   setExpenses]   = useState([])
  const [loading,    setLoading]    = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

  const loadExpenses = useCallback(async (signal, options = {}) => {
    try {
      setLoading(true)
      const response = await expenseService.getExpenses({
        page:  options.page  ?? 1,
        limit: options.limit ?? 20,
        ...options,
      })

      if (signal?.aborted) return

      const expenseData  = response.data?.data ?? response.data
      const paginationData = response.data?.pagination
      setExpenses(Array.isArray(expenseData) ? expenseData : [])
      if (paginationData) setPagination(paginationData)
    } catch (error) {
      if (error.name === 'AbortError' || signal?.aborted) return
      console.error('Error loading expenses:', error)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  const addExpense = async (expense) => {
    const response = await expenseService.add(expense)
    // Reload current page only — no need to refetch all
    await loadExpenses(null, { page: pagination.page, limit: pagination.limit })
    return response.data
  }

  const updateExpense = async (id, expense) => {
    const response = await expenseService.update(id, expense)
    await loadExpenses(null, { page: pagination.page, limit: pagination.limit })
    return response.data
  }

  const deleteExpense = async (id) => {
    await expenseService.delete(id)
    await loadExpenses(null, { page: pagination.page, limit: pagination.limit })
  }

  const goToPage = useCallback((page) => {
    loadExpenses(null, { page, limit: pagination.limit })
  }, [loadExpenses, pagination.limit])

  // Load first page when auth becomes available and when page size changes
  useEffect(() => {
    if (!user) {
      setExpenses([])
      setPagination({ page: 1, limit: 20, total: 0, pages: 0 })
      setLoading(false)
      return
    }

    const controller = new AbortController()
    loadExpenses(controller.signal, { page: pagination.page, limit: pagination.limit })
    return () => controller.abort()
  }, [user, loadExpenses, pagination.limit, pagination.page])

  const value = useMemo(() => ({
    expenses,
    loading,
    pagination,
    loadExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    goToPage,
  }), [expenses, loading, pagination, loadExpenses, goToPage])

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
}
