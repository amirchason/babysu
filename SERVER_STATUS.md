# 🚀 BabySU Servers Running

**Status:** ✅ Both servers active and accessible

---

## 🖥️ Server Information

### Backend API
- **URL:** http://localhost:5000
- **Status:** ✅ Running
- **Health:** http://localhost:5000/health
- **API Base:** http://localhost:5000/api
- **Database:** Mock (in-memory)

### Frontend Webapp
- **URL:** http://localhost:5173
- **Status:** ✅ Running (Vite dev server)
- **Technology:** React 19 + Material-UI
- **Build Tool:** Vite 7.1.12

---

## 📡 Port Usage

| Service | Port | Status | URL |
|---------|------|--------|-----|
| Backend | 5000 | 🟢 Active | http://localhost:5000 |
| Webapp | 5173 | 🟢 Active | http://localhost:5173 |

**No conflicts** with other Termux sessions ✅

---

## 🎯 Quick Access

### Open Webapp
```bash
termux-open-url http://localhost:5173
```

### Test Backend
```bash
curl http://localhost:5000/health
```

---

## 🛑 Stop Servers

### Stop Webapp
```bash
lsof -ti:5173 | xargs kill
```

### Stop Backend
```bash
lsof -ti:5000 | xargs kill
```

### Stop Both
```bash
lsof -ti:5000,5173 | xargs kill
```

---

## 🔄 Restart Servers

### Restart Backend
```bash
lsof -ti:5000 | xargs kill -9
cd /data/data/com.termux/files/home/proj/babysu/backend
node src/server.js &
```

### Restart Webapp
```bash
lsof -ti:5173 | xargs kill -9
cd /data/data/com.termux/files/home/proj/babysu/webapp
npm run dev &
```

---

## 📊 Current Session Info

**Started:** 2025-11-06 16:01
**Backend Process:** Running in background
**Webapp Process:** Running in background
**No Firebase:** Using mock database ✅

---

## 🧪 Test Endpoints

### Health Check
```bash
curl http://localhost:5000/health
```

### Create Child
```bash
curl -X POST http://localhost:5000/api/children \
  -H "Content-Type: application/json" \
  -H "x-user-id: $(whoami)" \
  -d '{"name":"Emma","age":2}'
```

### View Children
```bash
curl http://localhost:5000/api/children \
  -H "x-user-id: $(whoami)"
```

---

## 📝 Logs

### View Backend Logs
```bash
# If started with output redirection:
tail -f /tmp/babysu-backend.log

# Or check background process:
lsof -ti:5000 | xargs ps -p
```

### View Webapp Logs
```bash
# Check Vite output
curl -s http://localhost:5173/__vite_ping
```

---

**🎵 Webapp is now accessible at:** http://localhost:5173
**📡 Backend API ready at:** http://localhost:5000/api

*Auto-generated: 2025-11-06*
