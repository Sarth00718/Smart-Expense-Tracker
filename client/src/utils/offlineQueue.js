/**
 * Offline Queue Manager
 * Handles queuing API requests when offline and syncing when back online
 */

const QUEUE_KEY = 'offline-request-queue';

class OfflineQueue {
  constructor() {
    this.queue = this.loadQueue();
    this.setupOnlineListener();
  }

  // Load queue from localStorage
  loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading offline queue:', error);
      return [];
    }
  }

  // Save queue to localStorage
  saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  // Add request to queue
  addToQueue(request) {
    const queueItem = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ...request
    };
    
    this.queue.push(queueItem);
    this.saveQueue();
    
    console.log('Request queued for offline sync:', queueItem);
    return queueItem.id;
  }

  // Remove request from queue
  removeFromQueue(id) {
    this.queue = this.queue.filter(item => item.id !== id);
    this.saveQueue();
  }

  // Get all queued requests
  getQueue() {
    return [...this.queue];
  }

  // Clear entire queue
  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }

  // Process queue when back online
  async processQueue() {
    if (this.queue.length === 0) {
      console.log('No offline requests to sync');
      return { success: true, processed: 0, failed: 0 };
    }

    console.log(`Processing ${this.queue.length} offline requests...`);
    
    const results = {
      success: true,
      processed: 0,
      failed: 0,
      errors: []
    };

    // Process each queued request
    const queueCopy = [...this.queue];
    
    for (const item of queueCopy) {
      try {
        await this.executeRequest(item);
        this.removeFromQueue(item.id);
        results.processed++;
        console.log('Synced offline request:', item);
      } catch (error) {
        results.failed++;
        results.errors.push({
          id: item.id,
          error: error.message
        });
        console.error('Failed to sync request:', item, error);
        
        // Remove failed requests older than 24 hours
        const itemAge = Date.now() - new Date(item.timestamp).getTime();
        if (itemAge > 24 * 60 * 60 * 1000) {
          this.removeFromQueue(item.id);
          console.log('Removed old failed request:', item.id);
        }
      }
    }

    if (results.failed > 0) {
      results.success = false;
    }

    return results;
  }

  // Execute a queued request
  async executeRequest(item) {
    const { method, url, data, headers } = item;
    
    // Import axios dynamically to avoid circular dependencies
    const api = (await import('../services/api.js')).default;
    
    const config = {
      method: method.toLowerCase(),
      url,
      headers: headers || {},
      ...(data && { data })
    };

    const response = await api.request(config);
    return response.data;
  }

  // Setup listener for online event
  setupOnlineListener() {
    window.addEventListener('online', async () => {
      console.log('Back online! Processing queued requests...');
      
      // Wait a bit to ensure connection is stable
      setTimeout(async () => {
        const results = await this.processQueue();
        
        if (results.processed > 0) {
          // Notify user
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Synced!', {
              body: `${results.processed} offline changes synced successfully`,
              icon: '/pwa-192x192.png'
            });
          }
          
          // Dispatch custom event for UI updates
          window.dispatchEvent(new CustomEvent('offline-sync-complete', {
            detail: results
          }));
        }
      }, 2000);
    });
  }

  // Get queue size
  getQueueSize() {
    return this.queue.length;
  }

  // Check if queue has items
  hasQueuedItems() {
    return this.queue.length > 0;
  }
}

// Create singleton instance
const offlineQueue = new OfflineQueue();

export default offlineQueue;

// Helper function to queue a request
export const queueRequest = (method, url, data = null, headers = {}) => {
  return offlineQueue.addToQueue({ method, url, data, headers });
};

// Helper function to check if offline
export const isOffline = () => {
  return !navigator.onLine;
};
