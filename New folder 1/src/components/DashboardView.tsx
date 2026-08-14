import React from 'react';
import { useAppStore, formatInr, getTodayKey } from '../store/useAppStore';
import {
  Flame, Target, Camera, Trash2, Droplets,
  Utensils, ChevronRight, TrendingUp, Zap, Apple, CheckCircle2,
  CalendarDays, RefreshCw
} from 'lucide-react';

interface Props { onOpenWizard: () => void; }

export const DashboardView: React.FC<Props> = ({ onOpenWizard }) => {
  const {
    userProfile, macroGoals, loggedMeals, removeLoggedMeal, clearAllLoggedMeals,
    setActiveTab, waterIntakeLiters, addWater, setWater, setWaterGoal,
    streakDays, isDarkMode: dark, checkAndResetForNewDay
  } = useAppStore();

  // Run date check whenever dashboard is viewed
  React.useEffect(() => {
    checkAndResetForNewDay();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [isEditingWater, setIsEditingWater] = React.useState(false);
  const [waterInputValue, setWaterInputValue]     = React.useState(String(waterIntakeLiters));
  const [waterGoalInputValue, setWaterGoalInputValue] = React.useState(String(macroGoals.waterLiters));

  // Keep inputs in sync when store changes
  React.useEffect(() => {
    setWaterInputValue(String(waterIntakeLiters));
  }, [waterIntakeLiters]);
  React.useEffect(() => {
    setWaterGoalInputValue(String(macroGoals.waterLiters));
  }, [macroGoals.waterLiters]);

  const handleSaveWaterInput = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCurrent = parseFloat(waterInputValue);
    const parsedGoal    = parseFloat(waterGoalInputValue);
    if (!isNaN(parsedCurrent) && parsedCurrent >= 0) setWater(parsedCurrent);
    if (!isNaN(parsedGoal)    && parsedGoal > 0)     setWaterGoal(parsedGoal);
    setIsEditingWater(false);
  };

  // ── Computed Totals (LIVE from today's logged meals only) ─────────────────
  const totalCal   = loggedMeals.reduce((s, m) => s + m.foodItem.calories * m.servings, 0);
  const totalPro   = loggedMeals.reduce((s, m) => s + m.foodItem.protein  * m.servings, 0);
  const totalCarbs = loggedMeals.reduce((s, m) => s + m.foodItem.carbs    * m.servings, 0);
  const totalFat   = loggedMeals.reduce((s, m) => s + m.foodItem.fat      * m.servings, 0);
  const totalSpend = loggedMeals.reduce((s, m) => s + (m.foodItem.priceInr ?? 0) * m.servings, 0);

  const rawCalPct   = Math.round((totalCal   / (macroGoals.calories      || 1)) * 100);
  const rawProPct   = Math.round((totalPro   / (macroGoals.proteinGrams  || 1)) * 100);
  const rawCarbsPct = Math.round((totalCarbs / (macroGoals.carbsGrams    || 1)) * 100);
  const rawFatPct   = Math.round((totalFat   / (macroGoals.fatGrams      || 1)) * 100);

  const calPct    = Math.min(100, rawCalPct);
  const proPct    = Math.min(100, rawProPct);
  const carbsPct  = Math.min(100, rawCarbsPct);
  const fatPct    = Math.min(100, rawFatPct);
  const waterPct  = Math.min(100, Math.round((waterIntakeLiters / (macroGoals.waterLiters || 1)) * 100));
  const budgetPct = Math.min(100, Math.round((totalSpend / (userProfile.dailyBudgetInr || 1)) * 100));
  const calsRemaining = Math.max(0, macroGoals.calories - totalCal);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const bg       = dark ? 'bg-zinc-950'           : 'bg-gray-50';
  const card     = dark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-gray-200';
  const inner    = dark ? 'bg-zinc-800/60'         : 'bg-gray-50';
  const txt      = dark ? 'text-white'             : 'text-gray-900';
  const muted    = dark ? 'text-zinc-400'          : 'text-gray-500';
  const progress = dark ? 'bg-zinc-800'            : 'bg-gray-200';
  const goalBadge =
    userProfile.goal === 'fat_loss'    ? 'bg-red-500/10  text-red-400   border-red-500/20'   :
    userProfile.goal === 'muscle_gain' ? 'bg-blue-500/10 text-blue-400  border-blue-500/20'  :
                                         'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

  const macros = [
    { label: 'Protein', val: totalPro,   goal: macroGoals.proteinGrams, pct: proPct, rawPct: rawProPct,   isExceeded: rawProPct > 105,   color: 'bg-blue-500',    tc: 'text-blue-400'    },
    { label: 'Carbs',   val: totalCarbs, goal: macroGoals.carbsGrams,   pct: carbsPct, rawPct: rawCarbsPct, isExceeded: rawCarbsPct > 105, color: 'bg-amber-400',   tc: 'text-amber-400'   },
    { label: 'Fats',    val: totalFat,   goal: macroGoals.fatGrams,     pct: fatPct, rawPct: rawFatPct,   isExceeded: rawFatPct > 105,   color: 'bg-emerald-500', tc: 'text-emerald-400' },
  ];

  // Format today's date for display
  const today = new Date();
  const todayLabel = today.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-200`}>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* ── Welcome Banner ─────────────────────────────────────────────── */}
        <div className={`rounded-2xl border p-5 ${card} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[11px] font-extrabold border px-2.5 py-0.5 rounded-full uppercase tracking-wide ${goalBadge}`}>
                {userProfile.goal.replace('_', ' ')}
              </span>
              <span className={`text-[11px] font-mono ${muted}`}>TDEE {macroGoals.calories} kcal/day</span>
              {streakDays > 0 && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  🔥 {streakDays} day streak
                </span>
              )}
            </div>
            <h1 className={`text-2xl font-bold leading-tight ${txt}`}>
              Good {today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening'}, {userProfile.name.split(' ')[0]} 👋
            </h1>
            <p className={`text-xs mt-0.5 ${muted}`}>
              {todayLabel} ·{' '}
              {totalCal === 0
                ? 'No meals logged yet today — start tracking!'
                : `${totalCal} kcal logged · ${calsRemaining > 0 ? `${calsRemaining} kcal remaining` : '✅ Daily goal reached!'}`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('meals')}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition ${dark ? 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              <Utensils className="w-4 h-4 text-[#2196F3]" /> Meal Planner
            </button>
            <button
              onClick={() => setActiveTab('scanner')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4CAF50] hover:bg-[#43A047] text-white text-xs font-bold shadow transition"
            >
              <Camera className="w-4 h-4" /> Scan Food
            </button>
          </div>
        </div>

        {/* ── Live Sync Status Bar ───────────────────────────────────────── */}
        <div className={`rounded-xl border px-4 py-2.5 flex items-center justify-between ${dark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className={`text-[11px] font-bold ${muted}`}>LIVE SYNC ACTIVE</span>
            <span className={`text-[11px] ${muted}`}>· All data reflects real-time logged meals only</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-bold ${muted} flex items-center gap-1`}>
              <CalendarDays className="w-3 h-3" /> {getTodayKey()}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              loggedMeals.length === 0
                ? 'bg-zinc-800 text-zinc-400'
                : 'bg-emerald-500/15 text-emerald-400'
            }`}>
              {loggedMeals.length} meal{loggedMeals.length !== 1 ? 's' : ''} logged
            </span>
          </div>
        </div>

        {/* ── Stats Row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: 'Calories',
              val: totalCal === 0 ? '0' : `${totalCal}`,
              sub: `/ ${macroGoals.calories} kcal goal`,
              icon: Flame,
              tc: totalCal === 0 ? muted : 'text-orange-400',
              bg: totalCal === 0 ? (dark ? 'bg-zinc-800' : 'bg-gray-100') : 'bg-orange-500/10',
              empty: totalCal === 0,
            },
            {
              label: 'Protein',
              val: `${Math.round(totalPro)}g`,
              sub: `/ ${macroGoals.proteinGrams}g goal`,
              icon: Zap,
              tc: totalPro === 0 ? muted : 'text-blue-400',
              bg: totalPro === 0 ? (dark ? 'bg-zinc-800' : 'bg-gray-100') : 'bg-blue-500/10',
              empty: totalPro === 0,
            },
            {
              label: 'Budget Used',
              val: formatInr(totalSpend),
              sub: `/ ${formatInr(userProfile.dailyBudgetInr)} limit`,
              icon: Target,
              tc: totalSpend === 0 ? muted : budgetPct > 100 ? 'text-red-400' : 'text-emerald-400',
              bg: totalSpend === 0 ? (dark ? 'bg-zinc-800' : 'bg-gray-100') : budgetPct > 100 ? 'bg-red-500/10' : 'bg-emerald-500/10',
              empty: totalSpend === 0,
            },
            {
              label: 'Water',
              val: `${waterIntakeLiters}L`,
              sub: `/ ${macroGoals.waterLiters}L target`,
              icon: Droplets,
              tc: waterIntakeLiters === 0 ? muted : 'text-cyan-400',
              bg: waterIntakeLiters === 0 ? (dark ? 'bg-zinc-800' : 'bg-gray-100') : 'bg-cyan-500/10',
              empty: waterIntakeLiters === 0,
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`rounded-2xl border p-4 ${card}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.bg}`}>
                  <Icon className={`w-4 h-4 ${s.tc}`} />
                </div>
                <div className={`text-lg font-extrabold ${s.tc}`}>{s.val}</div>
                <div className={`text-xs ${muted}`}>{s.label}</div>
                <div className={`text-[10px] font-medium mt-0.5 ${s.empty ? 'text-zinc-600' : muted}`}>{s.sub}</div>
              </div>
            );
          })}
        </div>

        {/* ── Main Content Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Calorie Ring + Macros — LEFT */}
          <div className={`lg:col-span-2 rounded-2xl border p-5 ${card} space-y-4`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-sm font-extrabold ${txt}`}>Daily Energy</h2>
              <span className={`text-xs font-bold ${muted}`}>{calPct}% complete</span>
            </div>

            {/* Calorie Arc */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="48" fill="none" stroke={dark ? '#27272a' : '#e5e7eb'} strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="48" fill="none"
                    stroke={calPct === 0 ? (dark ? '#3f3f46' : '#d1d5db') : calPct >= 90 ? '#22c55e' : '#3b82f6'}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 48}`}
                    strokeDashoffset={`${2 * Math.PI * 48 * (1 - (calPct || 0) / 100)}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-xl font-extrabold leading-none ${calPct === 0 ? muted : txt}`}>
                    {totalCal === 0 ? '0' : totalCal}
                  </span>
                  <span className={`text-[10px] font-bold ${muted}`}>kcal eaten</span>
                  <span className={`text-[10px] font-medium ${muted}`}>/{macroGoals.calories}</span>
                </div>
              </div>
            </div>

            {/* Macro Bars */}
            <div className="space-y-2.5">
              {macros.map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className={`font-semibold ${muted}`}>{m.label}</span>
                    <span className={`font-bold ${m.pct === 0 ? muted : m.isExceeded ? 'text-rose-400 font-extrabold' : m.tc}`}>
                      {Math.round(m.val)}g / {m.goal}g {m.isExceeded ? `(${m.rawPct}% Exceeded ⚠️)` : ''}
                    </span>
                  </div>
                  <div className={`h-1.5 rounded-full ${progress}`}>
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${m.pct === 0 ? (dark ? 'bg-zinc-700' : 'bg-gray-300') : m.isExceeded ? 'bg-rose-500' : m.color}`}
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Water / Hydration Section */}
            <div className={`pt-3 border-t ${dark ? 'border-zinc-800' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span className={`text-xs font-semibold ${muted}`}>Hydration</span>
                </div>

                {isEditingWater ? (
                  <form onSubmit={handleSaveWaterInput} className="flex items-center gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-cyan-400 font-bold">Drank:</span>
                      <input
                        type="number" step="0.1" min="0" max="20"
                        value={waterInputValue}
                        onChange={(e) => setWaterInputValue(e.target.value)}
                        className={`w-14 px-1 py-0.5 rounded text-xs font-bold border focus:outline-none ${dark ? 'bg-zinc-900 border-cyan-500 text-cyan-400' : 'bg-white border-cyan-400 text-cyan-600'}`}
                        autoFocus
                      />
                      <span className="text-[10px] text-cyan-400 font-bold">L</span>
                    </div>
                    <span className="text-zinc-500 font-bold text-xs">/</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-cyan-400 font-bold">Target:</span>
                      <input
                        type="number" step="0.1" min="0.5" max="20"
                        value={waterGoalInputValue}
                        onChange={(e) => setWaterGoalInputValue(e.target.value)}
                        className={`w-14 px-1 py-0.5 rounded text-xs font-bold border focus:outline-none ${dark ? 'bg-zinc-900 border-cyan-500 text-cyan-400' : 'bg-white border-cyan-400 text-cyan-600'}`}
                      />
                      <span className="text-[10px] text-cyan-400 font-bold">L</span>
                    </div>
                    <button type="submit" className="px-2 py-0.5 rounded bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-[10px] font-extrabold">Save</button>
                    <button type="button" onClick={() => setIsEditingWater(false)} className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] font-bold">✕</button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-cyan-400">{waterIntakeLiters}L / {macroGoals.waterLiters}L</span>
                    <button
                      onClick={() => {
                        setWaterInputValue(String(waterIntakeLiters));
                        setWaterGoalInputValue(String(macroGoals.waterLiters));
                        setIsEditingWater(true);
                      }}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                )}
              </div>

              <div className={`h-1.5 rounded-full ${progress} mb-2`}>
                <div className="h-1.5 rounded-full bg-cyan-400 transition-all duration-500" style={{ width: `${waterPct}%` }} />
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <button onClick={() => addWater(-0.25)} className={`py-1.5 rounded-lg text-xs font-bold transition ${dark ? 'bg-zinc-800/80 text-red-400 hover:bg-zinc-700' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>-250ml</button>
                <button onClick={() => addWater(0.25)}  className={`py-1.5 rounded-lg text-xs font-bold transition ${dark ? 'bg-zinc-800 text-cyan-400 hover:bg-zinc-700' : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'}`}>+250ml</button>
                <button onClick={() => addWater(0.5)}   className={`py-1.5 rounded-lg text-xs font-bold transition ${dark ? 'bg-zinc-800 text-cyan-400 hover:bg-zinc-700' : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'}`}>+500ml</button>
                <button onClick={() => setWater(0)}     className={`py-1.5 rounded-lg text-[10px] font-bold transition ${dark ? 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>Reset</button>
              </div>
            </div>
          </div>

          {/* Logged Meals — RIGHT */}
          <div className={`lg:col-span-3 rounded-2xl border ${card} flex flex-col`}>
            <div className={`flex items-center justify-between px-5 pt-5 pb-3 border-b ${dark ? 'border-zinc-800' : 'border-gray-100'}`}>
              <div>
                <h2 className={`text-sm font-extrabold ${txt}`}>Today's Meals</h2>
                <p className={`text-xs ${muted}`}>
                  {loggedMeals.length === 0
                    ? 'No meals logged yet for today'
                    : `${loggedMeals.length} items · ${formatInr(totalSpend)} of ${formatInr(userProfile.dailyBudgetInr)} budget`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {loggedMeals.length > 0 && (
                  <button
                    onClick={() => clearAllLoggedMeals()}
                    className="px-2.5 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('scanner')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                >
                  + Add Food
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5 max-h-[400px]">
              {loggedMeals.length === 0 ? (
                <div className={`text-center py-12 ${muted}`}>
                  <Apple className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-semibold">No meals logged for today</p>
                  <p className="text-xs mt-1 opacity-70">Use the AI Scanner or Meal Planner to log your first meal</p>
                  <div className="flex gap-2 justify-center mt-4">
                    <button
                      onClick={() => setActiveTab('scanner')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
                    >
                      <Camera className="w-3.5 h-3.5" /> Scan Food
                    </button>
                    <button
                      onClick={() => setActiveTab('meals')}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition ${dark ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Utensils className="w-3.5 h-3.5" /> Meal Planner
                    </button>
                  </div>
                </div>
              ) : (
                loggedMeals.map((meal) => {
                  const mealCal = meal.foodItem.calories * meal.servings;
                  const mealPct = Math.min(100, Math.round((mealCal / (macroGoals.calories || 1)) * 100));
                  const mealEmoji =
                    meal.mealType === 'breakfast' ? '🌅' :
                    meal.mealType === 'lunch'     ? '☀️' :
                    meal.mealType === 'dinner'    ? '🌙' : '🍎';
                  return (
                    <div key={meal.id} className={`flex items-center gap-3 p-3 rounded-xl border transition ${dark ? 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${inner}`}>
                        {mealEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${txt}`}>{meal.foodItem.name}</p>
                        <p className={`text-[10px] font-medium ${muted}`}>
                          {meal.timestamp} · {meal.mealType} · {meal.servings > 1 ? `${meal.servings}x servings` : meal.foodItem.servingSize}
                        </p>
                        <div className={`h-1 rounded-full mt-1.5 ${progress}`}>
                          <div className="h-1 rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${mealPct}%` }} />
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-xs font-extrabold ${txt}`}>{mealCal} kcal</div>
                        <div className="text-[10px] text-blue-400 font-medium">{Math.round(meal.foodItem.protein * meal.servings)}g prot</div>
                        {meal.foodItem.priceInr > 0 && (
                          <div className="text-[10px] text-emerald-400 font-medium">{formatInr(meal.foodItem.priceInr * meal.servings)}</div>
                        )}
                      </div>
                      <button
                        onClick={() => removeLoggedMeal(meal.id)}
                        className={`p-1.5 rounded-lg transition shrink-0 ${dark ? 'hover:bg-red-900/40 text-zinc-600 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-400'}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Meal Planner CTA */}
            <div className={`border-t px-5 py-3 ${dark ? 'border-zinc-800' : 'border-gray-100'}`}>
              <button
                onClick={() => setActiveTab('meals')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition ${dark ? 'bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
              >
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-blue-400" />
                  <span>Open Weekly Meal Planner</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: 'Scan Food with AI', desc: 'Instant nutrition & glycemic analysis', icon: Camera, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', action: () => setActiveTab('scanner') },
            { title: 'View Analytics',    desc: 'Trends, macros & weekly breakdown',    icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', action: () => setActiveTab('analytics') },
            { title: 'Edit Profile & Goals', desc: 'TDEE, dietary preference, budget', icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', action: onOpenWizard },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.title} onClick={a.action}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition text-left ${card} hover:border-zinc-600`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.bg}`}>
                  <Icon className={`w-5 h-5 ${a.color}`} />
                </div>
                <div>
                  <div className={`text-sm font-bold ${txt}`}>{a.title}</div>
                  <div className={`text-[11px] ${muted}`}>{a.desc}</div>
                </div>
                <ChevronRight className={`w-4 h-4 ml-auto shrink-0 ${muted}`} />
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
