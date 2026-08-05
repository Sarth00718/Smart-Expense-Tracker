import { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react'
import { expenseService } from '../services/expenseService'
import { useAuth } from './AuthContext'
import { eventBus, Events } from '../utils/eventBus'

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
    // Use dateISO if available (from date utilities), otherwise fall back to date or current time
    const dateToUse = expense.dateISO || expense.date || new Date().toISOString()
    const optimisticExpense = { ...expense, _id: tempId, date: dateToUse }
    setExpenses(prev => [optimisticExpense, ...prev])
    
    try {
      // Send dateISO if available, otherwise send date
      const expenseData = { ...expense, date: dateToUse }
      delete expenseData.dateISO // Remove helper field before sending
      
      const response = await expenseService.add(expenseData)
      await loadExpenses(null, { page: 1, limit: pagination.limit })
      
      // Emit event for other components to react
      eventBus.emit(Events.EXPENSE_CREATED, response.data)
      
      return response.data
    } catch (error) {
      await loadExpenses(null, { page: 1, limit: pagination.limit })
      throw error
    }
  }

  const updateExpense = async (id, expense) => {
    // Handle date conversion for updates too
    const dateToUse = expense.dateISO || expense.date
    const expenseData = { ...expense, date: dateToUse }
    delete expenseData.dateISO
    
    setExpenses(prev => prev.map(e => e._id === id ? { ...e, ...expenseData } : e))
    
    try {
      const response = await expenseService.update(id, expenseData)
      await loadExpenses(null, { page: 1, limit: pagination.limit })
      
      // Emit event for other components to react
      eventBus.emit(Events.EXPENSE_UPDATED, { id, data: response.data })
      
      return response.data
    } catch (error) {
      await loadExpenses(null, { page: 1, limit: pagination.limit })
      throw error
    }
  }

  const deleteExpense = async (id) => {
    setExpenses(prev => prev.filter(e => e._id !== id))
    
    try {
      await expenseService.delete(id)
      await loadExpenses(null, { page: 1, limit: pagination.limit })
      
      // Emit event for other components to react
      eventBus.emit(Events.EXPENSE_DELETED, { id })
    } catch (error) {
      await loadExpenses(null, { page: 1, limit: pagination.limit })
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

  // Listen for external updates (e.g., from AI Assistant auto-categorization)
  useEffect(() => {
    const handleAICategorized = () => {
      // Refresh expenses when AI categorizes an expense
      loadExpenses(null, { page: 1, limit: pagination.limit })
    }

    const handleBulkUpdate = () => {
      // Refresh expenses when bulk updates occur
      loadExpenses(null, { page: 1, limit: pagination.limit })
    }

    const unsubscribeAI = eventBus.on(Events.AI_EXPENSE_CATEGORIZED, handleAICategorized)
    const unsubscribeBulk = eventBus.on(Events.EXPENSES_BULK_UPDATE, handleBulkUpdate)

    return () => {
      unsubscribeAI()
      unsubscribeBulk()
    }
  }, [loadExpenses, pagination.limit])

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
