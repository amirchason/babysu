# 🎵 BabySu - Personalized AI Children's Music App

> Every child deserves their own song!

## 🚀 Project Status

**Phase**: MVP Development (Week 1)
**Last Updated**: 2025-10-24

## 📋 Quick Links

- [Master Plan](./BABYSU_MASTER_PLAN.txt) - Complete technical specifications
- [Backend](./backend/) - Node.js + Express API
- [Mobile App](./mobile/) - React Native + Expo

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- Firebase (Auth, Firestore, Storage)
- Suno API (music generation)
- Google Gemini (prompt engineering)
- Bull + Redis (queue system)
- Stripe (payments)

### Mobile App
- React Native + Expo
- Redux Toolkit
- React Native Paper (UI)
- React Native Track Player (audio)
- Firebase SDK

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Suno API key ([Get here](https://sunoapi.com))
- Firebase project
- Google Gemini API key

## 🔒 Security Setup (IMPORTANT!)

**⚠️ CRITICAL: Never commit `.env` files to version control!**

This project uses environment variables to store sensitive API keys and credentials. Follow these steps carefully:

### 1. Set Up Environment Files

Each component (backend, mobile, webapp) has its own `.env.example` template. Copy these to create your local `.env` files:

```bash
# Backend
cd backend
cp .env.example .env

# Mobile
cd mobile
cp .env.example .env

# Web App
cd webapp
cp .env.example .env
```

### 2. Obtain Required API Keys

You'll need to sign up for these services and get API keys:

| Service | Purpose | Get Key From |
|---------|---------|--------------|
| **Firebase** | Authentication, Database, Storage | [console.firebase.google.com](https://console.firebase.google.com/) |
| **Suno API** | AI Music Generation | [docs.sunoapi.org](https://docs.sunoapi.org/suno-api/quickstart) |
| **Google Gemini** | Prompt Engineering | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| **OpenAI** (optional) | Advanced Prompts | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **Stripe** (optional) | Payments | [dashboard.stripe.com](https://dashboard.stripe.com/test/apikeys) |

### 3. Configure Environment Variables

Edit each `.env` file and replace the placeholder values with your actual API keys:

```bash
# Example for backend/.env
SUNO_API_KEY=your_actual_suno_key_here
GEMINI_API_KEY=your_actual_gemini_key_here
OPENAI_API_KEY=your_actual_openai_key_here
# ... etc
```

### 4. Generate Secure JWT Secret

For `JWT_SECRET` in `backend/.env`, generate a secure random string:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 64
```

### 5. Verify .gitignore

The `.gitignore` file is configured to exclude all `.env` files. Verify with:

```bash
git status
# Should NOT show any .env files
```

### ⚠️ Security Checklist

Before committing or deploying:

- [ ] `.env` files are NOT tracked by git
- [ ] All API keys are in `.env` files, not hardcoded
- [ ] `.env.example` files contain NO real secrets
- [ ] JWT secret is strong and random
- [ ] Auto-login credentials are removed in production
- [ ] Firebase security rules are configured
- [ ] CORS origins are restricted in production

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Add your API keys (see Security Setup above)
npm run dev
```

Backend will run on http://localhost:5000

### Mobile App Setup

```bash
cd mobile
npm install
cp .env.example .env  # Configure API URLs
npx expo start
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Auth Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/verify` - Verify Firebase token
- `GET /auth/me` - Get current user

### Song Endpoints
- `POST /songs/generate` - Generate new song
- `GET /songs` - Get all songs
- `GET /songs/:id` - Get specific song
- `GET /songs/:id/status` - Check generation status
- `PATCH /songs/:id/favorite` - Toggle favorite
- `DELETE /songs/:id` - Delete song

### Child Endpoints
- `POST /children` - Create child profile
- `GET /children` - Get all children
- `GET /children/:id` - Get specific child
- `PATCH /children/:id` - Update child
- `DELETE /children/:id` - Delete child

## 🎯 Current Sprint Goals

**Week 1 Objectives:**
- [x] Project structure setup
- [x] Backend core services (Suno, Gemini, Firebase)
- [x] Express API server with routes
- [x] Environment configuration
- [ ] Redis queue implementation
- [ ] Mobile app initialization
- [ ] Test song generation flow

## 📊 Progress Tracking

See [BABYSU_MASTER_PLAN.txt](./BABYSU_MASTER_PLAN.txt) for detailed roadmap.

## 🤝 Contributing

This is a private project during MVP development.

## 📝 License

Proprietary - All rights reserved

---

**Built with ❤️ for parents and kids everywhere**
