/**
 * Global Event Bus for cross-component communication
 * Allows components to broadcast and listen to events without direct coupling
 * Used to keep data in sync across contexts (e.g., AI updates triggering expense refresh)
 */

class EventBus {
  constructor() {
    this.events = {}
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Name of the event to listen for
   * @param {Function} callback - Function to call when event is emitted
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = []
    }
    
    this.events[eventName].push(callback)
    
    // Return unsubscribe function
    return () => {
      this.events[eventName] = this.events[eventName].filter(cb => cb !== callback)
    }
  }

  /**
   * Subscribe to an event that only fires once
   * @param {string} eventName - Name of the event to listen for
   * @param {Function} callback - Function to call when event is emitted
   */
  once(eventName, callback) {
    const onceWrapper = (...args) => {
      callback(...args)
      this.off(eventName, onceWrapper)
    }
    this.on(eventName, onceWrapper)
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Callback to remove
   */
  off(eventName, callback) {
    if (!this.events[eventName]) return
    
    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback)
  }

  /**
   * Emit an event to all subscribers
   * @param {string} eventName - Name of the event to emit
   * @param {*} data - Data to pass to subscribers
   */
  emit(eventName, data) {
    if (!this.events[eventName]) return
    
    this.events[eventName].forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error in event listener for "${eventName}":`, error)
      }
    })
  }

  /**
   * Remove all listeners for an event, or all events if no name provided
   * @param {string} [eventName] - Optional event name
   */
  clear(eventName) {
    if (eventName) {
      delete this.events[eventName]
    } else {
      this.events = {}
    }
  }

  /**
   * Get count of listeners for an event
   * @param {string} eventName - Name of the event
   * @returns {number} Number of listeners
   */
  listenerCount(eventName) {
    return this.events[eventName]?.length || 0
  }
}

// Singleton instance
export const eventBus = new EventBus()

// Predefined event names to prevent typos and provide autocomplete
export const Events = {
  // Expense events
  EXPENSE_CREATED: 'expense:created',
  EXPENSE_UPDATED: 'expense:updated',
  EXPENSE_DELETED: 'expense:deleted',
  EXPENSES_BULK_UPDATE: 'expenses:bulk-update',
  
  // Income events
  INCOME_CREATED: 'income:created',
  INCOME_UPDATED: 'income:updated',
  INCOME_DELETED: 'income:deleted',
  
  // Budget events
  BUDGET_CREATED: 'budget:created',
  BUDGET_UPDATED: 'budget:updated',
  BUDGET_DELETED: 'budget:deleted',
  
  // AI events
  AI_EXPENSE_CATEGORIZED: 'ai:expense-categorized',
  AI_ANALYSIS_COMPLETE: 'ai:analysis-complete',
  
  // Category events
  CATEGORY_CREATED: 'category:created',
  CATEGORY_UPDATED: 'category:updated',
  CATEGORY_DELETED: 'category:deleted',
  
  // Goal events
  GOAL_CREATED: 'goal:created',
  GOAL_UPDATED: 'goal:updated',
  GOAL_DELETED: 'goal:deleted',
  
  // Auth events
  USER_LOGGED_IN: 'user:logged-in',
  USER_LOGGED_OUT: 'user:logged-out',
}

export default eventBus
