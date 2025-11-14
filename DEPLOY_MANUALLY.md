# 🚀 MANUAL DEPLOYMENT GUIDE (10 Minutes)

The automated script needs you to login to Vercel first. Here's the manual process:

---

## Step 1: Login to Vercel (2 minutes)

```bash
vercel login
```

This will:
1. Open your browser
2. Ask you to login with GitHub/GitLab/Bitbucket/Email
3. Authorize Vercel CLI

**Choose:** GitHub (recommended since your code is already there!)

---

## Step 2: Deploy Backend (3 minutes)

```bash
cd backend
vercel --prod
```

**When prompted:**
- `Set up and deploy?` → Press **y**
- `Which scope?` → Press **Enter**
- `Link to existing project?` → Press **n**
- `Project name?` → Press **Enter** (use default: backend)
- `Directory?` → Press **Enter** (use default: ./)

**Wait for deployment...** ⏳

You'll get a URL like: `https://backend-xyz.vercel.app`

**COPY THIS URL!** You'll need it later.

---

## Step 3: Add Backend Environment Variables (5 minutes)

Still in the `backend` directory:

```bash
# Add each variable one by one:
vercel env add OPENAI_API_KEY production
# Paste your OpenAI key from backend/.env, press Enter

vercel env add GEMINI_API_KEY production
# Paste your Gemini key from backend/.env, press Enter

vercel env add SUNO_API_KEY production
# Paste your Suno key from backend/.env, press Enter

vercel env add JWT_SECRET production
# Paste your JWT secret from backend/.env (the long random string), press Enter

vercel env add FIREBASE_PROJECT_ID production
# Type: babynames-app-9fa2a

vercel env add FIREBASE_STORAGE_BUCKET production
# Type: babynames-app-9fa2a.firebasestorage.app

vercel env add CORS_ORIGIN production
# Type: *

# Redeploy with environment variables:
vercel --prod
```

---

## Step 4: Deploy Webapp (2 minutes)

```bash
cd ../webapp
vercel --prod
```

**When prompted:**
- `Set up and deploy?` → Press **y**
- `Which scope?` → Press **Enter**
- `Link to existing project?` → Press **n**
- `Project name?` → Press **Enter** (use default: webapp)
- `Directory?` → Press **Enter** (use default: ./)

You'll get a URL like: `https://webapp-xyz.vercel.app`

---

## Step 5: Add Webapp Environment Variables (3 minutes)

Still in the `webapp` directory:

```bash
vercel env add VITE_API_URL production
# Paste your backend URL from Step 2 + /api
# Example: https://backend-xyz.vercel.app/api

vercel env add VITE_FIREBASE_API_KEY production
# Type: AIzaSyDbNCgZiXe4d_dFAXNMVclSD3AryoUUI70

vercel env add VITE_FIREBASE_AUTH_DOMAIN production
# Type: babynames-app-9fa2a.firebaseapp.com

vercel env add VITE_FIREBASE_PROJECT_ID production
# Type: babynames-app-9fa2a

vercel env add VITE_FIREBASE_STORAGE_BUCKET production
# Type: babynames-app-9fa2a.firebasestorage.app

vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
# Type: 1093132372253

vercel env add VITE_FIREBASE_APP_ID production
# Type: 1:1093132372253:web:0327c13610942d60f4f9f4

# Redeploy with environment variables:
vercel --prod
```

---

## Step 6: Test Your App! ✅

### Test Backend:
```bash
curl https://your-backend-url.vercel.app/health
```

Should show: `{"status":"ok",...}`

### Test Webapp:
Open your webapp URL in a browser:
```
https://your-webapp-url.vercel.app
```

---

## 🎉 YOU'RE LIVE!

Your app is now online! Share the webapp URL with anyone.

**URLs to save:**
- Backend: `https://backend-xyz.vercel.app`
- Webapp: `https://webapp-xyz.vercel.app`

---

## 🔄 To Update Later:

```bash
# For backend updates:
cd backend
vercel --prod

# For webapp updates:
cd ../webapp
vercel --prod
```

---

## 🆘 Troubleshooting:

**"Build failed"**
```bash
vercel logs
# Check the error and fix it in your code
```

**"Can't connect to API"**
- Make sure VITE_API_URL includes `/api` at the end
- Example: `https://backend-xyz.vercel.app/api`

**"Environment variable not working"**
```bash
# Check variables are set:
vercel env ls

# Remove and re-add if needed:
vercel env rm VARIABLE_NAME production
vercel env add VARIABLE_NAME production
```

---

**Total Time:** ~15 minutes
**Next:** Open your webapp URL and test the app!
