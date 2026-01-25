import api from './api'

export const budgetService = {
  getBudgets: () => api.get('/budgets'),
  setBudget: (budget) => api.post('/budgets', budget),
  deleteBudget: (category) => api.delete(`/budgets/${category}`)
}

