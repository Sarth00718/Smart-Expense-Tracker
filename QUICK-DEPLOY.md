# Quick Deployment Steps

## 🚀 Deploy in 10 Minutes

### 1️⃣ Deploy Backend to Render (5 min)

1. Go to https://dashboard.render.com/
2. Click **New +** → **Web Service**
3. Connect GitHub: `Sarth00718/Smart-Expense-Tracker`
4. Settings:
   - Root Directory: `server`
   - Build: `npm install`
   - Start: `npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-uri>
   JWT_SECRET=<generate-random-string>
   GROQ_API_KEY=<your-groq-key>
   CLIENT_URL=https://your-app.vercel.app
   ```
6. Click **Create Web Service**
7. **Copy your Render URL** (e.g., `https://expense-tracker-api.onrender.com`)

---

### 2️⃣ Deploy Frontend to Vercel (3 min)

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import: `Sarth00718/Smart-Expense-Tracker`
4. Settings:
   - Framework: Vite
   - Root Directory: `client`
   - Build: `npm run build`
   - Output: `dist`
5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-render-url.onrender.com/api
   ```
6. Click **Deploy**
7. **Copy your Vercel URL** (e.g., `https://expense-tracker.vercel.app`)

---

### 3️⃣ Update Backend CORS (1 min)

1. Go back to Render Dashboard
2. Open your service → Environment
3. Update `CLIENT_URL` with your Vercel URL
4. Click **Save Changes** (auto-redeploys)

---

### 4️⃣ Configure MongoDB Atlas (1 min)

1. Go to https://cloud.mongodb.com/
2. Network Access → Add IP Address
3. Select **Allow Access from Anywhere** (0.0.0.0/0)
4. Confirm

---

## ✅ Done! Test Your App

Visit your Vercel URL and:
- Register a new account
- Add an expense
- Check the dashboard

---

## 🔒 Security Reminder

**IMPORTANT**: Generate new credentials (exposed in Git):
- New MongoDB password
- New JWT_SECRET (random 32+ characters)
- New GROQ_API_KEY

---

## 📞 Need Help?

Check `DEPLOYMENT.md` for detailed instructions and troubleshooting.
