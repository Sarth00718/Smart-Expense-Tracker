import api from './api'

export const expenseService = {
  getAll: () => api.get('/expenses'),
  add: (expense) => api.post('/expenses', expense),
  update: (id, expense) => api.put(`/expenses/${id}`, expense),
  delete: (id) => api.delete(`/expenses/${id}`),
  filter: (params) => api.get('/expenses/filter', { params }),
  search: (query) => api.post('/expenses/search', { query })
}
