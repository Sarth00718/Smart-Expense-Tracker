import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react'
import { expenseService } from '../services/expenseService'
import { useAuth } from './AuthContext'

const ExpenseContext = createContext()

export const useExpense = () => {
  const context = useContext(ExpenseContext)
  if (!context) {
    throw new Error('useExpense must be used within ExpenseProvider')
  }
  return context
}

export const ExpenseProvider = ({ children }) => {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0, pages: 0 })

  const loadExpenses = useCallback(async (signal, options = {}) => {
    if (!user) {
      setExpenses([])
      return
    }

    try {
      setLoading(true)
      
      // Use pagination with reasonable limit - only load recent expenses for context
      const response = await expenseService.getExpenses({ 
        page: options.page || 1, 
        limit: options.limit || 100,
        ...options 
      })

      // Check if request was aborted
      if (signal?.aborted) return

      // Handle both old format (array) and new format (object with data property)
      const expenseData = response.data.data || response.data
      const paginationData = response.data.pagination
      
      setExpenses(Array.isArray(expenseData) ? expenseData : [])
      if (paginationData) {
        setPagination(paginationData)
      }
    } catch (error) {
      // Don't set error state if request was aborted
      if (error.name === 'AbortError' || signal?.aborted) return

      console.error('Error loading expenses:', error)
      
      // Don't clear expenses on error - keep stale data
      // This prevents blank screen after timeout
      if (expenses.length === 0) {
        setExpenses([])
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [user]) // Removed expenses from dependencies to prevent loops

  useEffect(() => {
    const abortController = new AbortController()

    if (user) {
      loadExpenses(abortController.signal)
    }

    // Cleanup function to abort pending requests
    return () => {
      abortController.abort()
    }
  }, [user, loadExpenses])

  const addExpense = async (expense) => {
    const response = await expenseService.add(expense)
    await loadExpenses()
    return response.data
  }

  const updateExpense = async (id, expense) => {
    const response = await expenseService.update(id, expense)
    await loadExpenses()
    return response.data
  }

  const deleteExpense = async (id) => {
    await expenseService.delete(id)
    await loadExpenses()
  }

  const value = useMemo(() => ({
    expenses,
    loading,
    pagination,
    loadExpenses,
    fetchExpenses: loadExpenses, // Alias for compatibility
    addExpense,
    updateExpense,
    deleteExpense
  }), [expenses, loading, pagination, loadExpenses])

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
}
