import api from './api'
import { ANALYTICS, AI, ACHIEVEMENTS } from '../config/apiEndpoints'

export const analyticsService = {
  getDashboard:    ()               => api.get(ANALYTICS.DASHBOARD),
  getHeatmap:      (year, month)    => api.get(ANALYTICS.HEATMAP, { params: { year, month } }),
  getPatterns:     ()               => api.get(ANALYTICS.PATTERNS),
  getPredictions:  (months)         => api.get(ANALYTICS.PREDICTIONS, { params: { months } }),
  getScore:        ()               => api.get(ANALYTICS.SCORE),
  getAISuggestions:(type = 'general') => api.get(AI.SUGGESTIONS, { params: { type } }),
  getAchievements: ()               => api.get(ACHIEVEMENTS.BASE),
}
