import React from 'react';
import { PlannedMeal } from '../data/weeklyMealPlans';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Flame, 
  Dumbbell, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ChefHat, 
  DollarSign, 
  CheckCircle2, 
  Plus, 
  Utensils,
  Lightbulb,
  Scale,
  Activity
} from 'lucide-react';
import { formatINR } from '../utils/nutritionUtils';

interface MealDetailsModalProps {
  meal: PlannedMeal | null;
  isOpen: boolean;
  onClose: () => void;
  isEaten?: boolean;
  onToggleEaten?: () => void;
}

export const MealDetailsModal: React.FC<MealDetailsModalProps> = ({
  meal,
  isOpen,
  onClose,
  isEaten = false,
  onToggleEaten,
}) => {
  const { addMealLog, showToast, t } = useApp();

  if (!isOpen || !meal) return null;

  const handleLogMeal = () => {
    // Construct FoodItem from planned meal
    const foodItem: any = {
      _id: `planned_${meal.id || meal.name.replace(/\s+/g, '_').toLowerCase()}`,
      name: meal.name,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
      category: 'Indian Healthy Meal',
      cuisine: 'Indian',
      servingSizeGrams: parseInt(meal.portion) || 250,
      nutritionalInfo: {
        calories: meal.kcal,
        protein_g: meal.protein,
        carbs_g: meal.carbs,
        fat_g: meal.fat,
        fiber_g: meal.fiber || 5,
        sugar_g: 3,
        vitamins: {
          d_iu: meal.micronutrients?.vitaminD_iu || 0,
        },
        minerals: {
          calcium_mg: meal.micronutrients?.calciumMg || 100,
          iron_mg: meal.micronutrients?.ironMg || 4,
          potassium_mg: meal.micronutrients?.potassiumMg || 450,
          sodium_mg: meal.micronutrients?.sodiumMg || 300,
          zinc_mg: meal.micronutrients?.zincMg || 2.5,
        }
      },
      ingredients: meal.ingredients.map(i => i.name),
      allergens: [],
      dietaryTags: meal.dietaryTags || ['Healthy'],
      source: 'FitForge AI Recipe Engine',
      lastUpdated: new Date().toISOString(),
    };

    const mealTypeMap: Record<string, any> = {
      'Breakfast': 'breakfast',
      'Morning Snack': 'morning_snack',
      'Lunch': 'lunch',
      'Evening Snack': 'evening_snack',
      'Dinner': 'dinner',
    };

    const targetType = mealTypeMap[meal.slot] || 'lunch';
    addMealLog(foodItem, targetType, parseInt(meal.portion) || 250);
    showToast(`Logged "${meal.name}" (${meal.kcal} kcal, ${meal.protein}g protein) to your daily diary!`, 'success');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
      data-testid="meal-details-modal-backdrop"
    >
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in text-slate-100"
        onClick={(e) => e.stopPropagation()}
        data-testid="meal-details-modal"
      >
        {/* Header with Close Button */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="bg-emerald-500/15 text-emerald-400 font-extrabold px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider font-mono text-[11px]">
                {meal.slot}
              </span>
              <span className="bg-slate-800 text-slate-300 font-semibold px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {meal.prepTimeMinutes || 15} mins
              </span>
              <span className="bg-slate-800 text-slate-300 font-semibold px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1">
                <ChefHat className="w-3.5 h-3.5 text-indigo-400" />
                {meal.difficulty || 'Easy'}
              </span>
              <span className="bg-amber-500/15 text-amber-300 font-bold px-2.5 py-1 rounded-full border border-amber-500/30 text-[11px] font-mono">
                ₹{meal.costInr} Estimated Cost
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-100 mt-1" data-testid="modal-meal-name">
              {meal.name}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Portion: <strong className="text-slate-200">{meal.portion}</strong> · Daily Cost: <strong className="text-emerald-400">₹{meal.costInr}</strong>
            </p>

            {/* Dietary Tags */}
            {meal.dietaryTags && meal.dietaryTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {meal.dietaryTags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors shrink-0"
            aria-label="Close modal"
            data-testid="btn-close-meal-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 1. High-Impact Macronutrient Grid ─────────────────────── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 font-heading">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Complete Nutritional Profile
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Per Serving ({meal.portion})</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
            <div className="bg-slate-950/80 border border-amber-500/30 p-3 rounded-2xl">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-400 mb-1">
                <Flame className="w-3.5 h-3.5" /> Calories
              </div>
              <div className="text-xl font-extrabold font-mono text-amber-300">{meal.kcal}</div>
              <span className="text-[10px] text-slate-400 font-mono">kcal</span>
            </div>

            <div className="bg-slate-950/80 border border-sky-500/30 p-3 rounded-2xl">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-sky-400 mb-1">
                <Dumbbell className="w-3.5 h-3.5" /> Protein
              </div>
              <div className="text-xl font-extrabold font-mono text-sky-300">{meal.protein}g</div>
              <span className="text-[10px] text-slate-400 font-mono">High Bio</span>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/30 p-3 rounded-2xl">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-400 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Carbs
              </div>
              <div className="text-xl font-extrabold font-mono text-emerald-300">{meal.carbs}g</div>
              <span className="text-[10px] text-slate-400 font-mono">Clean Energy</span>
            </div>

            <div className="bg-slate-950/80 border border-rose-500/30 p-3 rounded-2xl">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-rose-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Healthy Fat
              </div>
              <div className="text-xl font-extrabold font-mono text-rose-300">{meal.fat}g</div>
              <span className="text-[10px] text-slate-400 font-mono">Essential</span>
            </div>

            <div className="bg-slate-950/80 border border-teal-500/30 p-3 rounded-2xl col-span-2 sm:col-span-1">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-teal-400 mb-1">
                <Scale className="w-3.5 h-3.5" /> Fiber
              </div>
              <div className="text-xl font-extrabold font-mono text-teal-300">{meal.fiber || 8}g</div>
              <span className="text-[10px] text-slate-400 font-mono">Gut Health</span>
            </div>
          </div>

          {/* Micronutrient Strip */}
          {meal.micronutrients && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block">Calcium:</span>
                <strong>{meal.micronutrients.calciumMg} mg</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Iron (Bioavailable):</span>
                <strong className="text-emerald-400">{meal.micronutrients.ironMg} mg</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Potassium:</span>
                <strong>{meal.micronutrients.potassiumMg} mg</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Zinc:</span>
                <strong>{meal.micronutrients.zincMg || 2.4} mg</strong>
              </div>
            </div>
          )}
        </div>

        {/* ── 2. Exact Ingredient Breakdown & Cost Table ─────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 font-heading flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-400" />
              Exact Ingredients & Cost Breakdown
            </h3>
            <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
              Total: ₹{meal.costInr}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
            {meal.ingredients.map((ing, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">{ing.name}</span>
                    <span className="text-[11px] text-slate-400 block font-mono">Quantity: {ing.quantity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right font-mono text-[11px]">
                  {ing.proteinG > 0 && (
                    <span className="text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded">
                      +{ing.proteinG}g P
                    </span>
                  )}
                  <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ₹{ing.costInr}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. Step-by-Step "How to Cook" Instructions ────────────── */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-100 font-heading flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-amber-400" />
            How to Cook (Step-by-Step Recipe)
          </h3>

          <div className="space-y-2.5">
            {meal.instructions.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Chef & Dietitian Pro Tip ──────────────────────────── */}
        {meal.chefTips && (
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-950 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-300 uppercase font-mono tracking-wide">
                Chef & Dietitian Pro Tip
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {meal.chefTips}
              </p>
            </div>
          </div>
        )}

        {/* ── 5. Action Buttons ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-800/80">
          {onToggleEaten && (
            <button
              onClick={() => {
                onToggleEaten();
                showToast(isEaten ? 'Marked meal as not eaten.' : 'Marked meal as completed & eaten!', 'info');
              }}
              className={`w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border transition-all ${
                isEaten
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              data-testid="btn-modal-toggle-eaten"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isEaten ? '✓ Completed (Eaten)' : 'Mark as Eaten Today'}</span>
            </button>
          )}

          <button
            onClick={handleLogMeal}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
            data-testid="btn-modal-log-diary"
          >
            <Plus className="w-4 h-4" />
            <span>Log to Daily Food Diary</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
