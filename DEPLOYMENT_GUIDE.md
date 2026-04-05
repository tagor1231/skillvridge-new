# 🚀 SkillBridge - Production Deployment Guide

## Complete Step-by-Step Guide to Deploy Your App Live

---

## 📋 Prerequisites

1. GitHub account (free)
2. MongoDB Atlas account (free)
3. Vercel account (free) - for frontend
4. Railway/Render account (free) - for backend
5. Domain name (optional, $10-15/year)

---

## Part 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Cluster

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create a **FREE** cluster:
   - Cloud Provider: AWS
   - Region: Choose nearest to your users
   - Cluster Tier: M0 Sandbox (FREE)
   - Cluster Name: skillbridge-cluster

### Step 2: Configure Database Access

1. **Database Access:**
   - Click "Database Access" in left menu
   - Click "Add New Database User"
   - Username: `skillbridge_admin`
   - Password: Generate strong password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

2. **Network Access:**
   - Click "Network Access" in left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

### Step 3: Get Connection String

1. Click "Databases" in left menu
2. Click "Connect" on your cluster
3. Click "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://skillbridge_admin:<password>@skillbridge-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name at end: `/skillbridge_db`

**Final Connection String:**
```
mongodb+srv://skillbridge_admin:YOUR_PASSWORD@skillbridge-cluster.xxxxx.mongodb.net/skillbridge_db?retryWrites=true&w=majority
```

---

## Part 2: Backend Deployment (Railway)

### Step 1: Prepare Backend

1. Make sure `/app/backend/.env.example` exists:
```bash
MONGO_URL=mongodb+srv://...
DB_NAME=skillbridge_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
CORS_ORIGINS=https://your-frontend-domain.vercel.app
EMERGENT_LLM_KEY=sk-emergent-aF72f1c0a120445Da1
```

### Step 2: Deploy on Railway

1. Go to: https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select your repository
6. Click "Add variables"
7. Add ALL environment variables from `.env.example`
8. Click "Deploy"

### Step 3: Configure Railway

1. Go to "Settings"
2. Find "Domains" section
3. Click "Generate Domain"
4. Copy your backend URL: `https://your-app.railway.app`
5. **Important:** Note this URL for frontend configuration

### Alternative: Render.com

1. Go to: https://render.com/
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect repository
5. Configure:
   - Name: skillbridge-backend
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
6. Add environment variables
7. Deploy

---

## Part 3: Frontend Deployment (Vercel)

### Step 1: Update Frontend Environment

1. Create `/app/frontend/.env.production`:
```bash
REACT_APP_BACKEND_URL=https://your-backend-url.railway.app
```

### Step 2: Deploy on Vercel

1. Go to: https://vercel.com/
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `yarn build`
   - Output Directory: `build`

6. **Environment Variables:**
   - Click "Environment Variables"
   - Add: `REACT_APP_BACKEND_URL` = `https://your-backend-url.railway.app`

7. Click "Deploy"

### Step 3: Get Frontend URL

1. After deployment completes
2. Copy your URL: `https://your-app.vercel.app`
3. Update backend CORS_ORIGINS with this URL

---

## Part 4: Update CORS (Backend)

1. Go to Railway dashboard
2. Click on your backend project
3. Go to "Variables"
4. Update `CORS_ORIGINS`:
   ```
   https://your-app.vercel.app,https://your-custom-domain.com
   ```
5. Save and redeploy

---

## Part 5: Custom Domain (Optional)

### Buy Domain

1. Go to: https://www.namecheap.com/ or https://www.godaddy.com/
2. Search for your domain name
3. Purchase (usually $10-15/year)

### Configure Vercel Domain

1. In Vercel dashboard
2. Go to your project → Settings → Domains
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

### Configure Railway Domain (Optional)

1. In Railway dashboard
2. Go to Settings → Domains
3. Add custom domain for API
4. Configure DNS CNAME record
5. Update frontend `.env` with new backend URL

---

## Part 6: Create First Admin User

### Method 1: Direct MongoDB

1. Go to MongoDB Atlas
2. Click "Browse Collections"
3. Click "Insert Document"
4. Add this JSON:
```json
{
  "id": "admin-001",
  "email": "admin@yourdomain.com",
  "full_name": "Super Admin",
  "role": "admin",
  "password_hash": "$2b$12$...", 
  "phone": "+1234567890",
  "created_at": {"$date": "2025-01-01T00:00:00.000Z"},
  "is_verified": true,
  "profile_completed": true,
  "skills": [],
  "bio": "Platform Administrator"
}
```

**To get password_hash:**
```python
import bcrypt
password = "YourSecurePassword123!"
hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
print(hash.decode('utf-8'))
```

### Method 2: Via Backend API (Easier)

1. Register normally as any user
2. Go to MongoDB Atlas
3. Find your user in `users` collection
4. Edit document
5. Change `"role": "student"` to `"role": "admin"`
6. Save
7. Logout and login again

---

## Part 7: Security Checklist

### Essential Security Updates

1. **Change JWT Secret:**
```bash
# Generate random secret
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

2. **Update Backend .env:**
```bash
JWT_SECRET=YOUR_NEWLY_GENERATED_SECRET
```

3. **Enable HTTPS Only:**
   - Vercel automatically provides SSL
   - Railway automatically provides SSL

4. **Rate Limiting (TODO):**
   - Add rate limiting middleware
   - Prevent API abuse

5. **Input Validation:**
   - Already implemented with Pydantic
   - Keep updated

6. **Database Backups:**
   - MongoDB Atlas auto-backups
   - Configure retention policy

---

## Part 8: Monitoring & Maintenance

### Add Monitoring Tools

1. **Uptime Monitoring:**
   - Sign up: https://uptimerobot.com/ (free)
   - Add your frontend URL
   - Add your backend URL + `/api/`
   - Get email alerts on downtime

2. **Error Tracking:**
   - Sign up: https://sentry.io/ (free tier)
   - Add Sentry to frontend & backend
   - Track errors in production

3. **Analytics:**
   - Google Analytics (free)
   - Track user behavior

---

## Part 9: Testing Production

### Test Checklist

- [ ] Frontend loads properly
- [ ] Backend API responding
- [ ] User registration works
- [ ] User login works
- [ ] Student dashboard loads
- [ ] Job posting works
- [ ] Job application works
- [ ] Admin panel accessible
- [ ] Course creation works
- [ ] Farm approval works

---

## Part 10: Cost Summary

### Free Tier (Recommended for Start)

- **MongoDB Atlas:** FREE (512 MB storage)
- **Railway Backend:** FREE ($5 credit/month, ~500 hours)
- **Vercel Frontend:** FREE (unlimited bandwidth)
- **Domain:** $10-15/year (optional)
- **Total:** ~$0-15/year

### Paid Tier (For Growth)

- **MongoDB Atlas:** $9-25/month (more storage)
- **Railway/Render:** $7-20/month (more resources)
- **Vercel Pro:** $20/month (team features)
- **Email Service:** $10/month (SendGrid/Resend)
- **Domain:** $10-15/year
- **Total:** ~$50-100/month

---

## 🎯 Quick Deploy Commands

### Deploy to Railway (Backend)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### Deploy to Vercel (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

---

## 📱 Final URLs Structure

```
Frontend:  https://skillbridge.vercel.app (or your-domain.com)
Backend:   https://skillbridge-api.railway.app (or api.your-domain.com)
Database:  mongodb+srv://...atlas.mongodb.net/skillbridge_db
```

---

## 🆘 Troubleshooting

### Frontend not connecting to Backend

**Problem:** CORS errors in browser console

**Solution:**
1. Check backend CORS_ORIGINS includes frontend URL
2. Restart backend after changing CORS
3. Clear browser cache

### Database connection failed

**Problem:** "Authentication failed" or "Connection timeout"

**Solution:**
1. Check MongoDB Atlas IP whitelist (should allow 0.0.0.0/0)
2. Verify username/password in connection string
3. Check database name is correct

### API returns 404

**Problem:** Backend routes not found

**Solution:**
1. Ensure backend URL is correct
2. Check all routes have `/api` prefix
3. Verify backend is running

---

## ✅ You're Live!

After following this guide:

✅ Your app is accessible worldwide
✅ Database is in the cloud
✅ SSL/HTTPS enabled
✅ Admin panel secured
✅ Ready for users!

---

## 🚀 Next Steps

1. **Marketing:**
   - Share on social media
   - Create landing page
   - SEO optimization

2. **Features:**
   - Email notifications
   - SMS alerts
   - Payment integration

3. **Scale:**
   - Upgrade to paid tiers
   - Add CDN
   - Optimize performance

---

**Congratulations! Your SkillBridge platform is now LIVE! 🎉**
