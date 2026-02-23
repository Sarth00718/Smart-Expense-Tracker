import { firebaseAuth } from '../config/firebase'
import api from './api'

export const authService = {
  // Register - Try backend first, fallback to Firebase only on network errors
  register: async (email, password, fullName) => {
    // Try backend authentication first with short timeout
    try {
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        fullName 
      }, {
        timeout: 8000, // 8 second timeout for auth
        skipCache: true // Don't cache auth requests
      })
      
      // Backend returns data in response.data.data structure
      const { token, user } = response.data.data || response.data
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('authMethod', 'backend')
      }
      return { token, user }
    } catch (backendError) {
      console.log('Backend register error:', backendError.message)
      
      // If backend returns validation error (400) or conflict (409), throw immediately
      if (backendError.response?.status === 400 || backendError.response?.status === 409) {
        const error = new Error(backendError.response?.data?.error || backendError.response?.data?.message || 'Registration failed')
        error.response = backendError.response
        throw error
      }
      
      // Only fallback to Firebase on network errors or 500 errors
      const isNetworkError = !backendError.response || backendError.code === 'ECONNABORTED' || backendError.code === 'ERR_NETWORK'
      const isServerError = backendError.response?.status >= 500
      
      if (!isNetworkError && !isServerError) {
        // Backend is reachable but returned an error - don't try Firebase
        throw backendError
      }
      
      // Network error or server error - try Firebase as fallback
      console.log('Trying Firebase fallback...')
      try {
        const result = await firebaseAuth.register(email, password, fullName)
        
        if (result.token) {
          localStorage.setItem('token', result.token)
          localStorage.setItem('user', JSON.stringify(result.user))
          localStorage.setItem('authMethod', 'firebase')
        }

        // Try to sync with backend in background (don't wait)
        api.post('/auth/firebase-sync', {
          uid: result.user.uid,
          email: result.user.email,
          fullName: result.user.fullName
        }).then(syncResponse => {
          const syncData = syncResponse.data.data || syncResponse.data
          if (syncData.token) {
            localStorage.setItem('token', syncData.token)
            localStorage.setItem('user', JSON.stringify(syncData.user))
          }
        }).catch(err => {
          console.warn('Backend sync failed:', err)
        })

        return result
      } catch (firebaseError) {
        console.error('Firebase register error:', firebaseError)
        // Firebase error - use the message from Firebase
        throw firebaseError
      }
    }
  },

  // Login - Try backend first, fallback to Firebase only on network errors
  login: async (email, password) => {
    // Try backend authentication first with short timeout
    try {
      const response = await api.post('/auth/login', { 
        email, 
        password 
      }, {
        timeout: 8000, // 8 second timeout for auth
        skipCache: true // Don't cache auth requests
      })
      
      // Backend returns data in response.data.data structure
      const { token, user } = response.data.data || response.data
      if (token) {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('authMethod', 'backend')
      }
      return { token, user }
    } catch (backendError) {
      console.log('Backend login error:', backendError.message)
      
      // If backend returns 401 (invalid credentials), throw immediately - don't try Firebase
      if (backendError.response?.status === 401) {
        const error = new Error(backendError.response?.data?.error || backendError.response?.data?.message || 'Invalid email or password')
        error.response = backendError.response
        throw error
      }
      
      // If backend returns 400 (validation error), throw immediately
      if (backendError.response?.status === 400) {
        const error = new Error(backendError.response?.data?.error || backendError.response?.data?.message || 'Invalid request')
        error.response = backendError.response
        throw error
      }
      
      // Only fallback to Firebase on network errors or 500 errors
      const isNetworkError = !backendError.response || backendError.code === 'ECONNABORTED' || backendError.code === 'ERR_NETWORK'
      const isServerError = backendError.response?.status >= 500
      
      if (!isNetworkError && !isServerError) {
        // Backend is reachable but returned an error - don't try Firebase
        throw backendError
      }
      
      // Network error or server error - try Firebase as fallback
      console.log('Trying Firebase fallback...')
      try {
        const result = await firebaseAuth.login(email, password)
        
        if (result.token) {
          localStorage.setItem('token', result.token)
          localStorage.setItem('user', JSON.stringify(result.user))
          localStorage.setItem('authMethod', 'firebase')
        }

        // Try to sync with backend in background (don't wait)
        api.post('/auth/firebase-sync', {
          uid: result.user.uid,
          email: result.user.email,
          fullName: result.user.fullName
        }).then(syncResponse => {
          const syncData = syncResponse.data.data || syncResponse.data
          if (syncData.token) {
            localStorage.setItem('token', syncData.token)
            localStorage.setItem('user', JSON.stringify(syncData.user))
          }
        }).catch(err => {
          console.warn('Backend sync failed:', err)
        })

        return result
      } catch (firebaseError) {
        console.error('Firebase login error:', firebaseError)
        // Firebase error - use the message from Firebase
        throw firebaseError
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
      // Pass through the error with its message
      throw error
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
