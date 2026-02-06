# PWA Icon Generation Guide

## Required Icons

You need to create the following icons in the `client/public` folder:

1. **pwa-192x192.png** - 192x192 pixels
2. **pwa-512x512.png** - 512x512 pixels
3. **apple-touch-icon.png** - 180x180 pixels
4. **favicon.ico** - 32x32 pixels

## Quick Generation Options

### Option 1: Using Online Tools
1. Visit https://realfavicongenerator.net/
2. Upload your logo/icon (minimum 512x512 recommended)
3. Download the generated icons
4. Place them in the `client/public` folder

### Option 2: Using PWA Asset Generator
```bash
npx @vite-pwa/assets-generator --preset minimal public/logo.svg
```

### Option 3: Manual Creation
Use any image editor (Photoshop, GIMP, Figma, etc.) to create:
- A square logo with your app branding
- Export in the required sizes
- Ensure good contrast and visibility at small sizes

## Icon Design Tips
- Use simple, recognizable designs
- Ensure good contrast
- Test at different sizes
- Consider both light and dark backgrounds
- Add padding (safe zone) for maskable icons

## Temporary Placeholder
For now, you can use a colored square as a placeholder:
- Background: #4361ee (your theme color)
- Text: "ET" or your app initials
- White text on blue background
