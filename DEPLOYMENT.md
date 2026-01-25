# Deployment Guide

## Backend Deployment (Render)

### Step 1: Prepare Your Repository
Your code is already pushed to GitHub. Make sure the latest changes are committed.

### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `Sarth00718/Smart-Expense-Tracker`
4. Configure the service:
   - **Name**: `expense-tracker-api`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://sarthnarola007:YOUR_NEW_PASSWORD@cluster0.f0fr2sn.mongodb.net/expense-tracker
   JWT_SECRET=your-new-super-secret-jwt-key-here-make-it-long-and-random
   GROQ_API_KEY=your-new-groq-api-key
   CLIENT_URL=https://your-app.vercel.app
   ```

6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. Copy your Render URL (e.g., `https://expense-tracker-api.onrender.com`)

### Important Notes:
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Upgrade to paid plan for always-on service

---

## Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `Sarth00718/Smart-Expense-Tracker`
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-render-url.onrender.com/api
   ```
   (Replace with your actual Render URL from Step 2)

6. Click **"Deploy"**
7. Wait for deployment (2-3 minutes)
8. Your app will be live at `https://your-app.vercel.app`

### Step 2: Update Backend CORS

Go back to Render and update the `CLIENT_URL` environment variable with your Vercel URL:
```
CLIENT_URL=https://your-app.vercel.app
```

Then manually redeploy the backend service.

---

## Post-Deployment Checklist

### ✅ Security
- [ ] Rotate MongoDB password (exposed in Git history)
- [ ] Generate new JWT_SECRET
- [ ] Generate new GROQ_API_KEY
- [ ] Update all environment variables in Render

### ✅ Testing
- [ ] Test user registration
- [ ] Test user login
- [ ] Test expense creation
- [ ] Test budget features
- [ ] Test AI assistant
- [ ] Test receipt scanner

### ✅ MongoDB Atlas Configuration
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to **Network Access**
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click **"Confirm"**

---

## Troubleshooting

### Backend Issues
- **500 Error**: Check Render logs for MongoDB connection issues
- **CORS Error**: Verify CLIENT_URL matches your Vercel domain
- **Slow Response**: Free tier sleeps - first request is slow

### Frontend Issues
- **API Connection Failed**: Check VITE_API_URL is correct
- **Build Failed**: Ensure all dependencies are in package.json
- **404 on Refresh**: Vercel handles this automatically with SPA

### Common Fixes
```bash
# If build fails, test locally first
cd client
npm install
npm run build

# Check for errors
cd ../server
npm install
npm start
```

---

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Render
1. Go to Service Settings → Custom Domain
2. Add your domain
3. Update DNS CNAME record

---

## Monitoring

### Render
- View logs: Dashboard → Your Service → Logs
- Monitor metrics: Dashboard → Your Service → Metrics

### Vercel
- View deployments: Dashboard → Your Project → Deployments
- Check analytics: Dashboard → Your Project → Analytics

---

## Cost Optimization

### Free Tier Limits
- **Render**: 750 hours/month, sleeps after 15 min inactivity
- **Vercel**: 100 GB bandwidth, unlimited deployments
- **MongoDB Atlas**: 512 MB storage

### Upgrade When Needed
- Render: $7/month for always-on
- Vercel: $20/month for team features
- MongoDB: $9/month for 2GB storage
