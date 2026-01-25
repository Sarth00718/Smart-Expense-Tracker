# How to Update CLIENT_URL in Render (Step-by-Step)

## 📋 When to Do This

After you deploy your frontend to Vercel and get your Vercel URL (e.g., `https://expense-tracker.vercel.app`), you need to update your backend on Render to allow requests from that URL.

---

## 🔧 Step-by-Step Instructions

### Step 1: Get Your Vercel URL

After deploying to Vercel, you'll see a URL like:
```
https://expense-tracker-abc123.vercel.app
```
or
```
https://your-custom-domain.vercel.app
```

**Copy this URL** - you'll need it in the next steps.

---

### Step 2: Go to Render Dashboard

1. Open your browser
2. Go to: https://dashboard.render.com/
3. Log in to your account

---

### Step 3: Find Your Backend Service

1. You'll see a list of your services
2. Look for your backend service (e.g., "expense-tracker-api")
3. **Click on the service name** to open it

---

### Step 4: Open Environment Settings

1. On the left sidebar, you'll see several tabs:
   - Overview
   - Events
   - Logs
   - Metrics
   - **Environment** ← Click this one
   - Settings
   - etc.

2. **Click on "Environment"**

---

### Step 5: Find CLIENT_URL Variable

1. You'll see a list of all your environment variables:
   ```
   NODE_ENV = production
   PORT = 5000
   MONGODB_URI = mongodb+srv://...
   JWT_SECRET = your-secret...
   GROQ_API_KEY = gsk_...
   CLIENT_URL = http://localhost:3000  ← This one needs updating
   ```

2. Find the **CLIENT_URL** variable

---

### Step 6: Edit CLIENT_URL

1. Click the **pencil/edit icon** next to CLIENT_URL
   - OR click on the CLIENT_URL row

2. You'll see a text field with the current value:
   ```
   http://localhost:3000
   ```

3. **Delete** the old value

4. **Paste** your Vercel URL (from Step 1):
   ```
   https://expense-tracker-abc123.vercel.app
   ```

5. **Important**: 
   - ✅ Include `https://`
   - ✅ NO trailing slash at the end
   - ❌ Don't add `/api` or any path

---

### Step 7: Save Changes

1. Click the **"Save Changes"** button at the bottom
   - OR click the checkmark icon next to the field

2. You'll see a notification:
   ```
   "Environment variables updated"
   ```

---

### Step 8: Wait for Auto-Redeploy

1. Render will **automatically redeploy** your service
   - This happens within seconds

2. You'll see in the "Events" tab:
   ```
   Deploy triggered by environment variable change
   Building...
   Deploying...
   Live ✓
   ```

3. Wait 2-3 minutes for the deployment to complete

---

### Step 9: Verify the Update

1. Go to the **"Environment"** tab again

2. Check that CLIENT_URL now shows:
   ```
   CLIENT_URL = https://expense-tracker-abc123.vercel.app
   ```

3. Go to **"Logs"** tab and look for:
   ```
   🚀 Server running on port 5000
   📊 Environment: production
   ✅ MongoDB Connected
   ```

---

## ✅ You're Done!

Your backend now accepts requests from your Vercel frontend.

---

## 🧪 Test the Connection

1. Open your Vercel URL in a browser:
   ```
   https://expense-tracker-abc123.vercel.app
   ```

2. Try to:
   - Register a new account
   - Login
   - Add an expense

3. If everything works, you're all set! 🎉

---

## 🐛 Troubleshooting

### Issue: CORS Error in Browser Console

**Error message:**
```
Access to XMLHttpRequest at 'https://your-api.onrender.com/api/auth/login' 
from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

**Solution:**
1. Check CLIENT_URL in Render matches your Vercel URL exactly
2. Make sure there's no trailing slash
3. Verify the service redeployed successfully
4. Wait 2-3 minutes and try again

---

### Issue: Service Not Redeploying

**Solution:**
1. Go to Render Dashboard
2. Click your service
3. Click **"Manual Deploy"** button (top right)
4. Select "Clear build cache & deploy"
5. Wait for deployment to complete

---

### Issue: Still Shows localhost:3000

**Solution:**
1. Hard refresh your browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Try in incognito/private window

---

## 📸 Visual Guide Summary

```
Render Dashboard
    ↓
Click Your Service
    ↓
Click "Environment" Tab (left sidebar)
    ↓
Find "CLIENT_URL" variable
    ↓
Click Edit Icon (pencil)
    ↓
Replace with: https://your-vercel-url.vercel.app
    ↓
Click "Save Changes"
    ↓
Wait 2-3 minutes for auto-redeploy
    ↓
Done! ✓
```

---

## 🔄 If You Change Your Vercel Domain Later

Just repeat these steps with the new URL. Render will auto-redeploy again.

---

## 💡 Pro Tips

1. **Bookmark your Render service URL** for quick access
2. **Keep both tabs open** (Render + Vercel) during deployment
3. **Check Render logs** if something doesn't work
4. **Free tier sleeps** after 15 min - first request takes 30-60 seconds

---

## 📞 Need More Help?

- Check Render logs: Dashboard → Your Service → Logs
- Check browser console: F12 → Console tab
- Verify environment variables: Dashboard → Your Service → Environment
