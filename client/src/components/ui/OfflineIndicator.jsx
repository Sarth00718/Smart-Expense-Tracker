import { WifiOff, Wifi, Clock } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useState, useEffect } from 'react';
import offlineQueue from '../../utils/offlineQueue';

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    // Update queue size
    const updateQueueSize = () => {
      setQueueSize(offlineQueue.getQueueSize());
    };

    updateQueueSize();
    const interval = setInterval(updateQueueSize, 1000);

    if (isOnline && !navigator.onLine) {
      // Just came back online
      setShowOnlineMessage(true);
      const timer = setTimeout(() => setShowOnlineMessage(false), 3000);
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }

    return () => clearInterval(interval);
  }, [isOnline]);

  if (isOnline && !showOnlineMessage && queueSize === 0) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi size={18} />
          <span className="text-sm font-medium">Back online</span>
          {queueSize > 0 && (
            <span className="text-xs bg-white/20 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
              Syncing {queueSize}...
            </span>
          )}
        </>
      ) : (
        <>
          <WifiOff size={18} />
          <span className="text-sm font-medium">You're offline</span>
          {queueSize > 0 && (
            <>
              <Clock size={16} />
              <span className="text-xs">{queueSize} pending</span>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;
