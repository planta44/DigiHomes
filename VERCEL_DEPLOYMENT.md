# Deploying DIGI Homes to Vercel

This guide shows you how to deploy your frontend to Vercel and your backend to Railway (recommended for Express apps).

## 🎯 Deployment Strategy

**Frontend** → Vercel (Free tier, excellent for React/Vite apps)  
**Backend** → Railway.app (More generous free tier than Render for Node.js apps)

---

## Part 1: Deploy Backend to Railway

### 1.1 Sign Up for Railway
1. Go to https://railway.app
2. Sign up with GitHub (easiest method)

### 1.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `DIGI` repository
4. Railway will detect your monorepo

### 1.3 Configure Backend Service
1. Click **"Add variables"** and add:
   ```
   DATABASE_URL = your_supabase_connection_string
   JWT_SECRET = your_random_32_character_string
   NODE_ENV = production
   PORT = 5000
   ```

2. In **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty (not needed for Node.js)
   - **Start Command**: `npm start`

3. Click **"Deploy"**

4. Once deployed, Railway will give you a URL like:
   ```
   https://digi-homes-backend-production.up.railway.app
   ```
   **Copy this URL** - you'll need it for frontend deployment!

---

## Part 2: Deploy Frontend to Vercel

### 2.1 Sign Up for Vercel
1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**

### 2.2 Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Select your GitHub repository (`DIGI`)
3. Vercel will detect it's a monorepo

### 2.3 Configure Frontend Deployment

**Framework Preset:** `Vite`

**Root Directory:** `frontend` (IMPORTANT: Click "Edit" and set this!)

**Build Settings:**
- **Framework Preset**: `Vite` (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**Environment Variables:**
Click **"Environment Variables"** and add:
```
VITE_API_URL = https://your-railway-backend-url.up.railway.app/api
```
Replace with your actual Railway backend URL from Part 1!

### 2.4 Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Your site will be live at: `https://your-project.vercel.app`

---

## Part 3: Update Frontend API Configuration

You need to tell your frontend to use the Railway backend URL.

### Option A: Using Environment Variables (Recommended)
Already done if you added `VITE_API_URL` in Vercel dashboard!

### Option B: Manual Update (if needed)
Edit `frontend/src/config/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

---

## 🎉 Verification Checklist

After deployment, test these:

- [ ] Homepage loads correctly
- [ ] Images display properly
- [ ] Navigation works
- [ ] Property listings show up
- [ ] Admin login works
- [ ] Admin panel accessible
- [ ] Can create/edit houses
- [ ] Animations work
- [ ] Forms submit successfully

---

## 🔧 Troubleshooting

### Frontend shows "Network Error" or "Failed to fetch"
**Problem**: Frontend can't reach backend  
**Solution**: 
1. Check `VITE_API_URL` environment variable in Vercel
2. Make sure Railway backend is running (check logs)
3. Verify CORS settings allow your Vercel domain

### Images not loading
**Problem**: Image URLs point to localhost or old Render URL  
**Solution**: 
1. Update image URLs in database to use Cloudinary
2. Or configure Railway backend URL correctly

### 404 on page refresh
**Problem**: Vercel doesn't know about React Router  
**Solution**: Already fixed with `vercel.json` routing config

---

## 💰 Cost Comparison

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited personal projects
- Automatic HTTPS
- Edge network (super fast)

**Railway Free Tier:**
- $5 free credit/month
- ~500 hours of runtime
- More generous than Render for Node.js apps

---

## 🚀 Custom Domain (Optional)

### On Vercel:
1. Go to your project → **Settings** → **Domains**
2. Add your domain (e.g., `digihomes.co.ke`)
3. Follow DNS configuration instructions

### On Railway:
1. Go to your project → **Settings** → **Domains**
2. Click **Generate Domain** for free `.railway.app` domain
3. Or add custom domain

---

## 📝 Quick Reference

### Vercel Settings for DIGI Homes Frontend
```
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node Version: 18.x (default)
```

### Railway Settings for DIGI Homes Backend
```
Root Directory: backend
Start Command: npm start
Runtime: Node.js 18.x
```

### Environment Variables Needed

**Vercel (Frontend):**
```env
VITE_API_URL=https://your-backend.railway.app/api
```

**Railway (Backend):**
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-here
NODE_ENV=production
FRONTEND_URL=https://your-site.vercel.app
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🔄 Redeployment

### Frontend (Vercel):
- Push to GitHub → Vercel auto-deploys
- Or click **"Redeploy"** in Vercel dashboard

### Backend (Railway):
- Push to GitHub → Railway auto-deploys
- Or click **"Deploy"** in Railway dashboard

---

## Need Help?
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Check deployment logs for errors
