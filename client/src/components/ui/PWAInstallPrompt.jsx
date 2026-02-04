import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import { installPWA, setInstallPrompt, isPWA } from '../../utils/pwaUtils'
import toast from 'react-hot-toast'

const PWAInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Don't show if already installed as PWA
    if (isPWA()) {
      return
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return
      }
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    setIsInstalling(true)
    
    const result = await installPWA()
    
    if (result.success) {
      toast.success('App installed successfully!')
      setShowPrompt(false)
    } else {
      toast.error(result.error || 'Failed to install app')
    }
    
    setIsInstalling(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    setShowPrompt(false)
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Install App
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Install Smart Expense Tracker for quick access and offline support
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInstalling ? 'Installing...' : 'Install'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default PWAInstallPrompt
