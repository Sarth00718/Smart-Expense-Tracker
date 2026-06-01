import api from './api'
import { USERS } from '../config/apiEndpoints'

export const usersService = {
  getProfileStats: () => api.get(USERS.PROFILE_STATS),
  updateProfile: (profile) => api.put(USERS.PROFILE, profile),
  changePassword: (currentPassword, newPassword) => api.put(USERS.CHANGE_PASSWORD, {
    currentPassword,
    newPassword,
  }),
  getSessions: () => api.get(USERS.SESSIONS),
  revokeSession: (sessionId) => api.delete(USERS.SESSION_BY_ID(sessionId)),
  getPreferences: () => api.get(USERS.PREFERENCES),
  updatePreferences: (preferences) => api.patch(USERS.PREFERENCES, preferences),
}

export default usersService