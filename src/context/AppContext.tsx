import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, DietaryPreference, MealLog, FoodItem, MealType, NutritionalInfo } from '../types';
import { INITIAL_USER, INITIAL_PREFERENCES, INITIAL_MEAL_LOGS, INITIAL_FOOD_DATABASE } from '../data/mockFoodDatabase';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export type ActiveTab = 
  | 'dashboard'
  | 'scanner'
  | 'logs'
  | 'analytics'
  | 'coach'
  | 'medical'
  | 'workout'
  | 'supplements'
  | 'grocery'
  | 'profile';

export type UserPlan = 'starter' | 'pro' | 'enterprise';

interface AppContextType {
  user: User;
  updateUser: (updated: Partial<User>) => void;
  preferences: DietaryPreference[];
  addPreference: (pref: Omit<DietaryPreference, 'preferenceId' | 'userId'>) => void;
  removePreference: (id: string) => void;
  mealLogs: MealLog[];
  addMealLog: (foodItem: FoodItem, mealType: MealType, portionGrams: number) => void;
  deleteMealLog: (logId: string) => void;
  updateMealLogPortion: (logId: string, portionGrams: number) => void;
  foodDatabase: FoodItem[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;
  scannedFoodItem: FoodItem | null;
  setScannedFoodItem: (item: FoodItem | null) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isOnboardingCompleted: boolean;
  completeOnboarding: (userData: User, prefs: DietaryPreference[]) => void;
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type']) => void;
  resetAllData: () => void;
  checkAllergenConflicts: (food: FoodItem) => string[];

  // SaaS Pre-Launch Extensions
  userPlan: UserPlan;
  selectPlan: (plan: UserPlan) => void;
  isLoggedIn: boolean;
  toggleLogin: () => void;
  cookiesAccepted: boolean;
  acceptCookies: () => void;
  declineCookies: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isBillingModalOpen: boolean;
  setIsBillingModalOpen: (open: boolean) => void;
  isLegalModalOpen: boolean;
  setIsLegalModalOpen: (open: boolean) => void;
  isSupportModalOpen: boolean;
  setIsSupportModalOpen: (open: boolean) => void;
  submitSupportTicket: (category: string, message: string) => void;
  trackEvent: (eventName: string, data?: Record<string, any>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('ai_nutrition_user');
      const baseUser = saved ? { ...INITIAL_USER, ...JSON.parse(saved) } : INITIAL_USER;
      return {
        ...baseUser,
        weightKg: Math.round(baseUser.weightKg),
        heightCm: Math.round(baseUser.heightCm),
        dailyCalorieTarget: Math.round(baseUser.dailyCalorieTarget),
        dailyProteinTargetG: Math.round(baseUser.dailyProteinTargetG),
        dailyCarbsTargetG: Math.round(baseUser.dailyCarbsTargetG),
        dailyFatTargetG: Math.round(baseUser.dailyFatTargetG),
        dailyFiberTargetG: Math.round(baseUser.dailyFiberTargetG),
      };
    } catch (e) {
      console.warn('Failed to parse saved user, falling back to default:', e);
      return INITIAL_USER;
    }
  });

  const [preferences, setPreferences] = useState<DietaryPreference[]>(() => {
    try {
      const saved = localStorage.getItem('ai_nutrition_preferences');
      if (!saved) return INITIAL_PREFERENCES;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_PREFERENCES;
    } catch (e) {
      console.warn('Failed to parse saved preferences:', e);
      return INITIAL_PREFERENCES;
    }
  });

  const [mealLogs, setMealLogs] = useState<MealLog[]>(() => {
    try {
      const saved = localStorage.getItem('ai_nutrition_meal_logs');
      const initialLogs = saved ? JSON.parse(saved) : INITIAL_MEAL_LOGS;
      const logsArray = Array.isArray(initialLogs) ? initialLogs : INITIAL_MEAL_LOGS;
      
      // SANITIZE ALL LOADED MEAL LOGS SO LEGACY DECIMALS IN LOCALSTORAGE ARE CONVERTED TO CLEAN INTEGERS!
      return logsArray.map((log: any) => ({
        ...log,
        portionSizeGrams: Math.round(log.portionSizeGrams || 100),
        calculatedNutrients: {
          ...log.calculatedNutrients,
          calories: Math.round(log.calculatedNutrients?.calories || 0),
          protein_g: Math.round(log.calculatedNutrients?.protein_g || 0),
          carbs_g: Math.round(log.calculatedNutrients?.carbs_g || 0),
          netCarbs_g: log.calculatedNutrients?.netCarbs_g !== undefined ? Math.round(log.calculatedNutrients.netCarbs_g) : undefined,
          fat_g: Math.round(log.calculatedNutrients?.fat_g || 0),
          saturatedFat_g: log.calculatedNutrients?.saturatedFat_g !== undefined ? Math.round(log.calculatedNutrients.saturatedFat_g) : undefined,
          fiber_g: Math.round(log.calculatedNutrients?.fiber_g || 0),
          sugar_g: Math.round(log.calculatedNutrients?.sugar_g || 0),
        }
      }));
    } catch (e) {
      console.warn('Failed to parse saved meal logs:', e);
      return INITIAL_MEAL_LOGS;
    }
  });

  const [foodDatabase] = useState<FoodItem[]>(INITIAL_FOOD_DATABASE);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [scannedFoodItem, setScannedFoodItem] = useState<FoodItem | null>(null);

  // SaaS State Management
  const [userPlan, setUserPlan] = useState<UserPlan>(() => {
    try {
      return (localStorage.getItem('ai_tracker_plan') as UserPlan) || 'pro';
    } catch {
      return 'pro';
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ai_tracker_logged_in') !== 'false';
    } catch {
      return true;
    }
  });

  const [cookiesAccepted, setCookiesAccepted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ai_tracker_cookies_accepted') === 'true';
    } catch {
      return false;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ai_nutrition_theme');
      return saved ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });

  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ai_nutrition_onboarded') === 'true';
    } catch {
      return false;
    }
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_nutrition_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user to localStorage:', e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_nutrition_preferences', JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to save preferences to localStorage:', e);
    }
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_nutrition_meal_logs', JSON.stringify(mealLogs));
    } catch (e) {
      console.error('Failed to save meal logs to localStorage:', e);
    }
  }, [mealLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('ai_nutrition_theme', isDarkMode ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e);
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const trackEvent = (eventName: string, data?: Record<string, any>) => {
    console.log(`[Analytics Event] ${eventName}`, data || {});
  };

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ai_nutrition_theme', next ? 'dark' : 'light');
      } catch (e) {
        console.error('Failed to save theme to localStorage:', e);
      }
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      showToast(next ? '🌙 High-Contrast Dark Mode Enabled' : '☀️ Crisp Light Mode Enabled', 'info');
      return next;
    });
  };

  const updateUser = (updated: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...updated, updatedAt: new Date().toISOString() }));
    showToast('Profile updated successfully!', 'success');
  };

  const selectPlan = (plan: UserPlan) => {
    setUserPlan(plan);
    try {
      localStorage.setItem('ai_tracker_plan', plan);
    } catch (e) {
      console.error('Failed to save plan:', e);
    }
    trackEvent('subscription_plan_changed', { plan });
    showToast(`Switched subscription plan to ${plan.toUpperCase()}!`, 'success');
    setIsBillingModalOpen(false);
  };

  const toggleLogin = () => {
    setIsLoggedIn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ai_tracker_logged_in', String(next));
      } catch (e) {
        console.error('Failed to save login state:', e);
      }
      showToast(next ? 'Signed in successfully.' : 'Signed out of account.', next ? 'success' : 'info');
      return next;
    });
    setIsAuthModalOpen(false);
  };

  const acceptCookies = () => {
    setCookiesAccepted(true);
    try {
      localStorage.setItem('ai_tracker_cookies_accepted', 'true');
    } catch (e) {
      console.error('Failed to save cookie consent:', e);
    }
  };

  const declineCookies = () => {
    setCookiesAccepted(false);
    try {
      localStorage.setItem('ai_tracker_cookies_accepted', 'false');
    } catch (e) {
      console.error('Failed to save cookie consent:', e);
    }
  };

  const submitSupportTicket = (category: string, message: string) => {
    trackEvent('support_ticket_created', { category, message });
    showToast('Thank you! Your feedback ticket has been received.', 'success');
    setIsSupportModalOpen(false);
  };

  const addPreference = (pref: Omit<DietaryPreference, 'preferenceId' | 'userId'>) => {
    const newPref: DietaryPreference = {
      ...pref,
      preferenceId: `pref_${Date.now()}`,
      userId: user.userId,
    };
    setPreferences((prev) => [...prev, newPref]);
    showToast(`Added ${pref.value} to dietary profile.`, 'success');
  };

  const removePreference = (id: string) => {
    setPreferences((prev) => prev.filter((p) => p.preferenceId !== id));
    showToast('Dietary restriction removed.', 'info');
  };

  // Comprehensive Allergen & Dietary Safeguard Engine
  const checkAllergenConflicts = (food: FoodItem): string[] => {
    const conflicts: string[] = [];

    preferences.forEach((pref) => {
      const prefValLower = pref.value.toLowerCase();

      // Explicit Allergy Checks
      if (pref.type === 'allergy') {
        const matchesAllergen = food.allergens.some((a) => a.toLowerCase().includes(prefValLower));
        const matchesIngredient = food.ingredients.some((i) => i.toLowerCase().includes(prefValLower));
        if (matchesAllergen || matchesIngredient) {
          conflicts.push(`Contains ${pref.value} (Allergy Warning!)`);
        }
      }

      // Dietary Restriction Checks
      if (pref.type === 'restriction' || pref.type === 'preference') {
        // Vegan Check
        if (prefValLower.includes('vegan')) {
          const hasAnimal = food.allergens.some((a) => ['dairy', 'egg', 'fish', 'meat', 'chicken'].some((tag) => a.toLowerCase().includes(tag))) ||
                            food.ingredients.some((i) => ['milk', 'egg', 'cheese', 'paneer', 'chicken', 'butter', 'ghee', 'honey', 'salmon', 'cream'].some((tag) => i.toLowerCase().includes(tag)));
          if (hasAnimal) {
            conflicts.push(`Non-Vegan Ingredients (Dairy / Egg / Meat / Ghee / Paneer detected)`);
          }
        }
        // Jain Check
        if (prefValLower.includes('jain')) {
          const hasJainRestricted = food.ingredients.some((i) => ['onion', 'garlic', 'potato', 'sweet potato', 'chicken', 'fish', 'egg', 'meat'].some((tag) => i.toLowerCase().includes(tag)));
          if (hasJainRestricted) {
            conflicts.push(`Conflicts with Jain Diet (Contains Root Vegetables / Onion / Garlic / Non-Veg)`);
          }
        }
        // Gluten-Free Check
        if (prefValLower.includes('gluten')) {
          const hasGluten = food.allergens.some((a) => a.toLowerCase().includes('gluten')) ||
                            food.ingredients.some((i) => ['wheat', 'sourdough', 'barley', 'maida', 'roti', 'bhatura', 'naan', 'croutons'].some((tag) => i.toLowerCase().includes(tag)));
          if (hasGluten) {
            conflicts.push(`Contains Gluten (Wheat / Maida / Roti / Naan detected)`);
          }
        }
        // Dairy-Free Check
        if (prefValLower.includes('dairy')) {
          const hasDairy = food.allergens.some((a) => a.toLowerCase().includes('dairy')) ||
                           food.ingredients.some((i) => ['milk', 'paneer', 'ghee', 'butter', 'cheese', 'parmesan', 'yogurt', 'dahi', 'cream'].some((tag) => i.toLowerCase().includes(tag)));
          if (hasDairy) {
            conflicts.push(`Contains Dairy Products (Milk / Paneer / Ghee / Butter)`);
          }
        }
        // Keto Check
        if (prefValLower.includes('keto')) {
          if (food.nutritionalInfo.netCarbs_g && food.nutritionalInfo.netCarbs_g > 20) {
            conflicts.push(`High Net Carbs (${Math.round(food.nutritionalInfo.netCarbs_g)}g net carbs - exceeds Keto limit)`);
          }
        }
      }
    });

    return [...new Set(conflicts)];
  };

  // STRICT ZERO-DECIMAL NUTRIENT SCALING LOGIC (Math.round)
  const addMealLog = (foodItem: FoodItem, mealType: MealType, portionGrams: number) => {
    const validPortion = Math.max(1, Math.round(portionGrams || foodItem.servingSizeGrams || 100));
    const multiplier = validPortion / (foodItem.servingSizeGrams || 100);

    const calc: NutritionalInfo = {
      calories: Math.round(foodItem.nutritionalInfo.calories * multiplier),
      protein_g: Math.round(foodItem.nutritionalInfo.protein_g * multiplier),
      carbs_g: Math.round(foodItem.nutritionalInfo.carbs_g * multiplier),
      netCarbs_g: foodItem.nutritionalInfo.netCarbs_g ? Math.round(foodItem.nutritionalInfo.netCarbs_g * multiplier) : undefined,
      fat_g: Math.round(foodItem.nutritionalInfo.fat_g * multiplier),
      saturatedFat_g: foodItem.nutritionalInfo.saturatedFat_g ? Math.round(foodItem.nutritionalInfo.saturatedFat_g * multiplier) : undefined,
      fiber_g: Math.round(foodItem.nutritionalInfo.fiber_g * multiplier),
      sugar_g: Math.round(foodItem.nutritionalInfo.sugar_g * multiplier),
      glycemicIndex: foodItem.nutritionalInfo.glycemicIndex,
      glycemicLoad: foodItem.nutritionalInfo.glycemicLoad ? Math.round(foodItem.nutritionalInfo.glycemicLoad * multiplier) : undefined,
      novaGroup: foodItem.nutritionalInfo.novaGroup,
      vitamins: {
        c_mg: foodItem.nutritionalInfo.vitamins.c_mg ? Math.round(foodItem.nutritionalInfo.vitamins.c_mg * multiplier) : 0,
        a_iu: foodItem.nutritionalInfo.vitamins.a_iu ? Math.round(foodItem.nutritionalInfo.vitamins.a_iu * multiplier) : 0,
        d_iu: foodItem.nutritionalInfo.vitamins.d_iu ? Math.round(foodItem.nutritionalInfo.vitamins.d_iu * multiplier) : 0,
        b12_mcg: foodItem.nutritionalInfo.vitamins.b12_mcg ? Math.round(foodItem.nutritionalInfo.vitamins.b12_mcg * multiplier) : 0,
      },
      minerals: {
        potassium_mg: foodItem.nutritionalInfo.minerals.potassium_mg ? Math.round(foodItem.nutritionalInfo.minerals.potassium_mg * multiplier) : 0,
        iron_mg: foodItem.nutritionalInfo.minerals.iron_mg ? Math.round(foodItem.nutritionalInfo.minerals.iron_mg * multiplier) : 0,
        calcium_mg: foodItem.nutritionalInfo.minerals.calcium_mg ? Math.round(foodItem.nutritionalInfo.minerals.calcium_mg * multiplier) : 0,
        sodium_mg: foodItem.nutritionalInfo.minerals.sodium_mg ? Math.round(foodItem.nutritionalInfo.minerals.sodium_mg * multiplier) : 0,
        magnesium_mg: foodItem.nutritionalInfo.minerals.magnesium_mg ? Math.round(foodItem.nutritionalInfo.minerals.magnesium_mg * multiplier) : 0,
      }
    };

    const newLog: MealLog = {
      logId: `log_${Date.now()}`,
      userId: user.userId,
      foodItemId: foodItem._id,
      foodName: foodItem.name,
      imageUrl: foodItem.imageUrl,
      mealType,
      portionSizeGrams: validPortion,
      calculatedNutrients: calc,
      loggedAt: new Date().toISOString(),
    };

    setMealLogs((prev) => [newLog, ...prev]);
    trackEvent('meal_logged', { foodName: foodItem.name, mealType, portionGrams: validPortion });
    showToast(`Logged ${foodItem.name} (${validPortion}g) to ${mealType.toUpperCase()}`, 'success');
  };

  const deleteMealLog = (logId: string) => {
    setMealLogs((prev) => prev.filter((log) => log.logId !== logId));
    showToast('Meal log deleted.', 'info');
  };

  const updateMealLogPortion = (logId: string, portionGrams: number) => {
    const validPortion = Math.max(1, Math.round(portionGrams || 100));
    setMealLogs((prev) =>
      prev.map((log) => {
        if (log.logId !== logId) return log;
        const originalItem = foodDatabase.find((f) => f._id === log.foodItemId) || {
          servingSizeGrams: 100,
          nutritionalInfo: log.calculatedNutrients
        };
        const multiplier = validPortion / (originalItem.servingSizeGrams || 100);

        return {
          ...log,
          portionSizeGrams: validPortion,
          calculatedNutrients: {
            calories: Math.round(originalItem.nutritionalInfo.calories * multiplier),
            protein_g: Math.round(originalItem.nutritionalInfo.protein_g * multiplier),
            carbs_g: Math.round(originalItem.nutritionalInfo.carbs_g * multiplier),
            fat_g: Math.round(originalItem.nutritionalInfo.fat_g * multiplier),
            fiber_g: Math.round(originalItem.nutritionalInfo.fiber_g * multiplier),
            sugar_g: Math.round(originalItem.nutritionalInfo.sugar_g * multiplier),
            vitamins: log.calculatedNutrients.vitamins,
            minerals: log.calculatedNutrients.minerals,
          }
        };
      })
    );
    showToast('Portion size updated.', 'success');
  };

  const completeOnboarding = (userData: User, prefs: DietaryPreference[]) => {
    setUser(userData);
    setPreferences(prefs);
    setIsOnboardingCompleted(true);
    try {
      localStorage.setItem('ai_nutrition_onboarded', 'true');
    } catch (e) {
      console.error('Failed to save onboarding status:', e);
    }
    showToast('Welcome! Your profile has been initialized.', 'success');
  };

  const resetAllData = () => {
    setUser(INITIAL_USER);
    setPreferences(INITIAL_PREFERENCES);
    setMealLogs(INITIAL_MEAL_LOGS);
    try {
      localStorage.removeItem('ai_nutrition_user');
      localStorage.removeItem('ai_nutrition_preferences');
      localStorage.removeItem('ai_nutrition_meal_logs');
      localStorage.removeItem('ai_nutrition_onboarded');
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
    showToast('All app data has been reset to defaults.', 'warning');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        preferences,
        addPreference,
        removePreference,
        mealLogs,
        addMealLog,
        deleteMealLog,
        updateMealLogPortion,
        foodDatabase,
        activeTab,
        setActiveTab,
        isScannerOpen,
        setIsScannerOpen,
        scannedFoodItem,
        setScannedFoodItem,
        isDarkMode,
        toggleDarkMode,
        isOnboardingCompleted,
        completeOnboarding,
        toasts,
        showToast,
        resetAllData,
        checkAllergenConflicts,

        // SaaS Pre-Launch Extensions
        userPlan,
        selectPlan,
        isLoggedIn,
        toggleLogin,
        cookiesAccepted,
        acceptCookies,
        declineCookies,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isBillingModalOpen,
        setIsBillingModalOpen,
        isLegalModalOpen,
        setIsLegalModalOpen,
        isSupportModalOpen,
        setIsSupportModalOpen,
        submitSupportTicket,
        trackEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
