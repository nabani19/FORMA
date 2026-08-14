import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodItem, MealType } from '../types';
import { Check, ShieldAlert, Sparkles, Plus, Scale, Flame, ChevronDown, ChevronUp, Tag, Globe, Activity } from 'lucide-react';

interface ScanResultCardProps {
  foodItem: FoodItem;
  onLogged?: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ foodItem, onLogged }) => {
  const { addMealLog, checkAllergenConflicts } = useApp();

  const [mealType, setMealType] = useState<MealType>('lunch');
  const [portionGrams, setPortionGrams] = useState<number>(foodItem.servingSizeGrams || 200);
  const [showMicros, setShowMicros] = useState<boolean>(false);

  const conflicts = checkAllergenConflicts(foodItem);
  const multiplier = portionGrams / foodItem.servingSizeGrams;

  const currentCalories = Math.round(foodItem.nutritionalInfo.calories * multiplier);
  const currentProtein = Math.round(foodItem.nutritionalInfo.protein_g * multiplier);
  const currentCarbs = Math.round(foodItem.nutritionalInfo.carbs_g * multiplier);
  const currentNetCarbs = foodItem.nutritionalInfo.netCarbs_g ? Math.round(foodItem.nutritionalInfo.netCarbs_g * multiplier) : undefined;
  const currentFat = Math.round(foodItem.nutritionalInfo.fat_g * multiplier);
  const currentSatFat = foodItem.nutritionalInfo.saturatedFat_g ? Math.round(foodItem.nutritionalInfo.saturatedFat_g * multiplier) : undefined;
  const currentFiber = Math.round(foodItem.nutritionalInfo.fiber_g * multiplier);

  const handleLogMeal = () => {
    addMealLog(foodItem, mealType, portionGrams);
    if (onLogged) onLogged();
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 backdrop-blur-xl">
      
      {/* Top Banner & Photo */}
      <div className="relative rounded-2xl overflow-hidden h-52 sm:h-64 bg-slate-950 border border-slate-800 group">
        <img
          src={foodItem.imageUrl}
          alt={foodItem.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* Confidence & Cuisine Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          {foodItem.confidenceScore && (
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full px-3 py-1 flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Match: {Math.round(foodItem.confidenceScore * 100)}%</span>
            </div>
          )}
          <div className="bg-amber-500/20 backdrop-blur-md border border-amber-500/40 rounded-full px-3 py-1 text-xs font-bold text-amber-300 flex items-center gap-1">
            <Globe className="w-3 h-3" />
            <span>{foodItem.cuisine} Cuisine</span>
          </div>
        </div>

        {/* Source Badge */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full px-3 py-1 text-[11px] font-medium text-slate-300">
          {foodItem.source}
        </div>

        {/* Title & Hindi Translation */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
              {foodItem.category}
            </span>
            {foodItem.hindiName && (
              <span className="text-[11px] font-medium text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                {foodItem.hindiName}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-heading leading-tight">
            {foodItem.name}
          </h2>
        </div>
      </div>

      {/* Dynamic Allergen / Dietary Warning Banner */}
      {conflicts.length > 0 && (
        <div className="bg-rose-950/80 border border-rose-500/50 rounded-2xl p-4 flex items-start gap-3 animate-pulse">
          <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-extrabold text-rose-200 uppercase tracking-wide">
              ⚠️ Dietary Safeguard & Allergen Warning
            </h4>
            <ul className="mt-1 space-y-0.5">
              {conflicts.map((conf, idx) => (
                <li key={idx} className="text-xs text-rose-300 font-bold">
                  • {conf}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Portion Adjustment & Health Metrics */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        
        {/* Calories Counter & Energy Density */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-extrabold text-xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-100 font-heading leading-none">
              {currentCalories} <span className="text-xs font-semibold text-slate-400">kcal</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {Math.round((foodItem.nutritionalInfo.calories / foodItem.servingSizeGrams) * 100)} kcal per 100g
            </span>
          </div>
        </div>

        {/* Glycemic & NOVA Badges */}
        <div className="flex items-center gap-2">
          {foodItem.nutritionalInfo.glycemicIndex && (
            <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 font-medium">Glycemic Index</div>
              <div className="text-xs font-extrabold text-amber-400">
                {foodItem.nutritionalInfo.glycemicIndex} ({foodItem.nutritionalInfo.glycemicIndex < 55 ? 'Low' : 'Med'})
              </div>
            </div>
          )}
          {foodItem.nutritionalInfo.novaGroup && (
            <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 font-medium">NOVA Group</div>
              <div className="text-xs font-extrabold text-emerald-400">
                Group {foodItem.nutritionalInfo.novaGroup}
              </div>
            </div>
          )}
        </div>

        {/* Portion Input */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 rounded-xl p-1.5">
          <Scale className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="number"
            min="10"
            max="2000"
            step="10"
            value={portionGrams}
            onChange={(e) => setPortionGrams(Math.max(10, Number(e.target.value)))}
            className="w-16 bg-transparent text-sm font-bold text-center text-slate-100 focus:outline-none"
          />
          <span className="text-xs font-semibold text-slate-400 mr-2">grams</span>
        </div>

      </div>

      {/* Macronutrient Cards */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-3">
          <div className="text-sky-400 font-extrabold text-base sm:text-lg">{currentProtein}g</div>
          <div className="text-[11px] font-semibold text-slate-300">Protein</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3">
          <div className="text-amber-400 font-extrabold text-base sm:text-lg">{currentCarbs}g</div>
          <div className="text-[11px] font-semibold text-slate-300">
            Carbs {currentNetCarbs !== undefined && <span className="text-[10px] text-amber-300 block">({currentNetCarbs}g net)</span>}
          </div>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3">
          <div className="text-rose-400 font-extrabold text-base sm:text-lg">{currentFat}g</div>
          <div className="text-[11px] font-semibold text-slate-300">
            Fats {currentSatFat !== undefined && <span className="text-[10px] text-rose-300 block">({currentSatFat}g sat)</span>}
          </div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3">
          <div className="text-emerald-400 font-extrabold text-base sm:text-lg">{currentFiber}g</div>
          <div className="text-[11px] font-semibold text-slate-300">Fiber</div>
        </div>
      </div>

      {/* Expandable Micronutrients & Ingredients */}
      <div className="border-t border-slate-800/80 pt-3">
        <button
          onClick={() => setShowMicros((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white py-1"
        >
          <span>Complete Micronutrients & Full Ingredients List</span>
          {showMicros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showMicros && (
          <div className="mt-3 space-y-4 animate-fade-in text-xs">
            {/* Vitamins & Minerals */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <span className="font-semibold text-emerald-400 block">Extended Vitamins & Minerals:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                <div>Vit C: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.vitamins.c_mg || 0) * multiplier)} mg</strong></div>
                <div>Vit A: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.vitamins.a_iu || 0) * multiplier)} IU</strong></div>
                <div>Vit B12: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.vitamins.b12_mcg || 0) * multiplier)} mcg</strong></div>
                <div>Iron: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.minerals.iron_mg || 0) * multiplier)} mg</strong></div>
                <div>Calcium: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.minerals.calcium_mg || 0) * multiplier)} mg</strong></div>
                <div>Potassium: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.minerals.potassium_mg || 0) * multiplier)} mg</strong></div>
                <div>Sodium: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.minerals.sodium_mg || 0) * multiplier)} mg</strong></div>
                <div>Magnesium: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.minerals.magnesium_mg || 0) * multiplier)} mg</strong></div>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <span className="font-semibold text-slate-300 block mb-1">Full Ingredients:</span>
              <p className="text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                {foodItem.ingredients.join(', ')}
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {foodItem.dietaryTags.map((tag, i) => (
                <span key={i} className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-wider border border-slate-700">
                  <Tag className="w-3 h-3 text-emerald-400" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Log Meal Selector & Action Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        
        {/* Meal Type Select */}
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as MealType)}
          className="w-full sm:w-auto bg-slate-800/80 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 capitalize"
        >
          <option value="breakfast">🍳 Breakfast</option>
          <option value="lunch">🥗 Lunch</option>
          <option value="dinner">🥩 Dinner</option>
          <option value="snack">🍎 Snack</option>
        </select>

        {/* Log Action Button */}
        <button
          onClick={handleLogMeal}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-sm py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>Log Meal to Daily Tracker</span>
        </button>

      </div>

    </div>
  );
};
