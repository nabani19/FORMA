# 🚀 TRACker AI — Free Vercel Hosting & Supabase Backend Guide

This document provides a step-by-step guide to deploying **TRACker** for **FREE** on **Vercel** with **Supabase** for backend authentication, PostgreSQL database, and Row Level Security (RLS).

---

## 📋 Architecture Overview

* **App Name:** `TRACker`
* **Frontend Framework:** React 18 + Vite + TypeScript + Tailwind CSS (Design Tokens: `#4CAF50` Green, Montserrat & Open Sans fonts)
* **Backend / Auth / Database:** **Supabase** (Free Tier PostgreSQL + Built-in JWT Auth)
* **Hosting Platform:** **Vercel** (Free Hobby Tier with automatic continuous deployment from Git)

---

## 🗄️ Step 1: Set Up Supabase Backend & Database

1. **Create a Free Supabase Account & Project:**
   - Go to [https://supabase.com](https://supabase.com) and sign in.
   - Click **New Project**, choose a project name (e.g. `tracker-ai`), set a secure Database Password, and select a region close to your users.

2. **Run Database Migration (`supabase_schema.sql`):**
   - In your Supabase dashboard, click on **SQL Editor** in the left sidebar.
   - Open the [supabase_schema.sql](file:///d:/ALL%20WEB%20APPS%20I%20DESIGN/New%20folder%201/supabase_schema.sql) file from this repository.
   - Paste the SQL script into the Supabase SQL Editor and click **Run**.
   - This creates:
     - `profiles` table (linked to `auth.users` with RLS policies)
     - `logged_meals` table (with RLS policies)
     - `logged_workouts` table (with RLS policies)
     - Automatic user profile creation trigger (`handle_new_user`)

3. **Get Your API Keys:**
   - Go to **Project Settings -> API**.
   - Copy your **Project URL** (e.g. `https://xyzcompany.supabase.co`).
   - Copy your **Project API Key (anon / public)**.

---

## 🌐 Step 2: Deploy to Vercel (Free Hosting)

### Method A: Deploy via Vercel Dashboard (Recommended)

1. Push your repository code to GitHub or GitLab.
2. Log in to [https://vercel.com](https://vercel.com) and click **Add New -> Project**.
3. Import your `tracker-ai` repository.
4. Framework Preset will be automatically detected as **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. **Add Environment Variables:**
   - Key: `VITE_SUPABASE_URL` | Value: `https://your-project.supabase.co`
   - Key: `VITE_SUPABASE_ANON_KEY` | Value: `your-actual-anon-key`
8. Click **Deploy**. Vercel will build and publish your app to a free `.vercel.app` domain in ~30 seconds!

### Method B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to Production
vercel --prod
```

---

## 🔐 Environment Variables Summary

| Variable Name | Description | Example |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase Project URL | `https://xyzcompany.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public Anon API Key | `eyJhbGciOiJIUzI1Ni...` |

---

## ⚡ Features Included Out of the Box

- ✅ **Zero-Trust Auth**: Email & Password registration, login, logout with Supabase Auth.
- ✅ **SPA Routing Fix**: `vercel.json` rewrite rule prevents 404 errors on browser refresh.
- ✅ **Offline / Mock Fallback**: If Supabase credentials are not set, the app seamlessly runs in local state mode for demo purposes.
- ✅ **RLS Security**: Users can only read and write their own profile, meals, and workout logs.
