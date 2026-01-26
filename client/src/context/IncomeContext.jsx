import React, { createContext, useState, useContext, useEffect } from 'react'
import { incomeService } from '../services/incomeService'
import { useAuth } from './AuthContext'

const IncomeContext = createContext()

export const useIncome = () => {
  const context = useContext(IncomeContext)
  if (!context) {
    throw new Error('useIncome must be used within IncomeProvider')
  }
  return context
}

export const IncomeProvider = ({ children }) => {
  const { user } = useAuth()
  const [income, setIncome] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 0 })

  const loadIncome = async (params = {}) => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await incomeService.getAll(params)
      setIncome(response.data.data)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error loading income:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIncome()
  }, [user])

  const addIncome = async (incomeData) => {
    const response = await incomeService.add(incomeData)
    await loadIncome()
    return response.data
  }

  const updateIncome = async (id, incomeData) => {
    const response = await incomeService.update(id, incomeData)
    await loadIncome()
    return response.data
  }

  const deleteIncome = async (id) => {
    await incomeService.delete(id)
    await loadIncome()
  }

  const value = {
    income,
    loading,
    pagination,
    loadIncome,
    addIncome,
    updateIncome,
    deleteIncome
  }

  return <IncomeContext.Provider value={value}>{children}</IncomeContext.Provider>
}
