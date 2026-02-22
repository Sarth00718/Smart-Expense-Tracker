// Debounce utility for API requests
const pendingRequests = new Map()

/**
 * Debounce API requests to prevent duplicate calls
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounceRequest = (fn, delay = 300) => {
  let timeoutId = null
  
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn.apply(this, args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }
}

/**
 * Throttle API requests to limit frequency
 * @param {Function} fn - The function to throttle
 * @param {number} limit - Minimum time between calls in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttleRequest = (fn, limit = 1000) => {
  let inThrottle = false
  let lastResult = null
  
  return async function (...args) {
    if (!inThrottle) {
      inThrottle = true
      
      try {
        lastResult = await fn.apply(this, args)
        
        setTimeout(() => {
          inThrottle = false
        }, limit)
        
        return lastResult
      } catch (error) {
        inThrottle = false
        throw error
      }
    }
    
    // Return last result if in throttle period
    return lastResult
  }
}

/**
 * Deduplicate identical pending requests
 * @param {string} key - Unique key for the request
 * @param {Function} fn - The function to execute
 * @returns {Promise} - Promise that resolves with the result
 */
export const deduplicateRequest = (key, fn) => {
  // If request is already pending, return the existing promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key)
  }
  
  // Create new request
  const promise = fn()
    .finally(() => {
      // Remove from pending after completion
      pendingRequests.delete(key)
    })
  
  pendingRequests.set(key, promise)
  return promise
}

/**
 * Batch multiple requests into a single call
 * @param {Function} fn - The batch function
 * @param {number} delay - Delay before executing batch
 * @returns {Function} - Batched function
 */
export const batchRequests = (fn, delay = 100) => {
  let batch = []
  let timeoutId = null
  
  return function (item) {
    return new Promise((resolve, reject) => {
      batch.push({ item, resolve, reject })
      
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(async () => {
        const currentBatch = batch
        batch = []
        
        try {
          const items = currentBatch.map(b => b.item)
          const results = await fn(items)
          
          currentBatch.forEach((b, index) => {
            b.resolve(results[index])
          })
        } catch (error) {
          currentBatch.forEach(b => {
            b.reject(error)
          })
        }
      }, delay)
    })
  }
}

export default {
  debounceRequest,
  throttleRequest,
  deduplicateRequest,
  batchRequests
}
