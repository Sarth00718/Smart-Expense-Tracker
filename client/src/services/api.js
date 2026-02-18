import axios from 'axios'
import offlineQueue, { isOffline } from '../utils/offlineQueue'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000, // Increased from 30s to 60s for slow wake-ups
  withCredentials: false
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add retry config to all requests
    config.retry = config.retry || 3
    config.retryDelay = config.retryDelay || 1000
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  // Response interceptor for error handling with retry logic
  async (error) => {
    const config = error.config
    
    // Retry logic for timeout and network errors
    if (!config || !config.retry) {
      return handleError(error)
    }
    
    // Check if we should retry
    const shouldRetry = 
      !error.response || // Network error
      error.code === 'ECONNABORTED' || // Timeout
      error.code === 'ERR_NETWORK' || // Network error
      (error.response && error.response.status >= 500) // Server error
    
    if (shouldRetry && config.retry > 0) {
      config.retry -= 1
      
      console.log(`Retrying request... (${3 - config.retry}/3)`)
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => 
        setTimeout(resolve, config.retryDelay * (4 - config.retry))
      )
      
      return api(config)
    }
    
    return handleError(error)
  }
)

// Separate error handling function
function handleError(error) {
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
    
    // Network error but not offline - likely server waking up
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Server may be waking up, please try again.'))
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

export default api
