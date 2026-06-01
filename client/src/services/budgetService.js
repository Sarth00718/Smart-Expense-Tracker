import api from './api'
import { BUDGETS } from '../config/apiEndpoints'

export const budgetService = {
  getBudgets:   ()                       => api.get(BUDGETS.BASE),
  setBudget:    (budget)                 => api.post(BUDGETS.BASE, budget),
  updateBudget: (category, monthlyBudget)=> api.post(BUDGETS.BASE, { category, monthlyBudget }),
  deleteBudget: (category)               => api.delete(BUDGETS.BY_CATEGORY(category)),
}
