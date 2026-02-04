import api from './api'
import { biometricService } from './biometricService'

export const authService = {
  register: async (email, password, fullName) => {
    const response = await api.post('/auth/register', { email, password, fullName })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      // Store credentials for biometric login
      localStorage.setItem('user_email', email)
      localStorage.setItem('user_password', btoa(password)) // Base64 encode for basic obfuscation
    }
    return response.data
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      // Store credentials for biometric login
      localStorage.setItem('user_email', email)
      localStorage.setItem('user_password', btoa(password))
    }
    return response.data
  },

  biometricLogin: async (userId) => {
    try {
      // Authenticate with biometric
      await biometricService.authenticate(userId)
      
      // Get stored credentials
      const email = localStorage.getItem('user_email')
      const encodedPassword = localStorage.getItem('user_password')
      
      if (!email || !encodedPassword) {
        throw new Error('No stored credentials found')
      }
      
      const password = atob(encodedPassword)
      
      // Login with stored credentials
      return await authService.login(email, password)
    } catch (error) {
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Keep biometric credentials for next login
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}
