// Simple in-memory cache for API requests
class RequestCache {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
  }

  // Generate cache key from URL and params
  generateKey(url, params = {}) {
    return `${url}:${JSON.stringify(params)}`
  }

  // Get cached data if not expired
  get(url, params = {}, maxAge = 30000) { // 30 seconds default
    const key = this.generateKey(url, params)
    const timestamp = this.timestamps.get(key)
    
    if (!timestamp) return null
    
    const age = Date.now() - timestamp
    if (age > maxAge) {
      // Expired, remove from cache
      this.cache.delete(key)
      this.timestamps.delete(key)
      return null
    }
    
    return this.cache.get(key)
  }

  // Set cache data
  set(url, params = {}, data) {
    const key = this.generateKey(url, params)
    this.cache.set(key, data)
    this.timestamps.set(key, Date.now())
  }

  // Clear specific cache entry
  clear(url, params = {}) {
    const key = this.generateKey(url, params)
    this.cache.delete(key)
    this.timestamps.delete(key)
  }

  // Clear all cache
  clearAll() {
    this.cache.clear()
    this.timestamps.clear()
  }

  // Clear expired entries
  cleanup() {
    const now = Date.now()
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now - timestamp > 300000) { // 5 minutes
        this.cache.delete(key)
        this.timestamps.delete(key)
      }
    }
  }
}

// Create singleton instance
const requestCache = new RequestCache()

// Cleanup every 5 minutes
setInterval(() => {
  requestCache.cleanup()
}, 5 * 60 * 1000)

export default requestCache
