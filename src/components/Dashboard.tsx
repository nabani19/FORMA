import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Scan, 
  Flame, 
  Plus, 
  ArrowRight, 
  Dumbbell, 
  ShieldCheck, 
  Sparkles,
  Wallet,
  FileText
} from 'lucide-react';
import { BudgetSettingsPanel } from './BudgetSettingsPanel';
import { getStartOfToday, deriveDailyBudget, formatINR } from '../utils/nutritionUtils';

export const Dashboard: React.FC = () => {
  const { 
    user, 
    preferences, 
    mealLogs, 
    setActiveTab, 
    setIsScannerOpen, 
    setIsPdfExportModalOpen, 
    t 
  } = useApp();

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

      {/* ── 1. Fresh Hero Greeting Card ───────────────────────────── */}
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
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100 tracking-tight" data-testid="dashboard-hero-title">
              Hello, {user.firstName || 'Athlete'}! 👋
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              {todayLogs.length === 0
                ? 'Your daily nutrition & fitness cockpit is ready. Scan a food item or log your first meal to start tracking.'
                : `You have logged ${todayLogs.length} meal${todayLogs.length > 1 ? 's' : ''} today with ${calRemaining} kcal remaining in your target.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
              data-testid="btn-hero-scan"
            >
              <Scan className="w-4 h-4" />
              <span>{t('scan_food')}</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-2xl transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t('log_meal')}</span>
            </button>
            <button
              onClick={() => setIsPdfExportModalOpen(true)}
              className="flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs px-3 py-2.5 rounded-2xl transition-all"
              title="Export Clinical PDF Reports"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Neat & Clean Macro Metric Cards ────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { 
            label: t('calories'), 
            val: totalCalories, 
            target: calTarget, 
            unit: 'kcal', 
            pct: calPercent, 
            icon: Flame,
            color: 'text-amber-400', 
            barGradient: 'from-amber-500 to-orange-400', 
            remaining: `${calRemaining} left` 
          },
          { 
            label: t('protein'), 
            val: totalProtein, 
            target: proteinTarget, 
            unit: 'g', 
            pct: proteinPct, 
            icon: Dumbbell,
            color: 'text-sky-400', 
            barGradient: 'from-sky-500 to-blue-500', 
            remaining: `${Math.max(0, proteinTarget - totalProtein)}g left` 
          },
          { 
            label: t('carbs'), 
            val: totalCarbs, 
            target: carbsTarget, 
            unit: 'g', 
            pct: carbsPct, 
            icon: Sparkles,
            color: 'text-emerald-400', 
            barGradient: 'from-emerald-500 to-teal-400', 
            remaining: `${Math.max(0, carbsTarget - totalCarbs)}g left` 
          },
          { 
            label: t('fats'), 
            val: totalFat, 
            target: fatTarget, 
            unit: 'g', 
            pct: fatPct, 
            icon: ShieldCheck,
            color: 'text-rose-400', 
            barGradient: 'from-rose-500 to-pink-500', 
            remaining: `${Math.max(0, fatTarget - totalFat)}g left` 
          },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 shadow-lg space-y-3 transition-all backdrop-blur-xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                  <span className="text-xs font-bold text-slate-300 font-heading">{m.label}</span>
                </div>
                <span className={`text-[11px] font-extrabold font-mono ${m.color}`}>{m.pct}%</span>
              </div>

              <div className="flex items-baseline gap-1.5 my-0.5">
                <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${m.color}`}>{m.val}</span>
                <span className="text-xs text-slate-400 font-mono font-medium">{m.unit}</span>
              </div>

              <div className="space-y-2">
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    className={`h-full bg-gradient-to-r ${m.barGradient} transition-all duration-500 rounded-full`}
                    style={{ width: `${Math.min(100, m.pct)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Target: {m.target}{m.unit}</span>
                  <span className="text-slate-400 font-semibold">{m.remaining}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Food Budget & Health Snapshot ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Daily Food Budget Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  {t('daily_budget')}
                </h3>
                <span className="text-[10px] text-slate-400">Target: {formatINR(dailyBudget)}/day</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('grocery')}
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 font-mono"
            >
              <span>Grocery Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
            <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{t('daily_budget')}</span>
              <strong className="text-slate-100 text-sm">{formatINR(dailyBudget)}</strong>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{t('spent_today')}</span>
              <strong className="text-emerald-400 text-sm">
                {formatINR(Math.round(todayLogs.length * 35))}
              </strong>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">{t('remaining')}</span>
              <strong className="text-sky-400 text-sm">
                {formatINR(Math.max(0, dailyBudget - Math.round(todayLogs.length * 35)))}
              </strong>
            </div>
          </div>
        </div>

        {/* Health Goal & Dietary Safeguards Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Dietary Safeguards
                </h3>
                <span className="text-[10px] text-slate-400">
                  {preferences.length} Active preference{preferences.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-xs font-bold text-indigo-400 hover:underline flex items-center gap-1 font-mono"
            >
              <span>Manage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {preferences.length === 0 ? (
            <div className="text-xs text-slate-400 bg-slate-950/50 p-3 rounded-2xl border border-slate-800/80">
              No dietary restrictions active. Click Manage to add allergies or preferences (Vegan, Jain, Gluten-Free).
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {preferences.map((p) => (
                <span
                  key={p.preferenceId}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${
                    p.type === 'allergy'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                  }`}
                >
                  {p.type === 'allergy' ? `⚠️ ${p.value}` : p.value}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── 4. User-Adjustable Budget Settings ─────────────────────── */}
      <BudgetSettingsPanel />

    </div>
  );
};
