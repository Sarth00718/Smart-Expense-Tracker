import React, { createContext, useState, useContext, useEffect } from 'react'
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

  const loadExpenses = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await expenseService.getAll()
      setExpenses(response.data)
    } catch (error) {
      console.error('Error loading expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [user])

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
