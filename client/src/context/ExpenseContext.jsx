import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
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

  const loadExpenses = useCallback(async (signal) => {
    if (!user) {
      setExpenses([])
      return
    }

    try {
      setLoading(true)
      const response = await expenseService.getAll()

      // Check if request was aborted
      if (signal?.aborted) return

      // Handle both old format (array) and new format (object with data property)
      const expenseData = response.data.data || response.data
      setExpenses(Array.isArray(expenseData) ? expenseData : [])
    } catch (error) {
      // Don't set error state if request was aborted
      if (error.name === 'AbortError' || signal?.aborted) return

      console.error('Error loading expenses:', error)
      setExpenses([])
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [user])

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

  const value = {
    expenses,
    loading,
    loadExpenses,
    fetchExpenses: loadExpenses, // Alias for compatibility
    addExpense,
    updateExpense,
    deleteExpense
  }

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
}
