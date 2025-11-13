# 🎵 BabySu Web App → APK Master Plan
## Modular Cross-Platform Development Strategy

**Created**: 2025-10-25
**Status**: 🟡 Planning Phase
**Target**: Web App (PWA) → Standalone Android APK

---

## 📋 EXECUTIVE SUMMARY

**Problem**: Built React Native app requires Expo Go for testing - not acceptable for single-user deployment.

**Solution**: Build modular React web app that:
1. Runs in ANY browser (no installation)
2. Works as PWA (installable, offline-capable)
3. Converts to standalone APK via Capacitor.js
4. Shares 70-90% code between web/mobile

**Timeline**:
- Web App MVP: 8-12 hours
- PWA Features: 2-3 hours
- APK Conversion: 2-3 hours
- **Total**: 12-18 hours

---

## 🏗️ ARCHITECTURE OVERVIEW

### Phase 1: React Web App (NOW)
```
┌─────────────────────────────────────┐
│    BabySu Web App (React 18)       │
│  ├─ Runs in browser (Chrome/Safari)│
│  ├─ Responsive mobile-first design │
│  ├─ Works with backend API         │
│  └─ No installation required       │
└─────────────────────────────────────┘
```

### Phase 2: PWA Enhancement (+2-3 hours)
```
┌─────────────────────────────────────┐
│  BabySu PWA (Progressive Web App)  │
│  ├─ Installable on home screen     │
│  ├─ Offline audio playback         │
│  ├─ Service Worker caching         │
│  ├─ Background sync                │
│  └─ Push notifications (optional)  │
└─────────────────────────────────────┘
```

### Phase 3: Native APK (+2-3 hours)
```
┌─────────────────────────────────────┐
│   BabySu Android APK (Capacitor)   │
│  ├─ Real Android app (.apk file)   │
│  ├─ Installable like any app       │
│  ├─ Access to native APIs          │
│  ├─ No browser chrome/UI           │
│  └─ Publishable to Play Store      │
└─────────────────────────────────────┘
```

---

## 🎯 CORE PRINCIPLES

### 1. Modular Architecture
```
src/
├── core/              # Shared business logic
│   ├── api/          # API clients (reusable)
│   ├── state/        # Redux store (platform-agnostic)
│   └── utils/        # Helper functions
├── features/         # Feature modules
│   ├── auth/         # Login/register
│   ├── children/     # Child management
│   ├── songs/        # Song library
│   └── player/       # Audio playback
├── ui/               # UI components
│   ├── components/   # Reusable components
│   ├── layouts/      # Page layouts
│   └── theme/        # Design tokens
└── platform/         # Platform-specific code
    ├── web/          # Web-only features
    └── native/       # Capacitor-only features
```

### 2. Code Reusability Target
- **Business Logic**: 100% shared
- **State Management**: 100% shared
- **API Layer**: 100% shared
- **UI Components**: 85-95% shared
- **Platform-specific**: 5-15%

### 3. Technology Stack

**Core Framework**:
- React 18.2+ (latest stable)
- TypeScript (optional but recommended)
- Vite (lightning-fast dev server)

**State Management**:
- Redux Toolkit (same as React Native version)
- Redux Persist (offline state)

**UI Framework**:
- Material-UI (MUI) v5+ (responsive, accessible)
- Emotion for styling (CSS-in-JS)
- React Router v6 (navigation)

**PWA Tools**:
- Workbox (Google's service worker library)
- IndexedDB (offline audio storage)
- Web App Manifest

**Build & Deploy**:
- Vite for bundling
- Capacitor.js for native conversion
- GitHub Actions (optional CI/CD)

---

## 📐 DETAILED SPECIFICATIONS

### App Structure

#### Core Features (Must Have)
1. **Authentication**
   - Email/password login
   - Auto-login (single user)
   - Session persistence

2. **Child Management**
   - Add/Edit/Delete child profiles
   - Name, age, gender
   - Avatar display (first letter)

3. **Song Generator**
   - 4-step wizard
   - Child selection (multi-select)
   - Category picker (8 categories)
   - Topic input
   - Style selector (5 styles)
   - Generate button

4. **Song Library**
   - List all songs
   - Search by title/category
   - Filter by child, status
   - Play/Pause controls
   - Favorite toggle
   - Delete songs

5. **Audio Player**
   - Play/Pause/Seek
   - Progress bar
   - Volume control
   - Mini player (persistent)

6. **Settings**
   - User profile
   - Usage stats
   - Logout

#### PWA Features (Phase 2)
1. **Offline Mode**
   - Cache all UI assets
   - Store songs in IndexedDB
   - Background sync for new songs

2. **Installation**
   - Add to home screen prompt
   - Custom app icon
   - Splash screen

3. **Push Notifications** (optional)
   - Song generation complete
   - Daily usage reminders

### Design System

**Colors** (Pink Theme):
```css
--primary: #FF6B9D;      /* Pink */
--secondary: #FFA07A;    /* Coral */
--tertiary: #98D8C8;     /* Mint */
--accent: #FFD93D;       /* Yellow */
--background: #FFF9FB;   /* Light pink */
--text: #2D3436;         /* Dark gray */
```

**Spacing Scale**:
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-xxl: 48px;
```

**Responsive Breakpoints**:
```css
--mobile: 320px - 767px
--tablet: 768px - 1023px
--desktop: 1024px+
```

**Typography**:
```css
--font-family: 'Inter', -apple-system, sans-serif;
--font-size-sm: 12px;
--font-size-md: 14px;
--font-size-lg: 16px;
--font-size-xl: 20px;
--font-size-xxl: 28px;
```

### API Integration

**Backend**: Existing Node.js/Express API
**Base URL**: `http://localhost:5000/api` (dev)
**Authentication**: JWT token in headers

**Endpoints** (Already Built):
```
POST   /auth/login
POST   /auth/register
GET    /auth/me

GET    /children
POST   /children
PUT    /children/:id
DELETE /children/:id

POST   /songs/generate
GET    /songs
GET    /songs/:id
PUT    /songs/:id/favorite
DELETE /songs/:id

GET    /users/profile
GET    /users/usage
```

---

## 🗓️ DEVELOPMENT ROADMAP

### ✅ COMPLETED (React Native Version)
- [x] Backend API (95% complete)
- [x] Udio music generation integration
- [x] Firebase Firestore database
- [x] 8 React Native screens (2,500+ lines)
- [x] Redux state management
- [x] API client with interceptors

### 🟡 PHASE 1: Web App Foundation (6-8 hours)

#### Step 1.1: Project Setup (30 min)
- [ ] Create new Vite + React project
- [ ] Install dependencies:
  - [ ] React 18.2
  - [ ] React Router DOM v6
  - [ ] Redux Toolkit
  - [ ] MUI (Material-UI)
  - [ ] Axios
  - [ ] React Hook Form (forms)
- [ ] Configure folder structure (modular)
- [ ] Setup theme provider (MUI + custom)
- [ ] Configure environment variables

**Commands**:
```bash
npm create vite@latest webapp -- --template react
cd webapp
npm install @mui/material @emotion/react @emotion/styled
npm install react-router-dom @reduxjs/toolkit react-redux
npm install axios react-hook-form
```

#### Step 1.2: Core Infrastructure (1 hour)
- [ ] Create Redux store (copy from React Native)
- [ ] Port authSlice.js (100% reusable)
- [ ] Port childrenSlice.js (100% reusable)
- [ ] Port songsSlice.js (100% reusable)
- [ ] Port playerSlice.js (100% reusable)
- [ ] Create API client (copy from React Native)
- [ ] Setup React Router routes

#### Step 1.3: Shared Components (2 hours)
- [ ] AppLayout (header, nav, footer)
- [ ] Button component (primary, secondary, outlined)
- [ ] Card component (song card, child card)
- [ ] Input components (text, select, multi-select)
- [ ] LoadingSpinner
- [ ] EmptyState
- [ ] ErrorBoundary

#### Step 1.4: Authentication Pages (1.5 hours)
- [ ] SplashScreen (branded loading)
- [ ] LoginPage (email/password form)
- [ ] RegisterPage (name, email, password, terms)
- [ ] Auto-login logic (from .env)
- [ ] Protected route wrapper

#### Step 1.5: Main App Pages (3-4 hours)
- [ ] HomePage (dashboard with stats)
- [ ] ChildrenPage (list + add/edit)
- [ ] SongGeneratorPage (4-step wizard)
- [ ] LibraryPage (list + search + filters)
- [ ] SongDetailPage (lyrics + player)
- [ ] SettingsPage (profile + logout)

#### Step 1.6: Audio Player Component (1 hour)
- [ ] HTML5 Audio element wrapper
- [ ] Play/Pause/Seek controls
- [ ] Progress bar (visual + scrubbing)
- [ ] Mini player (bottom of screen)
- [ ] Volume control

**Checkpoint**: ✅ Functional web app in browser

---

### 🟢 PHASE 2: PWA Enhancement (2-3 hours)

#### Step 2.1: Service Worker Setup (1 hour)
- [ ] Install Workbox
- [ ] Create service worker
- [ ] Configure caching strategy:
  - [ ] Cache-first for static assets
  - [ ] Network-first for API calls
  - [ ] Stale-while-revalidate for images
- [ ] Add offline fallback page

**Commands**:
```bash
npm install workbox-webpack-plugin
npm install workbox-window
```

#### Step 2.2: Offline Audio (1 hour)
- [ ] Setup IndexedDB for audio storage
- [ ] Cache audio files on first play
- [ ] Implement range request handling
- [ ] Add download progress indicator
- [ ] Test offline playback

**Libraries**:
```bash
npm install localforage  # IndexedDB wrapper
```

#### Step 2.3: App Manifest & Installation (30 min)
- [ ] Create manifest.json
- [ ] Add app icons (192x192, 512x512)
- [ ] Configure splash screen
- [ ] Add install prompt UI
- [ ] Test "Add to Home Screen"

**manifest.json**:
```json
{
  "name": "BabySu - AI Songs for Kids",
  "short_name": "BabySu",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FF6B9D",
  "theme_color": "#FF6B9D",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Step 2.4: PWA Testing (30 min)
- [ ] Test in Chrome DevTools (Lighthouse)
- [ ] Verify offline mode works
- [ ] Test installation flow
- [ ] Check service worker updates
- [ ] Test on real device

**Checkpoint**: ✅ Installable PWA with offline support

---

### 🔵 PHASE 3: Native APK Conversion (2-3 hours)

#### Step 3.1: Capacitor Setup (30 min)
- [ ] Install Capacitor CLI
- [ ] Initialize Capacitor project
- [ ] Add Android platform
- [ ] Configure capacitor.config.ts

**Commands**:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npm install @capacitor/android
npx cap add android
```

**capacitor.config.ts**:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.babysu.app',
  appName: 'BabySu',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

#### Step 3.2: Build Web Assets (15 min)
- [ ] Run production build
- [ ] Copy assets to Capacitor
- [ ] Verify build output

**Commands**:
```bash
npm run build
npx cap copy android
npx cap sync android
```

#### Step 3.3: Android Configuration (30 min)
- [ ] Install Android Studio (if not installed)
- [ ] Open project in Android Studio
- [ ] Configure app permissions (AndroidManifest.xml):
  - [ ] INTERNET
  - [ ] RECORD_AUDIO (optional, for future features)
  - [ ] WRITE_EXTERNAL_STORAGE (for downloads)
- [ ] Update app icon
- [ ] Configure splash screen

#### Step 3.4: Build APK (30 min)
- [ ] Open Android Studio
- [ ] Build > Build Bundle(s) / APK(s) > Build APK(s)
- [ ] Wait for build to complete (~5-10 min)
- [ ] Locate APK file:
  - `android/app/build/outputs/apk/debug/app-debug.apk`
- [ ] Transfer to device
- [ ] Install and test

**Alternative CLI Build**:
```bash
cd android
./gradlew assembleDebug
```

#### Step 3.5: Native Features (Optional, 1 hour)
- [ ] Add Capacitor plugins:
  - [ ] @capacitor/filesystem (save songs)
  - [ ] @capacitor/share (share songs)
  - [ ] @capacitor/splash-screen
  - [ ] @capacitor/status-bar
  - [ ] @capacitor/push-notifications (future)

**Commands**:
```bash
npm install @capacitor/filesystem @capacitor/share
npx cap sync
```

**Checkpoint**: ✅ Standalone Android APK

---

## 🔄 REUSABILITY MAPPING

### Code to Reuse from React Native Version

#### ✅ 100% Reusable (Copy-Paste)
```
mobile/src/store/slices/
├── authSlice.js         ✅ Redux logic identical
├── childrenSlice.js     ✅ Redux logic identical
├── songsSlice.js        ✅ Redux logic identical
└── playerSlice.js       ✅ Redux logic identical

mobile/src/services/
└── api.js               ✅ Axios client identical
```

#### 🔄 80-90% Reusable (Minor Adaptation)
```
mobile/src/screens/
├── LoginScreen.js       → LoginPage.jsx (swap RN components → MUI)
├── RegisterScreen.js    → RegisterPage.jsx
├── HomeScreen.js        → HomePage.jsx
├── ChildrenScreen.js    → ChildrenPage.jsx
├── SongGeneratorScreen.js → SongGeneratorPage.jsx
├── LibraryScreen.js     → LibraryPage.jsx
└── SettingsScreen.js    → SettingsPage.jsx
```

**Conversion Pattern**:
```javascript
// React Native
import { View, Text } from 'react-native';
<View><Text>Hello</Text></View>

// React Web
import { Box, Typography } from '@mui/material';
<Box><Typography>Hello</Typography></Box>
```

#### ⚠️ Requires Rewrite
```
- Navigation (React Navigation → React Router)
- Audio player (expo-av → HTML5 Audio API)
- Styling (StyleSheet → Emotion/MUI)
```

---

## 📊 PROGRESS TRACKING

### Development Checklist

#### 🟡 Phase 1: Web App (0/30 tasks)
**Setup & Infrastructure** (0/7)
- [ ] 1.1.1 Create Vite project
- [ ] 1.1.2 Install core dependencies
- [ ] 1.1.3 Configure folder structure
- [ ] 1.1.4 Setup MUI theme
- [ ] 1.1.5 Configure environment variables
- [ ] 1.1.6 Create Redux store
- [ ] 1.1.7 Setup React Router

**Redux State** (0/4)
- [ ] 1.2.1 Port authSlice
- [ ] 1.2.2 Port childrenSlice
- [ ] 1.2.3 Port songsSlice
- [ ] 1.2.4 Port playerSlice

**API Layer** (0/2)
- [ ] 1.2.5 Port API client
- [ ] 1.2.6 Test API connectivity

**Shared Components** (0/7)
- [ ] 1.3.1 AppLayout component
- [ ] 1.3.2 Button component
- [ ] 1.3.3 Card component
- [ ] 1.3.4 Input components
- [ ] 1.3.5 LoadingSpinner
- [ ] 1.3.6 EmptyState
- [ ] 1.3.7 ErrorBoundary

**Auth Pages** (0/4)
- [ ] 1.4.1 SplashScreen
- [ ] 1.4.2 LoginPage
- [ ] 1.4.3 RegisterPage
- [ ] 1.4.4 Auto-login logic

**Main Pages** (0/6)
- [ ] 1.5.1 HomePage (dashboard)
- [ ] 1.5.2 ChildrenPage
- [ ] 1.5.3 SongGeneratorPage
- [ ] 1.5.4 LibraryPage
- [ ] 1.5.5 SongDetailPage
- [ ] 1.5.6 SettingsPage

#### 🔵 Phase 2: PWA (0/10 tasks)
**Service Worker** (0/4)
- [ ] 2.1.1 Install Workbox
- [ ] 2.1.2 Create service worker
- [ ] 2.1.3 Configure caching
- [ ] 2.1.4 Add offline fallback

**Offline Audio** (0/3)
- [ ] 2.2.1 Setup IndexedDB
- [ ] 2.2.2 Implement audio caching
- [ ] 2.2.3 Test offline playback

**Installation** (0/3)
- [ ] 2.3.1 Create manifest.json
- [ ] 2.3.2 Generate app icons
- [ ] 2.3.3 Add install prompt

#### 🟢 Phase 3: APK (0/8 tasks)
**Capacitor Setup** (0/3)
- [ ] 3.1.1 Install Capacitor
- [ ] 3.1.2 Initialize project
- [ ] 3.1.3 Add Android platform

**Build Process** (0/3)
- [ ] 3.2.1 Production build
- [ ] 3.2.2 Copy to Capacitor
- [ ] 3.2.3 Build APK

**Testing** (0/2)
- [ ] 3.4.1 Install on device
- [ ] 3.4.2 Full E2E test

**Total Progress**: 0/48 tasks (0%)

---

## 🎨 UI/UX SPECIFICATIONS

### Page Wireframes

#### HomePage (Dashboard)
```
┌────────────────────────────────┐
│ 🎵 BabySu                  ☰   │
├────────────────────────────────┤
│ Good Evening, Parent!          │
│ 2 children registered          │
├────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │  12  │ │   5  │ │  20  │    │
│ │Songs │ │Favs  │ │Limit │    │
│ └──────┘ └──────┘ └──────┘    │
├────────────────────────────────┤
│ Quick Actions                  │
│ ┌────────┐ ┌────────┐         │
│ │Create  │ │Add     │         │
│ │Song    │ │Child   │         │
│ └────────┘ └────────┘         │
├────────────────────────────────┤
│ Your Children                  │
│ ┌─────┐ ┌─────┐               │
│ │  E  │ │  M  │ →             │
│ │Emma │ │Mike │               │
│ └─────┘ └─────┘               │
├────────────────────────────────┤
│ Recent Songs                   │
│ 🎵 Bedtime Lullaby             │
│ 🎵 Potty Training Song         │
│ 🎵 Morning Routine             │
└────────────────────────────────┘
│ 🏠  📚  ➕  👶  ⚙️           │
```

#### SongGeneratorPage
```
┌────────────────────────────────┐
│ ← Create a Song                │
├────────────────────────────────┤
│ Step 1/4: Select Child         │
│ ┌──────────────────┐           │
│ │ ☑ Emma           │           │
│ │ ☐ Mike           │           │
│ └──────────────────┘           │
├────────────────────────────────┤
│ Step 2/4: Choose Category      │
│ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │🌙   │ │☀️   │ │💧   │       │
│ │Bed  │ │Morn │ │Potty│       │
│ └─────┘ └─────┘ └─────┘       │
├────────────────────────────────┤
│ Step 3/4: Song Details         │
│ Topic: ___________________     │
│ Custom: __________________     │
├────────────────────────────────┤
│ Step 4/4: Choose Style         │
│ ○ Lullaby  ○ Upbeat           │
│ ○ Calm     ○ Playful          │
├────────────────────────────────┤
│ [Generate Song 🎵]             │
└────────────────────────────────┘
```

### Responsive Behavior

**Mobile (320-767px)**:
- Single column layout
- Bottom navigation
- Full-width cards
- Touch-optimized controls

**Tablet (768-1023px)**:
- Two-column grid
- Side navigation (optional)
- Larger touch targets

**Desktop (1024px+)**:
- Three-column grid
- Sidebar navigation
- Mouse/keyboard optimized
- Keyboard shortcuts

---

## 🔒 SECURITY & PERFORMANCE

### Security Checklist
- [ ] HTTPS only (production)
- [ ] JWT token in httpOnly cookies (if possible)
- [ ] Input validation (client + server)
- [ ] XSS protection (sanitize HTML)
- [ ] CSRF protection
- [ ] Rate limiting on API
- [ ] Secure local storage (encrypt sensitive data)

### Performance Targets
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse Score > 90
- [ ] Bundle size < 500KB (gzipped)
- [ ] Code splitting by route
- [ ] Lazy loading for heavy components
- [ ] Image optimization (WebP, lazy load)

---

## 🧪 TESTING STRATEGY

### Unit Tests
- [ ] Redux reducers
- [ ] API client functions
- [ ] Utility functions
- [ ] Form validation

### Integration Tests
- [ ] Auth flow
- [ ] Song generation flow
- [ ] Child management CRUD

### E2E Tests (Playwright/Cypress)
- [ ] Complete user journey:
  1. Login
  2. Add child
  3. Generate song
  4. Play song
  5. Add to favorites

### PWA Tests
- [ ] Offline functionality
- [ ] Install prompt
- [ ] Service worker updates
- [ ] Audio caching

---

## 📦 DEPLOYMENT OPTIONS

### Phase 1: Web App
**Option 1: Vercel** (Recommended)
```bash
npm install -g vercel
vercel deploy
```

**Option 2: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Option 3: Firebase Hosting**
```bash
npm install -g firebase-tools
firebase deploy --only hosting
```

### Phase 2: PWA
- Same as web app (auto-enabled)
- Ensure HTTPS for installation

### Phase 3: APK
**Option 1: Direct Install**
- Transfer .apk to device
- Enable "Unknown sources"
- Install manually

**Option 2: Internal Distribution**
- Firebase App Distribution
- Google Play Console (Beta track)

**Option 3: Public Release**
- Google Play Store submission
- Requires developer account ($25 one-time)

---

## 🚀 QUICK START COMMANDS

### Development
```bash
# Start web app
cd webapp
npm run dev

# Start backend
cd backend
npm start

# Build production
npm run build

# Preview production build
npm run preview
```

### PWA Testing
```bash
# Build & serve with HTTPS
npm run build
npx serve -s dist -p 3000 --ssl-cert cert.pem --ssl-key key.pem
```

### APK Build
```bash
# Build web app
npm run build

# Sync with Capacitor
npx cap sync android

# Open Android Studio
npx cap open android

# Or build via CLI
cd android && ./gradlew assembleDebug
```

---

## 📚 RESOURCES & DOCUMENTATION

### Official Docs
- React: https://react.dev
- Vite: https://vitejs.dev
- MUI: https://mui.com
- Redux Toolkit: https://redux-toolkit.js.org
- Capacitor: https://capacitorjs.com
- Workbox: https://developers.google.com/web/tools/workbox

### Tutorials
- PWA Guide: https://web.dev/progressive-web-apps/
- Capacitor Tutorial: https://capacitorjs.com/docs/getting-started
- IndexedDB: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

### Tools
- Lighthouse (PWA audit): Chrome DevTools
- PWA Builder: https://www.pwabuilder.com
- Android Studio: https://developer.android.com/studio

---

## 🎯 SUCCESS CRITERIA

### Phase 1: Web App ✅
- [ ] App loads in browser
- [ ] All 6 pages functional
- [ ] Auto-login works
- [ ] Backend API integrated
- [ ] Songs can be generated
- [ ] Audio playback works
- [ ] Mobile responsive

### Phase 2: PWA ✅
- [ ] Installable on device
- [ ] Works offline (basic UI)
- [ ] Audio playback offline
- [ ] Lighthouse PWA score > 90
- [ ] Install prompt appears

### Phase 3: APK ✅
- [ ] APK builds successfully
- [ ] Installs on Android device
- [ ] All features work
- [ ] No browser chrome visible
- [ ] Native feel

---

## 📊 METRICS & KPIs

### Development Metrics
- Lines of code: ~3,500 (estimated)
- Code reuse from RN: ~70%
- Time to first interactive: < 3s
- Bundle size: < 500KB (gzipped)

### User Metrics (Post-Launch)
- Install rate (PWA): Target > 20%
- Offline usage: Target > 50% of sessions
- Song generation success: Target > 95%
- Daily active usage: Target 1+ song/day

---

## 🔄 VERSION HISTORY

**v0.1 - 2025-10-25** (Current)
- Initial planning document
- Technology stack defined
- Architecture outlined
- Development roadmap created

**v0.2 - TBD**
- Phase 1 progress updates
- Code snippets added
- Testing results

**v1.0 - TBD**
- Web app MVP complete
- PWA features complete
- APK build successful

---

## 💡 NOTES & DECISIONS

### Decision Log

**2025-10-25**: Chose React + Vite over Next.js
- Reason: Simpler, faster, better for SPA
- Next.js SSR not needed for single-user app

**2025-10-25**: Chose MUI over Tailwind
- Reason: Component library = faster dev
- Consistent with Material Design
- Better accessibility out-of-box

**2025-10-25**: Chose Capacitor over Cordova
- Reason: Modern, better maintained
- Native-first approach
- Better TypeScript support

### Future Enhancements
- [ ] Voice recording (custom lyrics)
- [ ] Share songs via link
- [ ] Song history/analytics
- [ ] Playlist creation
- [ ] Sleep timer
- [ ] Lyrics editing
- [ ] Multi-language support

---

## 🆘 TROUBLESHOOTING

### Common Issues

**Issue**: Service worker not updating
**Solution**: Clear cache, hard reload (Ctrl+Shift+R)

**Issue**: Audio not playing offline
**Solution**: Check IndexedDB, verify range request handling

**Issue**: APK build fails
**Solution**: Check Android SDK, Gradle version, Java version

**Issue**: Install prompt not appearing
**Solution**: Verify HTTPS, manifest.json, service worker registered

---

**Last Updated**: 2025-10-25
**Maintainer**: Development Team
**Status**: 🟡 Living Document - Update as Progress is Made

---

## 🎬 NEXT ACTIONS

1. **Review this plan** with stakeholders
2. **Set up development environment** (Node, Vite, Android Studio)
3. **Start Phase 1.1** (Project setup)
4. **Update this document** after each major milestone
5. **Track progress** in checklist sections

**Let's build something amazing! 🚀**
