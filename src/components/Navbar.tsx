import React from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import { Scan, Sun, Moon, Flame, Activity, Dumbbell, Pill, ShoppingBag, Utensils, Bot } from 'lucide-react';
import { getStartOfToday } from '../utils/nutritionUtils';

export const Navbar: React.FC = () => {
  const {
    user,
    activeTab,
    setActiveTab,
    setIsScannerOpen,
    isDarkMode,
    toggleDarkMode,
    mealLogs,
    userPlan,
  } = useApp();

  const todayStart = getStartOfToday();
  const todayCalories = Math.round(
    mealLogs
      .filter((log) => new Date(log.loggedAt) >= todayStart)
      .reduce((sum, log) => sum + log.calculatedNutrients.calories, 0)
  );
  const caloriePct = Math.min(100, Math.round((todayCalories / user.dailyCalorieTarget) * 100));

  const agentTabs: { id: ActiveTab; label: string; icon: any }[] = [
    { id: 'dashboard',   label: 'Dashboard',    icon: Activity   },
    { id: 'logs',        label: 'Meal Log',     icon: Utensils   },
    { id: 'coach',       label: 'AI Coach',     icon: Bot        },
    { id: 'medical',     label: 'Medical AI',   icon: Activity   },
    { id: 'workout',     label: 'Workout AI',   icon: Dumbbell   },
    { id: 'supplements', label: 'Supplements',  icon: Pill       },
    { id: 'grocery',     label: 'Grocery AI',   icon: ShoppingBag},
  ];

  const dark = isDarkMode;

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-2.5 transition-all duration-300 ${
      dark ? 'bg-slate-900/95 border-slate-800/70' : 'bg-white/95 border-indigo-200/80 shadow-sm shadow-indigo-100'
    }`} data-testid="app-navbar">
      <div className="max-w-6xl mx-auto flex flex-col gap-2">

        {/* ── Top Header Row ─────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">

          {/* Brand */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
            data-testid="navbar-brand"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform font-heading font-extrabold text-lg">
              F
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className={`font-heading font-extrabold text-base tracking-tight ${dark ? 'text-slate-100' : 'text-indigo-950'}`}>
                  Forma <span className="text-indigo-500">AI</span>
                </h1>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${
                  dark
                    ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                    : 'bg-indigo-100 text-indigo-700 border-indigo-300/50'
                }`} data-testid="user-plan-badge">
                  {userPlan} Plan
                </span>
              </div>
              <p className={`text-[11px] font-medium ${dark ? 'text-slate-400' : 'text-indigo-400'}`}>
                WHO & ICMR-NIN Clinical Performance Suite
              </p>
            </div>
          </div>

          {/* Calorie Progress Bar */}
          <div className={`hidden sm:flex items-center gap-3 rounded-full px-4 py-1.5 border ${
            dark
              ? 'bg-slate-800/60 border-slate-700/50'
              : 'bg-indigo-50 border-indigo-200'
          }`} data-testid="calorie-progress-bar">
            <div className={`flex items-center gap-2 text-xs font-semibold ${dark ? 'text-slate-300' : 'text-indigo-700'}`}>
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>{todayCalories} / {Math.round(user.dailyCalorieTarget)} kcal today</span>
            </div>
            <div className={`w-16 h-2 rounded-full overflow-hidden ${dark ? 'bg-slate-700' : 'bg-indigo-100'}`}>
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${caloriePct}%` }}
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Scan Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-extrabold text-xs px-3 py-2 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
              data-testid="btn-scan-food-nav"
            >
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">Scan Food</span>
            </button>

            {/* Dark/Light Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl border transition-all ${
                dark
                  ? 'bg-slate-800/80 border-slate-700/60 text-amber-400 hover:bg-slate-700/80'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
              }`}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              data-testid="btn-theme-toggle"
            >
              {dark
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-indigo-500" />
              }
            </button>

            {/* Profile Avatar */}
            <button
              onClick={() => setActiveTab('profile')}
              className={`p-1.5 rounded-xl border transition-all ${
                activeTab === 'profile'
                  ? dark
                    ? 'bg-indigo-500/10 border-indigo-500/40'
                    : 'bg-indigo-100 border-indigo-400'
                  : dark
                    ? 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-700/80'
                    : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
              }`}
              data-testid="btn-profile"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center">
                {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
              </div>
            </button>

          </div>
        </div>

        {/* ── Secondary Sub-Navbar ───────────────────────────────── */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {agentTabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                  active
                    ? dark
                      ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 shadow'
                      : 'bg-indigo-100 text-indigo-700 border-indigo-400/50 shadow-sm'
                    : dark
                      ? 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800'
                      : 'text-indigo-400 border-transparent hover:text-indigo-700 hover:bg-indigo-50'
                }`}
                data-testid={`tab-${t.id}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
