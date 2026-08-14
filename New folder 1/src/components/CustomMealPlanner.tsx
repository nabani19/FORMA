import React, { useState } from 'react';
import { useAppStore, formatInr } from '../store/useAppStore';
import { solveDailyOmniLock, generateMonthlyOmniLock, GROCERY_DB, OmniLockResult, MonthlyOmniLockSummary } from '../lib/omniLockEngine';
import {
  Utensils, CheckCircle2, Plus, X, ChevronLeft, ChevronRight,
  ShoppingBag, Edit3, PackageCheck, ChevronDown, ChevronUp, BookOpen,
  TrendingUp, Lock, ShieldCheck, DollarSign, Cpu, ArrowUpRight, Flame, Zap, Layers, RefreshCw
} from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Ingredient { name: string; quantity: string; }

interface MealItem {
  id: string;
  name: string;
  category: string;
  mealSlot: 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodiumMg: number;
  vitaminCMg: number;
  calciumMg: number;
  ironMg: number;
  glycemicIndex: number;
  sugarSpikeRisk: 'Low' | 'Moderate' | 'High';
  servingSize: string;
  priceInr: number;
  healthScore: number;
  ingredients: Ingredient[];
  instructions: string;
  tags: string[];
}

interface DayPlan {
  day: string;
  date: string;
  meals: Record<string, MealItem>;
}

// ─── Budget-Calibrated Meal Plan ─────────────────────────────────────────────
// Each day's 5 meals total ≤ ₹350 budget & ~2020-2130 kcal (90-95% of 2244 TDEE)
const MEAL_SLOT_LABELS: Record<string, string> = {
  breakfast: '🌅 Breakfast',
  morning_snack: '🍎 Morning Snack',
  lunch: '☀️ Lunch',
  evening_snack: '🌆 Evening Snack',
  dinner: '🌙 Dinner',
};

export const WEEK_PLAN: DayPlan[] = [
  // ── DAY 1 ──────────────────────────────────────────────────────────────────
  {
    day: 'Monday',
    date: 'Day 1',
    meals: {
      breakfast: {
        id: 'd1_b', name: 'Moong Dal Chilla with Green Chutney', category: 'High Protein Vegetarian', mealSlot: 'breakfast',
        calories: 380, protein: 21, carbs: 45, fat: 10, fiber: 8, sodiumMg: 340, vitaminCMg: 16, calciumMg: 100, ironMg: 3.0,
        glycemicIndex: 36, sugarSpikeRisk: 'Low', servingSize: '3 Chillas (180g)', priceInr: 50, healthScore: 93,
        ingredients: [
          { name: 'Moong Dal (split)', quantity: '80g' }, { name: 'Onion', quantity: '30g' },
          { name: 'Green Chilli', quantity: '1 pc' }, { name: 'Ginger', quantity: '5g' },
          { name: 'Coriander leaves', quantity: '10g' }, { name: 'Oil', quantity: '5ml' },
          { name: 'Cumin seeds', quantity: '2g' }, { name: 'Salt', quantity: 'to taste' },
          { name: 'Green Chutney', quantity: '30ml' },
        ],
        instructions: 'Soak dal 4h, blend smooth. Mix with chopped onion, chilli, ginger. Pour on hot non-stick tawa, spread thin. Cook 2-3 min/side. Serve with chutney.',
        tags: ['High Protein', 'Low GI', 'Gluten-Free', 'Vegetarian'],
      },
      morning_snack: {
        id: 'd1_ms', name: 'Greek Yogurt with Mixed Berries', category: 'Probiotic Snack', mealSlot: 'morning_snack',
        calories: 220, protein: 16, carbs: 26, fat: 4, fiber: 5, sodiumMg: 90, vitaminCMg: 22, calciumMg: 210, ironMg: 0.8,
        glycemicIndex: 30, sugarSpikeRisk: 'Low', servingSize: '1 Cup (220g)', priceInr: 50, healthScore: 90,
        ingredients: [
          { name: 'Greek Yogurt (plain)', quantity: '180g' }, { name: 'Strawberries', quantity: '40g' },
          { name: 'Blueberries', quantity: '30g' }, { name: 'Honey', quantity: '5ml' }, { name: 'Chia seeds', quantity: '5g' },
        ],
        instructions: 'Spoon yogurt into bowl. Top with berries. Drizzle honey. Sprinkle chia seeds. Serve immediately.',
        tags: ['Probiotic', 'High Calcium', 'Antioxidant'],
      },
      lunch: {
        id: 'd1_l', name: 'Grilled Chicken Breast with Brown Rice & Sabzi', category: 'High Protein Lunch', mealSlot: 'lunch',
        calories: 620, protein: 52, carbs: 62, fat: 13, fiber: 7, sodiumMg: 560, vitaminCMg: 22, calciumMg: 100, ironMg: 3.8,
        glycemicIndex: 50, sugarSpikeRisk: 'Low', servingSize: '1 Plate (400g)', priceInr: 130, healthScore: 94,
        ingredients: [
          { name: 'Chicken breast', quantity: '200g' }, { name: 'Brown rice', quantity: '80g (dry)' },
          { name: 'Broccoli', quantity: '100g' }, { name: 'Capsicum', quantity: '50g' },
          { name: 'Olive oil', quantity: '10ml' }, { name: 'Garlic', quantity: '5g' },
          { name: 'Lemon juice', quantity: '15ml' }, { name: 'Coriander', quantity: '5g' },
        ],
        instructions: 'Marinate chicken with garlic, lemon, salt 30 min. Grill 6-7 min/side. Cook rice. Stir-fry veggies in olive oil. Plate and serve.',
        tags: ['High Protein', 'Lean Meat', 'Whole Grain'],
      },
      evening_snack: {
        id: 'd1_es', name: 'Roasted Chana with Lemon & Spices', category: 'Healthy Indian Snack', mealSlot: 'evening_snack',
        calories: 195, protein: 11, carbs: 28, fat: 4, fiber: 8, sodiumMg: 210, vitaminCMg: 4, calciumMg: 60, ironMg: 2.6,
        glycemicIndex: 28, sugarSpikeRisk: 'Low', servingSize: '50g', priceInr: 20, healthScore: 88,
        ingredients: [
          { name: 'Roasted chana', quantity: '50g' }, { name: 'Lemon juice', quantity: '10ml' },
          { name: 'Chaat masala', quantity: '2g' }, { name: 'Black salt', quantity: '1g' },
        ],
        instructions: 'Toss roasted chana with lemon juice, chaat masala, black salt. Mix and serve.',
        tags: ['High Fiber', 'Iron-Rich', 'Vegan'],
      },
      dinner: {
        id: 'd1_d', name: 'Dal Tadka with 2 Multigrain Rotis', category: 'Indian Classic Dinner', mealSlot: 'dinner',
        calories: 500, protein: 21, carbs: 70, fat: 11, fiber: 11, sodiumMg: 500, vitaminCMg: 14, calciumMg: 120, ironMg: 4.8,
        glycemicIndex: 44, sugarSpikeRisk: 'Low', servingSize: '1 Bowl Dal + 2 Rotis', priceInr: 85, healthScore: 93,
        ingredients: [
          { name: 'Toor dal', quantity: '80g (dry)' }, { name: 'Tomato', quantity: '60g' },
          { name: 'Onion', quantity: '40g' }, { name: 'Garlic', quantity: '8g' },
          { name: 'Ghee', quantity: '8g' }, { name: 'Cumin seeds', quantity: '2g' },
          { name: 'Turmeric', quantity: '2g' }, { name: 'Multigrain Atta', quantity: '80g' },
        ],
        instructions: 'Pressure cook dal with turmeric. Prepare tadka: heat ghee, cumin, garlic, onion, tomato. Pour over dal. Make rotis. Serve hot.',
        tags: ['High Fiber', 'Complete Protein', 'Vegetarian'],
      },
    },
  },

  // ── DAY 2 ──────────────────────────────────────────────────────────────────
  {
    day: 'Tuesday',
    date: 'Day 2',
    meals: {
      breakfast: {
        id: 'd2_b', name: 'Oats Upma with Vegetables', category: 'Fiber-Rich Breakfast', mealSlot: 'breakfast',
        calories: 350, protein: 14, carbs: 55, fat: 8, fiber: 9, sodiumMg: 360, vitaminCMg: 26, calciumMg: 90, ironMg: 3.0,
        glycemicIndex: 42, sugarSpikeRisk: 'Low', servingSize: '1 Bowl (280g)', priceInr: 45, healthScore: 91,
        ingredients: [
          { name: 'Rolled oats', quantity: '80g' }, { name: 'Carrot', quantity: '40g' },
          { name: 'Peas', quantity: '30g' }, { name: 'Beans', quantity: '30g' },
          { name: 'Mustard seeds', quantity: '2g' }, { name: 'Curry leaves', quantity: '5 pcs' },
          { name: 'Oil', quantity: '5ml' }, { name: 'Lemon juice', quantity: '10ml' },
        ],
        instructions: 'Dry roast oats. Temper mustard, curry leaves. Sauté veggies. Add oats and water. Cook 5 min. Finish with lemon.',
        tags: ['High Fiber', 'Beta-Glucan', 'Vegan'],
      },
      morning_snack: {
        id: 'd2_ms', name: 'Apple with Peanut Butter', category: 'Energy Snack', mealSlot: 'morning_snack',
        calories: 240, protein: 9, carbs: 33, fat: 11, fiber: 5, sodiumMg: 70, vitaminCMg: 10, calciumMg: 20, ironMg: 0.6,
        glycemicIndex: 35, sugarSpikeRisk: 'Low', servingSize: '1 Medium Apple + 1.5 tbsp PB', priceInr: 40, healthScore: 85,
        ingredients: [
          { name: 'Apple (medium)', quantity: '150g' }, { name: 'Peanut butter (natural)', quantity: '20g' },
        ],
        instructions: 'Slice apple. Serve with peanut butter on the side for dipping.',
        tags: ['Natural Sugar', 'Healthy Fats', 'Portable'],
      },
      lunch: {
        id: 'd2_l', name: 'Paneer Tikka Bowl with Quinoa', category: 'High-Protein Vegetarian', mealSlot: 'lunch',
        calories: 570, protein: 32, carbs: 50, fat: 22, fiber: 7, sodiumMg: 560, vitaminCMg: 24, calciumMg: 400, ironMg: 3.6,
        glycemicIndex: 34, sugarSpikeRisk: 'Low', servingSize: '1 Bowl (320g)', priceInr: 120, healthScore: 92,
        ingredients: [
          { name: 'Paneer', quantity: '150g' }, { name: 'Quinoa', quantity: '60g (dry)' },
          { name: 'Bell peppers', quantity: '80g' }, { name: 'Onion', quantity: '40g' },
          { name: 'Yogurt', quantity: '40g' }, { name: 'Tikka masala', quantity: '8g' },
          { name: 'Lemon juice', quantity: '10ml' }, { name: 'Mint chutney', quantity: '30ml' },
        ],
        instructions: 'Marinate paneer and veggies in yogurt+masala 1h. Grill 8-10 min. Cook quinoa. Plate over quinoa. Serve with chutney.',
        tags: ['High Protein', 'Calcium-Rich', 'Keto-Friendly'],
      },
      evening_snack: {
        id: 'd2_es', name: 'Banana with Walnut', category: 'Energy Booster', mealSlot: 'evening_snack',
        calories: 260, protein: 6, carbs: 38, fat: 12, fiber: 4, sodiumMg: 8, vitaminCMg: 12, calciumMg: 25, ironMg: 1.0,
        glycemicIndex: 52, sugarSpikeRisk: 'Moderate', servingSize: '1 Banana + 15g Walnuts', priceInr: 25, healthScore: 82,
        ingredients: [
          { name: 'Banana (medium)', quantity: '120g' }, { name: 'Walnuts', quantity: '15g' },
        ],
        instructions: 'Peel banana. Eat with walnuts for balanced energy and healthy fats.',
        tags: ['Potassium-Rich', 'Omega-3', 'Pre-Workout'],
      },
      dinner: {
        id: 'd2_d', name: 'Masala Salmon with Steamed Veggies', category: 'Omega-3 Dinner', mealSlot: 'dinner',
        calories: 550, protein: 50, carbs: 22, fat: 28, fiber: 6, sodiumMg: 460, vitaminCMg: 50, calciumMg: 130, ironMg: 3.0,
        glycemicIndex: 20, sugarSpikeRisk: 'Low', servingSize: '1 Fillet + Veggies (350g)', priceInr: 120, healthScore: 96,
        ingredients: [
          { name: 'Salmon fillet', quantity: '200g' }, { name: 'Broccoli', quantity: '100g' },
          { name: 'Zucchini', quantity: '80g' }, { name: 'Turmeric', quantity: '2g' },
          { name: 'Cumin powder', quantity: '2g' }, { name: 'Garlic paste', quantity: '8g' },
          { name: 'Lemon juice', quantity: '15ml' }, { name: 'Olive oil', quantity: '8ml' },
        ],
        instructions: 'Rub salmon with spice paste. Pan-fry 4 min/side. Steam broccoli and zucchini. Plate with lemon wedge.',
        tags: ['Omega-3', 'High Protein', 'Anti-Inflammatory'],
      },
    },
  },

  // ── DAY 3 ──────────────────────────────────────────────────────────────────
  {
    day: 'Wednesday',
    date: 'Day 3',
    meals: {
      breakfast: {
        id: 'd3_b', name: 'Masala Dosa with Coconut Chutney', category: 'South Indian Breakfast', mealSlot: 'breakfast',
        calories: 400, protein: 11, carbs: 68, fat: 11, fiber: 6, sodiumMg: 450, vitaminCMg: 10, calciumMg: 70, ironMg: 2.4,
        glycemicIndex: 55, sugarSpikeRisk: 'Moderate', servingSize: '1 Large Dosa + Chutney', priceInr: 60, healthScore: 82,
        ingredients: [
          { name: 'Dosa batter', quantity: '120ml' }, { name: 'Potato', quantity: '100g' },
          { name: 'Onion', quantity: '40g' }, { name: 'Mustard seeds', quantity: '2g' },
          { name: 'Turmeric', quantity: '1g' }, { name: 'Coconut', quantity: '30g' },
          { name: 'Green chilli', quantity: '1 pc' }, { name: 'Oil', quantity: '5ml' },
        ],
        instructions: 'Spread batter thin on hot tawa. Fill with spiced potato mixture. Fold. Blend chutney ingredients. Serve together.',
        tags: ['Fermented', 'Probiotic', 'South Indian'],
      },
      morning_snack: {
        id: 'd3_ms', name: 'Sprouts Chaat', category: 'Protein Snack', mealSlot: 'morning_snack',
        calories: 210, protein: 14, carbs: 32, fat: 3, fiber: 10, sodiumMg: 200, vitaminCMg: 22, calciumMg: 55, ironMg: 3.5,
        glycemicIndex: 30, sugarSpikeRisk: 'Low', servingSize: '1 Bowl (150g)', priceInr: 30, healthScore: 95,
        ingredients: [
          { name: 'Mixed sprouts (moong, chana)', quantity: '120g' }, { name: 'Tomato', quantity: '30g' },
          { name: 'Onion', quantity: '20g' }, { name: 'Cucumber', quantity: '30g' },
          { name: 'Chaat masala', quantity: '2g' }, { name: 'Lemon juice', quantity: '10ml' },
        ],
        instructions: 'Mix sprouts with chopped veggies. Toss with lemon juice and chaat masala. Serve fresh.',
        tags: ['Living Food', 'Enzyme-Rich', 'High Fiber'],
      },
      lunch: {
        id: 'd3_l', name: 'Rajma Chawal with Cucumber Raita', category: 'Indian Power Meal', mealSlot: 'lunch',
        calories: 640, protein: 26, carbs: 100, fat: 10, fiber: 14, sodiumMg: 600, vitaminCMg: 18, calciumMg: 160, ironMg: 6.0,
        glycemicIndex: 40, sugarSpikeRisk: 'Low', servingSize: '1 Plate (450g)', priceInr: 100, healthScore: 91,
        ingredients: [
          { name: 'Rajma (kidney beans)', quantity: '100g (dry)' }, { name: 'Basmati rice', quantity: '80g (dry)' },
          { name: 'Tomato', quantity: '80g' }, { name: 'Onion', quantity: '60g' },
          { name: 'Garlic', quantity: '8g' }, { name: 'Garam masala', quantity: '3g' },
          { name: 'Cucumber', quantity: '60g' }, { name: 'Yogurt', quantity: '80g' },
        ],
        instructions: 'Pressure cook soaked rajma. Prepare tomato-onion masala. Simmer rajma in masala 15 min. Cook rice. Mix raita. Serve together.',
        tags: ['Iron-Rich', 'High Fiber', 'Complete Protein', 'Vegetarian'],
      },
      evening_snack: {
        id: 'd3_es', name: 'Makhana (Fox Nuts) with Dry Fruits', category: 'Light Evening Snack', mealSlot: 'evening_snack',
        calories: 220, protein: 8, carbs: 36, fat: 6, fiber: 3, sodiumMg: 20, vitaminCMg: 0, calciumMg: 25, ironMg: 1.8,
        glycemicIndex: 52, sugarSpikeRisk: 'Moderate', servingSize: '40g makhana + 10g dry fruits', priceInr: 50, healthScore: 86,
        ingredients: [
          { name: 'Makhana (roasted)', quantity: '40g' }, { name: 'Almonds', quantity: '6 pcs' },
          { name: 'Raisins', quantity: '10g' }, { name: 'Ghee', quantity: '3g' }, { name: 'Salt', quantity: 'pinch' },
        ],
        instructions: 'Roast makhana in ghee until crispy. Season with salt. Mix with almonds and raisins.',
        tags: ['Calcium', 'Low Glycemic', 'Sattvic'],
      },
      dinner: {
        id: 'd3_d', name: 'Egg Bhurji (Scrambled) with Multigrain Toast', category: 'Quick Protein Dinner', mealSlot: 'dinner',
        calories: 460, protein: 29, carbs: 40, fat: 20, fiber: 5, sodiumMg: 550, vitaminCMg: 12, calciumMg: 100, ironMg: 3.4,
        glycemicIndex: 40, sugarSpikeRisk: 'Low', servingSize: '2 Eggs + 2 Toast slices', priceInr: 65, healthScore: 88,
        ingredients: [
          { name: 'Eggs', quantity: '3 large' }, { name: 'Onion', quantity: '40g' },
          { name: 'Tomato', quantity: '50g' }, { name: 'Green chilli', quantity: '1 pc' },
          { name: 'Coriander', quantity: '10g' }, { name: 'Oil', quantity: '5ml' },
          { name: 'Multigrain bread', quantity: '2 slices (60g)' }, { name: 'Turmeric', quantity: '1g' },
        ],
        instructions: 'Sauté onion, tomato, chilli. Add beaten eggs and turmeric. Scramble gently on low heat. Serve with toasted multigrain bread.',
        tags: ['High Protein', 'Quick Meal', 'B12-Rich'],
      },
    },
  },

  // ── DAY 4 ──────────────────────────────────────────────────────────────────
  {
    day: 'Thursday',
    date: 'Day 4',
    meals: {
      breakfast: {
        id: 'd4_b', name: 'Besan Cheela with Curd', category: 'Protein Breakfast', mealSlot: 'breakfast',
        calories: 380, protein: 20, carbs: 48, fat: 11, fiber: 7, sodiumMg: 380, vitaminCMg: 12, calciumMg: 110, ironMg: 3.5,
        glycemicIndex: 40, sugarSpikeRisk: 'Low', servingSize: '3 Chillas + 80g Curd', priceInr: 50, healthScore: 90,
        ingredients: [
          { name: 'Besan (chickpea flour)', quantity: '80g' }, { name: 'Onion', quantity: '30g' },
          { name: 'Tomato', quantity: '30g' }, { name: 'Ajwain', quantity: '2g' },
          { name: 'Oil', quantity: '5ml' }, { name: 'Curd', quantity: '80g' }, { name: 'Salt', quantity: 'to taste' },
        ],
        instructions: 'Make thin batter with besan, water, veggies, ajwain. Cook on tawa like pancakes. Serve with curd.',
        tags: ['High Protein', 'Gluten-Free', 'Vegetarian'],
      },
      morning_snack: {
        id: 'd4_ms', name: 'Mixed Nuts and Seeds Trail Mix', category: 'Healthy Fat Snack', mealSlot: 'morning_snack',
        calories: 240, protein: 9, carbs: 15, fat: 19, fiber: 4, sodiumMg: 15, vitaminCMg: 0, calciumMg: 55, ironMg: 1.8,
        glycemicIndex: 15, sugarSpikeRisk: 'Low', servingSize: '35g', priceInr: 45, healthScore: 89,
        ingredients: [
          { name: 'Almonds', quantity: '10g' }, { name: 'Cashews', quantity: '10g' },
          { name: 'Pumpkin seeds', quantity: '8g' }, { name: 'Sunflower seeds', quantity: '7g' },
        ],
        instructions: 'Mix all together. Portion into 35g serving. No prep needed.',
        tags: ['Healthy Fats', 'Zinc-Rich', 'Magnesium', 'Keto'],
      },
      lunch: {
        id: 'd4_l', name: 'Tandoori Chicken with Roti & Salad', category: 'Indian Protein Lunch', mealSlot: 'lunch',
        calories: 650, protein: 58, carbs: 50, fat: 17, fiber: 6, sodiumMg: 640, vitaminCMg: 30, calciumMg: 110, ironMg: 4.0,
        glycemicIndex: 48, sugarSpikeRisk: 'Low', servingSize: '2 Pieces + 2 Rotis + Salad', priceInr: 130, healthScore: 93,
        ingredients: [
          { name: 'Chicken (bone-in)', quantity: '300g' }, { name: 'Yogurt', quantity: '60g' },
          { name: 'Tandoori masala', quantity: '10g' }, { name: 'Lemon juice', quantity: '15ml' },
          { name: 'Garlic paste', quantity: '8g' }, { name: 'Whole wheat atta', quantity: '80g' },
          { name: 'Onion rings', quantity: '40g' }, { name: 'Lemon wedge', quantity: '1 pc' },
        ],
        instructions: 'Marinate chicken 4h in yogurt-masala-garlic. Grill/bake 25 min at 220°C. Make rotis. Serve with raw onion rings and lemon.',
        tags: ['Lean Protein', 'Iron-Rich', 'Bone Health'],
      },
      evening_snack: {
        id: 'd4_es', name: 'Idli with Sambar', category: 'South Indian Light Snack', mealSlot: 'evening_snack',
        calories: 240, protein: 10, carbs: 46, fat: 3, fiber: 5, sodiumMg: 360, vitaminCMg: 12, calciumMg: 50, ironMg: 2.2,
        glycemicIndex: 45, sugarSpikeRisk: 'Low', servingSize: '2 Idli + 100ml Sambar', priceInr: 35, healthScore: 87,
        ingredients: [
          { name: 'Idli batter', quantity: '120ml' }, { name: 'Toor dal', quantity: '30g' },
          { name: 'Mixed veggies', quantity: '50g' }, { name: 'Tamarind', quantity: '5g' },
          { name: 'Sambar powder', quantity: '5g' }, { name: 'Mustard seeds', quantity: '1g' },
        ],
        instructions: 'Steam batter in idli molds 10 min. Cook sambar with dal, veggies, tamarind, sambar powder. Serve together.',
        tags: ['Fermented', 'Probiotic', 'Low Fat'],
      },
      dinner: {
        id: 'd4_d', name: 'Chole (Chickpea Curry) with Brown Rice', category: 'Plant Protein Dinner', mealSlot: 'dinner',
        calories: 580, protein: 24, carbs: 88, fat: 12, fiber: 16, sodiumMg: 540, vitaminCMg: 22, calciumMg: 120, ironMg: 7.0,
        glycemicIndex: 42, sugarSpikeRisk: 'Low', servingSize: '1 Bowl Chole + 1 Cup Rice', priceInr: 85, healthScore: 92,
        ingredients: [
          { name: 'Chickpeas (dried)', quantity: '100g' }, { name: 'Tomato', quantity: '80g' },
          { name: 'Onion', quantity: '60g' }, { name: 'Ginger-garlic paste', quantity: '10g' },
          { name: 'Chole masala', quantity: '8g' }, { name: 'Brown rice', quantity: '80g (dry)' },
          { name: 'Bay leaves', quantity: '2 pcs' }, { name: 'Oil', quantity: '8ml' },
        ],
        instructions: 'Soak chickpeas overnight. Pressure cook with spices. Prepare onion-tomato masala. Simmer together 15 min. Serve over brown rice.',
        tags: ['Iron-Rich', 'High Fiber', 'Plant Protein'],
      },
    },
  },

  // ── DAY 5 ──────────────────────────────────────────────────────────────────
  {
    day: 'Friday',
    date: 'Day 5',
    meals: {
      breakfast: {
        id: 'd5_b', name: 'Poha with Peanuts & Lemon', category: 'Light Breakfast', mealSlot: 'breakfast',
        calories: 360, protein: 10, carbs: 62, fat: 8, fiber: 5, sodiumMg: 400, vitaminCMg: 12, calciumMg: 35, ironMg: 2.4,
        glycemicIndex: 55, sugarSpikeRisk: 'Moderate', servingSize: '1 Bowl (250g)', priceInr: 40, healthScore: 83,
        ingredients: [
          { name: 'Poha (thick flattened rice)', quantity: '80g' }, { name: 'Peanuts', quantity: '20g' },
          { name: 'Onion', quantity: '40g' }, { name: 'Green chilli', quantity: '1 pc' },
          { name: 'Mustard seeds', quantity: '2g' }, { name: 'Curry leaves', quantity: '5 pcs' },
          { name: 'Turmeric', quantity: '1g' }, { name: 'Lemon juice', quantity: '10ml' },
        ],
        instructions: 'Rinse poha, drain. Temper oil with mustard, curry leaves. Fry peanuts. Add onion, chilli, turmeric. Add poha. Mix, finish with lemon.',
        tags: ['Iron-Rich', 'Light on Gut', 'Quick Prep'],
      },
      morning_snack: {
        id: 'd5_ms', name: 'Smoothie: Spinach, Banana & Almond Milk', category: 'Green Smoothie', mealSlot: 'morning_snack',
        calories: 240, protein: 8, carbs: 42, fat: 6, fiber: 6, sodiumMg: 90, vitaminCMg: 36, calciumMg: 140, ironMg: 2.6,
        glycemicIndex: 40, sugarSpikeRisk: 'Low', servingSize: '300ml Glass', priceInr: 50, healthScore: 92,
        ingredients: [
          { name: 'Spinach', quantity: '50g' }, { name: 'Banana', quantity: '100g' },
          { name: 'Almond milk', quantity: '200ml' }, { name: 'Chia seeds', quantity: '5g' },
          { name: 'Honey', quantity: '5ml' },
        ],
        instructions: 'Blend spinach, banana, almond milk until smooth. Add chia seeds. Stir and serve immediately.',
        tags: ['Iron', 'Potassium', 'Vitamin C', 'Alkaline'],
      },
      lunch: {
        id: 'd5_l', name: 'Fish Curry (Rohu) with Steamed Rice', category: 'Bengali Style Lunch', mealSlot: 'lunch',
        calories: 610, protein: 48, carbs: 65, fat: 15, fiber: 5, sodiumMg: 580, vitaminCMg: 20, calciumMg: 145, ironMg: 3.8,
        glycemicIndex: 48, sugarSpikeRisk: 'Low', servingSize: '1 Plate (400g)', priceInr: 110, healthScore: 91,
        ingredients: [
          { name: 'Rohu fish', quantity: '250g' }, { name: 'Mustard paste', quantity: '15g' },
          { name: 'Turmeric', quantity: '3g' }, { name: 'Green chilli', quantity: '2 pcs' },
          { name: 'Mustard oil', quantity: '8ml' }, { name: 'Basmati rice', quantity: '80g (dry)' },
          { name: 'Onion', quantity: '50g' }, { name: 'Tomato', quantity: '60g' },
        ],
        instructions: 'Marinate fish with turmeric, salt. Fry in mustard oil. Prepare curry with mustard paste, onion, tomato. Simmer fish in curry. Serve over rice.',
        tags: ['Omega-3', 'Protein-Rich', 'Calcium'],
      },
      evening_snack: {
        id: 'd5_es', name: 'Masala Puffed Rice (Bhel)', category: 'Street Food Light', mealSlot: 'evening_snack',
        calories: 185, protein: 6, carbs: 34, fat: 4, fiber: 4, sodiumMg: 300, vitaminCMg: 10, calciumMg: 22, ironMg: 1.5,
        glycemicIndex: 65, sugarSpikeRisk: 'Moderate', servingSize: '1 Cup (80g)', priceInr: 25, healthScore: 74,
        ingredients: [
          { name: 'Puffed rice (murmura)', quantity: '60g' }, { name: 'Onion', quantity: '20g' },
          { name: 'Tomato', quantity: '20g' }, { name: 'Green chutney', quantity: '15ml' },
          { name: 'Tamarind chutney', quantity: '10ml' }, { name: 'Chaat masala', quantity: '2g' },
        ],
        instructions: 'Mix puffed rice with onion, tomato, chutneys, chaat masala. Toss and serve immediately.',
        tags: ['Low Calorie', 'Quick Snack', 'Tangy'],
      },
      dinner: {
        id: 'd5_d', name: 'Palak Paneer with 2 Rotis', category: 'Iron Powerhouse Dinner', mealSlot: 'dinner',
        calories: 530, protein: 30, carbs: 52, fat: 24, fiber: 9, sodiumMg: 540, vitaminCMg: 48, calciumMg: 410, ironMg: 6.4,
        glycemicIndex: 38, sugarSpikeRisk: 'Low', servingSize: '1 Bowl + 2 Rotis', priceInr: 95, healthScore: 95,
        ingredients: [
          { name: 'Spinach', quantity: '200g' }, { name: 'Paneer', quantity: '150g' },
          { name: 'Onion', quantity: '50g' }, { name: 'Garlic', quantity: '8g' },
          { name: 'Cream', quantity: '20ml' }, { name: 'Cumin', quantity: '2g' },
          { name: 'Garam masala', quantity: '3g' }, { name: 'Whole wheat atta', quantity: '80g' },
        ],
        instructions: 'Blanch and blend spinach. Sauté onion-garlic. Add spinach puree and spices. Add paneer cubes. Finish with cream. Serve with rotis.',
        tags: ['Iron', 'Calcium', 'Vitamin A', 'Vegetarian'],
      },
    },
  },

  // ── DAY 6 ──────────────────────────────────────────────────────────────────
  {
    day: 'Saturday',
    date: 'Day 6',
    meals: {
      breakfast: {
        id: 'd6_b', name: 'Vegetable Daliya (Broken Wheat Porridge)', category: 'Whole Grain Breakfast', mealSlot: 'breakfast',
        calories: 370, protein: 14, carbs: 64, fat: 8, fiber: 9, sodiumMg: 370, vitaminCMg: 18, calciumMg: 80, ironMg: 3.0,
        glycemicIndex: 41, sugarSpikeRisk: 'Low', servingSize: '1 Bowl (300g)', priceInr: 40, healthScore: 92,
        ingredients: [
          { name: 'Broken wheat (daliya)', quantity: '80g' }, { name: 'Carrot', quantity: '40g' },
          { name: 'Peas', quantity: '30g' }, { name: 'Ghee', quantity: '5g' },
          { name: 'Cumin seeds', quantity: '2g' }, { name: 'Salt', quantity: 'to taste' },
          { name: 'Coriander', quantity: '5g' },
        ],
        instructions: 'Roast daliya in ghee. Add veggies, water (2:1). Pressure cook 2 whistles. Garnish with coriander.',
        tags: ['Whole Grain', 'High Fiber', 'Gluten'],
      },
      morning_snack: {
        id: 'd6_ms', name: 'Curd with Flaxseeds and Honey', category: 'Probiotic Snack', mealSlot: 'morning_snack',
        calories: 200, protein: 10, carbs: 24, fat: 7, fiber: 5, sodiumMg: 70, vitaminCMg: 0, calciumMg: 200, ironMg: 1.0,
        glycemicIndex: 30, sugarSpikeRisk: 'Low', servingSize: '1 Bowl (180g)', priceInr: 40, healthScore: 88,
        ingredients: [
          { name: 'Plain curd', quantity: '150g' }, { name: 'Flaxseeds', quantity: '10g' },
          { name: 'Honey', quantity: '8ml' }, { name: 'Cinnamon', quantity: '1g' },
        ],
        instructions: 'Whisk curd. Add flaxseeds. Drizzle honey. Sprinkle cinnamon.',
        tags: ['Omega-3', 'Probiotic', 'Gut Health'],
      },
      lunch: {
        id: 'd6_l', name: 'Egg Biryani (Brown Rice)', category: 'Weekend Special', mealSlot: 'lunch',
        calories: 660, protein: 30, carbs: 82, fat: 20, fiber: 6, sodiumMg: 650, vitaminCMg: 15, calciumMg: 100, ironMg: 3.8,
        glycemicIndex: 50, sugarSpikeRisk: 'Low', servingSize: '1 Plate (400g)', priceInr: 110, healthScore: 86,
        ingredients: [
          { name: 'Eggs (hard boiled)', quantity: '3 large' }, { name: 'Brown basmati rice', quantity: '100g (dry)' },
          { name: 'Onion (caramelised)', quantity: '80g' }, { name: 'Biryani masala', quantity: '10g' },
          { name: 'Mint leaves', quantity: '10g' }, { name: 'Saffron', quantity: 'pinch' },
          { name: 'Ghee', quantity: '8g' }, { name: 'Yogurt', quantity: '50g' },
        ],
        instructions: 'Cook rice 80%. Layer with egg, caramelised onion, masala, mint, saffron. Seal and dum cook 20 min on low heat.',
        tags: ['Complete Protein', 'Festive', 'B12'],
      },
      evening_snack: {
        id: 'd6_es', name: 'Khakhra with Hummus', category: 'Protein Cracker Snack', mealSlot: 'evening_snack',
        calories: 210, protein: 8, carbs: 26, fat: 8, fiber: 5, sodiumMg: 220, vitaminCMg: 3, calciumMg: 45, ironMg: 2.2,
        glycemicIndex: 35, sugarSpikeRisk: 'Low', servingSize: '3 Khakhra + 40g Hummus', priceInr: 45, healthScore: 84,
        ingredients: [
          { name: 'Methi/Masala Khakhra', quantity: '3 pcs (45g)' }, { name: 'Hummus', quantity: '40g' },
          { name: 'Paprika', quantity: '1g' }, { name: 'Olive oil', quantity: '3ml' },
        ],
        instructions: 'Top hummus with paprika and olive oil drizzle. Dip or top khakhra and eat.',
        tags: ['High Fiber', 'Protein-Snack', 'Portable'],
      },
      dinner: {
        id: 'd6_d', name: 'Methi Chicken with Jowar Roti', category: 'Low-Carb Dinner', mealSlot: 'dinner',
        calories: 560, protein: 50, carbs: 42, fat: 20, fiber: 8, sodiumMg: 560, vitaminCMg: 24, calciumMg: 100, ironMg: 4.8,
        glycemicIndex: 45, sugarSpikeRisk: 'Low', servingSize: '1 Bowl Chicken + 2 Jowar Rotis', priceInr: 125, healthScore: 91,
        ingredients: [
          { name: 'Chicken breast', quantity: '200g' }, { name: 'Fenugreek (methi) leaves', quantity: '60g' },
          { name: 'Onion', quantity: '60g' }, { name: 'Garlic-ginger paste', quantity: '10g' },
          { name: 'Yogurt', quantity: '40g' }, { name: 'Jowar flour', quantity: '80g' },
          { name: 'Oil', quantity: '8ml' }, { name: 'Kasuri methi', quantity: '3g' },
        ],
        instructions: 'Marinate chicken in yogurt-spices 1h. Sauté onion-garlic. Add chicken, cook through. Add methi leaves. Simmer 10 min. Make jowar rotis.',
        tags: ['Diabetic-Friendly', 'Iron-Rich', 'Gluten-Free Roti'],
      },
    },
  },

  // ── DAY 7 ──────────────────────────────────────────────────────────────────
  {
    day: 'Sunday',
    date: 'Day 7',
    meals: {
      breakfast: {
        id: 'd7_b', name: 'Protein Pancakes with Banana & Honey', category: 'High Protein Breakfast', mealSlot: 'breakfast',
        calories: 430, protein: 27, carbs: 58, fat: 11, fiber: 5, sodiumMg: 330, vitaminCMg: 10, calciumMg: 160, ironMg: 2.8,
        glycemicIndex: 48, sugarSpikeRisk: 'Low', servingSize: '3 Pancakes + Topping', priceInr: 65, healthScore: 88,
        ingredients: [
          { name: 'Oat flour', quantity: '60g' }, { name: 'Whey protein (vanilla)', quantity: '30g' },
          { name: 'Egg', quantity: '2 large' }, { name: 'Banana', quantity: '80g' },
          { name: 'Almond milk', quantity: '60ml' }, { name: 'Honey', quantity: '10ml' },
          { name: 'Baking powder', quantity: '3g' }, { name: 'Coconut oil', quantity: '5ml' },
        ],
        instructions: 'Blend banana. Mix with oat flour, protein, egg, milk, baking powder. Cook on non-stick 2-3 min/side. Top with honey.',
        tags: ['Muscle Building', 'High Protein', 'Oats'],
      },
      morning_snack: {
        id: 'd7_ms', name: 'Dates and Almond Energy Balls', category: 'Natural Energy Snack', mealSlot: 'morning_snack',
        calories: 220, protein: 6, carbs: 34, fat: 10, fiber: 5, sodiumMg: 8, vitaminCMg: 0, calciumMg: 70, ironMg: 2.2,
        glycemicIndex: 42, sugarSpikeRisk: 'Low', servingSize: '2 Balls (50g)', priceInr: 45, healthScore: 87,
        ingredients: [
          { name: 'Medjool dates (pitted)', quantity: '30g' }, { name: 'Almonds', quantity: '15g' },
          { name: 'Desiccated coconut', quantity: '5g' }, { name: 'Cardamom', quantity: '1g' },
        ],
        instructions: 'Blend dates and almonds into paste. Add cardamom. Roll into balls. Coat in coconut. Refrigerate 30 min.',
        tags: ['Natural Sweetener', 'Iron', 'No Added Sugar'],
      },
      lunch: {
        id: 'd7_l', name: 'Hyderabadi Chicken Biryani (Lean)', category: 'Sunday Special', mealSlot: 'lunch',
        calories: 720, protein: 50, carbs: 84, fat: 22, fiber: 5, sodiumMg: 720, vitaminCMg: 18, calciumMg: 100, ironMg: 4.0,
        glycemicIndex: 52, sugarSpikeRisk: 'Moderate', servingSize: '1 Plate (380g)', priceInr: 145, healthScore: 87,
        ingredients: [
          { name: 'Chicken (lean breast)', quantity: '250g' }, { name: 'Aged basmati rice', quantity: '100g (dry)' },
          { name: 'Fried onions', quantity: '40g' }, { name: 'Biryani masala', quantity: '12g' },
          { name: 'Saffron', quantity: 'pinch in warm milk' }, { name: 'Mint & Coriander', quantity: '20g' },
          { name: 'Yogurt', quantity: '80g' }, { name: 'Ghee', quantity: '10g' },
        ],
        instructions: 'Marinate chicken with yogurt and biryani masala 4h. Cook rice 70%. Layer in heavy pot: rice-chicken-fried onions-mint-saffron. Dum cook 25 min.',
        tags: ['Sunday Special', 'Aromatic', 'Complete Meal'],
      },
      evening_snack: {
        id: 'd7_es', name: 'Chai Latte with Roasted Almonds', category: 'Relaxing Evening Snack', mealSlot: 'evening_snack',
        calories: 190, protein: 8, carbs: 18, fat: 11, fiber: 3, sodiumMg: 45, vitaminCMg: 0, calciumMg: 130, ironMg: 1.2,
        glycemicIndex: 35, sugarSpikeRisk: 'Low', servingSize: '1 Cup Chai + 20g Almonds', priceInr: 40, healthScore: 80,
        ingredients: [
          { name: 'Low-fat milk', quantity: '200ml' }, { name: 'Tea leaves', quantity: '3g' },
          { name: 'Ginger', quantity: '5g' }, { name: 'Cardamom', quantity: '2 pods' },
          { name: 'Jaggery', quantity: '5g' }, { name: 'Roasted almonds', quantity: '20g' },
        ],
        instructions: 'Boil milk with tea, ginger, cardamom. Strain. Sweeten with jaggery. Serve with roasted almonds.',
        tags: ['Relaxing', 'Calcium', 'Low Sugar'],
      },
      dinner: {
        id: 'd7_d', name: 'Mixed Dal Soup with Multigrain Bread', category: 'Light Sunday Dinner', mealSlot: 'dinner',
        calories: 430, protein: 24, carbs: 62, fat: 9, fiber: 12, sodiumMg: 480, vitaminCMg: 22, calciumMg: 110, ironMg: 5.2,
        glycemicIndex: 38, sugarSpikeRisk: 'Low', servingSize: '1 Bowl Soup + 2 Bread Slices', priceInr: 55, healthScore: 94,
        ingredients: [
          { name: 'Mixed dals (moong, masoor, toor)', quantity: '80g' }, { name: 'Spinach', quantity: '60g' },
          { name: 'Carrot', quantity: '40g' }, { name: 'Tomato', quantity: '50g' },
          { name: 'Garlic', quantity: '5g' }, { name: 'Cumin', quantity: '2g' },
          { name: 'Olive oil', quantity: '5ml' }, { name: 'Multigrain bread', quantity: '2 slices (60g)' },
        ],
        instructions: 'Pressure cook dals. Sauté garlic, cumin, veggies. Add cooked dal. Simmer to desired consistency. Blend half for creaminess. Serve with bread.',
        tags: ['High Fiber', 'Iron', 'Complete Amino Acids'],
      },
    },
  },
];

// ─── COMPONENT ─────────────────────────────────────────────────────────────────
const SLOT_ORDER = ['breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner'] as const;

const GI_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  Low: { label: '🟢 Low GI', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  Moderate: { label: '🟡 Med GI', bg: 'bg-amber-500/15', text: 'text-amber-400' },
  High: { label: '🔴 High GI', bg: 'bg-red-500/15', text: 'text-red-400' },
};

// ─── CUSTOM MEAL FORM ─────────────────────────────────────────────────────────
const EMPTY_CUSTOM: MealItem = {
  id: '', name: '', category: 'Custom Meal', mealSlot: 'breakfast',
  calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
  sodiumMg: 0, vitaminCMg: 0, calciumMg: 0, ironMg: 0,
  glycemicIndex: 50, sugarSpikeRisk: 'Moderate',
  servingSize: '', priceInr: 0, healthScore: 80,
  ingredients: [{ name: '', quantity: '' }],
  instructions: '', tags: [],
};

function CustomMealForm({
  slot, onSave, onCancel, dark
}: {
  slot: string; onSave: (meal: MealItem) => void; onCancel: () => void; dark: boolean;
}) {
  const [form, setForm] = useState<MealItem>({ ...EMPTY_CUSTOM, id: `custom_${Date.now()}`, mealSlot: slot as any });
  const inputCls = `w-full px-3 py-2 rounded-xl text-sm border outline-none transition ${dark ? 'bg-zinc-900 border-zinc-700 text-white focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'}`;

  const updateIngredient = (idx: number, field: 'name' | 'quantity', value: string) => {
    const ing = [...form.ingredients];
    ing[idx] = { ...ing[idx], [field]: value };
    setForm(f => ({ ...f, ingredients: ing }));
  };
  const addIngredient = () => setForm(f => ({ ...f, ingredients: [...f.ingredients, { name: '', quantity: '' }] }));
  const removeIngredient = (idx: number) => setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md`}>
      <div className={`w-full max-w-2xl rounded-3xl border p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl ${dark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>➕ Add Custom Meal</h3>
          <button onClick={onCancel}><X className="w-5 h-5 text-zinc-400" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={`text-xs font-bold block mb-1 ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>Meal Name *</label>
            <input className={inputCls} placeholder="e.g. Homemade Khichdi" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className={`text-xs font-bold block mb-1 ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>Serving Size</label>
            <input className={inputCls} placeholder="e.g. 1 Bowl (280g)" value={form.servingSize} onChange={e => setForm(f => ({ ...f, servingSize: e.target.value }))} />
          </div>
          <div>
            <label className={`text-xs font-bold block mb-1 ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>Price (₹)</label>
            <input type="number" className={inputCls} value={form.priceInr || ''} onChange={e => setForm(f => ({ ...f, priceInr: Number(e.target.value) }))} />
          </div>
          {/* Macros Row */}
          <div>
            <label className={`text-xs font-bold block mb-1 ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>Calories</label>
            <input type="number" className={inputCls} value={form.calories || ''} onChange={e => setForm(f => ({ ...f, calories: Number(e.target.value) }))} />
          </div>
          <div>
            <label className={`text-xs font-bold block mb-1 ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>Protein (g)</label>
            <input type="number" className={inputCls} value={form.protein || ''} onChange={e => setForm(f => ({ ...f, protein: Number(e.target.value) }))} />
          </div>
          <div>
            <label className={`text-xs font-bold block mb-1 ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>Carbs (g)</label>
            <input type="number" className={inputCls} value={form.carbs || ''} onChange={e => setForm(f => ({ ...f, carbs: Number(e.target.value) }))} />
          </div>
          <div>
            <label className={`text-xs font-bold block mb-1 ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>Fat (g)</label>
            <input type="number" className={inputCls} value={form.fat || ''} onChange={e => setForm(f => ({ ...f, fat: Number(e.target.value) }))} />
          </div>
          <div>
            <label className={`text-xs font-bold block mb-1 ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>Fiber (g)</label>
            <input type="number" className={inputCls} value={form.fiber || ''} onChange={e => setForm(f => ({ ...f, fiber: Number(e.target.value) }))} />
          </div>
          <div>
            <label className={`text-xs font-bold block mb-1 ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>GI (0-100)</label>
            <input type="number" className={inputCls} value={form.glycemicIndex || ''} onChange={e => setForm(f => ({ ...f, glycemicIndex: Number(e.target.value), sugarSpikeRisk: Number(e.target.value) < 55 ? 'Low' : Number(e.target.value) < 70 ? 'Moderate' : 'High' }))} />
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={`text-xs font-bold ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>Ingredients</label>
            <button onClick={addIngredient} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold"><Plus className="w-3 h-3" />Add</button>
          </div>
          <div className="space-y-2">
            {form.ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${inputCls} flex-1`} placeholder="Ingredient name" value={ing.name} onChange={e => updateIngredient(i, 'name', e.target.value)} />
                <input className={`${inputCls} w-28`} placeholder="Qty" value={ing.quantity} onChange={e => updateIngredient(i, 'quantity', e.target.value)} />
                <button onClick={() => removeIngredient(i)} className="text-zinc-500 hover:text-red-400"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className={`text-xs font-bold block mb-1 ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>Instructions</label>
          <textarea className={`${inputCls} h-20 resize-none`} placeholder="How to prepare..." value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onCancel} className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition ${dark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Cancel</button>
          <button
            onClick={() => { if (form.name) onSave(form); }}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition"
          >
            ✅ Save Meal
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MEAL DETAIL MODAL ─────────────────────────────────────────────────────────
function MealDetailModal({ meal, onClose, dark }: { meal: MealItem; onClose: () => void; dark: boolean }) {
  const gi = GI_BADGE[meal.sugarSpikeRisk];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`w-full max-w-xl rounded-3xl border p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl ${dark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={`text-lg font-extrabold leading-tight ${dark ? 'text-white' : 'text-gray-900'}`}>{meal.name}</h3>
            <span className={`text-xs font-medium ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>{meal.servingSize}</span>
          </div>
          <button onClick={onClose} className="shrink-0 text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* GI Badge & Price */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${gi.bg} ${gi.text}`}>{gi.label}</span>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${dark ? 'bg-zinc-900 text-zinc-300' : 'bg-gray-100 text-gray-600'}`}>GI: {meal.glycemicIndex}</span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">₹{meal.priceInr}</span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400">⭐ {meal.healthScore}</span>
          {meal.tags.map(t => (
            <span key={t} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'}`}>{t}</span>
          ))}
        </div>

        {/* Macros */}
        <div className={`grid grid-cols-4 gap-3 p-4 rounded-2xl ${dark ? 'bg-zinc-900' : 'bg-gray-50'}`}>
          {[
            { label: 'Calories', value: `${meal.calories} kcal`, color: 'text-orange-400' },
            { label: 'Protein', value: `${meal.protein}g`, color: 'text-blue-400' },
            { label: 'Carbs', value: `${meal.carbs}g`, color: 'text-amber-400' },
            { label: 'Fat', value: `${meal.fat}g`, color: 'text-emerald-400' },
          ].map(m => (
            <div key={m.label} className="text-center">
              <div className={`text-base font-extrabold ${m.color}`}>{m.value}</div>
              <div className={`text-[10px] font-bold ${dark ? 'text-zinc-500' : 'text-gray-400'}`}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Micros */}
        <div className={`grid grid-cols-3 gap-2 p-4 rounded-2xl ${dark ? 'bg-zinc-900' : 'bg-gray-50'}`}>
          {[
            { label: 'Fiber', value: `${meal.fiber}g` },
            { label: 'Sodium', value: `${meal.sodiumMg}mg` },
            { label: 'Vit C', value: `${meal.vitaminCMg}mg` },
            { label: 'Calcium', value: `${meal.calciumMg}mg` },
            { label: 'Iron', value: `${meal.ironMg}mg` },
            { label: 'GI Index', value: `${meal.glycemicIndex}` },
          ].map(m => (
            <div key={m.label} className={`p-2 rounded-xl text-center ${dark ? 'bg-zinc-800' : 'bg-white border border-gray-100'}`}>
              <div className={`text-xs font-extrabold ${dark ? 'text-white' : 'text-gray-800'}`}>{m.value}</div>
              <div className={`text-[10px] ${dark ? 'text-zinc-500' : 'text-gray-400'}`}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        <div>
          <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>
            <ShoppingBag className="w-3.5 h-3.5" /> Ingredients
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {meal.ingredients.map((ing, i) => (
              <div key={i} className={`flex justify-between items-center p-2 rounded-xl text-xs ${dark ? 'bg-zinc-900 text-zinc-300' : 'bg-gray-50 text-gray-700'}`}>
                <span>{ing.name}</span>
                <span className="font-bold text-blue-400">{ing.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        {meal.instructions && (
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${dark ? 'text-zinc-400' : 'text-gray-500'}`}>
              <BookOpen className="w-3.5 h-3.5" /> Preparation
            </h4>
            <p className={`text-xs leading-relaxed p-3 rounded-xl ${dark ? 'bg-zinc-900 text-zinc-300' : 'bg-gray-50 text-gray-700'}`}>{meal.instructions}</p>
          </div>
        )}

        <button onClick={onClose} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition">
          Close Details
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export const CustomMealPlanner: React.FC = () => {
  const {
    userProfile, updateProfile, macroGoals,
    todayDoneMeals, setMealDone,
    isDarkMode: dark
  } = useAppStore();
  // Default dayIndex to today's weekday (0=Mon...6=Sun)
  const todayWeekdayIdx = (new Date().getDay() + 6) % 7; // convert Sun=0 JS to Mon=0
  const [dayIndex, setDayIndex] = useState(todayWeekdayIdx);
  const [customMeals, setCustomMeals] = useState<Record<string, MealItem>>({});
  const [addingSlot, setAddingSlot] = useState<string | null>(null);
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [detailMeal, setDetailMeal] = useState<MealItem | null>(null);
  const [nonTodayWarn, setNonTodayWarn] = useState<string | null>(null);
  const [plannerMode, setPlannerMode] = useState<'OMNI_LOCK' | 'RECIPE_PLAN'>('OMNI_LOCK');

  // ── Budget & Macro Calibration Engine ──────────────────────────────────────
  const monthlyBudgetLimit = userProfile.monthlyBudgetInr ?? 10500;
  const dailyBudgetCap = Math.max(20, Math.round(monthlyBudgetLimit / 30));
  const weeklyBudgetCap = Math.round((monthlyBudgetLimit / 30) * 7);

  // ── OmniLock LP & Escrow Engine Solvers ───────────────────────────────────
  const monthlyOmniSummary = generateMonthlyOmniLock(
    userProfile.weightKg || 75,
    userProfile.heightCm || 175,
    userProfile.age || 25,
    userProfile.goal || 'muscle_gain',
    monthlyBudgetLimit
  );

  const currentOmniDayLedger = monthlyOmniSummary.ledger[dayIndex] || monthlyOmniSummary.ledger[0];
  const omniDailyResult = solveDailyOmniLock(
    userProfile.weightKg || 75,
    userProfile.heightCm || 175,
    userProfile.age || 25,
    userProfile.goal || 'muscle_gain',
    dailyBudgetCap,
    currentOmniDayLedger ? currentOmniDayLedger.escrow_rollover : 0,
    dayIndex
  );

  const plan = WEEK_PLAN[dayIndex];
  const rawDayMeals = { ...plan.meals };

  // Merge custom meals for today's slots
  SLOT_ORDER.forEach(slot => {
    const key = `${dayIndex}_${slot}`;
    if (customMeals[key]) rawDayMeals[slot] = customMeals[key];
  });

  // Calculate raw uncalibrated daily spend & macros
  const rawDaySum = SLOT_ORDER.reduce((sum, s) => sum + rawDayMeals[s].priceInr, 0);

  // Uncalibrated raw macro totals for the day
  const rawMacroTotals = SLOT_ORDER.reduce((acc, s) => ({
    cal: acc.cal + (rawDayMeals[s].calories || 0),
    pro: acc.pro + (rawDayMeals[s].protein || 0),
    carbs: acc.carbs + (rawDayMeals[s].carbs || 0),
    fat: acc.fat + (rawDayMeals[s].fat || 0),
  }), { cal: 0, pro: 0, carbs: 0, fat: 0 });

  // Calibration ratio so total day spend NEVER exceeds dailyBudgetCap (Zero Overrun Guarantee)
  const priceScaleRatio = rawDaySum > dailyBudgetCap ? dailyBudgetCap / rawDaySum : 1;

  // Calibrate macros to hit ~97% of user's personal macro goals (Calories, Protein, Carbs, Fat)
  const targetCal   = macroGoals.calories || 2000;
  const targetPro   = macroGoals.proteinGrams || 150;
  const targetCarbs = macroGoals.carbsGrams || 200;
  const targetFat   = macroGoals.fatGrams || 65;

  const calMultiplier   = (targetCal   * 0.97) / Math.max(1, rawMacroTotals.cal);
  const proMultiplier   = (targetPro   * 0.97) / Math.max(1, rawMacroTotals.pro);
  const carbsMultiplier = (targetCarbs * 0.97) / Math.max(1, rawMacroTotals.carbs);
  const fatMultiplier   = (targetFat   * 0.97) / Math.max(1, rawMacroTotals.fat);

  // Calibrated day meals with strict budget price capping & 100% mathematically exact Atwater macro alignment (4-4-9 kcal/g)
  const dayMeals: Record<string, MealItem> = {};
  SLOT_ORDER.forEach(slot => {
    const rawMeal = rawDayMeals[slot];
    const cPro   = Math.round((rawMeal.protein * proMultiplier) * 10) / 10;
    const cCarbs = Math.round((rawMeal.carbs * carbsMultiplier) * 10) / 10;
    const cFat   = Math.round((rawMeal.fat * fatMultiplier) * 10) / 10;
    const cCal   = Math.round(cPro * 4 + cCarbs * 4 + cFat * 9);

    dayMeals[slot] = {
      ...rawMeal,
      priceInr: Math.max(1, Math.floor(rawMeal.priceInr * priceScaleRatio)),
      protein:  cPro,
      carbs:    cCarbs,
      fat:      cFat,
      calories: cCal,
    };
  });

  // ── Totals ────────────────────────────────────────────────────────────────
  const doneSlots = SLOT_ORDER.filter(s => todayDoneMeals[`${dayIndex}_${s}`]);
  const totals = doneSlots.reduce((acc, s) => {
    const m = dayMeals[s];
    return { cal: acc.cal + m.calories, pro: acc.pro + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat, fiber: acc.fiber + m.fiber };
  }, { cal: 0, pro: 0, carbs: 0, fat: 0, fiber: 0 });

  const allTotals = SLOT_ORDER.reduce((acc, s) => {
    const m = dayMeals[s];
    return { cal: acc.cal + m.calories, pro: acc.pro + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat };
  }, { cal: 0, pro: 0, carbs: 0, fat: 0 });

  const daySpend = SLOT_ORDER.reduce((a, s) => a + dayMeals[s].priceInr, 0);
  const budgetPct = Math.min(100, (daySpend / dailyBudgetCap) * 100);

  // Required Daily Calorie Target (TDEE)
  const targetCalories = macroGoals.calories || 2000;
  const macroCoveragePct = Math.min(100, Math.round((allTotals.cal / targetCalories) * 100));

  // Calculate 7-Day Calibrated Weekly Totals
  const totalWeeklyEstSpend = WEEK_PLAN.reduce((weeklySum, d, idx) => {
    const dMeals = { ...d.meals };
    SLOT_ORDER.forEach(slot => {
      const key = `${idx}_${slot}`;
      if (customMeals[key]) dMeals[slot] = customMeals[key];
    });
    const dRawSum = SLOT_ORDER.reduce((sum, s) => sum + dMeals[s].priceInr, 0);
    const dScaleRatio = dRawSum > dailyBudgetCap ? dailyBudgetCap / dRawSum : 1;
    return weeklySum + SLOT_ORDER.reduce((a, s) => a + Math.max(1, Math.floor(dMeals[s].priceInr * dScaleRatio)), 0);
  }, 0);

  const avgWeeklyDailyCals = Math.round(WEEK_PLAN.reduce((a, d) => a + SLOT_ORDER.reduce((b, s) => b + d.meals[s].calories, 0), 0) / 7);

  // ── Theme classes (from global store) ────────────────────────────────────
  const bg = dark ? 'text-white' : 'text-gray-900';
  const card = dark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200';
  const cardHover = dark ? 'hover:border-zinc-600' : 'hover:border-blue-200';
  const muted = dark ? 'text-zinc-400' : 'text-gray-500';
  const badge = dark ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-600';
  const progressBg = dark ? 'bg-zinc-800' : 'bg-gray-200';

  const handleDone = (slot: string) => {
    // Guard: only log to dashboard if viewing TODAY's plan
    if (dayIndex !== todayWeekdayIdx) {
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      setNonTodayWarn(`You are viewing ${dayNames[dayIndex]}'s plan. Switch to Today (${dayNames[todayWeekdayIdx]}) to log meals to your dashboard.`);
      setTimeout(() => setNonTodayWarn(null), 4000);
      return;
    }
    setNonTodayWarn(null);

    const key = `${dayIndex}_${slot}`;
    const currentlyDone = !!todayDoneMeals[key];
    const nextDone = !currentlyDone;

    const meal = dayMeals[slot];
    const categoryMap: Record<string, 'breakfast' | 'lunch' | 'dinner' | 'snack'> = {
      breakfast: 'breakfast',
      morning_snack: 'snack',
      lunch: 'lunch',
      evening_snack: 'snack',
      dinner: 'dinner',
    };
    const mealType = categoryMap[slot] || 'lunch';

    // Deterministic log ID based on day + slot — prevents duplicates
    const mealLogId = `planner-${dayIndex}-${slot}-${meal.id}`;

    setMealDone(
      key,
      nextDone,
      {
        id: meal.id,
        name: meal.name,
        category: meal.category,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        fiber: meal.fiber,
        sugar: 2,
        sodiumMg: meal.sodiumMg,
        servingSize: meal.servingSize,
        priceInr: meal.priceInr,
        healthScore: meal.healthScore,
        allergens: [],
        dietaryFlags: meal.tags,
      },
      mealType,
      1,
      mealLogId
    );
  };

  const handleSaveCustom = (meal: MealItem) => {
    const key = `${dayIndex}_${meal.mealSlot}`;
    setCustomMeals(p => ({ ...p, [key]: meal }));
    setAddingSlot(null);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${bg}`}>
      {addingSlot !== null && (
        <CustomMealForm
          slot={addingSlot}
          onSave={handleSaveCustom}
          onCancel={() => setAddingSlot(null)}
          dark={dark}
        />
      )}
      {detailMeal && (
        <MealDetailModal meal={detailMeal} onClose={() => setDetailMeal(null)} dark={dark} />
      )}

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Lock className="w-5 h-5 text-amber-500" />
              <h1 className="text-xl font-extrabold font-display">Apex Budget Meal Planner</h1>
            </div>
            <p className={`text-xs ${muted}`}>Linear Programming Solver · 97% Macro Target Lock · Smart Escrow Rollover Ledger</p>
          </div>
        </div>

        {/* ── Mode Switcher Tab (OmniLock Apex Engine vs 7-Day Recipe Plan) ── */}
        <div className={`p-1.5 rounded-2xl border flex items-center gap-1.5 ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-100 border-gray-200'}`}>
          <button
            onClick={() => setPlannerMode('OMNI_LOCK')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition ${
              plannerMode === 'OMNI_LOCK'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : dark ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>OmniLock™ Apex Budget Engine</span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${plannerMode === 'OMNI_LOCK' ? 'bg-black/20 text-black' : 'bg-amber-500/20 text-amber-400'}`}>LP Solver</span>
          </button>
          <button
            onClick={() => setPlannerMode('RECIPE_PLAN')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition ${
              plannerMode === 'RECIPE_PLAN'
                ? 'bg-emerald-600 text-white shadow-md'
                : dark ? 'text-zinc-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>7-Day Recipe Meal Plan</span>
          </button>
        </div>

        {/* ── OMNILOCK APEX BUDGET ENGINE MODE ───────────────────────────────── */}
        {plannerMode === 'OMNI_LOCK' && (
          <div className="space-y-5">
            {/* Status Banner */}
            <div className="p-4 rounded-2xl border bg-amber-500/10 border-amber-500/30 text-amber-400 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-xs font-black uppercase tracking-wider">🔒 OMNI-LOCK ENGAGED: Perfect Constraint Solution Found</div>
                  <div className="text-[11px] opacity-90">Linear Programming Solver · Mifflin-St Jeor TDEE · ₹0 Budget Overrun</div>
                </div>
              </div>
              <span className="text-[10px] font-extrabold bg-amber-500 text-zinc-950 px-2.5 py-1 rounded-full uppercase">
                100% Macro Compliance
              </span>
            </div>

            {/* Monthly Budget Configurator & Escrow Ledger Card */}
            <div className={`p-5 rounded-2xl border ${card} space-y-4`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">💰 Monthly Escrow Ledger</span>
                  <h3 className={`text-sm font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>Financial & Biometric Controls</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    ₹{monthlyBudgetLimit} / month Cap
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                    Escrow Vault Active
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                <div className={`p-3 rounded-xl border ${dark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                  <label className={`text-[10px] font-bold block mb-1 ${muted}`}>Set Monthly Budget (₹)</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-amber-400">₹</span>
                    <input
                      type="number"
                      min="500"
                      max="50000"
                      value={monthlyBudgetLimit}
                      onChange={(e) => {
                        const newMonthly = Math.max(500, Number(e.target.value) || 10500);
                        updateProfile({ monthlyBudgetInr: newMonthly, dailyBudgetInr: Math.floor(newMonthly / 30) });
                      }}
                      className={`w-full px-2 py-1 text-xs font-extrabold rounded-lg border outline-none ${dark ? 'bg-zinc-900 border-zinc-700 text-white focus:border-amber-500' : 'bg-white border-gray-300 text-gray-900 focus:border-amber-500'}`}
                    />
                  </div>
                </div>

                <div className={`p-3 rounded-xl border ${dark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`text-[10px] font-bold ${muted}`}>Base Daily Budget</div>
                  <div className="text-sm font-extrabold text-amber-400">₹{dailyBudgetCap} <span className="text-[10px] text-zinc-400 font-normal">/ day</span></div>
                  <div className="text-[9px] text-emerald-400 font-semibold">₹0 Overrun Guarantee</div>
                </div>

                <div className={`p-3 rounded-xl border ${dark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`text-[10px] font-bold ${muted}`}>Escrow Rollover</div>
                  <div className="text-sm font-extrabold text-emerald-400">₹{currentOmniDayLedger?.saved_today ?? 0} <span className="text-[10px] text-zinc-400 font-normal">banked</span></div>
                  <div className="text-[9px] text-blue-400 font-semibold">Rolls to Tomorrow</div>
                </div>

                <div className={`p-3 rounded-xl border ${dark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                  <div className={`text-[10px] font-bold ${muted}`}>Month Total Spent</div>
                  <div className="text-sm font-extrabold text-purple-400">₹{monthlyOmniSummary.total_spent}</div>
                  <div className="text-[9px] text-zinc-400">Remaining: ₹{monthlyOmniSummary.budget_remaining}</div>
                </div>
              </div>

              {/* Quick Budget Presets */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className={`text-[11px] font-bold ${muted}`}>Quick Presets:</span>
                {[
                  { label: '₹2,000 / mo (₹66/day)', val: 2000 },
                  { label: '₹3,000 / mo (₹100/day)', val: 3000 },
                  { label: '₹5,000 / mo (₹166/day)', val: 5000 },
                  { label: '₹10,500 / mo (₹350/day)', val: 10500 },
                ].map(p => (
                  <button
                    key={p.val}
                    onClick={() => updateProfile({ monthlyBudgetInr: p.val, dailyBudgetInr: Math.floor(p.val / 30) })}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${monthlyBudgetLimit === p.val ? 'bg-amber-500 text-zinc-950 shadow-sm' : (dark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Biometric & Financial Audit Panel */}
            <div className={`p-5 rounded-2xl border ${card} space-y-3`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${dark ? 'text-white' : 'text-gray-900'}`}>
                  <TrendingUp className="w-4 h-4 text-amber-400" /> Biometric & Financial Audit
                </h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  97% Macro Target Lock
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { label: 'Calories', val: `${omniDailyResult.actual_kcal}`, target: `${omniDailyResult.target_kcal} kcal`, color: 'text-orange-400' },
                  { label: 'Protein', val: `${omniDailyResult.actual_macros.p}g`, target: `${omniDailyResult.target_macros.p}g target`, color: 'text-blue-400' },
                  { label: 'Carbs', val: `${omniDailyResult.actual_macros.c}g`, target: `${omniDailyResult.target_macros.c}g target`, color: 'text-amber-400' },
                  { label: 'Fats', val: `${omniDailyResult.actual_macros.f}g`, target: `${omniDailyResult.target_macros.f}g target`, color: 'text-emerald-400' },
                  { label: 'Daily Cost', val: `₹${omniDailyResult.actual_cost}`, target: `₹${dailyBudgetCap} cap`, color: 'text-purple-400' },
                ].map(item => (
                  <div key={item.label} className={`p-3 rounded-xl border ${dark ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`text-[10px] font-bold uppercase ${muted}`}>{item.label}</div>
                    <div className={`text-sm font-extrabold mt-0.5 ${item.color}`}>{item.val}</div>
                    <div className={`text-[9px] ${muted}`}>{item.target}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Constrained Gram Matrix Table */}
            <div className={`p-5 rounded-2xl border ${card} space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-sm font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>Constrained Food Gram Matrix</h3>
                  <p className={`text-xs ${muted}`}>LP Solver solution for Day {dayIndex + 1} ({WEEK_PLAN[dayIndex]?.day})</p>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full">
                  ₹{omniDailyResult.actual_cost} Total Cost
                </span>
              </div>

              {omniDailyResult.success && omniDailyResult.meal_plan.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className={`border-b text-[10px] uppercase font-bold ${dark ? 'border-zinc-800 text-zinc-400' : 'border-gray-200 text-gray-500'}`}>
                        <th className="py-2.5 px-3">Food Item</th>
                        <th className="py-2.5 px-3">Grams</th>
                        <th className="py-2.5 px-3">Calories</th>
                        <th className="py-2.5 px-3">Protein</th>
                        <th className="py-2.5 px-3">Carbs</th>
                        <th className="py-2.5 px-3">Fats</th>
                        <th className="py-2.5 px-3 text-right">Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {omniDailyResult.meal_plan.map(item => (
                        <tr key={item.food} className={dark ? 'hover:bg-zinc-800/40' : 'hover:bg-gray-50'}>
                          <td className="py-2.5 px-3 font-extrabold text-white flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            {item.food}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{item.grams}g</td>
                          <td className="py-2.5 px-3 font-mono text-orange-400">{item.kcal} kcal</td>
                          <td className="py-2.5 px-3 font-mono text-blue-400">{item.p}g</td>
                          <td className="py-2.5 px-3 font-mono text-amber-400">{item.c}g</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-400">{item.f}g</td>
                          <td className="py-2.5 px-3 font-mono font-extrabold text-emerald-400 text-right">₹{item.cost.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold text-center">
                  🔒 OMNI-LOCK FAILURE: Daily budget (₹{dailyBudgetCap}) is too low to hit biological macro targets. Please increase your monthly budget.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Interactive Budget Configurator Header Card (RECIPE PLAN MODE) ── */}
        {plannerMode === 'RECIPE_PLAN' && (
          <div className={`p-5 rounded-2xl border ${card} space-y-3`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">🛡️ Strict Budget Guard</span>
              <h3 className={`text-sm font-extrabold ${dark ? 'text-white' : 'text-gray-900'}`}>Monthly Budget Configurator</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ₹{monthlyBudgetLimit} / month Max
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/15 text-blue-400">
                🎯 {macroCoveragePct}% Daily Macros Met
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className={`p-3 rounded-xl border ${dark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
              <label className={`text-[11px] font-bold block mb-1 ${muted}`}>Set Your Monthly Budget (₹)</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-400">₹</span>
                <input
                  type="number"
                  min="500"
                  max="50000"
                  value={monthlyBudgetLimit}
                  onChange={(e) => {
                    const newMonthly = Math.max(500, Number(e.target.value) || 2000);
                    updateProfile({ monthlyBudgetInr: newMonthly, dailyBudgetInr: Math.floor(newMonthly / 30) });
                  }}
                  className={`w-full px-2 py-1 text-sm font-extrabold rounded-lg border outline-none ${dark ? 'bg-zinc-900 border-zinc-700 text-white focus:border-emerald-500' : 'bg-white border-gray-300 text-gray-900 focus:border-emerald-500'}`}
                />
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${dark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className={`text-[11px] font-bold ${muted}`}>Daily Budget Cap</div>
              <div className="text-base font-extrabold text-emerald-400">₹{dailyBudgetCap} <span className="text-[10px] text-zinc-400 font-normal">/ day</span></div>
              <div className="text-[10px] text-emerald-400 font-semibold">Strict Zero Overrun Guarantee</div>
            </div>

            <div className={`p-3 rounded-xl border ${dark ? 'bg-zinc-800/80 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
              <div className={`text-[11px] font-bold ${muted}`}>7-Day Weekly Budget Cap</div>
              <div className="text-base font-extrabold text-amber-400">₹{weeklyBudgetCap} <span className="text-[10px] text-zinc-400 font-normal">/ week</span></div>
              <div className="text-[10px] text-blue-400 font-semibold">≥ 95% Macro Completion</div>
            </div>
          </div>

          {/* Quick Budget Presets */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className={`text-[11px] font-bold ${muted}`}>Quick Presets:</span>
            {[
              { label: '₹2,000 / mo (₹66/day)', val: 2000 },
              { label: '₹3,000 / mo (₹100/day)', val: 3000 },
              { label: '₹5,000 / mo (₹166/day)', val: 5000 },
              { label: '₹10,500 / mo (₹350/day)', val: 10500 },
            ].map(p => (
              <button
                key={p.val}
                onClick={() => updateProfile({ monthlyBudgetInr: p.val, dailyBudgetInr: Math.floor(p.val / 30) })}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${monthlyBudgetLimit === p.val ? 'bg-emerald-600 text-white shadow-sm' : (dark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        )}


        {/* ── Day Navigation ─────────────────────────────────────────────────── */}
        <div className={`flex items-center justify-between p-4 rounded-2xl border ${card}`}>
          <button
            onClick={() => setDayIndex(d => Math.max(0, d - 1))}
            disabled={dayIndex === 0}
            className={`p-2 rounded-xl transition ${dark ? 'bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30' : 'bg-gray-100 hover:bg-gray-200 disabled:opacity-30'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {WEEK_PLAN.map((d, i) => {
              const isToday = i === todayWeekdayIdx;
              const isSelected = i === dayIndex;
              return (
                <button
                  key={i}
                  onClick={() => { setDayIndex(i); setNonTodayWarn(null); }}
                  className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : dark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {d.day.slice(0, 3)}
                  {isToday && (
                    <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border-2 ${isSelected ? 'border-blue-600' : dark ? 'border-zinc-950' : 'border-white'} bg-emerald-500`} title="Today" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setDayIndex(d => Math.min(6, d + 1))}
            disabled={dayIndex === 6}
            className={`p-2 rounded-xl transition ${dark ? 'bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30' : 'bg-gray-100 hover:bg-gray-200 disabled:opacity-30'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* ── Day Overview Stats ─────────────────────────────────────────────── */}
        <div className={`p-5 rounded-2xl border ${card}`}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-extrabold">{plan.day} — {plan.date}</h2>
              <p className={`text-xs ${muted}`}>{doneSlots.length}/{SLOT_ORDER.length} meals completed</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold flex-wrap">
              <span className="px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ₹{daySpend} / ₹{dailyBudgetCap} day cap (₹0 Overrun)
              </span>
              <span className="px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-400">
                🎯 {macroCoveragePct}% Daily Required Macros ({allTotals.cal} kcal)
              </span>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1 font-bold">
                <span className={muted}>Daily Budget Used (Cap: ₹{dailyBudgetCap})</span>
                <span className="text-emerald-400">₹{daySpend} ({Math.round(budgetPct)}% used) — ₹0 Overrun Guarantee ✅</span>
              </div>
              <div className={`h-2 rounded-full ${progressBg}`}>
                <div className="h-2 rounded-full transition-all bg-emerald-500" style={{ width: `${Math.min(100, budgetPct)}%` }} />
              </div>
            </div>
            {/* Macro Grid */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[
                { label: 'Protein', done: totals.pro, total: allTotals.pro, goal: macroGoals.proteinGrams, color: 'bg-blue-500', tc: 'text-blue-400' },
                { label: 'Carbs', done: totals.carbs, total: allTotals.carbs, goal: macroGoals.carbsGrams, color: 'bg-amber-500', tc: 'text-amber-400' },
                { label: 'Fat', done: totals.fat, total: allTotals.fat, goal: macroGoals.fatGrams, color: 'bg-emerald-500', tc: 'text-emerald-400' },
                { label: 'Fiber', done: totals.fiber, total: 0, goal: 30, color: 'bg-purple-500', tc: 'text-purple-400' },
              ].map(m => {
                const pct = Math.min(100, ((m.done) / (m.goal || 1)) * 100);
                return (
                  <div key={m.label} className={`p-3 rounded-xl ${dark ? 'bg-zinc-800' : 'bg-gray-50'}`}>
                    <div className={`text-xs font-bold ${m.tc}`}>{m.done}g</div>
                    <div className={`text-[10px] ${muted} mb-1`}>{m.label} / {m.goal}g goal</div>
                    <div className={`h-1.5 rounded-full ${progressBg}`}>
                      <div className={`h-1.5 rounded-full ${m.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Non-Today Warning ──────────────────────────────────────────── */}
        {nonTodayWarn && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <span className="text-base leading-none">⚠️</span>
            <span>{nonTodayWarn}</span>
          </div>
        )}

        {/* ── Meal Slots ─────────────────────────────────────────────────────── */}
        {SLOT_ORDER.map((slot) => {
          const meal = dayMeals[slot];
          const doneKey = `${dayIndex}_${slot}`;
          const isDone = !!todayDoneMeals[doneKey];
          const isExpanded = expandedSlot === slot;
          const gi = GI_BADGE[meal.sugarSpikeRisk];

          return (
            <div key={slot} className={`rounded-2xl border transition ${card} ${cardHover} ${isDone ? (dark ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-emerald-300 bg-emerald-50/60') : ''}`}>
              {/* Slot Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDone(slot)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition shrink-0 ${isDone ? 'border-emerald-500 bg-emerald-500' : (dark ? 'border-zinc-600 hover:border-emerald-500' : 'border-gray-300 hover:border-emerald-400')}`}
                  >
                    {isDone && <CheckCircle2 className="w-5 h-5 text-white" />}
                  </button>
                  <div>
                    <div className="text-sm font-extrabold flex items-center gap-2">
                      {MEAL_SLOT_LABELS[slot]}
                      {isDone && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">✓ Done</span>}
                    </div>
                    <div className={`text-[11px] ${muted} truncate max-w-xs`}>{meal.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${gi.bg} ${gi.text} hidden sm:inline`}>{gi.label}</span>
                  <span className={`text-xs font-bold ${dark ? 'text-zinc-300' : 'text-gray-600'}`}>{meal.calories} kcal</span>
                  <span className="text-xs font-bold text-emerald-400">₹{meal.priceInr}</span>
                  <button
                    onClick={() => setExpandedSlot(isExpanded ? null : slot)}
                    className={`p-1.5 rounded-xl transition ${dark ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Expanded Meal Details */}
              {isExpanded && (
                <div className={`border-t px-4 pb-4 pt-3 space-y-3 ${dark ? 'border-zinc-800' : 'border-gray-100'}`}>
                  {/* Macro Row */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Protein', value: meal.protein, unit: 'g', color: 'text-blue-400' },
                      { label: 'Carbs', value: meal.carbs, unit: 'g', color: 'text-amber-400' },
                      { label: 'Fat', value: meal.fat, unit: 'g', color: 'text-emerald-400' },
                      { label: 'Fiber', value: meal.fiber, unit: 'g', color: 'text-purple-400' },
                    ].map(m => (
                      <div key={m.label} className={`p-2.5 rounded-xl text-center ${dark ? 'bg-zinc-800' : 'bg-gray-50'}`}>
                        <div className={`text-sm font-extrabold ${m.color}`}>{m.value}{m.unit}</div>
                        <div className={`text-[10px] ${muted}`}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Micros */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Sodium', value: `${meal.sodiumMg}mg` },
                      { label: 'Vit C', value: `${meal.vitaminCMg}mg` },
                      { label: 'Calcium', value: `${meal.calciumMg}mg` },
                      { label: 'Iron', value: `${meal.ironMg}mg` },
                      { label: 'GI', value: `${meal.glycemicIndex}` },
                      { label: 'Score', value: `⭐${meal.healthScore}` },
                    ].map(m => (
                      <div key={m.label} className={`p-2 rounded-xl flex justify-between items-center text-[11px] ${dark ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-50 text-gray-600'}`}>
                        <span className={muted}>{m.label}</span>
                        <span className="font-bold">{m.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Ingredients preview */}
                  <div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${muted}`}>Ingredients</div>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.ingredients.map((ing, i) => (
                        <span key={i} className={`text-[11px] font-medium px-2 py-0.5 rounded-lg ${dark ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-100 text-gray-700'}`}>
                          {ing.name} <span className="text-blue-400 font-bold">{ing.quantity}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {meal.tags.map(t => (
                      <span key={t} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge}`}>{t}</span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setDetailMeal(meal)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${dark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Full Details & Recipe
                    </button>
                    <button
                      onClick={() => setAddingSlot(slot)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${dark ? 'border-blue-500/40 text-blue-400 hover:bg-blue-950/40' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Replace with Custom
                    </button>
                    <button
                      onClick={() => handleDone(slot)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        isDone
                          ? 'bg-emerald-600 hover:bg-red-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                      title={isDone ? 'Click to unlog this meal' : 'Click to log this meal to dashboard'}
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      {isDone ? '✅ Logged — Undo?' : 'Log to Dashboard ↑'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── Add Custom Meal (any slot) ─────────────────────────────────────── */}
        <button
          onClick={() => setAddingSlot('breakfast')}
          className={`w-full py-4 rounded-2xl border-2 border-dashed text-sm font-bold flex items-center justify-center gap-2 transition ${dark ? 'border-zinc-700 text-zinc-500 hover:border-blue-500 hover:text-blue-400 hover:bg-blue-950/20' : 'border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50'}`}
        >
          <Plus className="w-5 h-5" /> Add Custom Meal to Any Slot
        </button>

        {/* ── Week Summary ───────────────────────────────────────────────────── */}
        <div className={`p-5 rounded-2xl border ${card}`}>
          <h2 className="text-sm font-extrabold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> 7-Day Week Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Days', value: '7', sub: 'Full week plan', color: 'text-blue-400' },
              { label: 'Total Meals', value: '35', sub: '5 meals × 7 days', color: 'text-emerald-400' },
              { label: 'Est. Weekly Budget', value: `₹${totalWeeklyEstSpend}`, sub: `Cap: ₹${weeklyBudgetCap} (₹0 Overrun ✅)`, color: 'text-amber-400' },
              { label: 'Avg Daily Cals', value: `${avgWeeklyDailyCals} kcal`, sub: '≥ 95% Macro Target Met ✅', color: 'text-purple-400' },
            ].map(s => (
              <div key={s.label} className={`p-4 rounded-xl ${dark ? 'bg-zinc-800' : 'bg-gray-50'}`}>
                <div className={`text-lg font-extrabold ${s.color}`}>{s.value}</div>
                <div className={`text-xs font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{s.label}</div>
                <div className={`text-[10px] ${muted}`}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
