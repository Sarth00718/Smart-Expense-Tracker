import api from './api'
import { throttleRequest } from '../utils/requestDebounce'

// Throttle expensive operations
const throttledGetExpenses = throttleRequest((params) => api.get('/expenses', { params }), 2000)
const throttledGetSummary = throttleRequest(() => api.get('/expenses/summary'), 5000)

export const expenseService = {
  getExpenses: (params) => throttledGetExpenses(params),
  getAll: () => api.get('/expenses'),
  add: (expense) => api.post('/expenses', expense),
  update: (id, expense) => api.put(`/expenses/${id}`, expense),
  delete: (id) => api.delete(`/expenses/${id}`),
  deleteAll: () => api.delete('/expenses'),
  filter: (params) => api.get('/expenses/filter', { params }),
  search: (query) => api.post('/expenses/search', { query }),
  getCategories: () => api.get('/expenses/categories'),
  getSummary: () => throttledGetSummary(),
  getTotal: () => api.get('/expenses/total'),
  getCategorySummary: () => api.get('/expenses/category-summary'),
  getRecent: (limit) => api.get(`/expenses/recent/${limit}`)
}
