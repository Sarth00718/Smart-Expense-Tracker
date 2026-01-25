# Complete Deployment Walkthrough (Beginner-Friendly)

## 🎯 Overview

You'll deploy in this order:
1. **Backend to Render** (5 minutes)
2. **Frontend to Vercel** (3 minutes)  
3. **Update Backend with Frontend URL** (2 minutes)
4. **Configure MongoDB** (1 minute)

Total time: ~15 minutes

---

## 🚀 PART 1: Deploy Backend to Render

### Step 1.1: Go to Render

1. Open browser and go to: https://render.com/
2. Click **"Get Started"** or **"Sign In"**
3. Sign up/login with GitHub (recommended)

### Step 1.2: Create New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. You'll see "Create a new Web Service" page

### Step 1.3: Connect Your Repository

1. Click **"Connect account"** if you haven't connected GitHub
2. Find your repository: `Sarth00718/Smart-Expense-Tracker`
3. Click **"Connect"** next to it

### Step 1.4: Configure the Service

Fill in these fields:

**Name:**
```
expense-tracker-api
```
(or any name you prefer)

**Region:**
```
Oregon (US West)
```
(or closest to you)

**Branch:**
```
main
```

**Root Directory:**
```
server
```
⚠️ **IMPORTANT**: Must be `server` (lowercase)

**Runtime:**
```
Node
```
(should auto-detect)

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

**Instance Type:**
```
Free
```

### Step 1.5: Add Environment Variables

Scroll down to **"Environment Variables"** section.

Click **"Add Environment Variable"** and add these **one by one**:

**Variable 1:**
```
Key: NODE_ENV
Value: production
```

**Variable 2:**
```
Key: PORT
Value: 5000
```

**Variable 3:**
```
Key: MONGODB_URI
Value: mongodb+srv://sarthnarola007:YOUR_NEW_PASSWORD@cluster0.f0fr2sn.mongodb.net/expense-tracker
```
⚠️ Replace `YOUR_NEW_PASSWORD` with your actual MongoDB password
⚠️ Make sure `/expense-tracker` is at the end (database name)

**Variable 4:**
```
Key: JWT_SECRET
Value: [Generate a new one - see below]
```

**To generate JWT_SECRET:**
- Open terminal/PowerShell
- Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- Copy the output and paste as value

**Variable 5:**
```
Key: GROQ_API_KEY
Value: YOUR_NEW_GROQ_API_KEY
```
⚠️ Get a new key from GROQ dashboard (revoke the old one first)

**Variable 6:**
```
Key: CLIENT_URL
Value: http://localhost:3000
```
⚠️ We'll update this later with your Vercel URL

### Step 1.6: Deploy!

1. Click **"Create Web Service"** button at the bottom
2. Render will start building your app
3. You'll see logs scrolling:
   ```
   ==> Cloning from https://github.com/Sarth00718/Smart-Expense-Tracker...
   ==> Checking out commit...
   ==> Running build command 'npm install'...
   ==> Starting service with 'npm start'...
   ```

4. Wait 3-5 minutes for deployment to complete

5. When you see **"Live"** with a green checkmark ✓, it's deployed!

### Step 1.7: Copy Your Render URL

At the top of the page, you'll see your service URL:
```
https://expense-tracker-api-xyz.onrender.com
```

**📋 COPY THIS URL** - you'll need it for Vercel!

---

## 🎨 PART 2: Deploy Frontend to Vercel

### Step 2.1: Go to Vercel

1. Open browser and go to: https://vercel.com/
2. Click **"Sign Up"** or **"Login"**
3. Sign up/login with GitHub (recommended)

### Step 2.2: Create New Project

1. Click **"Add New..."** button (top right)
2. Select **"Project"**
3. You'll see "Import Git Repository" page

### Step 2.3: Import Your Repository

1. Find your repository: `Sarth00718/Smart-Expense-Tracker`
2. Click **"Import"** next to it
3. You'll see "Configure Project" page

### Step 2.4: Configure the Project

**Framework Preset:**
```
Vite
```
(should auto-detect)

**Root Directory:**
1. Click **"Edit"** next to Root Directory
2. Select **"client"** folder
3. Click **"Continue"**

**Build and Output Settings:**
- Build Command: `npm run build` (auto-filled)
- Output Directory: `dist` (auto-filled)
- Install Command: `npm install` (auto-filled)

### Step 2.5: Add Environment Variable

1. Click **"Environment Variables"** dropdown to expand
2. Add this variable:

```
Name: VITE_API_URL
Value: https://expense-tracker-api-xyz.onrender.com/api
```

⚠️ **IMPORTANT**: 
- Replace with YOUR Render URL from Step 1.7
- Add `/api` at the end
- Include `https://`

### Step 2.6: Deploy!

1. Click **"Deploy"** button
2. Vercel will start building:
   ```
   Building...
   Deploying...
   ```

3. Wait 2-3 minutes

4. When you see **"Congratulations!"** with confetti 🎉, it's deployed!

### Step 2.7: Copy Your Vercel URL

You'll see your deployment URL:
```
https://expense-tracker-abc123.vercel.app
```

**📋 COPY THIS URL** - you'll need it for the next step!

---

## 🔄 PART 3: Update Backend with Frontend URL

Now we need to tell the backend to accept requests from your Vercel frontend.

### Step 3.1: Go Back to Render

1. Go to: https://dashboard.render.com/
2. Click on your service: **"expense-tracker-api"**

### Step 3.2: Open Environment Tab

1. On the left sidebar, click **"Environment"**
2. You'll see all your environment variables

### Step 3.3: Update CLIENT_URL

1. Find the **CLIENT_URL** variable (currently shows `http://localhost:3000`)
2. Click the **pencil icon** (edit) next to it
3. Delete the old value
4. Paste your Vercel URL from Step 2.7:
   ```
   https://expense-tracker-abc123.vercel.app
   ```
5. ⚠️ **NO trailing slash** at the end
6. Click **"Save Changes"**

### Step 3.4: Wait for Auto-Redeploy

1. Render will automatically redeploy (you'll see a notification)
2. Go to **"Events"** tab to watch progress
3. Wait 2-3 minutes until you see **"Live"** ✓

---

## 🗄️ PART 4: Configure MongoDB Atlas

### Step 4.1: Go to MongoDB Atlas

1. Go to: https://cloud.mongodb.com/
2. Log in to your account

### Step 4.2: Allow All IP Addresses

1. Click **"Network Access"** in the left sidebar
2. Click **"Add IP Address"** button
3. Click **"Allow Access from Anywhere"**
4. You'll see: `0.0.0.0/0` (allows all IPs)
5. Click **"Confirm"**

⚠️ This is needed because Render uses dynamic IPs

### Step 4.3: Verify Database User

1. Click **"Database Access"** in the left sidebar
2. Make sure user `sarthnarola007` exists
3. If you changed the password, verify it's updated

---

## ✅ PART 5: Test Your Deployment

### Step 5.1: Open Your App

1. Go to your Vercel URL:
   ```
   https://expense-tracker-abc123.vercel.app
   ```

### Step 5.2: Test Registration

1. Click **"Register"** or **"Sign Up"**
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: Test123!
3. Click **"Register"**
4. You should be redirected to the dashboard

### Step 5.3: Test Adding Expense

1. Click **"Add Expense"** or **"Expenses"**
2. Add a test expense:
   - Amount: 50
   - Category: Food
   - Description: Lunch
3. Click **"Save"**
4. Expense should appear in the list

### Step 5.4: Check Dashboard

1. Go to **"Dashboard"**
2. You should see:
   - Total expenses
   - Charts
   - Recent transactions

---

## 🎉 Success!

If all tests pass, your app is fully deployed and working!

---

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch" or Network Error

**Cause:** Backend is sleeping (free tier) or wrong API URL

**Solution:**
1. Wait 30-60 seconds (backend waking up)
2. Check `VITE_API_URL` in Vercel environment variables
3. Make sure it ends with `/api`

### Issue 2: CORS Error

**Cause:** CLIENT_URL in Render doesn't match Vercel URL

**Solution:**
1. Go to Render → Environment
2. Verify CLIENT_URL matches your Vercel URL exactly
3. No trailing slash
4. Redeploy if needed

### Issue 3: MongoDB Connection Error

**Cause:** IP not whitelisted or wrong credentials

**Solution:**
1. MongoDB Atlas → Network Access → Allow 0.0.0.0/0
2. Check MONGODB_URI has correct password
3. Make sure database name is included: `/expense-tracker`

### Issue 4: 404 Not Found

**Cause:** Wrong root directory or build failed

**Solution:**
1. Vercel: Check root directory is `client`
2. Render: Check root directory is `server`
3. Check deployment logs for errors

---

## 📊 Monitoring Your App

### Check Backend Logs (Render)
1. Render Dashboard → Your Service → **"Logs"**
2. Look for errors or connection issues

### Check Frontend Logs (Vercel)
1. Vercel Dashboard → Your Project → **"Deployments"**
2. Click on latest deployment → **"View Function Logs"**

### Check Browser Console
1. Open your app
2. Press **F12** (Windows) or **Cmd+Option+I** (Mac)
3. Go to **"Console"** tab
4. Look for errors

---

## 🔒 Security Reminder

After deployment, make sure you:
- ✅ Rotated MongoDB password
- ✅ Generated new JWT_SECRET
- ✅ Generated new GROQ_API_KEY
- ✅ Never commit `.env` files to Git

---

## 📞 Need Help?

If something doesn't work:
1. Check the logs (Render + Vercel + Browser Console)
2. Verify all environment variables are correct
3. Make sure MongoDB allows all IPs
4. Wait a few minutes and try again (services need time to start)

---

## 🎯 Quick Reference

**Your URLs:**
- Backend: `https://expense-tracker-api-xyz.onrender.com`
- Frontend: `https://expense-tracker-abc123.vercel.app`
- MongoDB: `mongodb+srv://sarthnarola007:password@cluster0.f0fr2sn.mongodb.net/expense-tracker`

**Important Settings:**
- Render Root Directory: `server`
- Vercel Root Directory: `client`
- CLIENT_URL: Your Vercel URL (no trailing slash)
- VITE_API_URL: Your Render URL + `/api`

---

Congratulations! Your Smart Expense Tracker is now live! 🚀
