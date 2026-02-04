// Offline Storage Utility using IndexedDB

const DB_NAME = 'ExpenseTrackerDB'
const DB_VERSION = 1
const STORES = {
  PENDING_EXPENSES: 'pendingExpenses',
  PENDING_INCOME: 'pendingIncome',
  CACHED_DATA: 'cachedData'
}

/**
 * Initialize IndexedDB
 */
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.PENDING_EXPENSES)) {
        const expenseStore = db.createObjectStore(STORES.PENDING_EXPENSES, { 
          keyPath: 'id', 
          autoIncrement: true 
        })
        expenseStore.createIndex('timestamp', 'timestamp', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.PENDING_INCOME)) {
        const incomeStore = db.createObjectStore(STORES.PENDING_INCOME, { 
          keyPath: 'id', 
          autoIncrement: true 
        })
        incomeStore.createIndex('timestamp', 'timestamp', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.CACHED_DATA)) {
        const cacheStore = db.createObjectStore(STORES.CACHED_DATA, { 
          keyPath: 'key' 
        })
        cacheStore.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

/**
 * Add item to store
 */
export const addToStore = async (storeName, data) => {
  try {
    const db = await initDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    const item = {
      ...data,
      timestamp: Date.now()
    }
    
    const request = store.add(item)
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error adding to store:', error)
    throw error
  }
}

/**
 * Get all items from store
 */
export const getAllFromStore = async (storeName) => {
  try {
    const db = await initDB()
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error getting from store:', error)
    return []
  }
}

/**
 * Delete item from store
 */
export const deleteFromStore = async (storeName, id) => {
  try {
    const db = await initDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(id)
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error deleting from store:', error)
    throw error
  }
}

/**
 * Clear all items from store
 */
export const clearStore = async (storeName) => {
  try {
    const db = await initDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.clear()
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error clearing store:', error)
    throw error
  }
}

/**
 * Cache data with expiration
 */
export const cacheData = async (key, data, expirationMinutes = 60) => {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORES.CACHED_DATA], 'readwrite')
    const store = transaction.objectStore(STORES.CACHED_DATA)
    
    const item = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (expirationMinutes * 60 * 1000)
    }
    
    const request = store.put(item)
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error caching data:', error)
    throw error
  }
}

/**
 * Get cached data
 */
export const getCachedData = async (key) => {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORES.CACHED_DATA], 'readonly')
    const store = transaction.objectStore(STORES.CACHED_DATA)
    const request = store.get(key)
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result
        
        // Check if data exists and hasn't expired
        if (result && result.expiresAt > Date.now()) {
          resolve(result.data)
        } else {
          // Delete expired data
          if (result) {
            deleteFromStore(STORES.CACHED_DATA, key)
          }
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('Error getting cached data:', error)
    return null
  }
}

/**
 * Offline expense operations
 */
export const savePendingExpense = (expense) => {
  return addToStore(STORES.PENDING_EXPENSES, expense)
}

export const getPendingExpenses = () => {
  return getAllFromStore(STORES.PENDING_EXPENSES)
}

export const deletePendingExpense = (id) => {
  return deleteFromStore(STORES.PENDING_EXPENSES, id)
}

/**
 * Offline income operations
 */
export const savePendingIncome = (income) => {
  return addToStore(STORES.PENDING_INCOME, income)
}

export const getPendingIncome = () => {
  return getAllFromStore(STORES.PENDING_INCOME)
}

export const deletePendingIncome = (id) => {
  return deleteFromStore(STORES.PENDING_INCOME, id)
}

/**
 * Sync pending data when back online
 */
export const syncPendingData = async (expenseService, incomeService) => {
  const results = {
    expenses: { success: 0, failed: 0 },
    income: { success: 0, failed: 0 }
  }

  try {
    // Sync pending expenses
    const pendingExpenses = await getPendingExpenses()
    for (const expense of pendingExpenses) {
      try {
        await expenseService.createExpense(expense)
        await deletePendingExpense(expense.id)
        results.expenses.success++
      } catch (error) {
        console.error('Failed to sync expense:', error)
        results.expenses.failed++
      }
    }

    // Sync pending income
    const pendingIncome = await getPendingIncome()
    for (const income of pendingIncome) {
      try {
        await incomeService.createIncome(income)
        await deletePendingIncome(income.id)
        results.income.success++
      } catch (error) {
        console.error('Failed to sync income:', error)
        results.income.failed++
      }
    }
  } catch (error) {
    console.error('Error syncing pending data:', error)
  }

  return results
}
