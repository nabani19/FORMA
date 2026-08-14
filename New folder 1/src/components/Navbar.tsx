import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { LayoutDashboard, Utensils, Camera, LineChart, Flame, Sun, Moon, LogIn } from 'lucide-react';

interface NavItem {
  id: 'dashboard' | 'meals' | 'scanner' | 'analytics';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface Props {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenAuth }) => {
  const {
    activeTab, setActiveTab, streakDays,
    isDarkMode, toggleTheme, isAuthenticated,
    userProfile, loggedMeals, macroGoals
  } = useAppStore();

  // Live calorie progress for the navbar pill
  const totalCalToday = loggedMeals.reduce((s, m) => s + m.foodItem.calories * m.servings, 0);
  const calPct = Math.min(100, Math.round((totalCalToday / (macroGoals.calories || 1)) * 100));

  const navItems: NavItem[] = [
    { id: 'dashboard',  label: 'Dashboard',    icon: LayoutDashboard },
    { id: 'meals',      label: 'Meal Planner', icon: Utensils, badge: 'Glycemic' },
    { id: 'scanner',    label: 'AI Scanner',   icon: Camera,   badge: 'AI' },
    { id: 'analytics',  label: 'Analytics',    icon: LineChart },
  ];

  const navBg     = isDarkMode ? 'bg-zinc-950/90 border-zinc-800/80' : 'bg-white/95 border-gray-200';
  const tabActive   = 'bg-[#4CAF50] text-white shadow-nutriscan font-extrabold';
  const tabInactive = isDarkMode
    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
  const streakStyle = isDarkMode
    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
    : 'bg-amber-50 border-amber-200 text-amber-600';
  const pillBg       = isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-gray-100 border-gray-200';
  const themeBtnStyle = isDarkMode
    ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50';

  const userInitial = userProfile?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <nav className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b px-4 py-3 transition-colors duration-200 ${navBg}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* Brand */}
        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4CAF50] to-[#2196F3] flex items-center justify-center text-white font-black text-xl shadow-md group-hover:scale-105 transition">
            T
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className={`font-extrabold text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                TRAC<span className="text-[#4CAF50]">ker</span>
              </span>
              <span className="text-[10px] font-bold bg-[#4CAF50]/15 text-[#4CAF50] border border-[#4CAF50]/30 px-1.5 rounded-md">v3.0</span>
            </div>
            <p className={`text-[11px] font-medium leading-none ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              AI Food Scanner &amp; Nutrition Coach
            </p>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className={`flex items-center gap-1 p-1.5 rounded-full border ${pillBg}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            // Show live meal count badge on Dashboard tab
            const showMealCount = item.id === 'dashboard' && loggedMeals.length > 0;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-150 touch-target ${isActive ? tabActive : tabInactive}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
                {showMealCount && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${isActive ? 'bg-white/25 text-white' : 'bg-emerald-500/15 text-emerald-400'}`}>
                    {loggedMeals.length} meals
                  </span>
                )}
                {!showMealCount && item.badge && (
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase ${isActive ? 'bg-white/20 text-white' : 'bg-[#4CAF50]/15 text-[#4CAF50]'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Live calorie progress pill — only shows when meals are logged */}
          {loggedMeals.length > 0 && (
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-100 border-gray-200'}`}>
              <div className={`w-14 h-1.5 rounded-full ${isDarkMode ? 'bg-zinc-700' : 'bg-gray-300'}`}>
                <div
                  className="h-1.5 rounded-full bg-[#4CAF50] transition-all duration-500"
                  style={{ width: `${calPct}%` }}
                />
              </div>
              <span className={isDarkMode ? 'text-zinc-300' : 'text-gray-700'}>
                {totalCalToday} / {macroGoals.calories} kcal
              </span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-2.5 rounded-xl border text-xs font-bold transition touch-target ${themeBtnStyle}`}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>

          {/* Streak */}
          {streakDays > 0 && (
            <div className={`hidden sm:flex items-center gap-1.5 border px-3.5 py-2 rounded-full font-bold text-xs ${streakStyle}`}>
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>{streakDays}d Streak</span>
            </div>
          )}

          {/* Profile Avatar or Sign In */}
          {isAuthenticated ? (
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-10 h-10 rounded-full bg-[#4CAF50] flex items-center justify-center font-bold text-sm text-white border transition touch-target ${activeTab === 'profile' ? 'ring-2 ring-[#4CAF50] border-white' : 'border-[#4CAF50]/30 hover:border-white'}`}
              title="Profile & Settings"
            >
              {userInitial}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 rounded-xl bg-[#4CAF50] hover:bg-[#43a047] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-nutriscan transition touch-target"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
