import axios from 'axios'
import offlineQueue, { isOffline } from '../utils/offlineQueue'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000, // 30 second timeout
  withCredentials: false
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
  // Response interceptor for error handling
  async (error) => {
    // Handle network errors (offline mode)
    if (!error.response) {
      // Check if we're offline
      if (isOffline()) {
        const config = error.config
        
        // Only queue write operations (POST, PUT, PATCH, DELETE)
        const writeOperations = ['post', 'put', 'patch', 'delete']
        if (writeOperations.includes(config.method?.toLowerCase())) {
          // Queue the request for later
          const queueId = offlineQueue.addToQueue({
            method: config.method,
            url: config.url,
            data: config.data,
            headers: config.headers
          })
          
          console.log('Request queued for offline sync:', queueId)
          
          // Return a special response indicating the request was queued
          return Promise.reject({
            ...error,
            isQueued: true,
            queueId,
            message: 'You are offline. Changes will sync when connection is restored.'
          })
        }
        
        console.warn('Offline: Read operation failed')
        return Promise.reject(new Error('You are offline. Please check your connection.'))
      }
      console.error('Network error:', error.message)
      return Promise.reject(new Error('Network error. Please check your connection.'))
    }

    // Handle specific status codes
    const status = error.response.status
    const errorMessage = error.response.data?.error || error.response.data?.message || 'An error occurred'
    
    if (status === 401) {
      // Don't redirect if we're just checking auth
      if (!error.config.url.includes('/auth/me')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('authMethod')
        window.location.href = '/login'
      }
    } else if (status === 403) {
      console.error('Access forbidden:', errorMessage)
    } else if (status === 404) {
      console.error('Resource not found:', errorMessage)
    } else if (status === 429) {
      console.error('Rate limit exceeded:', errorMessage)
    } else if (status >= 500) {
      console.error('Server error:', errorMessage)
    }
    
    return Promise.reject(error)
  }
)

export default api
