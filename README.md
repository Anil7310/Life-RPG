# ⚔️ Life RPG — Gamified Task & Habit Productivity System

> Turn your daily chores, habits, and work goals into an immersive RPG adventure. Level up your real life, gain XP, earn gold, unlock rare avatars, and redeem real-world rewards!

[![React](https://img.shields.io/badge/React-18.2-61dafb.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Ready-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌐 Live Deployments & Demo

| Service | Link | Notes |
| :--- | :--- | :--- |
| **Frontend Web App** | `https://your-life-rpg.vercel.app` | Production React SPA hosted on Vercel |
| **Backend REST API** | [https://life-rpg-f4ds.onrender.com](https://life-rpg-f4ds.onrender.com) | Production Node/Express API hosted on Render |
| **API Health Status** | [https://life-rpg-f4ds.onrender.com/api/health](https://life-rpg-f4ds.onrender.com/api/health) | Live backend health verification endpoint |
| **Demo Video (90-180s)**| `https://youtu.be/your-demo-video` | Full walkthrough showing signup, questing & persistence |

---

## ✨ Key Features

- 🧙‍♂️ **RPG Character Sheet & Stats**: Build your hero across 6 core RPG attributes: **Intellect**, **Strength**, **Agility**, **Vitality**, **Creativity**, and **Spirit**.
- 📜 **Quests & Habits Engine**: Create Single, Daily, and Recurring Quests with customizable difficulty tiers (Easy, Medium, Hard, Epic) and dynamic XP/gold rewards.
- ⚡ **Real-Time Level Progression**: Level up dynamically with mathematically balanced XP curves, sound effects, and confetti particle bursts.
- 🛍️ **Rewards Emporium**:
  - **In-Game Cosmetic Presets**: Unlock custom UI themes (Pastel Clay, Cyberpunk Neon, Retro 8-Bit, Enchanted Forest) and avatar titles.
  - **Custom Real-World Rewards**: Create your own IRL rewards (e.g., "1 Hour Gaming Break", "Cheat Meal", "Movie Night") that cost earned gold.
- 🔊 **Sound & Haptics**: Immersive 8-bit synthetic audio engine for quest completions, level ups, shop purchases, and error states.
- 🔐 **Robust Authentication & Security**: Secure JWT authentication, guest/demo instant login, BCrypt password hashing, and token-based forgot/reset password flow via Nodemailer.
- 🛡️ **Hosted DB Persistence + Offline Fallback**: Seamlessly connects to MongoDB Atlas / Hosted DB with automated fallback to persistent local storage for seamless local development.

---

## 🛠️ Architecture & Tech Stack

```
life-rpg/
├── client/                     # React 18 + Vite Frontend
│   ├── src/
│   │   ├── components/         # CharacterCard, QuestList, QuestModal, ShopModal, etc.
│   │   ├── context/            # AuthContext, ThemeContext, SoundContext
│   │   ├── utils/              # api.js (Dynamic API client), soundEffects.js
│   │   ├── App.jsx             # Main Application Shell
│   │   └── index.css           # Premium Glassmorphism & Cyber RPG styling
│   ├── vercel.json             # SPA Routing rewrites for Vercel
│   └── vite.config.js          # Vite config with dev proxy & build settings
├── server/                     # Node.js + Express Backend API
│   ├── config/                 # db.js (MongoDB Atlas connection & fallback store)
│   ├── controllers/            # authController, questController, shopController
│   ├── middleware/             # authMiddleware (JWT Verification)
│   ├── models/                 # User, Quest, Reward Mongoose Schemas
│   ├── routes/                 # authRoutes, questRoutes, shopRoutes
│   ├── services/               # dbService, emailService, rpgEngine
│   └── index.js                # Server entry point & CORS configuration
└── package.json                # Root package manager scripts
```

---

## 🚀 Local Quickstart Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- `npm` (v9.0.0 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/life-rpg.git
cd life-rpg
```

### 2. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 3. Configure Environment Variables

**Backend (`server/.env`):**
```bash
cp server/.env.example server/.env
```
*(Optionally provide `MONGODB_URI` or leave empty to use local persistent storage)*

**Frontend (`client/.env`):**
```bash
cp client/.env.example client/.env
```
*(Leave empty for local dev to use Vite proxy)*

### 4. Run Locally
```bash
# Run both Backend (port 5001) and Frontend (port 5173) concurrently
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🔐 Environment Variables Reference

### Backend (`server/.env`)

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `5001` | Port for the Express server |
| `JWT_SECRET` | **Required** | — | Secret string for signing JWT tokens |
| `MONGODB_URI` / `DATABASE_URL` | Optional | Local Fallback | Hosted MongoDB Atlas connection string |
| `FRONTEND_URL` | Production | `*` | Allowed CORS origin (e.g., `https://your-app.vercel.app`) |
| `EMAIL_USER` / `EMAIL_PASS` | Optional | — | Gmail credentials for password reset emails |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Optional | — | Custom SMTP service credentials |

### Frontend (`client/.env`)

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Production | `/api` | Base URL of deployed backend (e.g., `https://your-api.onrender.com`) |

---

## ☁️ Step-by-Step Production Deployment Guide

### Step 1: Provision Hosted Database (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free Shared Cluster (M0).
2. Under **Database Access**, create a user (e.g., `liferpg_admin`) and secure password.
3. Under **Network Access**, click **Add IP Address** -> **Allow Access from Anywhere (`0.0.0.0/0`)**.
4. In your Cluster dashboard, click **Connect** -> **Drivers** -> Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/liferpg?retryWrites=true&w=majority
   ```

---

### Step 2: Deploy Backend API on Render
1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com) and click **New +** -> **Web Service**.
3. Select your GitHub repository.
4. Configure the Web Service:
   - **Name**: `life-rpg-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: `Free`
5. Under **Environment Variables**, add:
   - `JWT_SECRET`: (e.g. `super-secret-jwt-key-2026`)
   - `MONGODB_URI`: (Your MongoDB Atlas connection URI from Step 1)
   - `FRONTEND_URL`: (Your frontend URL from Step 3, e.g. `https://life-rpg.vercel.app`)
6. Click **Deploy Web Service**. Copy the deployed backend URL (e.g., `https://life-rpg-api.onrender.com`).
7. Verify by opening `https://life-rpg-api.onrender.com/api/health` in your browser.

---

### Step 3: Deploy Frontend on Vercel
1. Sign in to [Vercel](https://vercel.com) and click **Add New...** -> **Project**.
2. Import your GitHub repository.
3. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: (Your backend URL from Step 2, e.g. `https://life-rpg-api.onrender.com`)
5. Click **Deploy**. Copy your live frontend URL (e.g., `https://life-rpg.vercel.app`).
6. *(Optional)* Return to Render and ensure `FRONTEND_URL` matches your Vercel domain.

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`username`, `email`, `password`, `characterName`, `avatarId`)
- `POST /api/auth/login` — Login with credentials (`email`, `password`)
- `POST /api/auth/guest` — One-click guest player account creation
- `GET /api/auth/me` — Fetch current user profile, stats, XP, level, inventory
- `PATCH /api/auth/profile` — Update character name, avatar, or active theme
- `POST /api/auth/forgot-password` — Request password reset email
- `POST /api/auth/reset-password` — Reset password using token

### Quests (`/api/quests`)
- `GET /api/quests` — Fetch user's active and completed quests
- `POST /api/quests` — Create a new quest (`title`, `description`, `category`, `difficulty`, `isRecurring`)
- `PUT /api/quests/:id` — Edit an existing quest
- `DELETE /api/quests/:id` — Delete a quest
- `PATCH /api/quests/:id/complete` — Complete a quest, calculate XP/gold, trigger level up & update streaks

### Shop & Rewards (`/api/shop`)
- `GET /api/shop` — Retrieve shop presets and user's custom real-life rewards
- `POST /api/shop/buy` — Buy cosmetic items or themes using in-game gold
- `POST /api/shop/custom` — Create a custom real-life reward (`title`, `cost`, `icon`)
- `POST /api/shop/custom/:id/claim` — Redeem a custom real-world reward
- `DELETE /api/shop/custom/:id` — Delete a custom reward

---

## 🎥 90–180s Demo Video Walkthrough Script

For the hackathon submission video:
1. **0:00 - 0:25 (Intro & Auth)**: Show the sleek landing page. Sign up with a new hero or use instant Guest Login. Highlight character stats and avatar.
2. **0:25 - 1:00 (Creating & Completing Quests)**: Add a new custom quest (e.g. "Complete Hackathon Deployment"). Mark it complete — showcase the XP/Gold animation, audio chime, and particle celebration.
3. **1:00 - 1:25 (Leveling Up & Shop)**: Complete another quest to trigger the **LEVEL UP** modal and stat upgrades. Visit the Rewards Shop to purchase a theme or redeem an IRL reward.
4. **1:25 - 1:50 (Proof of DB Persistence)**: Hard refresh (`Ctrl + Shift + R`) the live browser page. Point out that the level, XP, completed quests, and purchased themes remain intact from the hosted database (not ephemeral localStorage).
5. **1:50 - 2:00 (Conclusion)**: Brief recap of fullstack architecture and mobile responsiveness.

---

## 📋 Pre-Submission Checklist

- [x] **Public GitHub Repository** with clean commit history, README, and `.env.example` templates
- [x] **Live Frontend URL** deployed and accessible without console errors
- [x] **Live Backend API** deployed and verified via `/api/health`
- [x] **Hosted Database Connected** (MongoDB Atlas) with persistent data survival across restarts
- [x] **CORS Configured** for production domains and local dev environments
- [x] **SPA Routing Rewrites** configured (`vercel.json` & `_redirects`) to prevent refresh 404s
- [x] **Full Gameplay Loop Verified**: Auth → Add Quest → Complete Quest → Level Up → Shop → Persistence

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
