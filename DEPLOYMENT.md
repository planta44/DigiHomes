# DIGI Homes Deployment Guide

Complete guide to deploy DIGI Homes for **FREE** using:
- **Supabase** - PostgreSQL Database (Free tier)
- **Render** - Backend API (Free tier)
- **Netlify** - Frontend (Free tier)

---

## 📋 Prerequisites

1. GitHub account (to host your code)
2. Supabase account (https://supabase.com)
3. Render account (https://render.com)
4. Netlify account (https://netlify.com)

---

## Step 1: Push Code to GitHub

### 1.1 Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `digi-homes`
3. Set it to **Private** or **Public**
4. Don't initialize with README

### 1.2 Push Your Code

```bash
# In your DIGI folder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/digi-homes.git
git push -u origin main
```

---

## Step 2: Set Up Supabase (Database)

### 2.1 Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: `digi-homes`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to Kenya (e.g., Frankfurt or Mumbai)
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup

### 2.2 Get Database Connection String

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **URI** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

### 2.3 Configure Database (Important!)

1. Go to **Settings** → **Database** → **Connection Pooling**
2. Enable **Connection Pooling** (Supavisor)
3. Copy the **Pooler connection string** instead (recommended for production):
   ```
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

---

## Step 3: Set Up Render (Backend)

### 3.1 Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (recommended for easy deployment)

### 3.2 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Select your `digi-homes` repository
4. Configure:
   - **Name**: `digi-homes-api`
   - **Region**: Frankfurt (EU) or closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**

### 3.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Supabase connection string |
| `JWT_SECRET` | Generate a random string (32+ chars) |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

**To generate JWT_SECRET**, use: https://generate-secret.vercel.app/32

### 3.4 Deploy

1. Click **"Create Web Service"**
2. Wait for build (3-5 minutes)
3. Your API will be live at: `https://digi-homes-api.onrender.com`

### 3.5 Initialize Database

After deployment, you need to seed the database:

1. Go to your Render service dashboard
2. Click **"Shell"** tab
3. Run:
   ```bash
   npm run seed
   ```

**Note**: On free tier, the server spins down after 15 min of inactivity. First request after sleep takes ~30 seconds.

---

## Step 4: Set Up Netlify (Frontend)

### 4.1 Update Frontend API URL

Before deploying, update the API URL in your frontend:

1. Create/edit `frontend/.env.production`:
   ```
   VITE_API_URL=https://digi-homes-api.onrender.com/api
   ```

2. Or update `frontend/src/config/api.js`:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'https://digi-homes-api.onrender.com/api';
   ```

3. Commit and push changes:
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push
   ```

### 4.2 Create Netlify Site

1. Go to https://netlify.com and sign up/login
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

### 4.3 Add Environment Variables

Go to **Site settings** → **Environment variables** → **Add variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://digi-homes-api.onrender.com/api` |

### 4.4 Configure Redirects (Important for SPA!)

Create `frontend/public/_redirects` file:
```
/*    /index.html   200
```

Or create `frontend/netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4.5 Deploy

1. Click **"Deploy site"**
2. Wait for build (1-2 minutes)
3. Your site will be live at: `https://random-name.netlify.app`

### 4.6 Custom Domain (Optional)

1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `digihomes.co.ke`)
4. Follow DNS configuration instructions

---

## Step 5: Post-Deployment Setup

### 5.1 Test Everything

1. Visit your Netlify URL
2. Check homepage loads
3. Test admin login:
   - Email: `admin@digihomes.co.ke`
   - Password: `admin123`
4. Test creating/editing houses
5. Test image uploads

### 5.2 Update Admin Password

After first login, change the admin password for security!

### 5.3 Configure Image Uploads

For production, you'll need cloud storage for images. Options:

**Option A: Cloudinary (Recommended - Free tier)**
1. Sign up at https://cloudinary.com
2. Get your cloud name, API key, and secret
3. Add to Render environment variables:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Update backend to use Cloudinary for uploads

**Option B: Supabase Storage**
1. In Supabase, go to **Storage**
2. Create a bucket named `images`
3. Set bucket to **Public**
4. Update backend to upload to Supabase Storage

---

## 🔧 Troubleshooting

### Backend Issues

**"Application error" on Render**
- Check build logs in Render dashboard
- Verify all environment variables are set
- Check DATABASE_URL is correct

**Database connection fails**
- Verify Supabase password is correct
- Use the pooler connection string
- Check if Supabase project is active

### Frontend Issues

**404 on page refresh**
- Add `_redirects` file (see step 4.4)
- Redeploy on Netlify

**API calls fail**
- Check VITE_API_URL is set correctly
- Verify backend is running on Render
- Check browser console for CORS errors

### CORS Errors

If you see CORS errors, update backend `server.js`:
```javascript
app.use(cors({
  origin: ['https://your-site.netlify.app', 'http://localhost:5173'],
  credentials: true
}));
```

---

## 📊 Free Tier Limits

| Service | Free Tier Limits |
|---------|-----------------|
| **Supabase** | 500MB database, 1GB file storage, 2GB bandwidth |
| **Render** | 750 hours/month, spins down after 15min inactivity |
| **Netlify** | 100GB bandwidth, 300 build minutes/month |

These limits are generous for a small-medium real estate site!

---

## 🚀 Upgrading (When Needed)

When you outgrow free tiers:

- **Supabase Pro**: $25/month - More storage, no pausing
- **Render Starter**: $7/month - Always on, faster builds
- **Netlify Pro**: $19/month - More bandwidth, team features

---

## 📝 Quick Reference

| Service | URL |
|---------|-----|
| **Frontend** | https://your-site.netlify.app |
| **Backend API** | https://digi-homes-api.onrender.com |
| **Supabase** | https://app.supabase.com |
| **Render** | https://dashboard.render.com |
| **Netlify** | https://app.netlify.com |

---

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Render Docs: https://render.com/docs
- Netlify Docs: https://docs.netlify.com

Good luck with your deployment! 🏠
