// PWA Utility Functions

/**
 * Check if the app is running as a PWA
 */
export const isPWA = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  )
}

/**
 * Check if the app is installable
 */
export const isInstallable = () => {
  return 'BeforeInstallPromptEvent' in window
}

/**
 * Check if the browser is online
 */
export const isOnline = () => {
  return navigator.onLine
}

/**
 * Get PWA install prompt
 */
let deferredPrompt = null

export const setInstallPrompt = (prompt) => {
  deferredPrompt = prompt
}

export const getInstallPrompt = () => {
  return deferredPrompt
}

export const clearInstallPrompt = () => {
  deferredPrompt = null
}

/**
 * Trigger PWA installation
 */
export const installPWA = async () => {
  if (!deferredPrompt) {
    return { success: false, error: 'No install prompt available' }
  }

  try {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      clearInstallPrompt()
      return { success: true }
    } else {
      return { success: false, error: 'User dismissed the install prompt' }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Check if service worker is supported
 */
export const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator
}

/**
 * Get service worker registration
 */
export const getServiceWorkerRegistration = async () => {
  if (!isServiceWorkerSupported()) {
    return null
  }

  try {
    return await navigator.serviceWorker.ready
  } catch (error) {
    console.error('Error getting service worker registration:', error)
    return null
  }
}

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return { success: false, error: 'Notifications not supported' }
  }

  try {
    const permission = await Notification.requestPermission()
    return { success: permission === 'granted', permission }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Show notification
 */
export const showNotification = async (title, options = {}) => {
  if (!('Notification' in window)) {
    return { success: false, error: 'Notifications not supported' }
  }

  if (Notification.permission !== 'granted') {
    return { success: false, error: 'Notification permission not granted' }
  }

  try {
    const registration = await getServiceWorkerRegistration()
    
    if (registration) {
      await registration.showNotification(title, {
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        ...options
      })
    } else {
      new Notification(title, options)
    }
    
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
