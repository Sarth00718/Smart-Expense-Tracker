# PWA Setup Guide - Smart Expense Tracker

## Overview
Your expense tracker is now a Progressive Web App (PWA) with offline support and installability!

## Features Added

### 1. **Installable App**
- Users can install the app on their device (desktop, mobile, tablet)
- Works like a native app with its own icon and window
- Appears in app drawer/home screen

### 2. **Offline Support**
- App works without internet connection
- Caches static assets (HTML, CSS, JS, images)
- Stores pending transactions locally when offline
- Auto-syncs when connection is restored

### 3. **Service Worker**
- Handles caching strategies
- Background sync for pending data
- Network-first for API calls with fallback to cache

### 4. **Install Prompt**
- Smart install banner appears after user engagement
- Can be dismissed and reappears after 7 days
- Shows only on supported browsers

### 5. **Offline Indicator**
- Visual indicator when user goes offline
- "Back online" notification when connection restored

## Files Created

### Core PWA Files
```
client/
├── vite.config.js                          # PWA plugin configuration
├── index.html                              # PWA meta tags
├── public/
│   └── manifest.json                       # App manifest (auto-generated)
└── src/
    ├── components/ui/
    │   ├── PWAInstallPrompt.jsx           # Install banner component
    │   └── OfflineIndicator.jsx           # Offline status indicator
    └── utils/
        ├── pwaUtils.js                     # PWA utility functions
        └── offlineStorage.js               # IndexedDB for offline data
```

## How It Works

### Installation Flow
1. User visits the app on a supported browser
2. After some engagement, install prompt appears
3. User clicks "Install" → App installs to device
4. App opens in standalone window (no browser UI)

### Offline Flow
1. User goes offline → Offline indicator appears
2. User adds expense → Saved to IndexedDB
3. User comes back online → Auto-syncs pending data
4. Success notification shown

### Caching Strategy
- **Static Assets**: Cache-first (instant load)
- **API Calls**: Network-first with 10s timeout, fallback to cache
- **Fonts**: Cache-first with 1-year expiration

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Install | ✅ | ⚠️ | ✅ | ✅ |
| Offline | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |

⚠️ Firefox supports PWA but install prompt works differently

## Testing

### Test Installation
1. Run the app: `npm run dev`
2. Open Chrome DevTools → Application → Manifest
3. Click "Add to home screen" to test install

### Test Offline Mode
1. Open Chrome DevTools → Network
2. Select "Offline" from throttling dropdown
3. Try navigating the app
4. Add an expense (saved locally)
5. Go back online → Data syncs automatically

### Test Service Worker
1. Open Chrome DevTools → Application → Service Workers
2. Check if service worker is registered
3. View cached files in Cache Storage

## Icon Requirements

You need to create PWA icons. Place these in `client/public/`:

### Required Icons
- `pwa-192x192.png` - 192x192px (for Android)
- `pwa-512x512.png` - 512x512px (for Android, splash screen)
- `apple-touch-icon.png` - 180x180px (for iOS)
- `favicon.ico` - 32x32px (browser tab)

### Icon Design Tips
- Use your app's primary color (#4361ee)
- Include a recognizable symbol (💰 or 📊)
- Keep it simple and clear
- Test on both light and dark backgrounds

### Quick Icon Generation
Use online tools:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator
- https://favicon.io/

## Deployment

### Build for Production
```bash
cd client
npm run build
```

This generates:
- Optimized static files in `dist/`
- Service worker file
- Web manifest
- All PWA assets

### Deploy Checklist
- [ ] Icons created and placed in `public/`
- [ ] HTTPS enabled (required for PWA)
- [ ] Service worker registered
- [ ] Manifest linked in HTML
- [ ] Test on real devices

### HTTPS Requirement
PWAs require HTTPS in production. Most hosting platforms provide this:
- Vercel: Automatic HTTPS
- Netlify: Automatic HTTPS
- AWS S3 + CloudFront: Configure SSL certificate

## Usage Examples

### Check if App is Installed
```javascript
import { isPWA } from './utils/pwaUtils'

if (isPWA()) {
  console.log('Running as installed PWA')
}
```

### Save Data Offline
```javascript
import { savePendingExpense } from './utils/offlineStorage'

// When offline
await savePendingExpense({
  date: '2024-01-15',
  category: 'Food',
  amount: 50,
  description: 'Lunch'
})
```

### Sync When Online
```javascript
import { syncPendingData } from './utils/offlineStorage'
import { expenseService, incomeService } from './services'

window.addEventListener('online', async () => {
  const results = await syncPendingData(expenseService, incomeService)
  console.log('Synced:', results)
})
```

## Customization

### Change Theme Color
Edit `vite.config.js`:
```javascript
manifest: {
  theme_color: '#your-color',
  background_color: '#your-color'
}
```

### Adjust Cache Duration
Edit `vite.config.js` → `workbox.runtimeCaching`:
```javascript
expiration: {
  maxAgeSeconds: 60 * 60 * 24 // 1 day
}
```

### Add More Shortcuts
Edit `public/manifest.json`:
```json
"shortcuts": [
  {
    "name": "View Budgets",
    "url": "/dashboard/budgets",
    "icons": [{ "src": "/pwa-192x192.png", "sizes": "192x192" }]
  }
]
```

## Troubleshooting

### Install Prompt Not Showing
- Check if already installed
- Ensure HTTPS (or localhost)
- User must engage with site first
- Check browser console for errors

### Service Worker Not Registering
- Check browser console
- Verify HTTPS
- Clear cache and reload
- Check `vite.config.js` configuration

### Offline Mode Not Working
- Verify service worker is active
- Check Network tab in DevTools
- Ensure API calls are being cached
- Check IndexedDB for stored data

### Icons Not Appearing
- Verify icon paths in manifest
- Check file sizes match requirements
- Clear browser cache
- Test on different devices

## Performance

### Lighthouse Scores
Run Lighthouse audit in Chrome DevTools:
- Performance: 90+
- PWA: 100
- Accessibility: 90+
- Best Practices: 90+

### Optimization Tips
- Icons are cached on first load
- Service worker caches all static assets
- API responses cached for 5 minutes
- IndexedDB for offline data storage

## Next Steps

### Recommended Enhancements
1. **Push Notifications** - Remind users about bills
2. **Background Sync** - Sync data even when app is closed
3. **Share Target** - Share receipts to the app
4. **Periodic Background Sync** - Auto-refresh data
5. **App Shortcuts** - Quick actions from home screen

### Advanced Features
```javascript
// Push notifications
import { requestNotificationPermission, showNotification } from './utils/pwaUtils'

const { success } = await requestNotificationPermission()
if (success) {
  await showNotification('Budget Alert', {
    body: 'You've spent 80% of your food budget',
    icon: '/pwa-192x192.png'
  })
}
```

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox Guide](https://developers.google.com/web/tools/workbox)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## Support

For issues or questions:
1. Check browser console for errors
2. Review service worker status in DevTools
3. Test on different browsers/devices
4. Check network conditions

---

**Your app is now a fully functional PWA! 🎉**

Users can install it, use it offline, and enjoy a native app-like experience.
