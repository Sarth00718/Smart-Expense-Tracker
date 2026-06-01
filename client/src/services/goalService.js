import api from './api'
import { GOALS } from '../config/apiEndpoints'

export const goalService = {
  getGoals:   ()            => api.get(GOALS.BASE),
  getStats:   ()            => api.get(GOALS.STATS),
  addGoal:    (goal)        => api.post(GOALS.BASE, goal),
  updateGoal: (id, data)    => api.put(GOALS.BY_ID(id), data),
  deleteGoal: (id)          => api.delete(GOALS.BY_ID(id)),
}
