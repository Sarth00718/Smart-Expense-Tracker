import { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  RefreshCw, 
  Trash2, 
  Database,
  Wifi,
  Bell,
  Share2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card } from '../../ui/Card';
import toast from 'react-hot-toast';
import {
  isStandalone,
  checkStorageQuota,
  clearAppCache,
  checkForUpdates,
  requestNotificationPermission,
  shareContent,
  getNetworkInfo,
  getInstallInstructions
} from '../../../utils/pwaUtils';

const PWASettings = () => {
  const [isPWA, setIsPWA] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    setIsPWA(isStandalone());
    loadStorageInfo();
    loadNetworkInfo();
    
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadStorageInfo = async () => {
    const info = await checkStorageQuota();
    setStorageInfo(info);
  };

  const loadNetworkInfo = () => {
    const info = getNetworkInfo();
    setNetworkInfo(info);
  };

  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear the app cache? This will remove offline data.')) {
      const success = await clearAppCache();
      if (success) {
        toast.success('Cache cleared successfully');
        loadStorageInfo();
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error('Failed to clear cache');
      }
    }
  };

  const handleCheckUpdates = async () => {
    toast.loading('Checking for updates...');
    const success = await checkForUpdates();
    toast.dismiss();
    
    if (success) {
      toast.success('App is up to date');
    } else {
      toast.error('Could not check for updates');
    }
  };

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      toast.success('Notifications enabled');
    } else {
      toast.error('Notifications denied');
    }
  };

  const handleShare = async () => {
    const result = await shareContent({
      title: 'Smart Expense Tracker',
      text: 'Track your expenses with AI-powered insights',
      url: window.location.origin
    });

    if (result.success) {
      toast.success('Shared successfully');
    } else if (result.error !== 'Share cancelled') {
      toast.error(result.error);
    }
  };

  const installInstructions = getInstallInstructions();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">PWA Settings</h2>
        <p className="text-gray-600">Manage Progressive Web App features</p>
      </div>

      {/* Installation Status */}
      <Card>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${isPWA ? 'bg-green-100' : 'bg-blue-100'}`}>
            <Smartphone className={isPWA ? 'text-green-600' : 'text-blue-600'} size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Installation Status</h3>
            <div className="flex items-center gap-2 mb-2">
              {isPWA ? (
                <>
                  <CheckCircle className="text-green-600" size={18} />
                  <span className="text-green-600 font-medium">Installed as PWA</span>
                </>
              ) : (
                <>
                  <XCircle className="text-gray-400" size={18} />
                  <span className="text-gray-600">Running in browser</span>
                </>
              )}
            </div>
            {!isPWA && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Install for better experience:
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  {installInstructions.steps.map((step, index) => (
                    <li key={index}>• {step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Connection Status */}
      <Card>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
            <Wifi className={isOnline ? 'text-green-600' : 'text-red-600'} size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Connection Status</h3>
            <div className="flex items-center gap-2 mb-2">
              {isOnline ? (
                <span className="text-green-600 font-medium">Online</span>
              ) : (
                <span className="text-red-600 font-medium">Offline</span>
              )}
            </div>
            {networkInfo && (
              <div className="text-sm text-gray-600 space-y-1">
                <p>Connection: {networkInfo.effectiveType?.toUpperCase()}</p>
                <p>Speed: {networkInfo.downlink} Mbps</p>
                {networkInfo.saveData && (
                  <p className="text-orange-600">Data Saver: Enabled</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Storage Info */}
      {storageInfo && (
        <Card>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <Database className="text-purple-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Storage Usage</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Used</span>
                  <span className="font-medium">{storageInfo.usageInMB} MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available</span>
                  <span className="font-medium">{storageInfo.quotaInMB} MB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${storageInfo.percentUsed}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {storageInfo.percentUsed}% used
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications */}
      <Card>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${
            notificationPermission === 'granted' ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Bell className={
              notificationPermission === 'granted' ? 'text-green-600' : 'text-gray-600'
            } size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Notifications</h3>
            <p className="text-sm text-gray-600 mb-3">
              Status: {notificationPermission === 'granted' ? 'Enabled' : 'Disabled'}
            </p>
            {notificationPermission !== 'granted' && (
              <button
                onClick={handleRequestNotifications}
                className="btn btn-primary text-sm"
              >
                Enable Notifications
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">App Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleCheckUpdates}
            className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <RefreshCw size={20} className="text-blue-600" />
            <span className="font-medium">Check for Updates</span>
          </button>

          <button
            onClick={handleClearCache}
            className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={20} className="text-red-600" />
            <span className="font-medium">Clear Cache</span>
          </button>

          {navigator.share && (
            <button
              onClick={handleShare}
              className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <Share2 size={20} className="text-green-600" />
              <span className="font-medium">Share App</span>
            </button>
          )}
        </div>
      </Card>

      {/* Info */}
      <Card>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Progressive Web App (PWA)</strong> features allow this app to work offline,
            load faster, and provide a native app-like experience.
          </p>
          <p>
            Install the app on your device for quick access and better performance.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PWASettings;
