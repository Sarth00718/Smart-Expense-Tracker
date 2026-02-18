import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react'
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

  const loadIncome = useCallback(async (signal, params = {}) => {
    if (!user) {
      setIncome([])
      return
    }
    
    try {
      setLoading(true)
      const response = await incomeService.getAll(params)
      
      // Check if request was aborted
      if (signal?.aborted) return
      
      setIncome(response.data.data || [])
      setPagination(response.data.pagination || { total: 0, page: 1, limit: 50, pages: 0 })
    } catch (error) {
      // Don't set error state if request was aborted
      if (error.name === 'AbortError' || signal?.aborted) return
      
      console.error('Error loading income:', error)
      
      // Don't clear income on error - keep stale data
      // This prevents blank screen after timeout
      if (income.length === 0) {
        setIncome([])
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [user]) // Removed income from dependencies to prevent loops

  useEffect(() => {
    const abortController = new AbortController()

    if (user) {
      loadIncome(abortController.signal)
    }

    // Cleanup function to abort pending requests
    return () => {
      abortController.abort()
    }
  }, [user, loadIncome])

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

  const value = useMemo(() => ({
    income,
    loading,
    pagination,
    loadIncome,
    addIncome,
    updateIncome,
    deleteIncome
  }), [income, loading, pagination, loadIncome])

  return <IncomeContext.Provider value={value}>{children}</IncomeContext.Provider>
}
