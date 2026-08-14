import React from 'react';
import { useApp } from '../context/AppContext';
import { Scan, Flame, Plus, ArrowRight, Bot, Dumbbell, Utensils, TrendingUp } from 'lucide-react';
import { BudgetSettingsPanel } from './BudgetSettingsPanel';
import { getStartOfToday, deriveDailyBudget, formatINR } from '../utils/nutritionUtils';

export const Dashboard: React.FC = () => {
  const { user, preferences, mealLogs, setActiveTab, setIsScannerOpen } = useApp();

  // Filter today's meal logs using shared date utility
  const todayStart = getStartOfToday();
  const todayLogs = mealLogs.filter((log) => new Date(log.loggedAt) >= todayStart);

  // Totals from actual user logs
  const totalCalories = Math.round(todayLogs.reduce((acc, log) => acc + (log.calculatedNutrients.calories || 0), 0));
  const totalProtein  = Math.round(todayLogs.reduce((acc, log) => acc + (log.calculatedNutrients.protein_g || 0), 0));
  const totalCarbs    = Math.round(todayLogs.reduce((acc, log) => acc + (log.calculatedNutrients.carbs_g || 0), 0));
  const totalFat      = Math.round(todayLogs.reduce((acc, log) => acc + (log.calculatedNutrients.fat_g || 0), 0));

  const calTarget     = Math.round(user.dailyCalorieTarget);
  const proteinTarget = Math.round(user.dailyProteinTargetG);
  const carbsTarget   = Math.round(user.dailyCarbsTargetG);
  const fatTarget     = Math.round(user.dailyFatTargetG);

  const calRemaining  = Math.max(0, calTarget - totalCalories);
  const calPercent    = Math.min(100, Math.round((totalCalories / calTarget) * 100));
  const proteinPct    = Math.min(100, Math.round((totalProtein / proteinTarget) * 100));
  const carbsPct      = Math.min(100, Math.round((totalCarbs / carbsTarget) * 100));
  const fatPct        = Math.min(100, Math.round((totalFat / fatTarget) * 100));

  const dailyBudget   = user?.dailyBudgetInr || deriveDailyBudget(user.monthlyBudgetInr);

  return (
    <div className="space-y-5 pb-24 max-w-5xl mx-auto px-4 pt-4">

      {/* ── Greeting Banner ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-3xl p-5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wide bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {user.healthGoal?.replace(/_/g, ' ').toUpperCase() || 'HEALTH GOAL'}
            </span>
            <h2 className="text-2xl font-extrabold font-heading text-slate-100 mt-1">
              Hello, {user.firstName || 'User'}! 👋
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {todayLogs.length === 0
                ? 'No meals logged yet today. Start by scanning your first meal.'
                : `${todayLogs.length} meal${todayLogs.length > 1 ? 's' : ''} logged today · ${calRemaining} kcal remaining`}
            </p>
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold px-5 py-3 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Scan className="w-5 h-5" />
            <span>Scan Food</span>
          </button>
        </div>
      </div>

      {/* ── Core Macro Stats Row ─────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Calories', val: totalCalories, target: calTarget, unit: 'kcal', pct: calPercent, color: 'text-amber-400', bar: 'bg-amber-400' },
          { label: 'Protein',  val: totalProtein,  target: proteinTarget, unit: 'g', pct: proteinPct, color: 'text-sky-400',  bar: 'bg-sky-400' },
          { label: 'Carbs',    val: totalCarbs,    target: carbsTarget,   unit: 'g', pct: carbsPct,   color: 'text-amber-300', bar: 'bg-amber-300' },
          { label: 'Fats',     val: totalFat,      target: fatTarget,     unit: 'g', pct: fatPct,     color: 'text-rose-400',  bar: 'bg-rose-400' },
        ].map((m) => (
          <div key={m.label} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-400">{m.label}</span>
              <span className={m.color}>{m.pct}%</span>
            </div>
            <div className={`text-xl font-extrabold font-mono ${m.color}`}>
              {m.val}<span className="text-xs font-normal text-slate-500 ml-1">{m.unit}</span>
            </div>
            <div className="text-[10px] text-slate-500">of {m.target}{m.unit}</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className={`${m.bar} h-full rounded-full transition-all duration-700`} style={{ width: `${m.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Daily Budget & Active Preferences ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Budget Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Daily Food Budget</div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400">
              ₹{dailyBudget}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              ₹{dailyBudget} × 30 days = <span className="text-emerald-300 font-bold">₹{formatINR(dailyBudget * 30)} / month</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('logs')}
            className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
          >
            View Meal Log →
          </button>
        </div>

        {/* Active Preferences/Allergens */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-2">Your Active Dietary Filters</div>
          {preferences.length === 0 ? (
            <p className="text-xs text-slate-500">No dietary preferences set. Update in your Profile.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {preferences.map((p) => (
                <span
                  key={p.preferenceId}
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${
                    p.type === 'allergy'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {p.type === 'allergy' ? `⚠️ ${p.value}` : p.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Action Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Meal Log', sub: `${todayLogs.length} meals today`, tab: 'logs' as const, icon: Utensils, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'AI Coach', sub: 'Ask anything', tab: 'coach' as const, icon: Bot, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
          { label: 'Workout', sub: '1,000+ exercises', tab: 'workout' as const, icon: Dumbbell, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
          { label: 'Analytics', sub: 'Intake trends', tab: 'analytics' as const, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        ].map((q) => {
          const Icon = q.icon;
          return (
            <button
              key={q.tab}
              onClick={() => setActiveTab(q.tab)}
              className={`bg-slate-900/80 border ${q.bg} rounded-2xl p-4 text-left hover:scale-[1.02] transition-all space-y-2`}
            >
              <Icon className={`w-5 h-5 ${q.color}`} />
              <div className="text-sm font-bold text-slate-100">{q.label}</div>
              <div className="text-[10px] text-slate-400">{q.sub}</div>
            </button>
          );
        })}
      </div>

      {/* ── Budget Settings (user-adjustable inline) ──────────────── */}
      <BudgetSettingsPanel />

      {/* ── Today's Logged Meals ──────────────────────────────── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Today's Logged Meals ({todayLogs.length})
          </h3>
          <button
            onClick={() => setActiveTab('logs')}
            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayLogs.length === 0 ? (
          <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-slate-800/80">
            <Utensils className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-400">No meals logged yet today.</p>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="mt-2 text-xs font-bold text-emerald-400 hover:underline inline-flex items-center gap-1"
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
                className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={log.imageUrl}
                    alt={log.foodName}
                    className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-700/60"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate font-heading">{log.foodName}</div>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {Math.round(log.portionSizeGrams)}g · {Math.round(log.calculatedNutrients.calories)} kcal
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-bold text-sky-400">P: {Math.round(log.calculatedNutrients.protein_g)}g</div>
                  <div className="text-[10px] text-amber-400">C: {Math.round(log.calculatedNutrients.carbs_g)}g</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
