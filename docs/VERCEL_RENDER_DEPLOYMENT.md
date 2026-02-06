# Vercel + Render Deployment Guide

Deploy your expense tracker with:
- **Vercel** - Frontend (React PWA) - Free tier
- **Render** - Backend (Node.js API) - Free tier
- **MongoDB Atlas** - Database - Free tier

## Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Render account (sign up at https://render.com)
4. MongoDB Atlas account (sign up at https://mongodb.com/cloud/atlas)

## Step 1: Setup MongoDB Atlas (Database)

### 1.1 Create Free Cluster

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free account
3. Create a new project: "Expense Tracker"
4. Click "Build a Database"
5. Choose **FREE** tier (M0 Sandbox)
6. Select a cloud provider and region (closest to you)
7. Cluster Name: `expense-tracker-cluster`
8. Click "Create"

### 1.2 Create Database User

1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Authentication Method: Password
4. Username: `expenseuser` (or your choice)
5. Password: Generate secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 1.3 Whitelist IP Addresses

1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.4 Get Connection String

1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Node.js, Version: 5.5 or later
5. Copy the connection string:
   ```
   mongodb+srv://expenseuser:<password>@expense-tracker-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name before the `?`:
   ```
   mongodb+srv://expenseuser:yourpassword@expense-tracker-cluster.xxxxx.mongodb.net/expense-tracker?retryWrites=true&w=majority
   ```

## Step 2: Setup Firebase (Authentication)

### 2.1 Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Project name: "Expense Tracker"
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2.2 Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Click "Save"

### 2.3 Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click web icon (</>)
4. App nickname: "Expense Tracker Web"
5. Check "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the Firebase configuration:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "expense-tracker-xxxxx.firebaseapp.com",
     projectId: "expense-tracker-xxxxx",
     storageBucket: "expense-tracker-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:xxxxx"
   };
   ```

## Step 3: Push Code to GitHub

### 3.1 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `expense-tracker`
3. Description: "Smart Expense Tracker - MERN Stack PWA"
4. Choose Public or Private
5. Don't initialize with README (you already have one)
6. Click "Create repository"

### 3.2 Push Your Code

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Expense Tracker"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Deploy Backend to Render

### 4.1 Connect GitHub to Render

1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Click "Connect GitHub" (if not connected)
4. Select your `expense-tracker` repository
5. Click "Connect"

### 4.2 Configure Web Service

**Basic Settings:**
- Name: `expense-tracker-api`
- Region: Oregon (US West) or closest to you
- Branch: `main`
- Root Directory: `server`
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`

**Plan:**
- Select **Free** plan

### 4.3 Add Environment Variables

Click "Advanced" and add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | Your MongoDB connection string from Step 1.4 |
| `JWT_SECRET` | Generate random string (use: https://randomkeygen.com/) |
| `GROQ_API_KEY` | Your GROQ API key (optional, for AI features) |
| `CLIENT_URL` | Leave empty for now (will add after Vercel deployment) |

### 4.4 Deploy

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Once deployed, copy your API URL:
   ```
   https://expense-tracker-api.onrender.com
   ```

**Important Notes:**
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Upgrade to paid plan ($7/month) to avoid sleep

## Step 5: Deploy Frontend to Vercel

### 5.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 5.2 Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Click "Import"

### 5.3 Configure Project

**Framework Preset:** Vite

**Root Directory:** `client`

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 5.4 Add Environment Variables

Click "Environment Variables" and add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://expense-tracker-api.onrender.com/api` |
| `VITE_FIREBASE_API_KEY` | From Firebase config (Step 2.3) |
| `VITE_FIREBASE_AUTH_DOMAIN` | From Firebase config |
| `VITE_FIREBASE_PROJECT_ID` | From Firebase config |
| `VITE_FIREBASE_STORAGE_BUCKET` | From Firebase config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | From Firebase config |
| `VITE_FIREBASE_APP_ID` | From Firebase config |

### 5.5 Deploy

1. Click "Deploy"
2. Wait for deployment (2-5 minutes)
3. Once deployed, you'll get a URL:
   ```
   https://expense-tracker-xxxxx.vercel.app
   ```

## Step 6: Update Backend with Frontend URL

1. Go back to Render dashboard
2. Select your `expense-tracker-api` service
3. Go to "Environment"
4. Update `CLIENT_URL` with your Vercel URL:
   ```
   https://expense-tracker-xxxxx.vercel.app
   ```
5. Click "Save Changes"
6. Service will automatically redeploy

## Step 7: Test Your Deployment

### 7.1 Test Backend

```bash
# Health check
curl https://expense-tracker-api.onrender.com/health

# Should return:
# {"status":"healthy","timestamp":"..."}
```

### 7.2 Test Frontend

1. Open your Vercel URL in browser
2. Try to register a new account
3. Login with your account
4. Add an expense
5. Check if data persists

### 7.3 Test PWA on Mobile

1. Open your Vercel URL on mobile browser
2. **Android (Chrome):**
   - Tap menu (⋮) → "Install app"
   - Or banner will appear automatically
3. **iOS (Safari):**
   - Tap Share button
   - Scroll down → "Add to Home Screen"
   - Tap "Add"

## Step 8: Custom Domain (Optional)

### 8.1 Add Domain to Vercel

1. In Vercel project settings
2. Go to "Domains"
3. Add your domain: `expensetracker.com`
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

### 8.2 Update Backend CORS

1. Go to Render dashboard
2. Update `CLIENT_URL` environment variable
3. Add your custom domain:
   ```
   https://expensetracker.com
   ```

## Deployment Commands

### Update Frontend

```bash
# Make changes to client code
git add .
git commit -m "Update frontend"
git push origin main

# Vercel auto-deploys on push
```

### Update Backend

```bash
# Make changes to server code
git add .
git commit -m "Update backend"
git push origin main

# Render auto-deploys on push
```

### Manual Deploy with Vercel CLI

```bash
cd client
vercel --prod
```

## Monitoring and Logs

### Vercel Logs

1. Go to Vercel dashboard
2. Select your project
3. Click "Deployments"
4. Click on a deployment
5. View "Build Logs" and "Function Logs"

### Render Logs

1. Go to Render dashboard
2. Select your service
3. Click "Logs" tab
4. View real-time logs

## Troubleshooting

### Backend Not Responding

**Issue:** API returns 503 or times out

**Solution:**
- Free tier sleeps after inactivity
- First request takes 30-60 seconds to wake up
- Upgrade to paid plan to avoid sleep

### CORS Errors

**Issue:** Frontend can't connect to backend

**Solution:**
1. Check `CLIENT_URL` in Render environment variables
2. Make sure it matches your Vercel URL exactly
3. Include `https://` protocol
4. Redeploy backend after changes

### MongoDB Connection Failed

**Issue:** Backend can't connect to database

**Solution:**
1. Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
2. Verify connection string in Render environment variables
3. Make sure password doesn't contain special characters (or URL encode them)
4. Check MongoDB Atlas cluster is running

### PWA Not Installing

**Issue:** Install prompt doesn't appear

**Solution:**
1. PWA requires HTTPS (Vercel provides this automatically)
2. Check all icons are present in `client/public/`
3. Generate icons: `.\scripts\generate-placeholder-icons.ps1`
4. Rebuild and redeploy
5. Clear browser cache and try again

### Environment Variables Not Working

**Issue:** App shows errors about missing config

**Solution:**
1. Make sure all environment variables start with `VITE_` for frontend
2. Redeploy after adding environment variables
3. Check for typos in variable names
4. Verify values don't have extra spaces

## Cost Breakdown

### Free Tier (Perfect for Testing)

- **Vercel:** Free
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  - Custom domains

- **Render:** Free
  - 750 hours/month
  - Sleeps after 15 min inactivity
  - 512 MB RAM
  - Shared CPU

- **MongoDB Atlas:** Free
  - 512 MB storage
  - Shared cluster
  - Perfect for development

**Total: $0/month**

### Production Tier (Recommended)

- **Vercel Pro:** $20/month
  - 1 TB bandwidth
  - Better performance
  - Team collaboration

- **Render Starter:** $7/month
  - No sleep
  - 512 MB RAM
  - Always available

- **MongoDB Atlas M10:** $0.08/hour (~$57/month)
  - 10 GB storage
  - Dedicated cluster
  - Better performance

**Total: ~$84/month**

## Performance Optimization

### 1. Enable Caching

Already configured in `vite.config.js` with Workbox

### 2. Optimize Images

```bash
# Install image optimizer
npm install -g sharp-cli

# Optimize images
cd client/public
sharp -i pwa-512x512.png -o pwa-512x512.png --webp
```

### 3. Enable Compression

Vercel and Render automatically compress responses

### 4. Use CDN

Vercel automatically uses CDN for static assets

## Security Best Practices

### 1. Environment Variables

- ✅ Never commit `.env` files
- ✅ Use different secrets for production
- ✅ Rotate JWT secrets regularly

### 2. CORS Configuration

- ✅ Only allow your frontend domain
- ✅ Don't use wildcard (*) in production

### 3. Rate Limiting

Already configured in `server/middleware/rateLimiter.js`

### 4. HTTPS

- ✅ Vercel provides automatic HTTPS
- ✅ Render provides automatic HTTPS

## Backup Strategy

### 1. MongoDB Atlas Backups

1. Go to MongoDB Atlas dashboard
2. Select your cluster
3. Go to "Backup" tab
4. Enable "Cloud Backup" (paid feature)

### 2. Manual Backups

```bash
# Export database
mongodump --uri="your-mongodb-uri" --out=./backup

# Import database
mongorestore --uri="your-mongodb-uri" ./backup
```

### 3. Code Backups

- ✅ GitHub automatically backs up your code
- ✅ Enable branch protection rules
- ✅ Use tags for releases

## CI/CD Pipeline

### Automatic Deployments

Both Vercel and Render automatically deploy when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push origin main

# Vercel and Render automatically deploy
```

### Preview Deployments

Vercel creates preview deployments for pull requests:

1. Create a new branch
2. Make changes
3. Push and create pull request
4. Vercel creates preview URL
5. Test before merging

## Monitoring

### 1. Vercel Analytics

1. Go to Vercel dashboard
2. Select your project
3. Go to "Analytics" tab
4. View page views, performance, etc.

### 2. Render Metrics

1. Go to Render dashboard
2. Select your service
3. View CPU, memory, and request metrics

### 3. MongoDB Atlas Monitoring

1. Go to MongoDB Atlas dashboard
2. Select your cluster
3. View "Metrics" tab
4. Monitor connections, operations, etc.

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com/
- **Firebase Docs:** https://firebase.google.com/docs

## Quick Reference

### Important URLs

```bash
# Frontend (Vercel)
https://your-app.vercel.app

# Backend (Render)
https://expense-tracker-api.onrender.com

# MongoDB Atlas
https://cloud.mongodb.com

# Firebase Console
https://console.firebase.google.com
```

### Environment Variables Checklist

**Frontend (Vercel):**
- [ ] VITE_API_URL
- [ ] VITE_FIREBASE_API_KEY
- [ ] VITE_FIREBASE_AUTH_DOMAIN
- [ ] VITE_FIREBASE_PROJECT_ID
- [ ] VITE_FIREBASE_STORAGE_BUCKET
- [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
- [ ] VITE_FIREBASE_APP_ID

**Backend (Render):**
- [ ] NODE_ENV
- [ ] PORT
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] GROQ_API_KEY (optional)
- [ ] CLIENT_URL

## Next Steps

1. ✅ Deploy and test your app
2. ✅ Generate proper PWA icons
3. ✅ Test on mobile devices
4. ✅ Add custom domain (optional)
5. ✅ Set up monitoring
6. ✅ Configure backups
7. ✅ Share with users!

---

**Congratulations! Your expense tracker is now live! 🎉**
