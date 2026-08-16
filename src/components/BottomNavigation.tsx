import React, { useState } from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import { 
  Home, 
  Utensils, 
  BarChart3, 
  Bot, 
  Scan, 
  Menu, 
  X, 
  Activity, 
  Dumbbell, 
  Pill, 
  ShoppingCart, 
  UserCircle, 
  Sun, 
  Moon, 
  ShieldCheck, 
  LifeBuoy 
} from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsScannerOpen, 
    isDarkMode, 
    toggleDarkMode,
    setIsLegalModalOpen,
    setIsSupportModalOpen
  } = useApp();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);

  const mainNavItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home, isCenterScan: false },
    { id: 'logs' as const, label: 'Meals', icon: Utensils, isCenterScan: false },
    { id: 'scanner' as const, label: 'Scan', icon: Scan, isCenterScan: true },
    { id: 'coach' as const, label: 'Coach', icon: Bot, isCenterScan: false },
    { id: 'more' as const, label: 'More', icon: Menu, isCenterScan: false },
  ];

  const moreDrawerItems: Array<{ id: ActiveTab; label: string; icon: React.ComponentType<any>; color: string }> = [
    { id: 'medical', label: 'Medical Biomarkers', icon: Activity, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { id: 'workout', label: 'Workout Generator', icon: Dumbbell, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { id: 'supplements', label: 'Supplement Stack', icon: Pill, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    { id: 'grocery', label: 'Grocery Planner', icon: ShoppingCart, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
    { id: 'trainer', label: 'Trainer & Coach', icon: UserCircle, color: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30' },
    { id: 'analytics', label: 'Analytics & Trends', icon: BarChart3, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
    { id: 'profile', label: 'Profile & Subscription', icon: UserCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  ];

  const isMoreTabActive = ['medical', 'workout', 'supplements', 'grocery', 'analytics', 'profile', 'trainer'].includes(activeTab);

  const handleSelectDrawerItem = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      {/* 1. ANDROID MOBILE "MORE" BOTTOM SHEET DRAWER */}
      {isMoreMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md animate-fade-in flex flex-col justify-end"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div 
            className="w-full bg-slate-900 dark:bg-slate-950 border-t border-slate-800 rounded-t-3xl p-5 pb-8 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            data-testid="mobile-more-drawer"
          >
            {/* Drawer Drag Bar */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto" />

            <div className="flex items-center justify-between pt-1">
              <div>
                <h3 className="font-heading font-extrabold text-base text-slate-100">All Features & Health Tools</h3>
                <p className="text-xs text-slate-400">Tap any tool to navigate on your mobile device</p>
              </div>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                data-testid="btn-close-more-drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {moreDrawerItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectDrawerItem(item.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all active:scale-95 ${
                      isActive
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                        : 'bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-200 font-medium'
                    }`}
                    data-testid={`drawer-item-${item.id}`}
                  >
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs leading-snug">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Utility Quick Actions (Theme, Legal, Support) */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={toggleDarkMode}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  setIsLegalModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Privacy & Legal</span>
              </button>

              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  setIsSupportModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700"
              >
                <LifeBuoy className="w-4 h-4 text-cyan-400" />
                <span>Support</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ANDROID TOUCH-OPTIMIZED BOTTOM NAVIGATION BAR */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/80 pt-1.5 px-3 safe-area-bottom shadow-2xl"
        data-testid="bottom-navigation"
      >
        <div className="max-w-md mx-auto flex items-center justify-between relative pb-1">
          {mainNavItems.map((item) => {
            if (item.isCenterScan) {
              return (
                <button
                  key={item.id}
                  onClick={() => setIsScannerOpen(true)}
                  className="relative -top-5 flex flex-col items-center group focus:outline-none touch-target"
                  data-testid="bottom-nav-center-scan"
                  aria-label="Open AI Food Scanner"
                >
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 p-0.5 shadow-xl shadow-emerald-500/40 group-hover:scale-105 active:scale-95 transition-transform duration-200">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white">
                      <Scan className="w-6 h-6 text-emerald-400 group-hover:rotate-12 transition-transform" />
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-emerald-400 mt-0.5">Scan</span>
                </button>
              );
            }

            const Icon = item.icon;
            const isMore = item.id === 'more';
            const isActive = isMore ? isMoreTabActive : activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isMore) {
                    setIsMoreMenuOpen(!isMoreMenuOpen);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl transition-all duration-200 touch-target min-w-[56px] ${
                  isActive
                    ? 'text-emerald-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200 active:text-slate-100 font-medium'
                }`}
                data-testid={`bottom-nav-${item.id}`}
                aria-label={`Navigate to ${item.label}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[10px] sm:text-[11px] tracking-tight">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
