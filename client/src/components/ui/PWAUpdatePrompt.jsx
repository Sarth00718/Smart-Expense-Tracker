import { useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PWAUpdatePrompt = () => {
  const [dismissed, setDismissed] = useState(false);
  
  const {
    needRefresh,
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered() {
      // Service worker registered
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const handleUpdate = async () => {
    try {
      await updateServiceWorker(true);
      // Force reload after service worker update
      window.location.reload();
    } catch (error) {
      console.error('Error updating service worker:', error);
      // Fallback: force reload anyway
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!needRefresh || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 md:w-96 bg-gray-900 text-white rounded-lg shadow-2xl p-4 z-[9999] animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <RefreshCw className="text-white" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">
            New version available
          </h3>
          <p className="text-sm text-gray-300 mb-3">
            Click reload to update to the latest version
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Reload
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
