import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOnlineMessage, setShowOnlineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOnlineMessage(true)
      
      // Hide the "back online" message after 3 seconds
      setTimeout(() => {
        setShowOnlineMessage(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOnlineMessage(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Don't show anything if online and not showing the "back online" message
  if (isOnline && !showOnlineMessage) {
    return null
  }

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-down ${
      isOnline ? 'animate-fade-out' : ''
    }`}>
      <div className={`flex items-center gap-3 px-5 py-3 rounded-full shadow-lg ${
        isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-gray-900 text-white'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5" />
            <span className="font-medium">Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">You're offline</span>
          </>
        )}
      </div>
    </div>
  )
}

export default OfflineIndicator
