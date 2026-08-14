import React, { useState } from 'react';
import { useAppStore, formatInr, getTodayKey } from '../store/useAppStore';
import { WEEK_PLAN } from './CustomMealPlanner';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  LineChart as ChartIcon, TrendingUp, Flame, Target, Droplets,
  Utensils, Camera, CheckCircle2, Zap, Activity,
  Clock, Sun, Sunset, Moon, Coffee, HeartPulse, CalendarDays
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    userProfile, macroGoals, loggedMeals, scannedFoods,
    waterIntakeLiters, dailyLogs, streakDays, isDarkMode: dark,
    setActiveTab, checkAndResetForNewDay
  } = useAppStore();

  const [view, setView] = useState<'daily' | 'weekly' | 'nutrition' | 'history'>('daily');

  // Run date check when analytics tab is opened
  React.useEffect(() => {
    checkAndResetForNewDay();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Theme ─────────────────────────────────────────────────────────────────
  const bg       = dark ? 'bg-zinc-950'            : 'bg-gray-50';
  const card     = dark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-white border-gray-200';
  const inner    = dark ? 'bg-zinc-800'             : 'bg-gray-100';
  const txt      = dark ? 'text-white'              : 'text-gray-900';
  const muted    = dark ? 'text-zinc-400'           : 'text-gray-500';
  const axis     = dark ? '#52525b'                 : '#9ca3af';
  const tabActive   = 'bg-blue-600 text-white shadow-md';
  const tabInactive = dark ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200';

  // ── Real Today Data ───────────────────────────────────────────────────────
  const totalCal   = loggedMeals.reduce((s, m) => s + m.foodItem.calories * m.servings, 0);
  const totalPro   = loggedMeals.reduce((s, m) => s + m.foodItem.protein  * m.servings, 0);
  const totalCarbs = loggedMeals.reduce((s, m) => s + m.foodItem.carbs    * m.servings, 0);
  const totalFat   = loggedMeals.reduce((s, m) => s + m.foodItem.fat      * m.servings, 0);
  const totalFiber = loggedMeals.reduce((s, m) => s + (m.foodItem.fiber ?? 0) * m.servings, 0);
  const totalSpend = loggedMeals.reduce((s, m) => s + (m.foodItem.priceInr ?? 0) * m.servings, 0);

  // Meal breakdown by type
  const mealsByType = {
    breakfast: loggedMeals.filter((m) => m.mealType === 'breakfast'),
    lunch:     loggedMeals.filter((m) => m.mealType === 'lunch'),
    dinner:    loggedMeals.filter((m) => m.mealType === 'dinner'),
    snack:     loggedMeals.filter((m) => m.mealType === 'snack'),
  };

  const calsByMeal = {
    breakfast: mealsByType.breakfast.reduce((s, m) => s + m.foodItem.calories * m.servings, 0),
    lunch:     mealsByType.lunch.reduce((s, m) => s + m.foodItem.calories * m.servings, 0),
    dinner:    mealsByType.dinner.reduce((s, m) => s + m.foodItem.calories * m.servings, 0),
    snack:     mealsByType.snack.reduce((s, m) => s + m.foodItem.calories * m.servings, 0),
  };

  const proByMeal = {
    breakfast: mealsByType.breakfast.reduce((s, m) => s + m.foodItem.protein * m.servings, 0),
    lunch:     mealsByType.lunch.reduce((s, m) => s + m.foodItem.protein * m.servings, 0),
    dinner:    mealsByType.dinner.reduce((s, m) => s + m.foodItem.protein * m.servings, 0),
    snack:     mealsByType.snack.reduce((s, m) => s + m.foodItem.protein * m.servings, 0),
  };

  // Hourly energy curve (uses real meal data, normalised)
  const hourlyEnergyData = [
    { hour: '6 AM',  energy: 65,  glucose: 80,  calories: 0 },
    { hour: '8 AM',  energy: 80 + Math.min(20, calsByMeal.breakfast / 30), glucose: 85 + Math.min(30, calsByMeal.breakfast / 20), calories: calsByMeal.breakfast },
    { hour: '10 AM', energy: 85,  glucose: 90,  calories: 0 },
    { hour: '12 PM', energy: 75 + Math.min(25, calsByMeal.lunch / 30), glucose: 88 + Math.min(35, calsByMeal.lunch / 18), calories: calsByMeal.lunch },
    { hour: '3 PM',  energy: 78 + Math.min(15, calsByMeal.snack / 25),  glucose: 85 + Math.min(20, calsByMeal.snack / 15), calories: calsByMeal.snack },
    { hour: '7 PM',  energy: 80 + Math.min(20, calsByMeal.dinner / 28), glucose: 88 + Math.min(30, calsByMeal.dinner / 18), calories: calsByMeal.dinner },
    { hour: '10 PM', energy: 70,  glucose: 82,  calories: 0 },
  ];

  // Pie chart data — only real meals
  const mealGroups: Record<string, number> = {};
  loggedMeals.forEach((m) => {
    mealGroups[m.mealType] = (mealGroups[m.mealType] || 0) + m.foodItem.calories * m.servings;
  });
  const pieData      = Object.entries(mealGroups).map(([name, value]) => ({ name: name.toUpperCase(), value }));
  const pieColors    = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  // ── Weekly Trend: today = real data, rest = from plan ────────────────────
  const dayLabels    = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayDayIdx  = (new Date().getDay() + 6) % 7;

  const weeklyTrend = dayLabels.map((label, idx) => {
    const dayPlan   = WEEK_PLAN[idx] || WEEK_PLAN[0];
    const planMeals = Object.values(dayPlan.meals);
    const planCals  = planMeals.reduce((s, m) => s + m.calories, 0);
    const planPro   = planMeals.reduce((s, m) => s + m.protein, 0);
    const planCarbs = planMeals.reduce((s, m) => s + m.carbs, 0);

    const isToday  = idx === todayDayIdx;
    const dayCals  = isToday ? totalCal  : planCals;
    const dayPro   = isToday ? totalPro  : planPro;
    const dayCarbs = isToday ? totalCarbs : planCarbs;

    return {
      day:      isToday ? `${label} ★` : label,
      calories: dayCals,
      target:   macroGoals.calories || 2000,
      protein:  Math.round(dayPro),
      carbs:    Math.round(dayCarbs),
      isToday,
    };
  });

  const minCalVal = Math.max(0, Math.min(...weeklyTrend.map((d) => d.calories), macroGoals.calories || 2000) - 300);
  const maxCalVal = Math.max(...weeklyTrend.map((d) => d.calories), macroGoals.calories || 2000) + 300;

  // ── History from dailyLogs ────────────────────────────────────────────────
  const historyDates = Object.keys(dailyLogs).sort().reverse().slice(0, 14); // last 14 days

  const tooltipStyle = {
    backgroundColor: dark ? '#18181b' : '#ffffff',
    border: `1px solid ${dark ? '#3f3f46' : '#e5e7eb'}`,
    borderRadius: '12px',
    color: dark ? '#f4f4f5' : '#111827',
    fontSize: '12px',
  };

  // ── Empty state helper ────────────────────────────────────────────────────
  const NoDataState = ({ message }: { message: string }) => (
    <div className={`text-center py-12 ${muted}`}>
      <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
      <p className="text-sm font-medium">{message}</p>
      <p className="text-xs mt-1 opacity-70">Log your first meal to see data here</p>
      <button
        onClick={() => setActiveTab('scanner')}
        className="mt-3 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
      >
        <Camera className="w-3.5 h-3.5 inline mr-1" />Scan Food Now
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-200`}>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className={`rounded-2xl border p-5 ${card} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
          <div>
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <ChartIcon className="w-4 h-4 text-blue-400" />
              <h1 className={`text-base font-extrabold ${txt}`}>Performance Analytics &amp; Daily Analysis</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                LIVE SYNC
              </span>
            </div>
            <p className={`text-xs ${muted}`}>
              Real-time data from today's {loggedMeals.length} logged meal{loggedMeals.length !== 1 ? 's' : ''} ·{' '}
              {streakDays > 0 ? `🔥 ${streakDays}-day streak` : 'Start logging to build your streak'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className={`flex gap-1 p-1 rounded-xl border ${dark ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-100 border-gray-200'}`}>
            {[
              { id: 'daily',     label: '📅 Daily'   },
              { id: 'weekly',    label: '📊 Weekly'  },
              { id: 'nutrition', label: '🥗 Macros'  },
              { id: 'history',   label: '📋 History' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setView(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${view === t.id ? tabActive : tabInactive}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Summary Stats (always visible) ───────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Today's Intake",  value: totalCal === 0 ? '0 kcal' : `${totalCal} kcal`, sub: `${Math.round((totalCal / (macroGoals.calories || 1)) * 100)}% of TDEE`, color: totalCal === 0 ? muted : 'text-orange-400', bg: totalCal === 0 ? (dark ? 'bg-zinc-800' : 'bg-gray-100') : 'bg-orange-500/10', icon: Flame },
            { label: 'Protein',         value: `${Math.round(totalPro)}g`,           sub: `Goal: ${macroGoals.proteinGrams}g`,                color: totalPro === 0 ? muted : 'text-blue-400',    bg: totalPro === 0 ? (dark ? 'bg-zinc-800' : 'bg-gray-100') : 'bg-blue-500/10',    icon: Zap },
            { label: 'Water Today',     value: `${waterIntakeLiters}L`,               sub: `${Math.round((waterIntakeLiters / (macroGoals.waterLiters || 1)) * 100)}% hydrated`, color: waterIntakeLiters === 0 ? muted : 'text-cyan-400', bg: waterIntakeLiters === 0 ? (dark ? 'bg-zinc-800' : 'bg-gray-100') : 'bg-cyan-500/10', icon: Droplets },
            { label: 'Food Budget',     value: formatInr(totalSpend),                sub: `/ ${formatInr(userProfile.dailyBudgetInr)} daily`,  color: totalSpend === 0 ? muted : totalSpend <= userProfile.dailyBudgetInr ? 'text-emerald-400' : 'text-red-400', bg: totalSpend === 0 ? (dark ? 'bg-zinc-800' : 'bg-gray-100') : totalSpend <= userProfile.dailyBudgetInr ? 'bg-emerald-500/10' : 'bg-red-500/10', icon: Target },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`rounded-2xl border p-4 ${card}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${s.bg}`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className={`text-base font-extrabold ${s.color}`}>{s.value}</div>
                <div className={`text-xs font-semibold ${txt}`}>{s.label}</div>
                <div className={`text-[10px] ${muted}`}>{s.sub}</div>
              </div>
            );
          })}
        </div>

        {/* ══ VIEW 1: DAILY ════════════════════════════════════════════════ */}
        {view === 'daily' && (
          <div className="space-y-5">

            {/* Meal-by-Meal Breakdown */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className={`text-sm font-extrabold flex items-center gap-2 ${txt}`}>
                  <Clock className="w-4 h-4 text-blue-400" />
                  Today's Meal-by-Meal Breakdown
                </h2>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${loggedMeals.length === 0 ? 'bg-zinc-800 text-zinc-400' : 'bg-blue-500/15 text-blue-400'}`}>
                  {loggedMeals.length} Meals Logged
                </span>
              </div>

              {loggedMeals.length === 0 ? (
                <NoDataState message="No meals logged today" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { title: 'Breakfast', icon: Sun,     color: 'text-amber-400',   cals: calsByMeal.breakfast, pro: proByMeal.breakfast, meals: mealsByType.breakfast },
                    { title: 'Lunch',     icon: Utensils, color: 'text-blue-400',   cals: calsByMeal.lunch,     pro: proByMeal.lunch,     meals: mealsByType.lunch },
                    { title: 'Dinner',    icon: Sunset,  color: 'text-purple-400',  cals: calsByMeal.dinner,    pro: proByMeal.dinner,    meals: mealsByType.dinner },
                    { title: 'Snacks',    icon: Coffee,  color: 'text-emerald-400', cals: calsByMeal.snack,     pro: proByMeal.snack,     meals: mealsByType.snack },
                  ].map((m) => {
                    const Icon = m.icon;
                    return (
                      <div key={m.title} className={`p-4 rounded-xl border ${inner} ${dark ? 'border-zinc-800' : 'border-gray-200'} flex flex-col justify-between`}>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-extrabold flex items-center gap-1.5 ${m.color}`}>
                              <Icon className="w-4 h-4" /> {m.title}
                            </span>
                            <span className={`text-[10px] font-bold ${muted}`}>{m.meals.length} item(s)</span>
                          </div>
                          <div className={`text-lg font-black ${m.cals === 0 ? muted : txt}`}>{m.cals} kcal</div>
                          <div className={`text-xs font-semibold ${m.cals === 0 ? 'text-zinc-600' : 'text-blue-400'}`}>{Math.round(m.pro)}g Protein</div>
                        </div>
                        <div className={`mt-3 pt-2 border-t ${dark ? 'border-zinc-700' : 'border-gray-200'} text-[10px] ${muted} space-y-1`}>
                          {m.meals.length > 0 ? (
                            m.meals.map((item) => (
                              <div key={item.id} className="truncate font-medium">
                                • {item.foodItem.name} ({item.foodItem.calories * item.servings} kcal)
                              </div>
                            ))
                          ) : (
                            <span className="italic text-zinc-600">No meal logged</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Hourly Energy Curve */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className={`text-sm font-extrabold flex items-center gap-2 ${txt}`}>
                    <HeartPulse className="w-4 h-4 text-emerald-400" />
                    Estimated Daily Energy &amp; Glucose Curve
                  </h2>
                  <p className={`text-xs ${muted}`}>
                    {loggedMeals.length === 0
                      ? 'Curve will adjust as you log meals throughout the day'
                      : 'Curve reflects your actual logged meal timing'}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400">
                  Optimal 80–120 mg/dL
                </span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={hourlyEnergyData}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" tick={{ fill: axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: axis, fontSize: 11 }} axisLine={false} tickLine={false} domain={[50, 140]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="glucose" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" fill="none" name="Glucose (mg/dL)" />
                  <Area type="monotone" dataKey="energy"  stroke="#10b981" strokeWidth={2.5} fill="url(#energyGrad)" name="Energy Level (%)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ══ VIEW 2: WEEKLY ═══════════════════════════════════════════════ */}
        {view === 'weekly' && (
          <div className="space-y-5">
            <div className={`rounded-2xl border p-5 ${card}`}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className={`text-sm font-extrabold ${txt}`}>📊 Weekly Calories vs TDEE Target</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400">
                    ─ TDEE {macroGoals.calories} kcal
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400">
                    ★ = Today (Real Data)
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={weeklyTrend}>
                  <defs>
                    <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: axis, fontSize: 11 }} axisLine={false} tickLine={false} domain={[minCalVal, maxCalVal]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="target"   stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" fill="none"            name="TDEE Target" />
                  <Area type="monotone" dataKey="calories" stroke="#3b82f6" strokeWidth={2.5} fill="url(#calGrad)"                         name="Calories" />
                </AreaChart>
              </ResponsiveContainer>
              <p className={`text-[10px] ${muted} mt-2 text-center`}>
                Other days use your Meal Planner targets · Today (★) reflects your actual logged meals
              </p>
            </div>

            <div className={`rounded-2xl border p-5 ${card}`}>
              <h2 className={`text-sm font-extrabold mb-4 ${txt}`}>💪 Weekly Protein &amp; Carbs Breakdown</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyTrend} barGap={2}>
                  <XAxis dataKey="day" tick={{ fill: axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: axis, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: axis }} />
                  <Bar dataKey="protein" name="Protein (g)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="carbs"   name="Carbs (g)"   fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ══ VIEW 3: NUTRITION / MACROS ════════════════════════════════════ */}
        {view === 'nutrition' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Meal Distribution Pie */}
              <div className={`rounded-2xl border p-5 ${card}`}>
                <h2 className={`text-sm font-extrabold mb-4 ${txt}`}>🥗 Today's Meal Distribution</h2>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', color: axis }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <NoDataState message="Log meals to see your distribution" />
                )}
              </div>

              {/* Macro Completion Bars */}
              <div className={`rounded-2xl border p-5 ${card} flex flex-col justify-between`}>
                <h2 className={`text-sm font-extrabold mb-3 ${txt}`}>📊 Daily Macro Completion</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Calories', current: totalCal,   target: macroGoals.calories,     unit: 'kcal', color: 'bg-orange-500' },
                    { label: 'Protein',  current: totalPro,   target: macroGoals.proteinGrams,  unit: 'g',    color: 'bg-blue-500'   },
                    { label: 'Carbs',    current: totalCarbs, target: macroGoals.carbsGrams,    unit: 'g',    color: 'bg-amber-500'  },
                    { label: 'Fat',      current: totalFat,   target: macroGoals.fatGrams,      unit: 'g',    color: 'bg-emerald-500'},
                    { label: 'Fiber',    current: totalFiber, target: 30,                       unit: 'g',    color: 'bg-purple-500' },
                  ].map((m) => {
                    const pct = Math.min(100, Math.round((m.current / (m.target || 1)) * 100));
                    return (
                      <div key={m.label}>
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className={txt}>{m.label}</span>
                          <span className={muted}>{Math.round(m.current)} / {m.target} {m.unit} ({pct}%)</span>
                        </div>
                        <div className={`h-2 rounded-full ${inner}`}>
                          <div className={`h-2 rounded-full ${pct === 0 ? (dark ? 'bg-zinc-700' : 'bg-gray-300') : m.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {loggedMeals.length === 0 && (
                  <p className={`text-[11px] ${muted} text-center mt-3`}>Bars fill as you log meals</p>
                )}
              </div>
            </div>

            {/* Food quality summary */}
            {loggedMeals.length > 0 && (
              <div className={`rounded-2xl border p-5 ${card}`}>
                <h2 className={`text-sm font-extrabold mb-4 ${txt}`}>🏷️ Logged Food Summary</h2>
                <div className="space-y-2">
                  {loggedMeals.map((meal) => (
                    <div key={meal.id} className={`flex items-center justify-between p-3 rounded-xl ${inner}`}>
                      <div>
                        <p className={`text-xs font-bold ${txt}`}>{meal.foodItem.name}</p>
                        <p className={`text-[10px] ${muted}`}>{meal.mealType} · {meal.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-extrabold ${txt}`}>{meal.foodItem.calories * meal.servings} kcal</p>
                        <p className="text-[10px] text-blue-400">{Math.round(meal.foodItem.protein * meal.servings)}g P · {Math.round(meal.foodItem.carbs * meal.servings)}g C · {Math.round(meal.foodItem.fat * meal.servings)}g F</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ VIEW 4: HISTORY ══════════════════════════════════════════════ */}
        {view === 'history' && (
          <div className="space-y-5">
            <div className={`rounded-2xl border p-5 ${card}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-sm font-extrabold flex items-center gap-2 ${txt}`}>
                  <CalendarDays className="w-4 h-4 text-blue-400" />
                  Past Daily Logs
                </h2>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${dark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-500'}`}>
                  {historyDates.length} days recorded
                </span>
              </div>

              {historyDates.length === 0 ? (
                <div className={`text-center py-12 ${muted}`}>
                  <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">No history yet</p>
                  <p className="text-xs mt-1 opacity-70">Past days will automatically appear here as you track daily</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyDates.map((dateKey) => {
                    const log     = dailyLogs[dateKey];
                    const dayCal  = log.meals.reduce((s, m) => s + m.foodItem.calories * m.servings, 0);
                    const dayPro  = log.meals.reduce((s, m) => s + m.foodItem.protein  * m.servings, 0);
                    const dayPct  = Math.min(100, Math.round((dayCal / (macroGoals.calories || 1)) * 100));
                    const isGood  = dayPct >= 80 && dayPct <= 115;
                    return (
                      <div key={dateKey} className={`p-4 rounded-xl border ${dark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-extrabold ${txt}`}>{dateKey}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isGood ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                              {isGood ? '✅ On Track' : dayPct < 80 ? '⬇️ Under' : '⬆️ Over'}
                            </span>
                            <span className={`text-xs font-bold ${txt}`}>{dayCal} kcal</span>
                          </div>
                        </div>
                        <div className={`h-1.5 rounded-full ${dark ? 'bg-zinc-700' : 'bg-gray-200'} mb-2`}>
                          <div className={`h-1.5 rounded-full transition-all duration-500 ${isGood ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${dayPct}%` }} />
                        </div>
                        <div className="flex gap-4 text-[10px] font-semibold">
                          <span className="text-blue-400">{Math.round(dayPro)}g Protein</span>
                          <span className="text-cyan-400">{log.waterIntakeLiters}L Water</span>
                          <span className={muted}>{log.meals.length} meals · {dayPct}% of goal</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Scanner stats */}
            <div className={`rounded-2xl border p-5 ${card}`}>
              <h2 className={`text-sm font-extrabold mb-4 flex items-center gap-2 ${txt}`}>
                <Camera className="w-4 h-4 text-blue-400" /> AI Scanner Stats
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Total Scans Today', val: scannedFoods.length,  color: 'text-blue-400'    },
                  { label: 'Meals Logged Today', val: loggedMeals.length,  color: 'text-emerald-400' },
                  { label: 'Days Tracked',       val: historyDates.length + (loggedMeals.length > 0 ? 1 : 0), color: 'text-purple-400' },
                  { label: 'Streak',             val: `${streakDays}d`,    color: 'text-amber-400'   },
                ].map((s) => (
                  <div key={s.label} className={`p-3 rounded-xl border ${inner} ${dark ? 'border-zinc-800' : 'border-gray-200'}`}>
                    <div className={`text-[10px] font-bold uppercase ${muted}`}>{s.label}</div>
                    <div className={`text-base font-extrabold mt-0.5 ${s.color}`}>{s.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
