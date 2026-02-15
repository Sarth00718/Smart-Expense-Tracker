import { firebaseAuth } from '../config/firebase'
import api from './api'

export const authService = {
  // Register - Try backend first, fallback to Firebase
  register: async (email, password, fullName) => {
    // Try backend authentication first
    try {
      const response = await api.post('/auth/register', { email, password, fullName })
      // Backend returns data in response.data.data structure
      const { token, user } = response.data.data || response.data
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('authMethod', 'backend')
      }
      return { token, user }
    } catch (backendError) {
      // Fallback to Firebase silently
      
      // Fallback to Firebase
      try {
        const result = await firebaseAuth.register(email, password, fullName)
        
        if (result.token) {
          localStorage.setItem('token', result.token)
          localStorage.setItem('user', JSON.stringify(result.user))
          localStorage.setItem('authMethod', 'firebase')
        }

        // Sync with backend to link accounts
        try {
          const syncResponse = await api.post('/auth/firebase-sync', {
            uid: result.user.uid,
            email: result.user.email,
            fullName: result.user.fullName
          })
          
          // Use backend token and user data if sync successful
          const syncData = syncResponse.data.data || syncResponse.data
          if (syncData.token) {
            localStorage.setItem('token', syncData.token)
            localStorage.setItem('user', JSON.stringify(syncData.user))
            return {
              token: syncData.token,
              user: syncData.user
            }
          }
        } catch (error) {
          console.warn('Backend sync failed:', error)
        }

        return result
      } catch (firebaseError) {
        throw new Error(firebaseError.message || 'Registration failed')
      }
    }
  },

  // Login - Try backend first, fallback to Firebase
  login: async (email, password) => {
    // Try backend authentication first
    try {
      const response = await api.post('/auth/login', { email, password })
      // Backend returns data in response.data.data structure
      const { token, user } = response.data.data || response.data
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('authMethod', 'backend')
      }
      return { token, user }
    } catch (backendError) {
      // If backend returns 401 (invalid credentials), throw immediately without Firebase fallback
      if (backendError.response?.status === 401) {
        throw backendError
      }
      
      // For other errors, fallback to Firebase
      try {
        const result = await firebaseAuth.login(email, password)
        
        if (result.token) {
          localStorage.setItem('token', result.token)
          localStorage.setItem('user', JSON.stringify(result.user))
          localStorage.setItem('authMethod', 'firebase')
        }

        // Sync with backend to link accounts
        try {
          const syncResponse = await api.post('/auth/firebase-sync', {
            uid: result.user.uid,
            email: result.user.email,
            fullName: result.user.fullName
          })
          
          // Use backend token and user data if sync successful
          const syncData = syncResponse.data.data || syncResponse.data
          if (syncData.token) {
            localStorage.setItem('token', syncData.token)
            localStorage.setItem('user', JSON.stringify(syncData.user))
            return {
              token: syncData.token,
              user: syncData.user
            }
          }
        } catch (error) {
          console.warn('Backend sync failed:', error)
        }

        return result
      } catch (firebaseError) {
        throw new Error(firebaseError.message || 'Login failed')
      }
    }
  },

  // Login with Google (Firebase only)
  loginWithGoogle: async () => {
    try {
      const result = await firebaseAuth.loginWithGoogle()
      
      if (result && result.token) {
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('authMethod', 'firebase')
      }

      // Sync with backend to link accounts and preserve data
      try {
        const syncResponse = await api.post('/auth/firebase-sync', {
          uid: result.user.uid,
          email: result.user.email,
          fullName: result.user.fullName,
          picture: result.user.picture
        })
        
        // Use backend token and user data if sync successful
        const syncData = syncResponse.data.data || syncResponse.data
        if (syncData.token) {
          localStorage.setItem('token', syncData.token)
          localStorage.setItem('user', JSON.stringify(syncData.user))
          return {
            token: syncData.token,
            user: syncData.user
          }
        }
      } catch (error) {
        console.warn('Backend sync failed:', error)
      }

      return result
    } catch (error) {
      throw new Error(error.message || 'Google login failed')
    }
  },

  // Logout - Handle both methods
  logout: async () => {
    const authMethod = localStorage.getItem('authMethod')
    
    try {
      // If using Firebase, logout from Firebase
      if (authMethod === 'firebase') {
        await firebaseAuth.logout()
      }
      
      // Clear local storage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('authMethod')
    } catch (error) {
      console.error('Logout error:', error)
      // Clear local storage even if logout fails
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('authMethod')
    }
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Get auth method
  getAuthMethod: () => {
    return localStorage.getItem('authMethod') || 'backend'
  },

  // Get Firebase ID token (if using Firebase)
  getIdToken: async () => {
    const authMethod = localStorage.getItem('authMethod')
    if (authMethod === 'firebase') {
      return await firebaseAuth.getIdToken()
    }
    return localStorage.getItem('token')
  }
}
