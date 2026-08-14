# 🥗 TRACker — AI Food Scanner & Nutrition Coach

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![Supabase Backend](https://img.shields.io/badge/Supabase-Backend%20%26%20Auth-emerald)](https://supabase.com)
[![React + Vite](https://img.shields.io/badge/React%2018-Vite-blue)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6)](https://www.typescriptlang.org)

**TRACker** is a production-grade AI-powered nutrition platform, Indian food scanner, glycemic index sugar spike calculator, and TDEE budget diet planner.

---

## ✨ Features

- **🥗 AI Food Scanner**: Real-time image and barcode scanning powered by AI Vision models (Gemini Flash 1.5, YOLOv8-FoodSeg).
- **⚡ Glycemic Index & Sugar Spike Warning Engine**: Calculates blood sugar spike risks for Indian and global dishes.
- **🤖 TRACker AI Coach**: Interactive AI coach chatbot for personalized meal advice and budget nutrition.
- **🏋️ Interactive 3D Muscle Anatomy & Workout Engine**: Targeted exercise tracking from neck to feet.
- **🔐 Supabase Zero-Trust Auth & Database**: Instant email authentication and PostgreSQL database with Row Level Security (RLS).
- **🚀 Free Vercel Deployment**: Configured for instant deployment on Vercel's free tier.

---

## 🛠️ Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/tracker-ai.git

# Install dependencies
npm install

# Start local development server
npm run dev

# Production build
npm run build
```

---

## 🗄️ Supabase Database & Auth Setup

1. Execute the migration script in [supabase_schema.sql](file:///d:/ALL%20WEB%20APPS%20I%20DESIGN/New%20folder%201/supabase_schema.sql) in your Supabase SQL Editor.
2. Add your credentials to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 🌐 Deploy to Vercel (Free)

Refer to the detailed guide in [VERCEL_SUPABASE_DEPLOYMENT.md](file:///d:/ALL%20WEB%20APPS%20I%20DESIGN/New%20folder%201/VERCEL_SUPABASE_DEPLOYMENT.md).

```bash
# Deploy using Vercel CLI
npx vercel --prod
```

---

## 🎨 Design System

Fully styled using tokenized design rules (`#4CAF50` green primary, `#2196F3` secondary blue, `#FF9800` accent orange, Montserrat & Open Sans typography, and 48px touch targets). Refer to [Design.md](file:///d:/ALL%20WEB%20APPS%20I%20DESIGN/New%20folder%201/Design.md).
