import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Scan, 
  Flame, 
  Plus, 
  ArrowRight, 
  Bot, 
  Dumbbell, 
  Utensils, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles,
  Wallet,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { BudgetSettingsPanel } from './BudgetSettingsPanel';
import { getStartOfToday, deriveDailyBudget, formatINR } from '../utils/nutritionUtils';

export const Dashboard: React.FC = () => {
  const { user, preferences, mealLogs, setActiveTab, setIsScannerOpen } = useApp();

  // Filter today's meal logs using shared date utility
  const todayStart = getStartOfToday();
  const todayLogs = mealLogs.filter((log) => new Date(log.loggedAt) >= todayStart);

  // Totals from actual user logs
  const totalCalories = Math.round(todayLogs.reduce((acc, log) => acc + (log.calculatedNutrients?.calories || 0), 0));
  const totalProtein  = Math.round(todayLogs.reduce((acc, log) => acc + (log.calculatedNutrients?.protein_g || 0), 0));
  const totalCarbs    = Math.round(todayLogs.reduce((acc, log) => acc + (log.calculatedNutrients?.carbs_g || 0), 0));
  const totalFat      = Math.round(todayLogs.reduce((acc, log) => acc + (log.calculatedNutrients?.fat_g || 0), 0));

  const calTarget     = Math.round(user.dailyCalorieTarget || 2150);
  const proteinTarget = Math.round(user.dailyProteinTargetG || 140);
  const carbsTarget   = Math.round(user.dailyCarbsTargetG || 240);
  const fatTarget     = Math.round(user.dailyFatTargetG || 65);

  const calRemaining  = Math.max(0, calTarget - totalCalories);
  const calPercent    = Math.min(100, Math.round((totalCalories / calTarget) * 100));
  const proteinPct    = Math.min(100, Math.round((totalProtein / proteinTarget) * 100));
  const carbsPct      = Math.min(100, Math.round((totalCarbs / carbsTarget) * 100));
  const fatPct        = Math.min(100, Math.round((totalFat / fatTarget) * 100));

  const dailyBudget   = user?.dailyBudgetInr || deriveDailyBudget(user.monthlyBudgetInr);
  const monthlyBudget = user?.monthlyBudgetInr || (dailyBudget * 30);

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4 animate-fade-in" data-testid="dashboard-view">

      {/* ── 1. FRESH HERO GREETING CARD ───────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-mono">
                {user.healthGoal?.replace(/_/g, ' ').toUpperCase() || 'PERFORMANCE GOAL'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Formula: {user.calculationFormula?.toUpperCase() || 'WHO/FAO 2004'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100 tracking-tight">
              Welcome back, {user.firstName || 'Athlete'}! ✨
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {todayLogs.length === 0
                ? 'Your daily nutrition & fitness cockpit is ready. Scan a food item or log your first meal to start tracking.'
                : `You have logged ${todayLogs.length} meal${todayLogs.length > 1 ? 's' : ''} today with ${calRemaining} kcal remaining in your target.`}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              data-testid="dashboard-scan-btn"
            >
              <Scan className="w-4 h-4" />
              <span>Scan Food</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-bold px-4 py-3 rounded-2xl transition-all"
            >
              <Utensils className="w-4 h-4 text-emerald-400" />
              <span>Log Meal</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. NEAT & CLEAN MACRO METRIC CARDS ────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { label: 'Calories', val: totalCalories, target: calTarget, unit: 'kcal', pct: calPercent, color: 'text-amber-400', barGradient: 'from-amber-500 to-orange-400', remaining: `${calRemaining} left` },
          { label: 'Protein',  val: totalProtein,  target: proteinTarget, unit: 'g', pct: proteinPct, color: 'text-sky-400',  barGradient: 'from-sky-500 to-indigo-400', remaining: `${Math.max(0, proteinTarget - totalProtein)}g left` },
          { label: 'Carbs',    val: totalCarbs,    target: carbsTarget,   unit: 'g', pct: carbsPct,   color: 'text-emerald-400', barGradient: 'from-emerald-500 to-teal-400', remaining: `${Math.max(0, carbsTarget - totalCarbs)}g left` },
          { label: 'Fats',     val: totalFat,      target: fatTarget,     unit: 'g', pct: fatPct,     color: 'text-rose-400',  barGradient: 'from-rose-500 to-pink-400', remaining: `${Math.max(0, fatTarget - totalFat)}g left` },
        ].map((m) => (
          <div key={m.label} className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4.5 space-y-3 transition-all shadow-md backdrop-blur-xl">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">{m.label}</span>
              <span className={`font-mono font-bold ${m.color}`}>{m.pct}%</span>
            </div>

            <div>
              <div className={`text-2xl font-extrabold font-mono tracking-tight ${m.color}`}>
                {m.val}
                <span className="text-xs font-normal text-slate-500 ml-1">{m.unit}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-0.5">
                <span>Target: {m.target}{m.unit}</span>
                <span className="text-slate-500 text-[10px]">{m.remaining}</span>
              </div>
            </div>

            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800/80">
              <div
                className={`bg-gradient-to-r ${m.barGradient} h-full rounded-full transition-all duration-700`}
                style={{ width: `${m.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── 3. FOOD BUDGET & HEALTH SNAPSHOT ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Daily Food Budget Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center justify-between gap-4 backdrop-blur-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Daily Nutrition Budget</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400">
              ₹{dailyBudget} <span className="text-xs font-normal text-slate-400">/ day</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              ₹{dailyBudget}/day × 30 = <strong className="text-slate-200">₹{formatINR(monthlyBudget)} / month</strong>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('grocery')}
            className="text-xs font-bold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 px-3.5 py-2.5 rounded-2xl border border-teal-500/30 transition-all shrink-0"
          >
            Grocery List →
          </button>
        </div>

        {/* Active Dietary Regimes & Filters */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-2 backdrop-blur-xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Active Dietary Regimes & Safeguards</span>
          </div>

          {preferences.length === 0 ? (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-slate-400">All standard foods allowed. No allergen restrictions active.</p>
              <button
                onClick={() => setActiveTab('profile')}
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                Customize →
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {preferences.map((p) => (
                <span
                  key={p.preferenceId}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl border ${
                    p.type === 'allergy'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : 'bg-slate-950 border-slate-700 text-slate-200'
                  }`}
                >
                  {p.type === 'allergy' ? `⚠️ ${p.value}` : p.value}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── 4. QUICK TOOLS SHORTCUTS ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '5-Meal Planner', sub: 'Daily logs & macros', tab: 'logs' as const, icon: Utensils, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'AI Nutritionist', sub: 'Clinical advice chat', tab: 'coach' as const, icon: Bot, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Supplements', sub: 'AI budget stack', tab: 'supplements' as const, icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { label: 'Workout AI', sub: '1,000+ exercises', tab: 'workout' as const, icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
        ].map((q) => {
          const Icon = q.icon;
          return (
            <button
              key={q.tab}
              onClick={() => setActiveTab(q.tab)}
              className={`bg-slate-900/90 border ${q.bg} rounded-2xl p-4 text-left hover:scale-[1.02] active:scale-98 transition-all space-y-1.5 shadow-md`}
            >
              <Icon className={`w-5 h-5 ${q.color}`} />
              <div className="text-xs sm:text-sm font-bold text-slate-100 font-heading">{q.label}</div>
              <div className="text-[10px] text-slate-400 font-mono">{q.sub}</div>
            </button>
          );
        })}
      </div>

      {/* ── 5. TODAY'S LOGGED MEALS ───────────────────────────────── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Today's Logged Meals ({todayLogs.length})
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('logs')}
            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 font-mono"
          >
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayLogs.length === 0 ? (
          <div className="text-center py-8 bg-slate-950/50 rounded-2xl border border-slate-800/80 space-y-2">
            <Utensils className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-400">No meals logged yet today.</p>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="mt-1 text-xs font-bold text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Your First Meal</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {todayLogs.map((log) => (
              <div
                key={log.logId}
                className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={log.imageUrl}
                    alt={log.foodName}
                    className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-800"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate font-heading">{log.foodName}</div>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5 font-mono">
                      {Math.round(log.portionSizeGrams)}g · {Math.round(log.calculatedNutrients?.calories || 0)} kcal
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <div className="text-[11px] font-bold text-sky-400">P: {Math.round(log.calculatedNutrients?.protein_g || 0)}g</div>
                  <div className="text-[10px] text-amber-400">C: {Math.round(log.calculatedNutrients?.carbs_g || 0)}g</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
