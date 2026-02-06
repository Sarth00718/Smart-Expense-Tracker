import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useState, useEffect } from 'react';

const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    if (isOnline && !navigator.onLine) {
      // Just came back online
      setShowOnlineMessage(true);
      const timer = setTimeout(() => setShowOnlineMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (isOnline && !showOnlineMessage) return null;

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
        </>
      ) : (
        <>
          <WifiOff size={18} />
          <span className="text-sm font-medium">You're offline</span>
        </>
      )}
    </div>
  );
};

export default OfflineIndicator;
