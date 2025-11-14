# ⚡ QUICK DEPLOY GUIDE (5 Minutes)

**Goal:** Get your app online ASAP!

---

## 🎯 Step-by-Step (Copy & Paste)

### 1. Login to Vercel (1 minute)

```bash
vercel login
```

- Browser will open
- Click "Continue with GitHub"
- Authorize Vercel

---

### 2. Deploy Backend API (2 minutes)

```bash
cd backend
vercel --prod
```

**When prompted:**
- `Set up and deploy?` → Type: **y** (yes)
- `Which scope?` → Press **Enter** (your account)
- `Link to existing project?` → Type: **n** (no)
- `Project name?` → Press **Enter** (keep default)
- `Directory?` → Press **Enter** (keep default: ./)

**Copy the URL Vercel gives you!**
Example: `https://babysu-backend-abc123.vercel.app`

---

### 3. Add Environment Variables to Backend (2 minutes)

```bash
# Still in backend directory
# Add your API keys one by one:

vercel env add OPENAI_API_KEY production
# Paste your OpenAI key, press Enter

vercel env add GEMINI_API_KEY production
# Paste your Gemini key, press Enter

vercel env add SUNO_API_KEY production
# Paste your Suno key, press Enter

vercel env add JWT_SECRET production
# Paste your JWT secret from backend/.env, press Enter

vercel env add FIREBASE_PROJECT_ID production
# Paste: babynames-app-9fa2a

vercel env add FIREBASE_STORAGE_BUCKET production
# Paste: babynames-app-9fa2a.firebasestorage.app

vercel env add CORS_ORIGIN production
# Paste: * (for now, restrict later)

# Redeploy with environment variables
vercel --prod
```

---

### 4. Deploy Web App (2 minutes)

```bash
cd ../webapp
vercel --prod
```

**When prompted:**
- `Set up and deploy?` → Type: **y** (yes)
- `Which scope?` → Press **Enter** (your account)
- `Link to existing project?` → Type: **n** (no)
- `Project name?` → Press **Enter** (keep default)
- `Directory?` → Press **Enter** (keep default: ./)

**Copy the URL Vercel gives you!**
Example: `https://babysu-webapp-xyz789.vercel.app`

---

### 5. Add Environment Variables to Webapp (2 minutes)

```bash
# Still in webapp directory

vercel env add VITE_API_URL production
# Paste your backend URL from Step 2: https://babysu-backend-abc123.vercel.app

vercel env add VITE_FIREBASE_API_KEY production
# Paste: AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70

vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# Paste: babynames-app-9fa2a.firebaseapp.com

vercel env add VITE_FIREBASE_PROJECT_ID production
# Paste: babynames-app-9fa2a

vercel env add VITE_FIREBASE_STORAGE_BUCKET production
# Paste: babynames-app-9fa2a.firebasestorage.app

vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
# Paste: 1093132372253

vercel env add VITE_FIREBASE_APP_ID production
# Paste: 1:1093132372253:web:0327c13610942d60f4f9f4

# Redeploy with environment variables
vercel --prod
```

---

## ✅ DONE! Test Your App

### Backend Health Check:
```bash
# Replace with your backend URL from Step 2
curl https://babysu-backend-abc123.vercel.app/health
```

Should see:
```json
{"status":"ok","timestamp":"...","environment":"production"}
```

### Open Web App:
Open your webapp URL from Step 4 in a browser!
Example: `https://babysu-webapp-xyz789.vercel.app`

---

## 🎯 Your Live URLs

Write these down:

**Backend API:** `______________________________________`

**Web App:** `______________________________________`

---

## 🔧 Quick Fixes

### If backend shows "Internal Server Error":
```bash
# Check logs
cd backend
vercel logs
```

### If webapp shows "Cannot connect to API":
```bash
# Make sure VITE_API_URL is correct
cd webapp
vercel env ls
```

### Need to update environment variables:
```bash
# Remove old variable
vercel env rm VARIABLE_NAME production

# Add new one
vercel env add VARIABLE_NAME production

# Redeploy
vercel --prod
```

---

## 📱 Share Your App!

Your app is now live! Share the webapp URL with anyone:

**Example URL:** `https://babysu-webapp-xyz789.vercel.app`

They can:
- Access from any device
- Create accounts
- Generate songs
- No installation needed!

---

## 🚀 Update Your App Later

Made changes to code? Deploy updates:

```bash
# For backend changes
cd backend
git pull  # if pulling from GitHub
vercel --prod

# For webapp changes
cd webapp
git pull  # if pulling from GitHub
vercel --prod
```

---

**Total Time:** ~10 minutes (including environment variables)

**Next:** Read `DEPLOYMENT_GUIDE.md` for detailed info and troubleshooting!
