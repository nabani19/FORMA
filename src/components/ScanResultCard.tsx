import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodItem, MealType, PlateComponent } from '../types';
import { 
  Check, 
  ShieldAlert, 
  Sparkles, 
  Plus, 
  Scale, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  Globe, 
  Layers, 
  Sliders, 
  CheckSquare, 
  Square
} from 'lucide-react';
import { VISUAL_PORTION_GUIDES } from '../utils/aiVisionService';

interface ScanResultCardProps {
  foodItem: FoodItem;
  onLogged?: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ foodItem, onLogged }) => {
  const { addMealLog, checkAllergenConflicts, showToast } = useApp();

  const [mealType, setMealType] = useState<MealType>('lunch');
  const [portionGrams, setPortionGrams] = useState<number>(foodItem.servingSizeGrams || 200);
  const [showMicros, setShowMicros] = useState<boolean>(false);

  // Multi-item decomposed plate state
  const [components, setComponents] = useState<PlateComponent[]>(
    foodItem.decomposedComponents || []
  );

  const hasDecomposed = components && components.length > 0;

  // Toggle component inclusion
  const toggleComponentSelected = (id: string) => {
    setComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  };

  // Adjust component weight
  const updateComponentGrams = (id: string, newGrams: number) => {
    const validGrams = Math.max(5, newGrams);
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const ratio = validGrams / (c.portionGrams || 1);
        return {
          ...c,
          portionGrams: validGrams,
          calories: Math.round(c.calories * ratio),
          protein_g: Math.round(c.protein_g * ratio * 10) / 10,
          carbs_g: Math.round(c.carbs_g * ratio * 10) / 10,
          fat_g: Math.round(c.fat_g * ratio * 10) / 10,
          fiber_g: Math.round(c.fiber_g * ratio * 10) / 10,
        };
      })
    );
  };

  const conflicts = checkAllergenConflicts(foodItem);

  // Compute active totals
  let totalCalories: number;
  let totalProtein: number;
  let totalCarbs: number;
  let totalNetCarbs: number | undefined;
  let totalFat: number;
  let totalSatFat: number | undefined;
  let totalFiber: number;
  let activePortionWeight: number;

  if (hasDecomposed) {
    const selectedComps = components.filter((c) => c.selected);
    totalCalories = selectedComps.reduce((sum, c) => sum + c.calories, 0);
    totalProtein = Math.round(selectedComps.reduce((sum, c) => sum + c.protein_g, 0) * 10) / 10;
    totalCarbs = Math.round(selectedComps.reduce((sum, c) => sum + c.carbs_g, 0) * 10) / 10;
    totalFat = Math.round(selectedComps.reduce((sum, c) => sum + c.fat_g, 0) * 10) / 10;
    totalFiber = Math.round(selectedComps.reduce((sum, c) => sum + c.fiber_g, 0) * 10) / 10;
    totalNetCarbs = Math.max(0, Math.round((totalCarbs - totalFiber) * 10) / 10);
    totalSatFat = Math.round(totalFat * 0.35 * 10) / 10;
    activePortionWeight = selectedComps.reduce((sum, c) => sum + c.portionGrams, 0);
  } else {
    const multiplier = portionGrams / (foodItem.servingSizeGrams || 200);
    totalCalories = Math.round(foodItem.nutritionalInfo.calories * multiplier);
    totalProtein = Math.round(foodItem.nutritionalInfo.protein_g * multiplier * 10) / 10;
    totalCarbs = Math.round(foodItem.nutritionalInfo.carbs_g * multiplier * 10) / 10;
    totalNetCarbs = foodItem.nutritionalInfo.netCarbs_g ? Math.round(foodItem.nutritionalInfo.netCarbs_g * multiplier * 10) / 10 : Math.max(0, Math.round((totalCarbs - (foodItem.nutritionalInfo.fiber_g * multiplier)) * 10) / 10);
    totalFat = Math.round(foodItem.nutritionalInfo.fat_g * multiplier * 10) / 10;
    totalSatFat = foodItem.nutritionalInfo.saturatedFat_g ? Math.round(foodItem.nutritionalInfo.saturatedFat_g * multiplier * 10) / 10 : Math.round(totalFat * 0.35 * 10) / 10;
    totalFiber = Math.round(foodItem.nutritionalInfo.fiber_g * multiplier * 10) / 10;
    activePortionWeight = portionGrams;
  }

  const handleLogMeal = () => {
    if (hasDecomposed) {
      const selectedComps = components.filter((c) => c.selected);
      if (selectedComps.length === 0) {
        showToast('Please select at least one plate component to log.', 'warning');
        return;
      }

      // Log composite food item with aggregated nutrients
      const compositeFood: FoodItem = {
        ...foodItem,
        servingSizeGrams: activePortionWeight,
        decomposedComponents: selectedComps,
        nutritionalInfo: {
          ...foodItem.nutritionalInfo,
          calories: totalCalories,
          protein_g: totalProtein,
          carbs_g: totalCarbs,
          netCarbs_g: totalNetCarbs,
          fat_g: totalFat,
          saturatedFat_g: totalSatFat,
          fiber_g: totalFiber,
        },
      };

      addMealLog(compositeFood, mealType, activePortionWeight);
      showToast(`Logged ${foodItem.name} (${selectedComps.length} items, ${totalCalories} kcal)`, 'success');
    } else {
      addMealLog(foodItem, mealType, portionGrams);
      showToast(`Logged ${foodItem.name} (${totalCalories} kcal)`, 'success');
    }

    if (onLogged) onLogged();
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 backdrop-blur-xl">
      
      {/* Top Banner & Photo */}
      <div className="relative rounded-2xl overflow-hidden h-48 sm:h-60 bg-slate-950 border border-slate-800 group">
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
          {hasDecomposed && (
            <div className="bg-sky-500/20 backdrop-blur-md border border-sky-500/40 rounded-full px-3 py-1 text-xs font-bold text-sky-300 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>{components.length} Plate Items</span>
            </div>
          )}
        </div>

        {/* Source Badge */}
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full px-3 py-1 text-[11px] font-medium text-slate-300">
          {foodItem.source}
        </div>

        {/* Title & Category */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400">
              {foodItem.category}
            </span>
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

      {/* MULTI-ITEM PLATE DECOMPOSITION ACCORDION / LIST */}
      {hasDecomposed && (
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
                Multi-Item Plate Breakdown ({components.filter((c) => c.selected).length}/{components.length} Selected)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Adjust individual item grams below
            </span>
          </div>

          <div className="space-y-2.5">
            {components.map((comp) => (
              <div
                key={comp.id}
                className={`p-3 rounded-xl border transition-all ${
                  comp.selected
                    ? 'bg-slate-900/90 border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/60 opacity-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => toggleComponentSelected(comp.id)}
                    className="flex items-center gap-2 text-left font-bold text-xs text-slate-100 hover:text-emerald-400 transition-colors"
                  >
                    {comp.selected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span>{comp.name}</span>
                  </button>

                  <span className="text-xs font-mono font-bold text-amber-400">
                    {comp.calories} kcal
                  </span>
                </div>

                {comp.selected && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Portion:</span>
                      <input
                        type="range"
                        min="10"
                        max="400"
                        step="5"
                        value={comp.portionGrams}
                        onChange={(e) => updateComponentGrams(comp.id, Number(e.target.value))}
                        className="w-24 sm:w-32 accent-emerald-500"
                      />
                      <span className="font-bold text-slate-200 font-mono">{comp.portionGrams}g</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300 font-mono text-[10px]">
                      <span className="text-sky-400 font-bold">{comp.protein_g}g P</span>
                      <span>•</span>
                      <span className="text-amber-400 font-bold">{comp.carbs_g}g C</span>
                      <span>•</span>
                      <span className="text-rose-400 font-bold">{comp.fat_g}g F</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portion Adjustment & Calories Header */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        
        {/* Calories Counter & Energy Density */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-extrabold text-xl">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-100 font-heading leading-none">
              {totalCalories} <span className="text-xs font-semibold text-slate-400">kcal</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Total weight: {activePortionWeight}g
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

        {/* Single Item Portion Input if not decomposed */}
        {!hasDecomposed && (
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
        )}

      </div>

      {/* Quick Visual Hand-Measurement Shortcuts */}
      {!hasDecomposed && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Quick Portions:</span>
          {[
            { label: '1 Fist', grams: 150, icon: '✊' },
            { label: '1 Palm', grams: 100, icon: '✋' },
            { label: '1 Katori', grams: 150, icon: '🥣' },
            { label: '1 Cup', grams: 240, icon: '🥛' },
            { label: '1 Roti', grams: 35, icon: '🍞' },
            { label: '1 Handful', grams: 30, icon: '🤲' },
          ].map((quick, idx) => (
            <button
              key={idx}
              onClick={() => setPortionGrams(quick.grams)}
              className="text-[11px] font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 px-2.5 py-1 rounded-lg border border-slate-700 shrink-0 transition-colors"
            >
              {quick.icon} {quick.label} ({quick.grams}g)
            </button>
          ))}
        </div>
      )}

      {/* Macronutrient Cards */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-sky-500/10 border border-sky-500/20 rounded-2xl p-3">
          <div className="text-sky-400 font-extrabold text-base sm:text-lg">{totalProtein}g</div>
          <div className="text-[11px] font-semibold text-slate-300">Protein</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3">
          <div className="text-amber-400 font-extrabold text-base sm:text-lg">{totalCarbs}g</div>
          <div className="text-[11px] font-semibold text-slate-300">
            Carbs {totalNetCarbs !== undefined && <span className="text-[10px] text-amber-300 block">({totalNetCarbs}g net)</span>}
          </div>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3">
          <div className="text-rose-400 font-extrabold text-base sm:text-lg">{totalFat}g</div>
          <div className="text-[11px] font-semibold text-slate-300">
            Fats {totalSatFat !== undefined && <span className="text-[10px] text-rose-300 block">({totalSatFat}g sat)</span>}
          </div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3">
          <div className="text-emerald-400 font-extrabold text-base sm:text-lg">{totalFiber}g</div>
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
                <div>Vit C: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.vitamins.c_mg || 8))} mg</strong></div>
                <div>Vit A: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.vitamins.a_iu || 250))} IU</strong></div>
                <div>Vit B12: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.vitamins.b12_mcg || 0.4))} mcg</strong></div>
                <div>Iron: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.minerals.iron_mg || 2.5))} mg</strong></div>
                <div>Calcium: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.minerals.calcium_mg || 120))} mg</strong></div>
                <div>Potassium: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.minerals.potassium_mg || 350))} mg</strong></div>
                <div>Sodium: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.minerals.sodium_mg || 400))} mg</strong></div>
                <div>Magnesium: <strong className="text-slate-100">{Math.round((foodItem.nutritionalInfo.minerals.magnesium_mg || 45))} mg</strong></div>
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
          <option value="morning_snack">🍏 Morning Snack</option>
          <option value="lunch">🥗 Lunch</option>
          <option value="evening_snack">☕ Evening Snack</option>
          <option value="dinner">🥩 Dinner</option>
        </select>

        {/* Log Action Button */}
        <button
          onClick={handleLogMeal}
          className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-sm py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>{hasDecomposed ? 'Log Composite Plate to Daily Tracker' : 'Log Meal to Daily Tracker'}</span>
        </button>

      </div>

    </div>
  );
};
