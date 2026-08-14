import { DayOfWeek } from '../types';

export interface PlannedMeal {
  slot: string;
  name: string;
  portion: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  costInr: number;
}

export interface DayPlan {
  totalKcal: number;
  totalProtein: number;
  totalCost: number;
  meals: PlannedMeal[];
}

export const WEEKLY_PLAN: Record<DayOfWeek, DayPlan> = {
  monday: {
    totalKcal: 2145, totalProtein: 136, totalCost: 188,
    meals: [
      { slot: 'Breakfast',      name: 'Moong Dal Chilla with Paneer Filling (3 pcs)',    portion: '250g',  kcal: 390, protein: 28, carbs: 40, fat: 12, costInr: 35 },
      { slot: 'Morning Snack',  name: 'Boiled Eggs (3) + Masala Chaas (250ml)',           portion: '300g',  kcal: 285, protein: 22, carbs: 10, fat: 14, costInr: 25 },
      { slot: 'Lunch',          name: 'Rajma Chawal + 2 Phulkas + Raita',                portion: '450g',  kcal: 560, protein: 28, carbs: 85, fat: 10, costInr: 55 },
      { slot: 'Evening Snack',  name: 'Soya Chunks Chaat with Lemon & Spices',           portion: '150g',  kcal: 190, protein: 25, carbs: 12, fat: 3,  costInr: 18 },
      { slot: 'Dinner',         name: 'Dal Tadka + 3 Phulkas + Baingan Bharta',          portion: '500g',  kcal: 720, protein: 33, carbs: 95, fat: 18, costInr: 55 },
    ]
  },
  tuesday: {
    totalKcal: 2190, totalProtein: 138, totalCost: 192,
    meals: [
      { slot: 'Breakfast',      name: 'Aloo Paratha (2) with Dahi + Achar',              portion: '280g',  kcal: 450, protein: 14, carbs: 65, fat: 16, costInr: 35 },
      { slot: 'Morning Snack',  name: 'Sattu Drink (2 tbsp) + Roasted Makhana',          portion: '200g',  kcal: 220, protein: 14, carbs: 28, fat: 5,  costInr: 22 },
      { slot: 'Lunch',          name: 'Chicken Curry (150g) + Rice + Salad',             portion: '500g',  kcal: 560, protein: 40, carbs: 60, fat: 14, costInr: 70 },
      { slot: 'Evening Snack',  name: 'Sprouted Moong & Kala Chana Chaat',               portion: '180g',  kcal: 195, protein: 18, carbs: 22, fat: 3,  costInr: 18 },
      { slot: 'Dinner',         name: 'Paneer Bhurji + 3 Phulkas + Aloo Gobi Matar',    portion: '480g',  kcal: 765, protein: 52, carbs: 72, fat: 28, costInr: 47 },
    ]
  },
  wednesday: {
    totalKcal: 2160, totalProtein: 133, totalCost: 185,
    meals: [
      { slot: 'Breakfast',      name: 'Steamed Idli (4) with Sambar & Coconut Chutney', portion: '350g',  kcal: 380, protein: 14, carbs: 68, fat: 6,  costInr: 30 },
      { slot: 'Morning Snack',  name: 'Greek Dahi (200g) + Banana',                     portion: '250g',  kcal: 240, protein: 18, carbs: 30, fat: 5,  costInr: 22 },
      { slot: 'Lunch',          name: 'Chole Masala + 2 Bhatura + Salad',               portion: '480g',  kcal: 620, protein: 22, carbs: 92, fat: 16, costInr: 50 },
      { slot: 'Evening Snack',  name: 'Boiled Eggs (2) + High-Protein Sattu Drink',     portion: '280g',  kcal: 280, protein: 28, carbs: 18, fat: 10, costInr: 28 },
      { slot: 'Dinner',         name: 'Egg Curry (3 eggs) + Brown Rice + Lauki Dal',    portion: '500g',  kcal: 640, protein: 51, carbs: 68, fat: 18, costInr: 55 },
    ]
  },
  thursday: {
    totalKcal: 2150, totalProtein: 140, totalCost: 197,
    meals: [
      { slot: 'Breakfast',      name: 'Kanda Poha with Peanuts & Curry Leaves',          portion: '250g',  kcal: 380, protein: 12, carbs: 62, fat: 10, costInr: 22 },
      { slot: 'Morning Snack',  name: 'Whey Protein Shake (30g) + Milk (200ml)',         portion: '350ml', kcal: 260, protein: 35, carbs: 14, fat: 4,  costInr: 38 },
      { slot: 'Lunch',          name: 'Fish Curry (200g) + Rice + Dal + Papad',          portion: '550g',  kcal: 580, protein: 42, carbs: 62, fat: 14, costInr: 75 },
      { slot: 'Evening Snack',  name: 'Roasted Peanuts (50g) + Masala Chaas',           portion: '280g',  kcal: 210, protein: 10, carbs: 12, fat: 12, costInr: 18 },
      { slot: 'Dinner',         name: 'Soya Chunk Curry + 3 Rotis + Raita + Salad',     portion: '480g',  kcal: 720, protein: 41, carbs: 88, fat: 16, costInr: 44 },
    ]
  },
  friday: {
    totalKcal: 2120, totalProtein: 134, totalCost: 183,
    meals: [
      { slot: 'Breakfast',      name: 'Besan Chilla (3 pcs) with Green Chutney',        portion: '250g',  kcal: 360, protein: 18, carbs: 42, fat: 12, costInr: 25 },
      { slot: 'Morning Snack',  name: 'Boiled Eggs (2) + Fruit (1 apple)',               portion: '250g',  kcal: 220, protein: 14, carbs: 22, fat: 8,  costInr: 22 },
      { slot: 'Lunch',          name: 'Aloo Bhindi Masala + 2 Rotis + Dal + Rice',      portion: '500g',  kcal: 560, protein: 22, carbs: 85, fat: 12, costInr: 55 },
      { slot: 'Evening Snack',  name: 'Sprouted Moong + Soya Chunks + Lemon',           portion: '180g',  kcal: 195, protein: 25, carbs: 18, fat: 2,  costInr: 18 },
      { slot: 'Dinner',         name: 'Paneer Curry + 3 Phulkas + Cucumber Raita',      portion: '480g',  kcal: 785, protein: 55, carbs: 68, fat: 30, costInr: 63 },
    ]
  },
  saturday: {
    totalKcal: 2200, totalProtein: 139, totalCost: 198,
    meals: [
      { slot: 'Breakfast',      name: 'Oats Upma with Vegetables & Peanuts',            portion: '280g',  kcal: 380, protein: 14, carbs: 55, fat: 12, costInr: 25 },
      { slot: 'Morning Snack',  name: 'Paneer Tikka (100g) + Lassi',                    portion: '300ml', kcal: 320, protein: 22, carbs: 18, fat: 14, costInr: 45 },
      { slot: 'Lunch',          name: 'Chicken Biryani (250g Chicken) + Raita',         portion: '550g',  kcal: 620, protein: 45, carbs: 72, fat: 16, costInr: 85 },
      { slot: 'Evening Snack',  name: 'Roasted Chana (50g) + Green Tea',                portion: '100g',  kcal: 185, protein: 10, carbs: 28, fat: 3,  costInr: 15 },
      { slot: 'Dinner',         name: 'Moong Dal Khichdi + Kadhi + Papad',              portion: '480g',  kcal: 695, protein: 48, carbs: 85, fat: 14, costInr: 28 },
    ]
  },
  sunday: {
    totalKcal: 2170, totalProtein: 135, totalCost: 190,
    meals: [
      { slot: 'Breakfast',      name: 'Methi Thepla (3) with Dahi & Pickle',            portion: '280g',  kcal: 410, protein: 14, carbs: 56, fat: 14, costInr: 28 },
      { slot: 'Morning Snack',  name: 'Greek Dahi (200g) + Chia Seeds + Banana',        portion: '280g',  kcal: 250, protein: 18, carbs: 32, fat: 5,  costInr: 28 },
      { slot: 'Lunch',          name: 'Fish Fry (200g) + Curd Rice + Dal Soup',         portion: '550g',  kcal: 580, protein: 44, carbs: 55, fat: 18, costInr: 78 },
      { slot: 'Evening Snack',  name: 'Besan Ladoo (1) + Masala Milk',                 portion: '200ml', kcal: 250, protein: 10, carbs: 32, fat: 8,  costInr: 22 },
      { slot: 'Dinner',         name: 'Dal Palak + Jeera Rice + 2 Rotis + Salad',      portion: '500g',  kcal: 680, protein: 49, carbs: 85, fat: 12, costInr: 34 },
    ]
  },
};
