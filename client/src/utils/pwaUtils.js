/**
 * PWA Utility Functions
 */

/**
 * Check if app is running as installed PWA
 */
export const isStandalone = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Check if device is iOS
 */
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

/**
 * Check if device is Android
 */
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

/**
 * Check if browser supports PWA installation
 */
export const canInstallPWA = () => {
  return 'BeforeInstallPromptEvent' in window;
};

/**
 * Get platform-specific install instructions
 */
export const getInstallInstructions = () => {
  if (isIOS()) {
    return {
      platform: 'iOS',
      steps: [
        'Tap the Share button',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to confirm'
      ]
    };
  }
  
  if (isAndroid()) {
    return {
      platform: 'Android',
      steps: [
        'Tap the menu icon (three dots)',
        'Tap "Install app" or "Add to Home Screen"',
        'Tap "Install" to confirm'
      ]
    };
  }
  
  return {
    platform: 'Desktop',
    steps: [
      'Look for the install icon in the address bar',
      'Click the icon to install',
      'The app will open in a standalone window'
    ]
  };
};

/**
 * Request persistent storage
 */
export const requestPersistentStorage = async () => {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    return isPersisted;
  }
  return false;
};

/**
 * Check storage quota
 */
export const checkStorageQuota = async () => {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const percentUsed = (estimate.usage / estimate.quota) * 100;
    
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentUsed: percentUsed.toFixed(2),
      usageInMB: (estimate.usage / (1024 * 1024)).toFixed(2),
      quotaInMB: (estimate.quota / (1024 * 1024)).toFixed(2)
    };
  }
  return null;
};

/**
 * Clear app cache
 */
export const clearAppCache = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    return true;
  }
  return false;
};

/**
 * Unregister service worker
 */
export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map(registration => registration.unregister())
    );
    return true;
  }
  return false;
};

/**
 * Check for app updates
 */
export const checkForUpdates = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return true;
    }
  }
  return false;
};

/**
 * Share content using Web Share API
 */
export const shareContent = async (data) => {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return { success: true };
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, error: 'Share cancelled' };
      }
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Web Share API not supported' };
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  return { success: false, error: 'Clipboard API not supported' };
};

/**
 * Vibrate device (if supported)
 */
export const vibrate = (pattern = 200) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
    return true;
  }
  return false;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

/**
 * Show local notification
 */
export const showNotification = async (title, options = {}) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options
      });
      return true;
    }
  }
  return false;
};

/**
 * Get network information
 */
export const getNetworkInfo = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }
  return null;
};

/**
 * Detect if user prefers reduced motion
 */
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
