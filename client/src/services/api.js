import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (offline mode)
    if (!error.response) {
      // Check if we're offline
      if (!navigator.onLine) {
        console.warn('Offline: Request will be cached and retried when online')
        return Promise.reject(new Error('You are offline. Changes will sync when connection is restored.'))
      }
      console.error('Network error:', error.message)
      return Promise.reject(new Error('Network error. Please check your connection.'))
    }

    // Handle specific status codes
    const status = error.response.status
    
    if (status === 401) {
      // Don't redirect if we're just checking auth
      if (!error.config.url.includes('/auth/me')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('authMethod')
        window.location.href = '/login'
      }
    } else if (status === 403) {
      console.error('Access forbidden')
    } else if (status === 404) {
      console.error('Resource not found')
    } else if (status >= 500) {
      console.error('Server error:', error.response.data)
    }
    
    return Promise.reject(error)
  }
)

export default api
