import api from './api'
import { BUDGET_RECOMMENDATIONS } from '../config/apiEndpoints'

export const budgetRecommendationService = {
  getRecommendations: () => api.get(BUDGET_RECOMMENDATIONS.BASE),
}
