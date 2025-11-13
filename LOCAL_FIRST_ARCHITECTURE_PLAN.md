# 📱 BabySu - Local-First Mobile App Architecture Plan

**Created**: 2025-11-04
**Status**: Planning Phase
**bd Issue**: babysu-a11e

---

## 🎯 Vision

Transform BabySu into a **local-first mobile app** where:
- ✅ Child profiles stored locally on phone (SQLite)
- ✅ Downloaded songs stored locally on phone (file system)
- ✅ API used ONLY for song creation
- ✅ Stream or download generated songs
- ✅ Works offline after songs are downloaded
- ✅ Minimal backend dependency

---

## 🏗️ Current Architecture (What We Have)

### Backend (`backend/`)
- Node.js + Express API
- Firebase Auth + Firestore
- Music API integration (PiAPI/Udio)
- Cloud-based storage

### Mobile (`mobile/`)
- React Native + Expo
- Structure exists but not implemented
- Currently designed for cloud-first

### Webapp (`webapp/`)
- Vite + React
- Fully functional with guest mode
- Uses localStorage (already local-first!)

---

## 🔄 New Architecture (What We're Building)

### 1. **Local Database** (SQLite)

#### Child Profiles Table
```sql
CREATE TABLE children (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age REAL NOT NULL,
  gender TEXT,
  interests TEXT, -- JSON array
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  synced_to_cloud BOOLEAN DEFAULT 0
);
```

#### Songs Table
```sql
CREATE TABLE songs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  child_ids TEXT NOT NULL, -- JSON array
  topic TEXT,
  category TEXT,
  style TEXT,
  lyrics TEXT,
  duration INTEGER,
  image_url TEXT,
  audio_local_path TEXT, -- Path to downloaded file
  audio_remote_url TEXT, -- Streaming URL
  is_downloaded BOOLEAN DEFAULT 0,
  is_favorite BOOLEAN DEFAULT 0,
  created_at INTEGER NOT NULL,
  task_id TEXT, -- API task ID for checking status
  generation_status TEXT -- pending, processing, completed, failed
);
```

#### Settings Table
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### 2. **Local File Storage**

#### Directory Structure
```
/data/user/0/com.babysu.app/files/
├── songs/
│   ├── audio/
│   │   ├── song-123.mp3
│   │   ├── song-456.mp3
│   │   └── ...
│   └── images/
│       ├── song-123.jpg
│       ├── song-456.jpg
│       └── ...
├── children/
│   └── avatars/
│       ├── child-123.jpg
│       └── ...
└── cache/
    └── temp downloads
```

### 3. **API Integration** (Minimal)

#### Only 2 API Calls Needed:

**1. Generate Song**
```javascript
POST /api/songs/generate
{
  "prompt": "gentle bedtime lullaby...",
  "title": "Emma's Bedtime Song"
}
→ Returns: { task_id, status: "pending" }
```

**2. Check Song Status**
```javascript
GET /api/songs/status/:task_id
→ Returns: {
  status: "completed",
  audio_url: "https://...",
  image_url: "https://...",
  lyrics: "..."
}
```

### 4. **Offline-First Features**

✅ **Always Available**:
- View child profiles
- Browse downloaded songs
- Play downloaded songs
- Mark favorites
- View lyrics

⚠️ **Requires Internet**:
- Generate new songs
- Download songs
- Stream songs (before download)

---

## 🛠️ Technology Stack

### Mobile App
- **React Native** (already installed)
- **Expo** (already installed)
- **expo-sqlite**: Local database
- **expo-file-system**: File downloads
- **expo-av**: Audio playback
- **@react-native-async-storage/async-storage**: Settings
- **react-native-track-player**: Background audio

### Backend (Simplified)
- **Express API** (minimal)
- **PiAPI/Udio**: Music generation only
- **No Firebase needed** (auth can be local)
- **No database needed** (backend is stateless)

---

## 📋 Implementation Plan

### Phase 1: Local Database Setup (Week 1)
**bd subtasks to create:**
- [ ] Install and configure expo-sqlite
- [ ] Create database initialization script
- [ ] Implement child profile CRUD operations
- [ ] Implement songs table CRUD operations
- [ ] Create database migration system

### Phase 2: Local Storage Setup (Week 1)
**bd subtasks to create:**
- [ ] Install expo-file-system
- [ ] Create file download manager
- [ ] Implement song audio download
- [ ] Implement song image download
- [ ] Add download progress tracking
- [ ] Implement cache management

### Phase 3: Offline-First UI (Week 2)
**bd subtasks to create:**
- [ ] Create offline indicator component
- [ ] Build child profile screens (local CRUD)
- [ ] Build song library (show downloaded + cloud)
- [ ] Add download buttons to songs
- [ ] Show download status/progress
- [ ] Implement offline queue

### Phase 4: API Integration (Week 2)
**bd subtasks to create:**
- [ ] Simplify backend to 2 endpoints only
- [ ] Create song generation service (mobile)
- [ ] Implement status polling
- [ ] Add retry logic for failed downloads
- [ ] Handle network errors gracefully

### Phase 5: Audio Playback (Week 3)
**bd subtasks to create:**
- [ ] Install react-native-track-player
- [ ] Implement audio player component
- [ ] Add streaming capability
- [ ] Add background playback
- [ ] Implement playback queue
- [ ] Add player controls

### Phase 6: Polish & Testing (Week 3)
**bd subtasks to create:**
- [ ] Add loading states
- [ ] Implement error boundaries
- [ ] Add empty states
- [ ] Test offline scenarios
- [ ] Test download/resume
- [ ] Performance optimization

---

## 📊 Data Flow

### Creating a New Song

```
User Action → Mobile App (Local)
   ↓
1. Save to local DB (status: "pending")
   ↓
2. Call API: POST /generate
   ↓
3. Get task_id
   ↓
4. Poll API: GET /status/:task_id (every 5s)
   ↓
5. When complete: Save URLs to DB
   ↓
6. Auto-download audio file
   ↓
7. Save local path to DB
   ↓
8. Mark as downloaded
   ↓
Song ready for offline playback!
```

### Playing a Song

```
User taps song → Check DB
   ↓
Is downloaded?
   ├─ YES → Play from local file
   └─ NO  → Stream from URL (requires internet)
```

---

## 🔑 Key Benefits

1. **Offline First**: Works without internet after initial download
2. **Fast**: No API calls for browsing/playback
3. **Private**: Data stays on device
4. **Cheap**: Minimal server costs (only song generation)
5. **Simple**: No complex sync logic needed
6. **Reliable**: Not dependent on backend being up

---

## 📦 Package Dependencies to Add

```json
{
  "dependencies": {
    "expo-sqlite": "~13.4.0",
    "expo-file-system": "~16.0.6",
    "expo-av": "~13.10.4",
    "react-native-track-player": "^4.0.1",
    "@react-native-async-storage/async-storage": "1.21.0"
  }
}
```

---

## 🚧 Migration Strategy

### Option A: Fresh Start (Recommended)
- Build new mobile app from scratch
- Use local-first from day 1
- Copy UI/UX from webapp
- Skip Firebase entirely

### Option B: Gradual Migration
- Keep existing webapp
- Build mobile separately
- Both use same API
- Eventually deprecate webapp

---

## 🎯 Success Criteria

✅ User can create child profiles without internet
✅ User can generate songs (requires internet)
✅ User can download songs to device
✅ User can play downloaded songs offline
✅ App works smoothly offline after setup
✅ Downloads resume after interruption
✅ App uses < 500MB storage for 100 songs

---

## 📝 Next Steps

1. **Create bd subtask issues** for each phase
2. **Start with Phase 1**: Local database setup
3. **Build incrementally**: Each phase is testable
4. **Use webapp as reference**: Copy proven UI patterns
5. **Test offline frequently**: Airplane mode testing

---

## 💡 Optional Enhancements (Future)

- [ ] iCloud/Google Drive backup
- [ ] Share songs between devices
- [ ] Export songs to camera roll
- [ ] Batch download all songs
- [ ] Smart storage management
- [ ] Background download queue

---

**Ready to start implementation?**
Let me know and I'll create all the bd subtask issues and begin Phase 1!
