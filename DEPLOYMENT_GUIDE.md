# 🚀 Free Hosting Deployment Guide for Anantya Stonebook

This guide will help you deploy your Anantya Stonebook CRM system for free using modern cloud platforms.

## 📋 **Prerequisites**

1. **GitHub Account** (free)
2. **Supabase Account** (free tier)
3. **Vercel Account** (free tier)
4. **Railway Account** (free $5 credit monthly)

---

## 🎯 **Deployment Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │◄──►│   (Railway)     │◄──►│   (Supabase)    │
│   React/Vite    │    │   Node.js/Express│   │   PostgreSQL    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🔧 **Step 1: Prepare Your Repository**

### 1.1 Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for deployment"
git branch -M main
git remote add origin https://github.com/yourusername/anantya-stonebook.git
git push -u origin main
```

### 1.2 Update Environment Variables
Create these files in your project root:

**`.env.example`** (for reference):
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

---

## 🗄️ **Step 2: Deploy Backend (Railway)**

### 2.1 Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Get $5 free credit monthly

### 2.2 Deploy Backend
1. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Environment Variables**
   - Go to "Variables" tab
   - Add these variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NODE_ENV=production
   PORT=3000
   ```

3. **Deploy**
   - Railway will automatically detect Node.js
   - It will run `npm install` and `npm start`
   - Wait for deployment to complete

4. **Get Backend URL**
   - Copy the generated URL (e.g., `https://your-app.railway.app`)
   - This is your backend API URL

---

## 🌐 **Step 3: Deploy Frontend (Vercel)**

### 3.1 Create Vercel Account
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Free tier includes unlimited deployments

### 3.2 Deploy Frontend
1. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

2. **Configure Build Settings**
   - **Framework Preset**: Vite
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install && cd client && npm install`

3. **Add Environment Variables**
   - Go to "Environment Variables"
   - Add these variables:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Get your frontend URL (e.g., `https://your-app.vercel.app`)

---

## 🗄️ **Step 4: Configure Supabase**

### 4.1 Database Setup
1. **Run Migrations**
   ```sql
   -- Run this in Supabase SQL Editor
   ALTER TABLE sales 
   ADD COLUMN IF NOT EXISTS buyers_order_number TEXT,
   ADD COLUMN IF NOT EXISTS buyers_order_date TEXT,
   ADD COLUMN IF NOT EXISTS dispatch_doc_no TEXT,
   ADD COLUMN IF NOT EXISTS delivery_note_date TEXT,
   ADD COLUMN IF NOT EXISTS dispatched_through TEXT,
   ADD COLUMN IF NOT EXISTS destination TEXT,
   ADD COLUMN IF NOT EXISTS terms_of_delivery TEXT;
   ```

### 4.2 Configure CORS
1. Go to Supabase Dashboard → Settings → API
2. Add your frontend URL to allowed origins:
   ```
   https://your-app.vercel.app
   ```

---

## 🔗 **Step 5: Connect Everything**

### 5.1 Update Frontend Configuration
1. **Update `client/vercel.json`**:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://your-backend-url.railway.app/api/$1"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### 5.2 Update Backend CORS
1. **Update `server/index.ts`** (if needed):
   ```typescript
   app.use(cors({
     origin: [
       'https://your-app.vercel.app',
       'http://localhost:3000' // for development
     ],
     credentials: true
   }));
   ```

---

## 🧪 **Step 6: Test Your Deployment**

### 6.1 Health Check
- Visit: `https://your-backend-url.railway.app/api/health`
- Should return: `{"status":"healthy","timestamp":"...","environment":"production"}`

### 6.2 Frontend Test
- Visit: `https://your-app.vercel.app`
- Should load your CRM application

### 6.3 API Test
- Visit: `https://your-app.vercel.app/api/sales`
- Should return your sales data

---

## 🔧 **Step 7: Custom Domain (Optional)**

### 7.1 Vercel Custom Domain
1. Go to Vercel Dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed

### 7.2 Railway Custom Domain
1. Go to Railway Dashboard → Domains
2. Add your custom domain
3. Update DNS records

---

## 📊 **Monitoring & Maintenance**

### 7.1 Railway Monitoring
- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: Monitor CPU, memory usage
- **Alerts**: Set up alerts for downtime

### 7.2 Vercel Analytics
- **Performance**: View Core Web Vitals
- **Analytics**: Track user behavior
- **Functions**: Monitor API calls

### 7.3 Supabase Monitoring
- **Database**: Monitor query performance
- **Storage**: Track file uploads
- **Auth**: Monitor user sessions

---

## 💰 **Cost Breakdown (Free Tier)**

| Service | Free Tier | Your Usage |
|---------|-----------|------------|
| **Vercel** | Unlimited deployments | ✅ Free |
| **Railway** | $5 credit/month | ✅ Free (small app) |
| **Supabase** | 500MB DB, 50K users | ✅ Free |
| **Total** | **$0/month** | 🎉 |

---

## 🚨 **Troubleshooting**

### Common Issues:

1. **Build Failures**
   ```bash
   # Check build logs in Vercel/Railway
   # Ensure all dependencies are in package.json
   ```

2. **CORS Errors**
   ```bash
   # Update CORS origins in both backend and Supabase
   # Check browser console for specific errors
   ```

3. **Database Connection**
   ```bash
   # Verify Supabase credentials
   # Check network connectivity
   # Ensure tables exist
   ```

4. **Environment Variables**
   ```bash
   # Double-check all env vars are set
   # Restart deployments after adding new vars
   ```

---

## 🔄 **Continuous Deployment**

### Automatic Deployments
- **GitHub Push** → **Vercel** → **Frontend Updated**
- **GitHub Push** → **Railway** → **Backend Updated**

### Manual Deployments
```bash
# Trigger manual deployment
git add .
git commit -m "Update for deployment"
git push origin main
```

---

## 📱 **Mobile Access**

Your app will work on mobile devices:
- **Responsive Design**: Already implemented
- **PWA Features**: Can be added later
- **Mobile Browser**: Full functionality

---

## 🎉 **Success!**

Your Anantya Stonebook CRM is now live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **Database**: Supabase (managed)

**Total Cost: $0/month** 🚀

---

## 📞 **Support**

If you encounter issues:
1. Check deployment logs
2. Verify environment variables
3. Test endpoints individually
4. Check browser console for errors

**Happy Hosting!** 🎊
