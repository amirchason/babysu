# 🔒 SECURITY SETUP GUIDE

## ⚠️ CRITICAL: Your API Keys Were Exposed

Since Claude Code accessed your `.env` files during the security audit, all API keys should be considered compromised and regenerated immediately.

---

## 🚨 IMMEDIATE ACTIONS REQUIRED

### 1. Regenerate OpenAI API Key

**Current Status:** 🔴 COMPROMISED

**Steps:**
1. Go to: https://platform.openai.com/api-keys
2. Click on your existing key → "Revoke"
3. Click "Create new secret key"
4. Name it: `BabySu Backend - [Date]`
5. Copy the new key immediately (you won't see it again!)
6. Update `backend/.env`:
   ```bash
   OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE
   ```

---

### 2. Regenerate Gemini API Key

**Current Status:** 🔴 COMPROMISED

**Steps:**
1. Go to: https://aistudio.google.com/app/apikey
2. Find your existing key and click "Delete"
3. Click "Create API key"
4. Select your project: `babynames-app-9fa2a`
5. Copy the new key
6. Update ALL `.env` files:
   ```bash
   # backend/.env
   GEMINI_API_KEY=AIzaSy_YOUR_NEW_KEY_HERE

   # webapp/.env
   VITE_GEMINI_API_KEY=AIzaSy_YOUR_NEW_KEY_HERE
   GEMINI_API_KEY=AIzaSy_YOUR_NEW_KEY_HERE
   ```

---

### 3. Regenerate Suno API Key

**Current Status:** 🔴 COMPROMISED

**Steps:**
1. Go to: https://sunoapi.org/ (or your Suno API provider dashboard)
2. Navigate to "API Keys" or "Settings"
3. Revoke/Delete the existing key
4. Generate a new API key
5. Copy the new key
6. Update `backend/.env`:
   ```bash
   SUNO_API_KEY=YOUR_NEW_SUNO_KEY_HERE
   ```

---

### 4. Change User Password

**Current Status:** 🔴 EXPOSED (Password: `Ahava1977!`)

**Steps:**
1. Go to your Firebase Console: https://console.firebase.google.com/
2. Navigate to: Authentication → Users
3. Find user: `earthiaone@gmail.com`
4. Click the user → "Reset password" or change manually
5. Update `backend/.env` and `mobile/.env`:
   ```bash
   AUTO_LOGIN_PASSWORD=YOUR_NEW_SECURE_PASSWORD
   ```

**Recommendation:** Use a password manager to generate a strong password (20+ characters)

---

### 5. Generate Secure JWT Secret

**Current Status:** 🔴 WEAK (Using default placeholder)

**Generate New Secret:**
```bash
# Run this command in terminal:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OR using OpenSSL:
openssl rand -hex 64
```

**Update `backend/.env`:**
```bash
JWT_SECRET=paste_the_generated_random_string_here
```

---

### 6. Remove Commented PiAPI Key

**Current Status:** 🟡 VISIBLE (line 26 in backend/.env)

**Action:**
1. Open `backend/.env`
2. Completely remove line 26:
   ```bash
   # REMOVE THIS LINE:
   # PIAPI_API_KEY=9d72e171331c936a71c1fe32d164648480a2c1a619f524c31849b00a7a43f583
   ```

---

## ✅ VERIFICATION CHECKLIST

After regenerating all keys, verify:

- [ ] OpenAI API key regenerated and updated in `backend/.env`
- [ ] Gemini API key regenerated and updated in `backend/.env` and `webapp/.env`
- [ ] Suno API key regenerated and updated in `backend/.env`
- [ ] User password changed in Firebase and updated in `.env` files
- [ ] JWT secret generated (64-byte random hex) and updated in `backend/.env`
- [ ] Commented PiAPI key removed from `backend/.env`
- [ ] Test backend API to ensure new keys work
- [ ] `.env` files still in `.gitignore` (run: `git status --ignored | grep .env`)

---

## 🔐 SECURITY BEST PRACTICES

### DO:
✅ Use password managers for API keys
✅ Rotate API keys every 90 days
✅ Use different credentials for dev/staging/production
✅ Enable 2FA on all service accounts
✅ Set usage limits/alerts on API keys (if available)
✅ Review API key permissions (use least privilege)

### DON'T:
❌ Share API keys via email, Slack, or messaging apps
❌ Commit `.env` files to version control
❌ Use production keys in development
❌ Store keys in screenshots or documents
❌ Hardcode keys in source code

---

## 🧪 TESTING AFTER KEY ROTATION

After updating all keys, test each integration:

### Test OpenAI:
```bash
cd backend
node -e "require('dotenv').config(); const OpenAI = require('openai'); const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); client.models.list().then(() => console.log('✅ OpenAI OK')).catch(err => console.error('❌ OpenAI Error:', err.message));"
```

### Test Gemini:
```bash
cd backend
# Create test script or run backend and check logs
npm run dev
# Watch for "✅ Gemini API connected" in logs
```

### Test Suno:
```bash
cd backend
# Test song generation endpoint
curl -X POST http://localhost:5000/api/songs/generate \
  -H "Content-Type: application/json" \
  -d '{"childId": "test", "theme": "birthday"}'
```

### Test JWT:
```bash
cd backend
npm run dev
# Try login endpoint - should return valid JWT token
```

---

## 📋 KEY REGENERATION TRACKING

Use this table to track your progress:

| Service | Old Key Revoked | New Key Generated | Updated in .env | Tested | Date |
|---------|----------------|-------------------|-----------------|--------|------|
| OpenAI | ☐ | ☐ | ☐ | ☐ | ____ |
| Gemini | ☐ | ☐ | ☐ | ☐ | ____ |
| Suno | ☐ | ☐ | ☐ | ☐ | ____ |
| User Password | ☐ | ☐ | ☐ | ☐ | ____ |
| JWT Secret | N/A | ☐ | ☐ | ☐ | ____ |

---

## 🆘 EMERGENCY CONTACTS

If you suspect unauthorized usage of your API keys:

**OpenAI:**
- Dashboard: https://platform.openai.com/usage
- Support: https://help.openai.com/

**Google Cloud (Gemini):**
- Console: https://console.cloud.google.com/
- Billing alerts: https://console.cloud.google.com/billing

**Suno API:**
- Dashboard: [Your Suno API provider]
- Check for unexpected API calls

---

## 💡 FUTURE: Environment Management

For production deployments, consider using:

1. **Environment Management Tools:**
   - Vercel Environment Variables
   - Railway Secrets
   - Render Environment Groups
   - AWS Secrets Manager
   - HashiCorp Vault

2. **Local Secret Management:**
   - `direnv` - Auto-load .env per directory
   - `doppler` - Secret management CLI
   - `sops` - Encrypted .env files

3. **CI/CD Integration:**
   - GitHub Secrets (for Actions)
   - GitLab CI/CD Variables
   - CircleCI Environment Variables

---

## ✅ SETUP COMPLETE INDICATOR

You'll know your setup is secure when:

1. ✅ All API keys regenerated and working
2. ✅ No more test/placeholder credentials
3. ✅ JWT secret is 128+ character random hex
4. ✅ All services responding correctly
5. ✅ No `.env` files in `git status`
6. ✅ This guide saved for future reference

---

**Last Updated:** 2025-11-13
**Next Key Rotation Due:** 2025-02-13 (90 days)
