import { createContext, useState, useContext, useCallback, useMemo, useEffect } from 'react'
import { incomeService } from '../services/incomeService'
import { useAuth } from './AuthContext'

const IncomeContext = createContext()

export const useIncome = () => {
  const context = useContext(IncomeContext)
  if (!context) throw new Error('useIncome must be used within IncomeProvider')
  return context
}

/**
 * IncomeProvider — server-side paginated (default page size 20).
 * Does NOT fetch 10,000 records (issue #2).
 */
export const IncomeProvider = ({ children }) => {
  const { user } = useAuth()
  const [income,     setIncome]     = useState([])
  const [loading,    setLoading]    = useState(false)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 0 })

  const loadIncome = useCallback(async (signal, params = {}) => {
    try {
      setLoading(true)
      const response = await incomeService.getAll({
        page:  params.page  ?? 1,
        limit: params.limit ?? 20,
        ...params,
      })
      if (signal?.aborted) return
      
      const incomeData = response.data?.data ?? []
      setIncome(prev => {
        if (params.append) {
          const existingIds = new Set(prev.map(i => i._id))
          const uniqueNewData = incomeData.filter(i => !existingIds.has(i._id))
          return [...prev, ...uniqueNewData]
        }
        return incomeData
      })
      setPagination(response.data?.pagination ?? { total: 0, page: 1, limit: 20, pages: 0 })
    } catch (error) {
      if (error.name === 'AbortError' || signal?.aborted) return
      console.error('Error loading income:', error)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  const addIncome = async (incomeData) => {
    const tempId = `temp-${Date.now()}`
    setIncome(prev => [optimisticIncome, ...prev])
    
    try {
      const response = await incomeService.add(incomeData)
      loadIncome(null, { page: 1, limit: pagination.limit })
      return response.data
    } catch (error) {
      loadIncome(null, { page: 1, limit: pagination.limit })
      throw error
    }
  }

  const updateIncome = async (id, incomeData) => {
    setIncome(prev => prev.map(i => i._id === id ? { ...i, ...incomeData } : i))
    
    try {
      const response = await incomeService.update(id, incomeData)
      loadIncome(null, { page: 1, limit: pagination.limit })
      return response.data
    } catch (error) {
      loadIncome(null, { page: 1, limit: pagination.limit })
      throw error
    }
  }

  const deleteIncome = async (id) => {
    setIncome(prev => prev.filter(i => i._id !== id))
    
    try {
      await incomeService.delete(id)
      loadIncome(null, { page: 1, limit: pagination.limit })
    } catch (error) {
      loadIncome(null, { page: 1, limit: pagination.limit })
      throw error
    }
  }

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.pages && !loading) {
      loadIncome(null, { page: pagination.page + 1, limit: pagination.limit, append: true })
    }
  }, [loadIncome, pagination.page, pagination.pages, pagination.limit, loading])

  // Load first page when auth becomes available and when page size changes
  useEffect(() => {
    if (!user) {
      setIncome([])
      setPagination({ total: 0, page: 1, limit: 20, pages: 0 })
      setLoading(false)
      return
    }

    const controller = new AbortController()
    loadIncome(controller.signal, { page: 1, limit: pagination.limit })
    return () => controller.abort()
  }, [user, loadIncome, pagination.limit])

  const value = useMemo(() => ({
    income, loading, pagination,
    loadIncome, addIncome, updateIncome, deleteIncome, loadMore,
  }), [income, loading, pagination, loadIncome, loadMore])

  return <IncomeContext.Provider value={value}>{children}</IncomeContext.Provider>
}
