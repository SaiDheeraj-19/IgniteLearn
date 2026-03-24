# 🚀 IgniteLearn — AI Career GPS for Underserved Students

A production-ready full-stack web MVP that assesses student skills, generates AI-powered personalized learning roadmaps, and tracks progress — optimized for mobile-first, low-bandwidth usage in rural/semi-urban India.

## 📁 Project Structure

```
IgniteLearn/
├── frontend/                  # Vite + React + Tailwind CSS
│   └── src/
│       ├── pages/             # Landing, Quiz, Results, Dashboard
│       ├── components/        # Navbar, ProgressBar, LoadingSpinner
│       ├── services/          # api.js (axios service layer)
│       ├── context/           # AuthContext, LanguageContext
│       └── i18n/              # en.json, hi.json, te.json
│
└── backend/                   # Node.js + Express (MVC)
    ├── routes/                # auth, quiz, roadmap, progress, content
    ├── controllers/           # quiz, roadmap, progress, content
    ├── services/              # firebase, gemini, youtube
    ├── utils/                 # ruleEngine, promptBuilder, validators, errorHandler
    └── data/                  # questions.json (adaptive quiz bank)
```

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in GEMINI_API_KEY, YOUTUBE_API_KEY, FIREBASE_SERVICE_ACCOUNT_KEY
npm install
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Fill in VITE_FIREBASE_* config values
npm install
npm run dev
```

App will be available at **http://localhost:5173**

---

## 🔑 API Keys Required

| Key | Where to get |
|-----|-------------|
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `YOUTUBE_API_KEY` | [Google Cloud Console](https://console.cloud.google.com) → APIs → YouTube Data API v3 |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase Console → Project Settings → Service Accounts → Generate Key |
| `VITE_FIREBASE_*` | Firebase Console → Project Settings → Web App Config |

---

## 🏗️ Architecture

### AI Pipeline (Critical Path)

```
Quiz Submission
   │
   ▼
calculateScores() → raw domain scores (0–100)
   │
   ▼
ruleEngine.processScores() → enriched profile (levels, flags, strengths)
   │
   ▼
promptBuilder.buildRoadmapPrompt() → deterministic structured prompt
   │
   ▼
gemini.generateRoadmap() → parsed JSON roadmap
   │
   ▼
Firestore persistence → roadmaps/{userId}
```

### Adaptive Quiz Logic

```
Start: Easy question per domain
  ├─ Correct → Medium → Hard
  └─ Wrong   → Another Easy or stops
```

Domain scores calculated:
- Easy correct = 10 pts
- Medium correct = 15 pts
- Hard correct = 20 pts
- Score = (earned / max) × 100

### Rule Engine (Pre-AI Processing)

```javascript
math_score < 40      → "beginner"
math_score 40–70     → "intermediate"
math_score > 70      → "advanced"

logic_score > 70     → analyticalStrength flag
creativity_score > 65→ creativeAptitude flag
english_score < 40   → preferVernacularContent flag
math > 70 & logic > 70 → stemReady flag
```

---

## 🌐 Firebase Firestore Schema

```
users/{uid}
  ├── name: string
  ├── email: string
  ├── language: "en" | "hi" | "te"
  └── createdAt: timestamp

quizResults/{uid}
  ├── scores: { math, logic, english, science, creativity }  // 0–100
  └── completedAt: timestamp

roadmaps/{uid}
  ├── careers: [{ title, matchPercent, description, avgSalary, skills }]
  ├── roadmap: [{ week, topic, description, durationHours, tags, resources }]
  ├── skillGaps: string[]
  ├── explanation: string
  └── generatedAt: timestamp

progress/{uid}
  ├── completedLessons: string[]   // e.g. ["week_1", "week_2"]
  ├── currentWeek: number
  ├── percentComplete: number      // 0–100
  └── totalWeeks: number
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{collection}/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🤖 Sample AI Prompt (Gemini)

**Input:**
```json
{
  "skill_scores": { "math": 65, "logic": 80, "english": 35, "science": 55, "creativity": 72 },
  "interests": ["technology", "art"],
  "language": "hi"
}
```

**Output:**
```json
{
  "careers": [
    { "title": "UI/UX Designer", "matchPercent": 87, "description": "...", "avgSalary": "₹3–8 LPA", "skills": ["Figma", "User Research", "CSS"] }
  ],
  "roadmap": [
    { "week": 1, "topic": "Design Fundamentals", "durationHours": 4, "tags": ["design basics", "color theory"], "resources": [{ "title": "Design for Beginners", "type": "youtube", "searchQuery": "UI design basics tutorial" }] }
  ],
  "skillGaps": ["English communication", "Advanced JavaScript"],
  "explanation": "Your strong logic and creativity scores suggest design-thinking careers.",
  "motivationalMessage": "Every expert was once a beginner. Start today!"
}
```

---

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd frontend
npm run build
# Push to GitHub → import repo in Vercel
# Add all VITE_FIREBASE_* env vars in Vercel dashboard
```

### Backend (Railway / Render)

```bash
cd backend
# Push to GitHub → import in Railway or Render
# Add all env vars (GEMINI_API_KEY, etc.) in dashboard
# Set start command: node server.js
```

### Firebase

1. Enable **Firestore** and **Authentication** in Firebase Console
2. Add **Email/Password** as a sign-in provider
3. Deploy Firestore security rules from the schema above

---

## 📱 Features

| Feature | Status |
|---------|--------|
| Adaptive Skill Quiz (5 domains) | ✅ |
| AI Roadmap Generation (Gemini) | ✅ |
| Career Path Suggestions | ✅ |
| Multilingual UI (EN/HI/TE) | ✅ |
| Progress Dashboard | ✅ |
| YouTube Content Integration | ✅ |
| AI Chat Mentor (Spark) | ✅ |
| Mobile-First Design | ✅ |
| Rate Limiting & Security | ✅ |
| Firestore Persistence | ✅ |

---

Built with ❤️ for Bharat by IgniteLearn
