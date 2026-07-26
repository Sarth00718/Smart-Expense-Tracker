import { createContext, useContext, useState, useEffect } from 'react'
import { usersService } from '../services/usersService'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'
import { EXPENSE_CATEGORIES, INCOME_SOURCES } from '../constants/categories'

const CategoryContext = createContext()

export const useCategories = () => {
  const context = useContext(CategoryContext)
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider')
  }
  return context
}

export const CategoryProvider = ({ children }) => {
  const { user } = useAuth()
  const [expenseCategories, setExpenseCategories] = useState([])
  const [incomeCategories, setIncomeCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadCategories()
    } else {
      setExpenseCategories([])
      setIncomeCategories([])
      setLoading(false)
    }
  }, [user])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await usersService.getCategories()
      const cats = response.data.categories
      if (cats && cats.expense && cats.expense.length > 0) {
        setExpenseCategories(cats.expense)
        setIncomeCategories(cats.income || [])
      } else {
        // Fallback to defaults if backend array is completely empty or missing
        setExpenseCategories(EXPENSE_CATEGORIES)
        setIncomeCategories(INCOME_SOURCES)
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
      toast.error('Failed to load custom categories')
      setExpenseCategories(EXPENSE_CATEGORIES)
      setIncomeCategories(INCOME_SOURCES)
    } finally {
      setLoading(false)
    }
  }

  const updateCategories = async (expense, income) => {
    try {
      const response = await usersService.updateCategories({ expense, income })
      const cats = response.data.categories
      if (cats) {
        setExpenseCategories(cats.expense || [])
        setIncomeCategories(cats.income || [])
      }
      toast.success('Categories updated successfully')
    } catch (error) {
      console.error('Failed to update categories:', error)
      toast.error('Failed to update categories')
      throw error
    }
  }

  const getCategoryColor = (value, type = 'expense') => {
    const categories = type === 'expense' ? expenseCategories : incomeCategories
    const cat = categories.find(c => c.value === value)
    return cat?.color || { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-600 dark:text-slate-400' }
  }

  const getCategoryEmoji = (value, type = 'expense') => {
    const categories = type === 'expense' ? expenseCategories : incomeCategories
    const cat = categories.find(c => c.value === value)
    return cat?.emoji || '📦'
  }

  return (
    <CategoryContext.Provider
      value={{
        expenseCategories,
        incomeCategories,
        loading,
        updateCategories,
        getCategoryColor,
        getCategoryEmoji,
        refreshCategories: loadCategories
      }}
    >
      {children}
    </CategoryContext.Provider>
  )
}
