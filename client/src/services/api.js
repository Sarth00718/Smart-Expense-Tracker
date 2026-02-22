import axios from 'axios'
import offlineQueue, { isOffline } from '../utils/offlineQueue'
import requestCache from '../utils/requestCache'
import { deduplicateRequest } from '../utils/requestDebounce'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 5000, // 5 seconds - fail fast if server is down
  withCredentials: false
})

// Request interceptor to add auth token and caching
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add retry config to all requests (reduced for faster fallback)
    config.retry = config.retry || 1
    config.retryDelay = config.retryDelay || 500
    
    // Check cache for GET requests
    if (config.method === 'get' && !config.skipCache) {
      const cacheKey = config.url
      const cached = requestCache.get(cacheKey, config.params, 30000) // 30s cache
      
      if (cached) {
        // Return cached data immediately
        config.adapter = () => {
          return Promise.resolve({
            data: cached,
            status: 200,
            statusText: 'OK (cached)',
            headers: {},
            config,
            request: {}
          })
        }
      }
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling with retry logic
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && !response.config.skipCache) {
      const cacheKey = response.config.url
      requestCache.set(cacheKey, response.config.params, response.data)
    }
    
    // Clear cache on successful write operations
    if (['post', 'put', 'patch', 'delete'].includes(response.config.method)) {
      // Clear related caches
      const urlParts = response.config.url.split('/')
      const resource = urlParts[1] // e.g., 'expenses', 'income'
      
      // Clear all cache entries for this resource
      if (resource) {
        requestCache.clearAll() // Simple approach: clear all cache on writes
      }
    }
    
    return response
  },
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
      
      console.log(`Retrying request... (${2 - config.retry}/2)`)
      
      // Wait before retrying (shorter delay)
      await new Promise(resolve => 
        setTimeout(resolve, config.retryDelay)
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
    // Rate limit - use cached data if available
    console.warn('Rate limit hit, using cached data if available')
    
    const cacheKey = error.config.url
    const cached = requestCache.get(cacheKey, error.config.params, 300000) // 5 min stale cache
    
    if (cached) {
      console.log('Returning stale cached data due to rate limit')
      return Promise.resolve({
        data: cached,
        status: 200,
        statusText: 'OK (stale cache)',
        headers: {},
        config: error.config,
        request: {}
      })
    }
    
    console.error('Rate limit exceeded:', errorMessage)
  } else if (status >= 500) {
    console.error('Server error:', errorMessage)
  }
  
  return Promise.reject(error)
}

// Wrapper to deduplicate identical requests
const originalGet = api.get.bind(api)
api.get = function(url, config = {}) {
  const key = `GET:${url}:${JSON.stringify(config.params || {})}`
  return deduplicateRequest(key, () => originalGet(url, config))
}

export default api
