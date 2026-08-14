import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile, MacroGoals, LoggedMeal, FoodItem } from '../types';

// ── Date Helper ──────────────────────────────────────────────────────────────
export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ── Types ────────────────────────────────────────────────────────────────────
interface DailyLog {
  date: string;
  meals: LoggedMeal[];
  waterIntakeLiters: number;
  doneMeals: Record<string, boolean>;
}

interface AppState {
  // Auth & Profile
  isAuthenticated: boolean;
  userProfile: UserProfile;
  macroGoals: MacroGoals;
  activeTab: 'dashboard' | 'meals' | 'scanner' | 'analytics' | 'profile';
  isDarkMode: boolean;

  // ── TODAY's live state ───────────────────────────────────────────────────
  loggedMeals: LoggedMeal[];          // today's logged meals (live, synced everywhere)
  waterIntakeLiters: number;          // today's water intake
  streakDays: number;                 // current streak

  // ── Meal-planner "done" tracking (keyed: "dayIndex_slot") ───────────────
  // Persisted in store so it survives tab navigation
  todayDoneMeals: Record<string, boolean>;

  // ── Historical daily logs ────────────────────────────────────────────────
  dailyLogs: Record<string, DailyLog>;
  lastKnownDate: string;

  // ── Scanner history ──────────────────────────────────────────────────────
  scannedFoods: FoodItem[];

  // ── Actions ──────────────────────────────────────────────────────────────
  login: (email: string, name: string) => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  recalculateMacros: () => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  toggleTheme: () => void;

  // Meal logging
  addLoggedMeal: (food: FoodItem, servings: number, mealType: LoggedMeal['mealType']) => void;
  removeLoggedMeal: (id: string) => void;
  clearAllLoggedMeals: () => void;

  // Meal planner "done" state — persisted, synced across all tabs
  setMealDone: (
    key: string,
    isDone: boolean,
    meal: FoodItem,
    mealType: LoggedMeal['mealType'],
    servings: number,
    mealLogId: string
  ) => void;

  // Water
  addWater: (amountLiters: number) => void;
  setWater: (liters: number) => void;
  setWaterGoal: (targetLiters: number) => void;

  // Scanner
  addScannedFood: (food: FoodItem) => void;

  // Daily reset check
  checkAndResetForNewDay: () => void;
}

// ── Defaults ─────────────────────────────────────────────────────────────────
const defaultProfile: UserProfile = {
  name: 'User',
  email: 'user@tracker.ai',
  age: 28,
  gender: 'male',
  heightCm: 180,
  weightKg: 78,
  activityLevel: 'moderate',
  goal: 'fat_loss',
  dietaryPreference: 'high_protein',
  dailyBudgetInr: 350,
  monthlyBudgetInr: 10500,
  subscriptionPlan: 'pro',
  allergies: ['Peanuts'],
};

export function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function calculateMacros(profile: UserProfile): MacroGoals {
  const weight = Math.max(10, Number(profile.weightKg) || 70);
  const height = Math.max(50, Number(profile.heightCm) || 170);
  const age    = Math.max(12, Number(profile.age) || 25);

  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr += profile.gender === 'male' ? 5 : -161;

  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, extreme: 1.9,
  };
  let tdee = bmr * (activityMultipliers[profile.activityLevel] || 1.55);

  if (profile.goal === 'fat_loss')    tdee -= 500;
  if (profile.goal === 'muscle_gain') tdee += 350;

  const calories      = Math.max(1200, Math.round(tdee));
  let pRatio = 0.30, cRatio = 0.40, fRatio = 0.30;
  if (profile.dietaryPreference === 'keto')  { pRatio = 0.25; cRatio = 0.05; fRatio = 0.70; }
  if (profile.dietaryPreference === 'vegan') { pRatio = 0.25; cRatio = 0.50; fRatio = 0.25; }

  const proteinGrams = Math.round((calories * pRatio) / 4);
  const carbsGrams   = Math.round((calories * cRatio) / 4);
  const fatGrams     = Math.round((calories * fRatio) / 9);
  const waterLiters  = Number((weight * 0.035).toFixed(1));

  return { calories, proteinGrams, carbsGrams, fatGrams, waterLiters };
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userProfile:     defaultProfile,
      macroGoals:      calculateMacros(defaultProfile),
      activeTab:       'dashboard',
      isDarkMode:      true,

      // All empty on fresh start — no mock data
      loggedMeals:        [],
      waterIntakeLiters:  0,
      streakDays:         0,
      todayDoneMeals:     {},
      dailyLogs:          {},
      lastKnownDate:      getTodayKey(),
      scannedFoods:       [],

      // ── Auth ───────────────────────────────────────────────────────────────
      login: (email, name) => set((state) => ({
        isAuthenticated: true,
        userProfile: { ...state.userProfile, email, name },
      })),

      logout: () => set({ isAuthenticated: false }),

      // ── Profile ────────────────────────────────────────────────────────────
      updateProfile: (updatedFields) => set((state) => {
        const newProfile = { ...state.userProfile, ...updatedFields };
        return { userProfile: newProfile, macroGoals: calculateMacros(newProfile) };
      }),

      recalculateMacros: () => set((state) => ({
        macroGoals: calculateMacros(state.userProfile),
      })),

      setActiveTab: (tab) => set({ activeTab: tab }),

      toggleTheme: () => set((state) => {
        const newDark = !state.isDarkMode;
        if (newDark) document.documentElement.classList.add('dark');
        else         document.documentElement.classList.remove('dark');
        return { isDarkMode: newDark };
      }),

      // ── New Day Auto-Reset ─────────────────────────────────────────────────
      // Archives today → history, resets counters to zero, resets doneMeals
      checkAndResetForNewDay: () => {
        const state = get();
        const today = getTodayKey();
        if (state.lastKnownDate === today) return; // same day, nothing to do

        // Save yesterday to history
        const yesterdayLog: DailyLog = {
          date:               state.lastKnownDate,
          meals:              state.loggedMeals,
          waterIntakeLiters:  state.waterIntakeLiters,
          doneMeals:          state.todayDoneMeals,
        };
        const newStreak = state.loggedMeals.length > 0 ? state.streakDays + 1 : 0;

        set((s) => ({
          lastKnownDate:     today,
          loggedMeals:       [],
          waterIntakeLiters: 0,
          todayDoneMeals:    {},      // ← clear done-meal tracking for new day
          streakDays:        newStreak,
          dailyLogs: {
            ...s.dailyLogs,
            [yesterdayLog.date]: yesterdayLog,
          },
        }));
      },

      // ── Meal Logging ───────────────────────────────────────────────────────
      addLoggedMeal: (foodItem, servings, mealType) => {
        get().checkAndResetForNewDay();
        const newMeal: LoggedMeal = {
          id: `meal-${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          foodItem,
          servings,
          mealType,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        set((state) => ({ loggedMeals: [newMeal, ...state.loggedMeals] }));
      },

      removeLoggedMeal: (id) => set((state) => ({
        loggedMeals: state.loggedMeals.filter((m) => m.id !== id),
      })),

      clearAllLoggedMeals: () => set({ loggedMeals: [], todayDoneMeals: {} }),

      // ── Meal Planner Done-State (persisted, synced) ────────────────────────
      // isDone=true  → log the meal, mark key as done
      // isDone=false → remove the previously logged meal, unmark key
      setMealDone: (key, isDone, meal, mealType, servings, mealLogId) => {
        get().checkAndResetForNewDay();

        if (isDone) {
          // Add to loggedMeals with the provided deterministic id
          const newMeal: LoggedMeal = {
            id:        mealLogId,
            foodItem:  meal,
            servings,
            mealType,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          set((state) => ({
            loggedMeals:    [newMeal, ...state.loggedMeals],
            todayDoneMeals: { ...state.todayDoneMeals, [key]: true },
          }));
        } else {
          // Remove from loggedMeals by the deterministic id, unmark key
          set((state) => ({
            loggedMeals:    state.loggedMeals.filter((m) => m.id !== mealLogId),
            todayDoneMeals: { ...state.todayDoneMeals, [key]: false },
          }));
        }
      },

      // ── Water ──────────────────────────────────────────────────────────────
      addWater: (amountLiters) => set((state) => ({
        waterIntakeLiters: Math.max(0, Number((state.waterIntakeLiters + amountLiters).toFixed(1))),
      })),

      setWater: (liters) => set({
        waterIntakeLiters: Math.max(0, Number(liters.toFixed(1))),
      }),

      setWaterGoal: (targetLiters) => set((state) => ({
        macroGoals: {
          ...state.macroGoals,
          waterLiters: Math.max(0.5, Number(targetLiters.toFixed(1))),
        },
      })),

      // ── Scanner ────────────────────────────────────────────────────────────
      addScannedFood: (food) => set((state) => ({
        scannedFoods: [food, ...state.scannedFoods.slice(0, 19)],
      })),
    }),
    {
      name: 'tracker_app_store_v4_0',   // v4 = fresh start for all users
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated:    state.isAuthenticated,
        userProfile:        state.userProfile,
        macroGoals:         state.macroGoals,
        isDarkMode:         state.isDarkMode,
        loggedMeals:        state.loggedMeals,
        waterIntakeLiters:  state.waterIntakeLiters,
        streakDays:         state.streakDays,
        todayDoneMeals:     state.todayDoneMeals,   // ← persisted across tab switches
        dailyLogs:          state.dailyLogs,
        lastKnownDate:      state.lastKnownDate,
        scannedFoods:       state.scannedFoods,
      }),
    }
  )
);
