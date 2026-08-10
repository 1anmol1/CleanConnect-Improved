<div align="center">
  <img src="https://cleanconnectbyanmol.vercel.app/assets/logo-kiqy8Bz7.png" alt="CleanConnect Logo" width="150" />
  
  # CleanConnect 🌱
  
  **Smart City Waste Management System powered by AI & IoT**
  
  [![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://cleanconnectbyanmol.vercel.app)
  [![Render Deployment](https://img.shields.io/badge/Backend%20on-Render-46E3B7?logo=render)](https://cleanconnect-improved.onrender.com/api/health)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://hub.docker.com/r/anmolpatil/cleanconnect)
  
</div>

---

## 🚀 Live Demo

Experience the live application here: **[CleanConnect on Vercel](https://cleanconnectbyanmol.vercel.app)**

*Default Test Accounts:*
- **Citizen:** Make an account or report issues anonymously.
- **Worker/Officer:** Pre-configured in the database (e.g. login with worker/officer roles).

---

## 📖 About The Project

CleanConnect is a full-stack, enterprise-grade application designed to revolutionize urban waste management. It connects **Citizens**, **Sanitation Workers**, and **City Officers** into a single, cohesive ecosystem.

- 📸 **Citizens** can report overflowing bins, damaged infrastructure, or illegal dumping via a map-based UI with photo proof.
- 🚛 **Workers** receive AI-optimized collection routes and task assignments, allowing them to mark issues as resolved on-site.
- 📈 **Officers** get a bird's-eye view of city sanitation metrics, manage worker deployments, and verify task resolutions.
- 🤖 **CleanConnect AI** (Powered by Gemini 3.5 Flash) is integrated into the dashboard to instantly navigate users to their desired actions using natural language.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, React Router, Context API, CSS3
- **Backend:** Node.js, Express.js
- **Database:** MongoDB & Mongoose
- **AI Integration:** Google Gemini 3.5 Flash API (REST Integration)
- **Mapping:** Google Maps Platform (Directions & Maps JS API)
- **Infrastructure:** Docker, Vercel (Frontend), Render (Backend)

---

## 🐳 Running via Docker (Recommended)

You can run the entire application locally with a single command using the pre-built Docker image from Docker Hub!

```bash
docker run -p 5000:5000 -e MONGO_URI="<your_mongo_uri>" -e GEMINI_API_KEY="<your_api_key>" -e JWT_SECRET="<your_secret>" anmolpatil/cleanconnect
```
*The app will be available at `http://localhost:5000` (Backend API & Frontend served statically).*

---

## 💻 Local Development Setup

If you want to run the project from the source code, you can use our single `npm run dev` script which launches both the frontend and backend concurrently.

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Cluster or Local MongoDB
- Google Maps API Key
- Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/1anmol1/CleanConnect-Improved.git
   cd CleanConnect-Improved
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `server` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   ```
   
   Create a `.env` file in the `client` folder:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Run the App:**
   ```bash
   npm run dev
   ```
   *The Vite frontend will start on `http://localhost:5173` and the backend on `http://localhost:5000`.*

---

## ✨ Key Features

- **AI Chatbot Navigation:** Type "I want to report an issue" and the AI instantly opens the correct form, pre-filled!
- **Dynamic Route Optimization:** Calculates the absolute fastest driving route for workers to collect all smart bins.
- **Community Voting:** Citizens can upvote/downvote reported issues to prevent spam and auto-assign high-priority tasks.
- **CleanCoins Reward System:** Gamified ecosystem where citizens earn points for verified reports.
- **PWA Ready:** Installable on Android and iOS devices as a native-feeling app.

---
*Developed by Anmol Patil*