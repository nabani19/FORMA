/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { UserProfile, LoggedMeal } from '../types';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://demo-project.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhYnN0cmFjdCI6ImRlbW8ta2V5In0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    env.VITE_SUPABASE_URL && 
    env.VITE_SUPABASE_ANON_KEY &&
    !String(env.VITE_SUPABASE_URL).includes('demo-project')
  );
};

// ==========================================
// SUPABASE AUTH HELPERS
// ==========================================

export async function signUpWithSupabase(email: string, password: string, name: string) {
  if (!isSupabaseConfigured()) {
    return { user: { id: 'mock-user-123', email }, session: null, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  return { user: data.user, session: data.session, error };
}

export async function signInWithSupabase(email: string, password: string) {
  if (!isSupabaseConfigured()) {
    return { user: { id: 'mock-user-123', email }, session: null, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { user: data.user, session: data.session, error };
}

export async function signOutSupabase() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

// ==========================================
// SUPABASE DATABASE SYNC HELPERS
// ==========================================

export async function saveProfileToSupabase(profile: UserProfile, userId: string) {
  if (!isSupabaseConfigured()) return { data: null, error: null };

  const { data, error } = await supabase.from('profiles').upsert({
    id: userId,
    name: profile.name,
    email: profile.email,
    age: profile.age,
    gender: profile.gender,
    height_cm: profile.heightCm,
    weight_kg: profile.weightKg,
    activity_level: profile.activityLevel,
    goal: profile.goal,
    dietary_preference: profile.dietaryPreference,
    daily_budget_inr: profile.dailyBudgetInr,
    subscription_plan: profile.subscriptionPlan,
    updated_at: new Date().toISOString(),
  });

  return { data, error };
}

export async function saveMealToSupabase(meal: LoggedMeal, userId: string) {
  if (!isSupabaseConfigured()) return { data: null, error: null };

  const { data, error } = await supabase.from('logged_meals').insert({
    user_id: userId,
    food_name: meal.foodItem.name,
    calories: meal.foodItem.calories,
    protein: meal.foodItem.protein,
    carbs: meal.foodItem.carbs,
    fat: meal.foodItem.fat,
    price_inr: meal.foodItem.priceInr,
    servings: meal.servings,
    meal_type: meal.mealType,
    created_at: new Date().toISOString(),
  });

  return { data, error };
}
