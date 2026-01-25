import api from './api'

export const goalService = {
  getGoals: () => api.get('/goals'),
  addGoal: (goal) => api.post('/goals', goal),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`)
}

