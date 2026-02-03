import api from './api'

export const expenseService = {
  getExpenses: (params) => api.get('/expenses', { params }),
  getAll: () => api.get('/expenses'),
  add: (expense) => api.post('/expenses', expense),
  update: (id, expense) => api.put(`/expenses/${id}`, expense),
  delete: (id) => api.delete(`/expenses/${id}`),
  deleteAll: () => api.delete('/expenses'),
  filter: (params) => api.get('/expenses/filter', { params }),
  search: (query) => api.post('/expenses/search', { query }),
  getCategories: () => api.get('/expenses/categories'),
  getSummary: () => api.get('/expenses/summary'),
  getTotal: () => api.get('/expenses/total'),
  getCategorySummary: () => api.get('/expenses/category-summary'),
  getRecent: (limit) => api.get(`/expenses/recent/${limit}`)
}
