# 🎵 BabySu Setup Instructions

## ✅ What's Been Completed

### 1. Project Structure
```
/babysu
  /backend
    /src
      /config         - Firebase, Redis configs
      /middleware     - Auth, rate limiting
      /routes         - API endpoints
      /services       - Business logic
      /utils          - Logger, helpers
    .env              - Environment variables
    package.json      - Dependencies
  /mobile
    /src
      /screens        - UI screens
      /components     - Reusable components
      /navigation     - App navigation
      /services       - API clients
      /store          - Redux state
    .env              - Environment variables
    package.json      - Dependencies
  BABYSU_MASTER_PLAN.txt  - Complete technical plan
  README.md               - Project overview
```

### 2. Backend Services Created
- ✅ Suno API service (music generation)
- ✅ Gemini prompt service (AI lyrics)
- ✅ Song service (orchestration)
- ✅ Firebase configuration
- ✅ Logger utility
- ✅ Express API server
- ✅ All API routes (auth, songs, children, users)

### 3. Environment Files
- ✅ Backend .env (needs Suno API key)
- ✅ Mobile .env (configured)

## 🔑 Required API Keys

### 1. Suno API Key (CRITICAL)
1. Go to https://sunoapi.com
2. Sign up for account
3. Purchase credits ($20 minimum)
4. Copy API key
5. Add to `backend/.env`: `SUNO_API_KEY=your_key_here`

### 2. Firebase (Already Have)
- Using existing babyname2 Firebase project
- Credentials already in .env files
- ✅ No action needed

### 3. Gemini API (Already Have)
- Key already in .env files
- ✅ No action needed

### 4. Stripe (Phase 1.5 - Not Yet Needed)
- Will set up when implementing payments

## 🚀 Next Steps

### STEP 1: Install Backend Dependencies
```bash
cd /data/data/com.termux/files/home/proj/babysu/backend
npm install
```

### STEP 2: Get Suno API Key
1. Visit https://sunoapi.com
2. Sign up and add $20 credit
3. Get API key from dashboard
4. Update backend/.env with your key

### STEP 3: Create Logs Directory
```bash
mkdir -p backend/logs
```

### STEP 4: Test Backend
```bash
cd backend
npm run dev
```

Should see:
```
🚀 BabySu Backend Server started on port 5000
📊 Environment: development
🔗 API URL: http://localhost:5000/api
🏥 Health check: http://localhost:5000/health
```

### STEP 5: Test API Endpoints

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Create Test User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@babysu.com","password":"test1234","displayName":"Test User"}'
```

**Add Child Profile:**
```bash
curl -X POST http://localhost:5000/api/children \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-123" \
  -d '{"name":"Emma","age":4}'
```

**Generate Song (Requires Suno API Key):**
```bash
curl -X POST http://localhost:5000/api/songs/generate \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-123" \
  -d '{
    "childIds": ["child-id-from-previous-step"],
    "topic": "Bedtime routine",
    "category": "Daily Routines",
    "style": "lullaby",
    "customDetails": "Emma loves stars and her teddy bear"
  }'
```

**Check Song Status:**
```bash
curl http://localhost:5000/api/songs/{songId}/status \
  -H "x-user-id: test-user-123"
```

### STEP 6: Initialize Mobile App
```bash
cd /data/data/com.termux/files/home/proj/babysu/mobile
npm install
npx expo start
```

## 📝 Important Notes

### Firebase Setup
The backend uses Firebase Admin SDK with default credentials. For production:
1. Download service account key from Firebase Console
2. Add path to .env: `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`

### Redis (Queue System)
Not yet implemented. Songs generate synchronously for now. Will add in Phase 1.3.

### Testing Without Mobile App
Use curl or Postman to test all backend endpoints. Mobile app will be built in next phase.

## 🐛 Troubleshooting

### Error: "Firebase project not found"
- Check FIREBASE_PROJECT_ID in backend/.env
- Ensure Firebase project exists in console

### Error: "Suno API Error"
- Verify SUNO_API_KEY is correct
- Check you have credits in Suno account
- Test API key with:
  ```bash
  curl https://api.sunoapi.com/v1/health \
    -H "Authorization: Bearer your_key_here"
  ```

### Error: "Cannot find module"
- Run `npm install` in backend directory
- Check all dependencies in package.json

## 📊 Current Progress

**Completed:**
- [x] Project structure
- [x] Backend core services
- [x] API endpoints
- [x] Environment configuration
- [x] Documentation

**Next Up:**
- [ ] Get Suno API key
- [ ] Test song generation
- [ ] Implement Redis queue
- [ ] Build mobile app UI
- [ ] End-to-end testing

## 🎯 Week 1 Goals

By end of Week 1, we should have:
1. ✅ Backend API working
2. ⏳ Suno integration tested
3. ⏳ At least 1 song generated successfully
4. ⏳ Mobile app with basic screens
5. ⏳ Auth flow working

## 📞 Support

If stuck, check:
1. BABYSU_MASTER_PLAN.txt (detailed specs)
2. Backend logs: `backend/logs/combined.log`
3. Console output for error messages

---

**Last Updated**: 2025-10-24
**Status**: Backend complete, ready for Suno API key
