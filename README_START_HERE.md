# 👋 START HERE - BabySu Development

**⚠️ IMPORTANT: Read this file every time you start working on BabySu!**

---

## 🔍 FIRST THING TO DO

### 1. Read the Session Log
```bash
cat /data/data/com.termux/files/home/proj/babysu/.claude/session-log.md
```

This file contains:
- ✅ Current project status
- ⚠️ Known issues and blockers
- 🔑 API key status
- 📝 Recent code changes
- 🎯 Next steps

### 2. Check Server Status
```bash
ps aux | grep node
curl http://localhost:5000/health
```

### 3. Review Current Blocker
**Current Issue**: Suno API key needs to be updated
**Location**: `backend/.env`
**Status**: User getting correct key

---

## 📚 KEY FILES TO KNOW

| File | Purpose | When to Read |
|------|---------|--------------|
| `.claude/session-log.md` | **READ FIRST!** Current status & changes | Every session start |
| `FINAL_STATUS.md` | Detailed status report | When need overview |
| `BABYSU_MASTER_PLAN.txt` | Complete specifications (8,700 lines) | When need technical details |
| `SUNO_API_RESEARCH.md` | API provider research | When working with Suno API |
| `backend/.env` | API keys & configuration | When updating keys |

---

## 🚀 QUICK COMMANDS

### Start Development
```bash
cd /data/data/com.termux/files/home/proj/babysu

# Check what's running
ps aux | grep node

# Start server if needed
cd backend
node src/server.js &

# Test health
curl http://localhost:5000/health
```

### When User Provides Correct API Key
```bash
# 1. Update .env file
nano backend/.env
# Update SUNO_API_KEY line

# 2. Test with all providers
cd backend
node test_all_providers.js

# 3. Test song generation
node test_suno_final.js
```

### View Logs
```bash
# Server logs
tail -f backend/logs/server.log

# Combined logs
tail -f backend/logs/combined.log
```

---

## 📊 PROJECT STATUS (Quick View)

```
Backend API:     ✅ 100% Complete (15+ endpoints)
Suno Integration: ⚠️  95% (awaiting correct API key)
Gemini AI:       ✅ Working
Firebase:        ✅ Configured
Mobile App:      ⏳ Not started
Server Status:   ✅ Running on port 5000

CURRENT BLOCKER: Waiting for correct Suno API key from user
```

---

## 🎯 CURRENT PRIORITIES

1. **BLOCKED**: Suno API key update (user getting correct key)
2. **NEXT**: Test song generation
3. **THEN**: Generate first song "Emma's Bedtime Lullaby"
4. **AFTER**: Start mobile app development

---

## ⚠️ CRITICAL REMINDERS

- ✅ **Always read `.claude/session-log.md` first**
- ✅ **Update session log after any changes**
- ✅ **Check server status before starting**
- ✅ **Backend is 95% done - just need API key**
- ⚠️ **Don't reinstall dependencies (already installed)**

---

## 💡 CONTEXT FOR CLAUDE

This project is **BabySu** - a personalized AI children's music app that:
- Generates custom songs with child's name
- Helps parents with behavioral challenges
- Uses Suno API for music + Gemini for prompts
- $16B market opportunity
- 95% backend complete

**We're paused waiting for user to provide correct Suno API key.**

---

## 📞 WHEN USER RETURNS

**Expected**: User will provide correct Suno API key

**Then do**:
1. Read session log for current state
2. Update `.env` with new key
3. Test with `node test_all_providers.js`
4. Generate first song
5. Update session log with results

---

**Read `.claude/session-log.md` now! 👆**
