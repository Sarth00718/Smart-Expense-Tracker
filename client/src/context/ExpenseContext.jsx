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
      
      setExpenses(prev => {
        const newData = Array.isArray(expenseData) ? expenseData : []
        if (options.append) {
          // Filter out duplicates just in case
          const existingIds = new Set(prev.map(e => e._id))
          const uniqueNewData = newData.filter(e => !existingIds.has(e._id))
          return [...prev, ...uniqueNewData]
        }
        return newData
      })
      if (paginationData) setPagination(paginationData)
    } catch (error) {
      if (error.name === 'AbortError' || signal?.aborted) return
      console.error('Error loading expenses:', error)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  const addExpense = async (expense) => {
    const tempId = `temp-${Date.now()}`
    const optimisticExpense = { ...expense, _id: tempId, date: expense.date || new Date().toISOString() }
    setExpenses(prev => [optimisticExpense, ...prev])
    
    try {
      const response = await expenseService.add(expense)
      loadExpenses(null, { page: 1, limit: pagination.limit })
      return response.data
    } catch (error) {
      loadExpenses(null, { page: 1, limit: pagination.limit })
      throw error
    }
  }

  const updateExpense = async (id, expense) => {
    setExpenses(prev => prev.map(e => e._id === id ? { ...e, ...expense } : e))
    
    try {
      const response = await expenseService.update(id, expense)
      loadExpenses(null, { page: 1, limit: pagination.limit })
      return response.data
    } catch (error) {
      loadExpenses(null, { page: 1, limit: pagination.limit })
      throw error
    }
  }

  const deleteExpense = async (id) => {
    setExpenses(prev => prev.filter(e => e._id !== id))
    
    try {
      await expenseService.delete(id)
      loadExpenses(null, { page: 1, limit: pagination.limit })
    } catch (error) {
      loadExpenses(null, { page: 1, limit: pagination.limit })
      throw error
    }
  }

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.pages && !loading) {
      loadExpenses(null, { page: pagination.page + 1, limit: pagination.limit, append: true })
    }
  }, [loadExpenses, pagination.page, pagination.pages, pagination.limit, loading])

  // Load first page when auth becomes available and when page size changes
  useEffect(() => {
    if (!user) {
      setExpenses([])
      setPagination({ page: 1, limit: 20, total: 0, pages: 0 })
      setLoading(false)
      return
    }

    const controller = new AbortController()
    loadExpenses(controller.signal, { page: 1, limit: pagination.limit })
    return () => controller.abort()
  }, [user, loadExpenses, pagination.limit])

  const value = useMemo(() => ({
    expenses,
    loading,
    pagination,
    loadExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    loadMore,
  }), [expenses, loading, pagination, loadExpenses, loadMore])

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
}
