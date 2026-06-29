<div align="center">
  <img src="https://res.cloudinary.com/dcsh47583/image/upload/v1781614707/icon_czc4th.png" width="150" alt="Affanverse Logo" />
  <h1>🌌 Affanverse Web App</h1>
</div>

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)
![Python](https://img.shields.io/badge/Python-3.10+-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js)

---

## Project Overview

The Affanverse Web App Ecosystem is a high-performance, enterprise-grade monorepo integrating a Next.js 16 frontend ecosystem with a custom Python-based GenAI backend. Engineered to support dynamic multimedia modules and a 3D Interactive Reader, the platform emphasizes architectural scalability, strict memory management, and dual-stack separation of concerns.

---

## 🚀 Key Features & Architecture

- **Interactive 3D Interfaces:** Implements complex WebGL scenes utilizing Three.js and React Three Fiber. Adheres to strict GPU VRAM memory disposal, zero-leak canvas loops, and demand-driven rendering (via `IntersectionObserver`) to stabilize FPS across diverse hardware.
- **Suite of High-Performance Minigames:** Features 6 highly optimized HTML5 Canvas and WebGL rhythm minigames. Engineered with performance-critical algorithms such as procedural generation, `useReducer` state machines for predictable mutation, strict object pooling to prevent garbage collection spikes, and precise Web Audio API synchronization.
- **Custom REST API Backend:** A robust backend built with Python and FastAPI, integrating the Google Gemini AI and Supabase MCP. It executes context-aware vector similarity searches via pgvector RPCs to deliver accurate, context-injected AI responses.
- **Dual-Stack Architecture:** Distinct separation between the Node.js runtime driving the server-rendered React frontend (via Turbopack) and the standalone Uvicorn ASGI server managing the computationally intensive Generative AI pipeline.
- **Optimized Media Management:** Integrates Cloudinary API for secure, dynamic media uploads and highly optimized asset delivery (images, sprite sheets, and audio) across the global ecosystem.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI & State:** React 19, Zustand, Radix UI (shadcn/ui)
- **Styling & Animation:** Tailwind CSS, Framer Motion
- **3D Rendering:** Three.js, React Three Fiber, `@react-three/drei`

### Backend
- **Framework:** Python, FastAPI, Uvicorn
- **AI Integrations:** Google GenAI SDK (Gemini 2.5 Flash, Gemini Embedding 2)
- **Data Validation:** Pydantic

### Database & Tools
- **Database:** Supabase (PostgreSQL, pgvector, Row Level Security)
- **Media Asset Management:** Cloudinary
- **Environment Management:** `python-dotenv`

---

## 📁 Project Structure

```ascii
affanverse/
├── ai-backend/
│   ├── agent.py
│   └── embed_lore.py
├── app/
│   ├── (terminal)/
│   ├── about/
│   ├── abyss-term/
│   ├── aki/
│   ├── ambasuke/
│   ├── apex-exchange/
│   │   └── [ticker]/
│   ├── api/
│   │   ├── submit-guestbook/
│   │   └── submit-score/
│   ├── archives/
│   ├── behind-the-scenes/
│   ├── blog/
│   ├── contact/
│   ├── cookie-protocol/
│   ├── intercelestial/
│   ├── minigame/
│   │   ├── affan-card-protocol/
│   │   ├── affan-endless-runner/
│   │   ├── affan-low-cortisol/
│   │   ├── affan-strike/
│   │   ├── ambasuke-protocol/
│   │   └── flappy-affan/
│   ├── music/
│   ├── nexus/
│   ├── novel/
│   ├── privacy-policy/
│   ├── projects/
│   ├── terms-of-chaos/
│   ├── global.css
│   ├── icon.png
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── apex-exchange/
│   │   └── modals/
│   ├── intercelestial/
│   ├── projects/
│   ├── terminal/
│   ├── ui/
│   ├── affan-faq.tsx
│   ├── affan-gallery-dump.tsx
│   ├── affan-skill-tree.tsx
│   ├── affan-status.tsx
│   ├── affan-stories.tsx
│   ├── affan-testimonials.tsx
│   ├── AIPersonaChat.tsx
│   ├── AIPersonaChatWrapper.tsx
│   ├── blog-card.tsx
│   ├── creator-messages.tsx
│   ├── cursed-artifact-loader.tsx
│   ├── cursed-artifact.tsx
│   ├── floating-back-button-b.tsx
│   ├── floating-back-button.tsx
│   ├── footer.tsx
│   ├── GlitchTransition.tsx
│   ├── guestbook.tsx
│   ├── hero-3d.tsx
│   ├── Hero3DWrapper.tsx
│   ├── jumpscare-overlay.tsx
│   ├── MarketTable.tsx
│   ├── MarketWidgets.tsx
│   ├── minigame-portal.tsx
│   ├── navbar.tsx
│   ├── project-list.tsx
│   ├── smart-media.tsx
│   ├── soundscape-overlay.tsx
│   ├── Sparkline.tsx
│   ├── SystemBriefingVideo.tsx
│   ├── testimonials-marquee.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── hooks/
├── lib/
├── public/
├── scripts/
├── store/
├── types/
├── .env.local
├── .gitignore
├── AGENTS.md
├── cek-kurang.js
├── CLAUDE.md
├── components.json
├── eslint.config.mjs
├── migrate-full.js
├── migration-result.json
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── susulan.js
├── tailwind.config.ts
├── test-supabase.js
├── test-supabase2.js
├── test-supabase3.js
├── tsconfig.json
├── tsconfig.tsbuildinfo
└── update-db.js
```

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v20+ recommended)
- Python (3.10+ recommended)
- Git

### Environment Configuration
Create a `.env.local` file in the root directory. This centralized configuration file provides environment variables for both the Next.js frontend and the FastAPI backend.

```env
# .env.local

# Supabase Authentication & Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Generative AI Configuration
GEMINI_API_KEY=

# Cloudinary Media Management
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend Initialization
1. Install Node modules:
   ```bash
   npm install
   ```
2. Start the Next.js development server:
   ```bash
   npm run dev
   ```

### Backend Initialization
1. From the root directory, navigate to the backend directory:
   ```bash
   cd ai-backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install required Python dependencies:
   ```bash
   pip install fastapi uvicorn google-genai supabase python-dotenv pydantic
   ```
4. Start the FastAPI application server:
   ```bash
   uvicorn agent:app --reload
   ```

---

## 🌐 Deployment

Guidelines for deploying the Next.js frontend via Vercel and hosting the FastAPI backend on dedicated cloud services will be added in upcoming documentation iterations.

---

## 📄 License & Acknowledgments

This full-stack ecosystem serves as an advanced open-source architecture testing ground for complex WebGL integration and GenAI capabilities. All rights reserved.
