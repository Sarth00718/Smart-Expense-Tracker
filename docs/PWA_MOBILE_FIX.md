# PWA Mobile Fix Guide

## Issues Fixed

1. ✅ Service Worker not registering in main.jsx
2. ✅ Missing manifest link in index.html
3. ✅ Improved PWA configuration for mobile
4. ✅ Added proper iOS meta tags
5. ✅ Enhanced offline support

## What Changed

### 1. Service Worker Registration (main.jsx)
Added automatic service worker registration on app load.

### 2. Enhanced HTML Meta Tags (index.html)
- Added proper manifest link
- iOS-specific meta tags
- Theme color for light/dark mode
- Microsoft Tile configuration

### 3. Improved Vite PWA Config (vite.config.js)
- Changed to `registerType: 'prompt'` for better control
- Added `navigateFallback` for SPA routing
- Added app shortcuts
- Enhanced caching strategies

## Testing PWA on Mobile

### Android Testing

1. **Build the app:**
   ```bash
   cd client
   npm run build
   npm run preview
   ```

2. **Access from mobile:**
   - Find your computer's local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - On mobile browser, go to: `http://YOUR_IP:4173`

3. **Install PWA:**
   - Chrome will show "Add to Home Screen" banner
   - Or tap menu (⋮) → "Install app"

4. **Verify:**
   - App icon appears on home screen
   - Opens in standalone mode (no browser UI)
   - Works offline

### iOS Testing

1. **Build and serve:**
   ```bash
   cd client
   npm run build
   npm run preview
   ```

2. **Access from iPhone/iPad:**
   - Open Safari (must use Safari, not Chrome)
   - Go to: `http://YOUR_IP:4173`

3. **Install PWA:**
   - Tap Share button (square with arrow)
   - Scroll down and tap "Add to Home Screen"
   - Tap "Add"

4. **Verify:**
   - App icon on home screen
   - Opens without Safari UI
   - Status bar matches theme color

## Required: Generate PWA Icons

Your PWA needs proper icons. Here's how to create them:

### Option 1: Quick Online Tool (Easiest)

1. Go to https://realfavicongenerator.net/
2. Upload a square logo (512x512 minimum)
3. Download the generated icons
4. Place in `client/public/`:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `apple-touch-icon.png`
   - `favicon.ico`

### Option 2: Use PWA Asset Generator

```bash
cd client

# Install generator
npm install -g @vite-pwa/assets-generator

# Create a logo.svg in public folder first, then:
npx @vite-pwa/assets-generator --preset minimal public/logo.svg
```

### Option 3: Manual Creation

Create these files in `client/public/`:

1. **pwa-192x192.png** (192x192 pixels)
2. **pwa-512x512.png** (512x512 pixels)
3. **apple-touch-icon.png** (180x180 pixels)
4. **favicon.ico** (32x32 pixels)

Design tips:
- Use simple, recognizable design
- Good contrast
- Test at small sizes
- Add padding for maskable icons

### Temporary Placeholder Script

Run this PowerShell script to create basic placeholder icons:

```powershell
# Run from project root
.\scripts\generate-placeholder-icons.ps1
```

## Deployment Checklist

### Before Deploying to Production

- [ ] Generate proper PWA icons
- [ ] Test on Android device
- [ ] Test on iOS device (Safari)
- [ ] Verify offline functionality
- [ ] Test install prompt
- [ ] Check service worker registration
- [ ] Verify manifest.json is accessible
- [ ] Test on HTTPS (PWA requires HTTPS in production)

### Production Requirements

1. **HTTPS is MANDATORY**
   - PWA only works on HTTPS (or localhost)
   - Use CloudFront with SSL certificate
   - Or use Vercel/Netlify (automatic HTTPS)

2. **Proper Domain**
   - Custom domain recommended
   - Better for iOS installation

3. **Valid Icons**
   - All icon sizes present
   - Proper format (PNG)
   - Correct dimensions

## Troubleshooting

### PWA Not Installing on Android

**Check:**
```bash
# Open Chrome DevTools on desktop
# Connect Android device via USB
# Go to chrome://inspect
# Inspect your app
# Check Console for errors
```

**Common issues:**
- Missing icons
- Invalid manifest.json
- Not served over HTTPS
- Service worker errors

**Fix:**
```bash
# Rebuild with proper config
cd client
npm run build

# Check manifest
curl http://localhost:4173/manifest.webmanifest

# Check service worker
curl http://localhost:4173/sw.js
```

### PWA Not Installing on iOS

**Check:**
- Using Safari (not Chrome)
- Icons are present
- Manifest is valid
- HTTPS in production

**iOS Limitations:**
- No install prompt (manual only)
- Limited service worker support
- Must use Safari for installation
- Some PWA features not supported

### Service Worker Not Registering

**Check browser console:**
```javascript
// Open DevTools → Console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Registered SWs:', regs.length)
  regs.forEach(reg => console.log(reg.scope))
})
```

**Clear and re-register:**
```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister())
  location.reload()
})
```

### App Not Working Offline

**Check:**
1. Service worker registered
2. Cache populated
3. Network requests cached

**Debug:**
```javascript
// Check cache
caches.keys().then(names => console.log('Caches:', names))

// Check specific cache
caches.open('api-cache').then(cache => {
  cache.keys().then(keys => console.log('Cached URLs:', keys))
})
```

### Icons Not Showing

**Verify files exist:**
```bash
cd client/public
ls -la *.png *.ico
```

**Check manifest:**
```bash
# After build
cat dist/manifest.webmanifest
```

**Regenerate icons:**
```bash
# Use online tool or generator
# Place in client/public/
# Rebuild
npm run build
```

## Testing Commands

### Local Testing

```bash
# Development with PWA
cd client
npm run dev

# Production build
npm run build
npm run preview

# Check on mobile
# Go to http://YOUR_LOCAL_IP:4173
```

### Check PWA Score

```bash
# Install Lighthouse
npm install -g lighthouse

# Run audit
lighthouse http://localhost:4173 --view
```

### Verify Service Worker

```bash
# In browser DevTools
# Application tab → Service Workers
# Should show: "activated and is running"
```

## Production Deployment

### Deploy to Vercel (Easiest)

```bash
cd client

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

Vercel automatically provides:
- HTTPS
- Custom domain
- CDN
- Perfect for PWA

### Deploy to AWS (Your Setup)

```bash
# Build
cd client
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

**Important for AWS:**
- CloudFront must have SSL certificate
- Set proper MIME types for manifest
- Configure error pages for SPA routing

### S3 + CloudFront Configuration

Add to CloudFront:
```json
{
  "CustomErrorResponses": [
    {
      "ErrorCode": 404,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200",
      "ErrorCachingMinTTL": 300
    },
    {
      "ErrorCode": 403,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200",
      "ErrorCachingMinTTL": 300
    }
  ]
}
```

## Verification Steps

### 1. Check Manifest

```bash
# Should return JSON
curl https://your-domain.com/manifest.webmanifest
```

### 2. Check Service Worker

```bash
# Should return JavaScript
curl https://your-domain.com/sw.js
```

### 3. Check Icons

```bash
curl -I https://your-domain.com/pwa-192x192.png
# Should return: Content-Type: image/png
```

### 4. Lighthouse Audit

- Open Chrome DevTools
- Go to Lighthouse tab
- Select "Progressive Web App"
- Run audit
- Should score 90+ for PWA

## Common Errors and Solutions

### Error: "Service worker registration failed"

**Solution:**
```javascript
// Check in main.jsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .catch(err => console.error('SW Error:', err))
}
```

### Error: "Manifest not found"

**Solution:**
```html
<!-- Add to index.html -->
<link rel="manifest" href="/manifest.webmanifest" />
```

### Error: "Icons not loading"

**Solution:**
1. Verify files exist in `public/`
2. Check file names match manifest
3. Rebuild: `npm run build`

### Error: "Not installable"

**Checklist:**
- [ ] HTTPS enabled (or localhost)
- [ ] Valid manifest.json
- [ ] Icons present (192x192 and 512x512)
- [ ] Service worker registered
- [ ] start_url accessible

## Mobile-Specific Features

### Add to Home Screen Prompt

Already implemented in `PWAInstallPrompt.jsx`

### iOS Add to Home Screen Instructions

Already implemented with platform detection

### Offline Indicator

Already implemented in `OfflineIndicator.jsx`

### Update Prompt

Already implemented in `PWAUpdatePrompt.jsx`

## Performance Tips

1. **Optimize Images:**
   ```bash
   # Use WebP format
   # Compress PNGs
   # Lazy load images
   ```

2. **Cache Strategy:**
   - Static assets: CacheFirst
   - API calls: NetworkFirst
   - Images: CacheFirst with expiration

3. **Bundle Size:**
   ```bash
   # Analyze bundle
   npm run build -- --mode production
   
   # Check size
   ls -lh dist/assets/
   ```

## Next Steps

1. Generate proper icons
2. Test on real devices
3. Deploy to HTTPS
4. Run Lighthouse audit
5. Monitor PWA metrics

## Support Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
