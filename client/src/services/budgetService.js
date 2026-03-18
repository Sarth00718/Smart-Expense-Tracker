import api from './api'

export const budgetService = {
  getBudgets: () => api.get('/budgets'),
  setBudget: (budget) => api.post('/budgets', budget),
  updateBudget: (category, monthlyBudget) => api.post('/budgets', { category, monthlyBudget }),
  deleteBudget: (category) => api.delete(`/budgets/${category}`)
}

