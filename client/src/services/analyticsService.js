import api from './api'

export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getHeatmap: (year, month) => api.get('/analytics/heatmap', { params: { year, month } }),
  getPatterns: () => api.get('/analytics/patterns'),
  getPredictions: (months) => api.get('/analytics/predictions', { params: { months } }),
  getScore: () => api.get('/analytics/score'),
  getAISuggestions: (type = 'general') => api.get('/ai/suggestions', { params: { type } }),
  getAchievements: () => api.get('/achievements')
}
