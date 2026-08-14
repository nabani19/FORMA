-- ============================================================
-- TRACker AI — Supabase Database Migration & RLS Schema
-- PostgreSQL 15+ Schema for Supabase Backend / Auth / Database
-- ============================================================

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  age INTEGER NOT NULL DEFAULT 28,
  gender TEXT NOT NULL DEFAULT 'male',
  height_cm NUMERIC NOT NULL DEFAULT 180,
  weight_kg NUMERIC NOT NULL DEFAULT 78,
  activity_level TEXT NOT NULL DEFAULT 'moderate',
  goal TEXT NOT NULL DEFAULT 'fat_loss',
  dietary_preference TEXT NOT NULL DEFAULT 'high_protein',
  daily_budget_inr NUMERIC NOT NULL DEFAULT 350,
  subscription_plan TEXT NOT NULL DEFAULT 'pro',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert/update own profile" 
  ON public.profiles FOR ALL 
  USING (auth.uid() = id);

-- 2. LOGGED MEALS TABLE
CREATE TABLE IF NOT EXISTS public.logged_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  price_inr NUMERIC NOT NULL DEFAULT 0,
  servings NUMERIC NOT NULL DEFAULT 1,
  meal_type TEXT NOT NULL DEFAULT 'lunch',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Logged Meals
ALTER TABLE public.logged_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own logged meals" 
  ON public.logged_meals FOR ALL 
  USING (auth.uid() = user_id);

-- 3. LOGGED WORKOUTS TABLE
CREATE TABLE IF NOT EXISTS public.logged_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  target_muscle TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  sets INTEGER NOT NULL DEFAULT 4,
  reps INTEGER NOT NULL DEFAULT 10,
  calories_burned NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Logged Workouts
ALTER TABLE public.logged_workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own logged workouts" 
  ON public.logged_workouts FOR ALL 
  USING (auth.uid() = user_id);

-- Automatic Profile Creation Trigger on Auth Sign-Up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'New Athlete')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
