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
      setIncome(response.data?.data ?? [])
      setPagination(response.data?.pagination ?? { total: 0, page: 1, limit: 20, pages: 0 })
    } catch (error) {
      if (error.name === 'AbortError' || signal?.aborted) return
      console.error('Error loading income:', error)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  const addIncome = async (incomeData) => {
    const response = await incomeService.add(incomeData)
    await loadIncome(null, { page: pagination.page, limit: pagination.limit })
    return response.data
  }

  const updateIncome = async (id, incomeData) => {
    const response = await incomeService.update(id, incomeData)
    await loadIncome(null, { page: pagination.page, limit: pagination.limit })
    return response.data
  }

  const deleteIncome = async (id) => {
    await incomeService.delete(id)
    await loadIncome(null, { page: pagination.page, limit: pagination.limit })
  }

  const goToPage = useCallback((page) => {
    loadIncome(null, { page, limit: pagination.limit })
  }, [loadIncome, pagination.limit])

  // Load first page when auth becomes available and when page size changes
  useEffect(() => {
    if (!user) {
      setIncome([])
      setPagination({ total: 0, page: 1, limit: 20, pages: 0 })
      setLoading(false)
      return
    }

    const controller = new AbortController()
    loadIncome(controller.signal, { page: pagination.page, limit: pagination.limit })
    return () => controller.abort()
  }, [user, loadIncome, pagination.limit, pagination.page])

  const value = useMemo(() => ({
    income, loading, pagination,
    loadIncome, addIncome, updateIncome, deleteIncome, goToPage,
  }), [income, loading, pagination, loadIncome, goToPage])

  return <IncomeContext.Provider value={value}>{children}</IncomeContext.Provider>
}
