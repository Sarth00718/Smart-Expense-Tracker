# Deployment Guide

## Prerequisites
- GitHub account
- MongoDB Atlas account (or MongoDB instance)
- Render account (for backend)
- Vercel account (for frontend)

## Backend Deployment (Render)

### 1. Prepare MongoDB
1. Create MongoDB Atlas cluster
2. Create database user
3. Whitelist all IPs (0.0.0.0/0) for Render
4. Copy connection string

### 2. Deploy to Render
1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name:** smart-expense-tracker-api
   - **Environment:** Node
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Instance Type:** Free

### 3. Environment Variables
Add in Render dashboard:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
CLIENT_URL=https://your-frontend-domain.vercel.app
GROQ_API_KEY=your_groq_api_key_optional
```

### 4. Deploy
Click "Create Web Service" and wait for deployment

## Frontend Deployment (Vercel)

### 1. Deploy to Vercel
1. Go to Vercel Dashboard
2. Click "Add New" → "Project"
3. Import GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** client
   - **Build Command:** `npm run build`
   - **Output Directory:** dist

### 2. Environment Variables
Add in Vercel dashboard:
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_AUTH_METHOD=backend
```

Optional Firebase variables:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Deploy
Click "Deploy" and wait for build

## Post-Deployment

### 1. Update CORS
Update backend CLIENT_URL environment variable with actual Vercel URL

### 2. Test Endpoints
```bash
curl https://your-backend.onrender.com/health
```

### 3. Test Frontend
Visit your Vercel URL and test:
- Registration
- Login
- Create expense
- View dashboard

## Monitoring

### Backend Health Check
```
GET https://your-backend.onrender.com/health
```

### Frontend
Monitor in Vercel dashboard

## Troubleshooting

### Backend Issues
- Check Render logs
- Verify MongoDB connection
- Verify environment variables

### Frontend Issues
- Check Vercel deployment logs
- Verify API_URL is correct
- Check browser console for errors

### CORS Errors
- Ensure CLIENT_URL matches frontend domain
- Redeploy backend after updating

## Custom Domain (Optional)

### Backend
1. Go to Render dashboard
2. Settings → Custom Domain
3. Add your domain
4. Update DNS records

### Frontend
1. Go to Vercel dashboard
2. Settings → Domains
3. Add your domain
4. Update DNS records

## Continuous Deployment

Both Render and Vercel auto-deploy on git push to main branch.

To disable:
- Render: Settings → Auto-Deploy
- Vercel: Settings → Git → Disable

## Backup Strategy

### Database
1. MongoDB Atlas automatic backups
2. Manual exports via MongoDB Compass

### Code
1. GitHub repository
2. Regular commits
3. Tagged releases

## Scaling

### Backend
- Upgrade Render instance type
- Enable autoscaling
- Add Redis for caching

### Frontend
- Vercel handles scaling automatically
- Optimize images and assets
- Enable CDN

## Security Checklist

- [ ] Environment variables set correctly
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] MongoDB user has minimal permissions
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Sensitive data not in logs
