import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MealType, DayOfWeek } from '../types';
import { 
  Utensils, 
  Scan, 
  Trash2, 
  Edit2, 
  Scale, 
  Flame, 
  Search, 
  Plus, 
  Wallet, 
  TrendingUp, 
  CheckCircle, 
  DollarSign, 
  CheckCircle2, 
  Circle,
  ChefHat,
  Sparkles,
  Info,
  RotateCcw
} from 'lucide-react';
import { BudgetSettingsPanel } from './BudgetSettingsPanel';
import { getBudgetOptimizedWeeklyPlan, PlannedMeal } from '../data/weeklyMealPlans';
import { MealDetailsModal } from './MealDetailsModal';
import { getStartOfToday, deriveDailyBudget, formatINR } from '../utils/nutritionUtils';

export const MealLogView: React.FC = () => {
  const { 
    mealLogs, 
    deleteMealLog, 
    updateMealLogPortion, 
    setIsScannerOpen, 
    user,
    eatenMeals,
    togglePlannedMealEaten,
    isPlannedMealEaten,
    clearTodayLogs
  } = useApp();
  const [filterMealType, setFilterMealType] = useState<MealType | 'all'>('all');
  const [searchQuery, setSearchQuery]         = useState<string>('');
  
  const getCurrentDayOfWeek = (): DayOfWeek => {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = new Date().getDay();
    return days[dayIndex] || 'monday';
  };

  const [selectedDay, setSelectedDay]         = useState<DayOfWeek>(() => getCurrentDayOfWeek());
  const [editingLogId, setEditingLogId]       = useState<string | null>(null);
  const [editPortion, setEditPortion]         = useState<number>(100);

  // Active meal for Recipe & Nutrient Details Modal popup
  const [selectedMealForModal, setSelectedMealForModal] = useState<PlannedMeal | null>(null);
  const [isMealModalOpen, setIsMealModalOpen]           = useState<boolean>(false);

  const daysOfWeek: { id: DayOfWeek; label: string; short: string }[] = [
    { id: 'monday',    label: 'Monday',    short: 'Mon' },
    { id: 'tuesday',   label: 'Tuesday',   short: 'Tue' },
    { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { id: 'thursday',  label: 'Thursday',  short: 'Thu' },
    { id: 'friday',    label: 'Friday',    short: 'Fri' },
    { id: 'saturday',  label: 'Saturday',  short: 'Sat' },
    { id: 'sunday',    label: 'Sunday',    short: 'Sun' },
  ];

  const mealSlots: { id: MealType | 'all'; label: string }[] = [
    { id: 'all',           label: 'All 5 Meals'     },
    { id: 'breakfast',     label: '1. Breakfast'    },
    { id: 'morning_snack', label: '2. Morning Snack'},
    { id: 'lunch',         label: '3. Lunch'        },
    { id: 'evening_snack', label: '4. Evening Snack'},
    { id: 'dinner',        label: '5. Dinner'       },
  ];

  // ── User Budgets ──────────────────────────────────────────────────
  const dailyBudget   = user?.dailyBudgetInr   || deriveDailyBudget(user?.monthlyBudgetInr);
  const monthlyBudget = user?.monthlyBudgetInr  || (dailyBudget * 30);
  const targetCal     = user?.dailyCalorieTarget || 2150;
  const targetProt    = user?.dailyProteinTargetG || 140;

  // ── Dynamic Budget-Optimized 7-Day Meal Plan ──────────────────────
  const optimizedWeeklyPlan = getBudgetOptimizedWeeklyPlan(dailyBudget, targetCal, targetProt);
  const dayPlan = optimizedWeeklyPlan[selectedDay];

  // ── Today's real logs for the stats cards ─────────────────────────
  const todayStart = getStartOfToday();
  const todayLogs   = mealLogs.filter((log) => new Date(log.loggedAt) >= todayStart);
  const totalDayCost     = todayLogs.reduce((acc, l) => acc + (l.costInr   || 35),  0);
  const totalDayCalories = todayLogs.reduce((acc, l) => acc + (l.calculatedNutrients?.calories  || 0), 0);
  const totalDayProtein  = todayLogs.reduce((acc, l) => acc + (l.calculatedNutrients?.protein_g || 0), 0);
  const projectedMonthly = totalDayCost * 30;

  // ── Filter actual logs for the Logged Meals list ──────────────────
  const filteredLogs = mealLogs.filter((log) => {
    const matchesType   = filterMealType === 'all' || log.mealType === filterMealType;
    const name = log.foodName || (log as any).foodItem?.name || '';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const planMeals = filterMealType === 'all'
    ? dayPlan.meals
    : dayPlan.meals.filter((m) => {
        const map: Record<string, MealType> = {
          'Breakfast': 'breakfast', 'Morning Snack': 'morning_snack',
          'Lunch': 'lunch', 'Evening Snack': 'evening_snack', 'Dinner': 'dinner',
        };
        return map[m.slot] === filterMealType;
      });

  const handleStartEdit = (logId: string, currentPortion: number) => {
    setEditingLogId(logId);
    setEditPortion(Math.round(currentPortion));
  };
  const handleSaveEdit = (logId: string) => {
    updateMealLogPortion(logId, editPortion);
    setEditingLogId(null);
  };

  const handleOpenMealModal = (meal: PlannedMeal) => {
    setSelectedMealForModal(meal);
    setIsMealModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4" data-testid="meal-log-view">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <Utensils className="w-6 h-6 text-emerald-400" />
            <h2 className="font-heading font-extrabold text-2xl text-slate-100">Meal History Log</h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
              5 MEALS/DAY · 7 DAYS
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
            AI Budget-Optimized 5-Meal Schedule under <strong className="text-emerald-400">₹{dailyBudget}/day</strong> (₹{formatINR(monthlyBudget)}/mo) · Fulfilling <strong className="text-amber-300">{targetCal} kcal</strong> & <strong className="text-sky-300">{targetProt}g protein</strong>. Click any meal for how-to-cook recipes & ingredients!
          </p>
        </div>
        <button
          onClick={() => setIsScannerOpen(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold px-5 py-3 rounded-xl shadow-lg transition-all shrink-0"
          data-testid="btn-scan-food-log-header"
        >
          <Scan className="w-4 h-4" />
          <span>Scan Food / Barcode</span>
        </button>
      </div>

      {/* ── User Budget Settings ─────────────────────────────────── */}
      <BudgetSettingsPanel />

      {/* 7-Day Tabs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar" data-testid="day-tabs-container">
        {daysOfWeek.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDay(d.id)}
            className={`flex-1 min-w-[90px] py-2.5 px-2 rounded-xl text-xs font-bold text-center transition-all ${
              selectedDay === d.id
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            data-testid={`day-tab-${d.id}`}
          >
            <div>{d.short}</div>
            <div className="text-[10px] font-normal opacity-80">
              {optimizedWeeklyPlan[d.id].totalKcal} kcal
            </div>
          </button>
        ))}
      </div>

      {/* Stats Cards (from today's real logs) with Distinct Target Typography */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Daily Food Cost */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Daily Food Cost</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400" data-testid="daily-food-cost-display">
            ₹{totalDayCost} <span className="text-xs text-slate-400 font-normal">/ ₹{dailyBudget}</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/60">
            <div className={`h-full rounded-full transition-all duration-500 ${totalDayCost <= dailyBudget ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(100, (totalDayCost / dailyBudget) * 100)}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">₹{Math.max(0, dailyBudget - totalDayCost)} left</span>
            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              ₹{dailyBudget}/day
            </span>
          </div>
        </div>

        {/* 2. Monthly Projection */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Monthly Projection</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold font-mono text-cyan-400">
            ₹{formatINR(projectedMonthly)} <span className="text-xs text-slate-400 font-normal">/ ₹{formatINR(monthlyBudget)}</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/60">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (projectedMonthly / monthlyBudget) * 100)}%` }} />
          </div>
          <div className="text-[10px] text-cyan-300 font-mono">
            ₹{totalDayCost} × 30 = ₹{formatINR(projectedMonthly)}
          </div>
        </div>

        {/* 3. Calories Today with Prominent Target Styling */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="font-semibold text-slate-200">Calories Today</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-amber-400">{Math.round(totalDayCalories)}</span>
            <span className="text-xs font-mono text-slate-400">kcal</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/60">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((totalDayCalories / targetCal) * 100))}%` }} />
          </div>
          <div className="flex items-center justify-between gap-1 text-[10px] font-mono pt-0.5">
            <span className="font-extrabold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/40 shadow-sm">
              🎯 Target: {targetCal} kcal
            </span>
            <span className="text-slate-400 font-semibold">{Math.max(0, targetCal - Math.round(totalDayCalories))} left</span>
          </div>
        </div>

        {/* 4. Protein Today with Prominent Target Styling */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-1.5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="font-semibold text-slate-200">Protein Today</span>
            <CheckCircle className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-sky-400">{Math.round(totalDayProtein)}g</span>
            <span className="text-xs font-mono text-slate-400">protein</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/60">
            <div className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((totalDayProtein / targetProt) * 100))}%` }} />
          </div>
          <div className="flex items-center justify-between gap-1 text-[10px] font-mono pt-0.5">
            <span className="font-extrabold text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded-md border border-sky-500/40 shadow-sm">
              🎯 Target: {targetProt}g
            </span>
            <span className="text-slate-400 font-semibold">{Math.max(0, targetProt - Math.round(totalDayProtein))}g left</span>
          </div>
        </div>
      </div>

      {/* Budget Breakdown Banner */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Monthly Health Budget:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span className="text-emerald-300">🍛 Meals: <strong>₹{dailyBudget}/day × 30 = ₹{formatINR(monthlyBudget)} INR</strong></span>
          <span className="text-purple-300">💊 Supplements: <strong>₹{formatINR(user?.supplementBudgetInr || 3500)} INR/mo</strong></span>
          <span className="text-amber-300 font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
            Total: ₹{formatINR(monthlyBudget + (user?.supplementBudgetInr || 3500))} INR
          </span>
        </div>
      </div>

      {/* Meal Slot Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logged foods or planned meals..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            data-testid="input-search-meals"
          />
        </div>
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto no-scrollbar" data-testid="meal-slot-filters">
          {mealSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => setFilterMealType(slot.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                filterMealType === slot.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              data-testid={`filter-slot-${slot.id}`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Selected Day Planned Meal Plan (Clickable with Full Recipes) ─────── */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4" data-testid="planned-meals-container">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-heading flex items-center gap-2">
              <ChefHat className="w-4 h-4 text-emerald-400" />
              <span>{daysOfWeek.find(d => d.id === selectedDay)?.label} — Planned Meal Schedule</span>
            </h3>
            <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
              <strong className="text-amber-400">{dayPlan.totalKcal} kcal</strong> · <strong className="text-sky-400">{dayPlan.totalProtein}g protein</strong> · <strong className="text-emerald-400">₹{dayPlan.totalCost} total</strong>
              <span className="text-slate-500 ml-2">(Click any meal for how-to-cook, ingredients & full charts)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded border font-mono ${
              dayPlan.totalCost <= dailyBudget
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`} data-testid="budget-status-badge">
              {dayPlan.totalCost <= dailyBudget ? `✓ Under Budget (₹${dayPlan.totalCost} / ₹${dailyBudget})` : `⚠️ Over Budget (₹${dayPlan.totalCost} / ₹${dailyBudget})`}
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          {planMeals.map((meal, idx) => {
            const isEaten = isPlannedMealEaten(selectedDay, idx);
            return (
              <div
                key={idx}
                onClick={() => handleOpenMealModal(meal)}
                className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-300 cursor-pointer ${
                  isEaten
                    ? 'bg-emerald-500/5 border-emerald-500/40 opacity-75'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-900/90 shadow-md'
                }`}
                data-testid={`planned-meal-row-${idx}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Eaten Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlannedMealEaten(selectedDay, idx, meal);
                    }}
                    title={isEaten ? 'Mark as not eaten' : 'Mark as eaten'}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                      isEaten
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                        : 'bg-slate-900/80 border-slate-700 text-slate-500 hover:border-emerald-500/50 hover:text-emerald-400'
                    }`}
                    data-testid={`meal-eaten-btn-${idx}`}
                  >
                    {isEaten
                      ? <CheckCircle2 className="w-5 h-5" />
                      : <Circle className="w-4.5 h-4.5" />
                    }
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">{meal.slot}</span>
                      <span className="text-[9px] text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded font-mono">
                        {meal.prepTimeMinutes || 15}m
                      </span>
                    </div>
                    <div className={`text-xs font-bold mt-0.5 leading-snug transition-all ${
                      isEaten ? 'line-through text-slate-400 decoration-emerald-400' : 'text-slate-200'
                    }`} data-testid={`meal-name-${idx}`}>
                      {meal.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{meal.portion}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-bold hover:underline flex items-center gap-0.5">
                        <Info className="w-3 h-3 inline" /> View Recipe & Cooking Steps
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono shrink-0">
                  {isEaten && (
                    <span className="bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-lg font-bold border border-emerald-500/30 text-[10px]" data-testid={`badge-eaten-${idx}`}>
                      ✓ Eaten
                    </span>
                  )}
                  <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded font-bold">{meal.kcal} kcal</span>
                  <span className="bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded font-bold">P: {meal.protein}g</span>
                  <span className="bg-amber-500/10 text-amber-200 px-2 py-0.5 rounded">C: {meal.carbs}g</span>
                  <span className="bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded">F: {meal.fat}g</span>
                  <span className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    ₹{meal.costInr}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Actual Logged Meals Section ───────────────────────────────── */}
      <div className="space-y-3" data-testid="logged-meals-section">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Your Scanned / Logged Meals ({todayLogs.length} today)
          </h3>
          {todayLogs.length > 0 && (
            <button
              onClick={() => clearTodayLogs()}
              className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-lg transition-all font-mono"
              title="Reset and clear today's logs"
              data-testid="btn-clear-today-logs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Today's Logs</span>
            </button>
          )}
        </div>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/60 border border-slate-800 rounded-3xl p-6" data-testid="empty-logs-banner">
            <Utensils className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-300">No meals logged yet for this filter.</p>
            <p className="text-xs text-slate-400 mt-1">Scan a barcode or food item to log it.</p>
            <button
              onClick={() => setIsScannerOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 bg-emerald-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl"
              data-testid="btn-empty-scan-food"
            >
              <Plus className="w-3.5 h-3.5" /> Scan Food Now
            </button>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isEditing = editingLogId === log.logId;
            return (
              <div
                key={log.logId}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all space-y-3"
                data-testid={`meal-log-card-${log.logId}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={log.imageUrl}
                      alt={log.foodName}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-700/60 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {log.mealType.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          ₹{log.costInr || 35}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-100 text-sm font-heading mt-0.5">{log.foodName}</h3>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Portion: <strong className="text-slate-200">{Math.round(log.portionSizeGrams)}g</strong></span>
                        <span>·</span>
                        <span className="text-amber-400 font-semibold">{Math.round(log.calculatedNutrients.calories)} kcal</span>
                        <span>·</span>
                        <span className="text-sky-400 font-semibold">{Math.round(log.calculatedNutrients.protein_g)}g P</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleStartEdit(log.logId, log.portionSizeGrams)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors" title="Edit portion"
                      data-testid={`btn-edit-log-${log.logId}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteMealLog(log.logId)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 transition-colors" title="Delete"
                      data-testid={`btn-delete-log-${log.logId}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between gap-3 animate-fade-in" data-testid="edit-portion-panel">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold text-slate-300">Adjust Portion:</span>
                      <input
                        type="number" min="10" max="2000" step="10"
                        value={editPortion}
                        onChange={(e) => setEditPortion(Math.round(Number(e.target.value)))}
                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-center text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                        data-testid="input-edit-portion"
                      />
                      <span className="text-xs text-slate-400">grams</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditingLogId(null)} className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1" data-testid="btn-cancel-portion">Cancel</button>
                      <button onClick={() => handleSaveEdit(log.logId)} className="bg-emerald-500 text-slate-950 font-bold text-xs px-3 py-1 rounded-lg hover:bg-emerald-400" data-testid="btn-save-portion">Save</button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold pt-1 border-t border-slate-800/60 font-mono">
                  <div className="bg-sky-500/10 text-sky-300 py-1 rounded-lg">P: {Math.round(log.calculatedNutrients.protein_g)}g</div>
                  <div className="bg-amber-500/10 text-amber-300 py-1 rounded-lg">C: {Math.round(log.calculatedNutrients.carbs_g)}g</div>
                  <div className="bg-rose-500/10 text-rose-300 py-1 rounded-lg">F: {Math.round(log.calculatedNutrients.fat_g)}g</div>
                  <div className="bg-emerald-500/10 text-emerald-300 py-1 rounded-lg">Fiber: {Math.round(log.calculatedNutrients.fiber_g)}g</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Meal Details & Recipe Popup Modal ────────────────────── */}
      <MealDetailsModal
        meal={selectedMealForModal}
        isOpen={isMealModalOpen}
        onClose={() => {
          setIsMealModalOpen(false);
          setSelectedMealForModal(null);
        }}
        isEaten={selectedMealForModal ? isPlannedMealEaten(selectedDay, dayPlan.meals.findIndex(m => m.id === selectedMealForModal.id)) : false}
        onToggleEaten={() => {
          if (selectedMealForModal) {
            const idx = dayPlan.meals.findIndex(m => m.id === selectedMealForModal.id);
            if (idx !== -1) {
              togglePlannedMealEaten(selectedDay, idx, selectedMealForModal);
            }
          }
        }}
      />

    </div>
  );
};
