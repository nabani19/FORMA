import React, { useState, useRef, useEffect } from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import { 
  Scan, 
  Sun, 
  Moon, 
  Flame, 
  Activity, 
  Dumbbell, 
  Pill, 
  ShoppingBag, 
  Utensils, 
  Bot, 
  BarChart3, 
  ChevronDown, 
  Menu, 
  X,
  Globe,
  Mic,
  MicOff,
  FileText,
  Users,
  Server,
  Sparkles
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../utils/i18n';
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
    language,
    setLanguage,
    t,
    setIsPdfExportModalOpen,
    setIsHealthModalOpen,
    showToast,
  } = useApp();

  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMoreDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Phase 27: Web Speech Recognition API Integration
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice Recognition is not supported by your browser.', 'error');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'es' ? 'es-ES' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);
      showToast('🎙️ Listening... Speak a command or food name.', 'info');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setIsListening(false);
        showToast(`Heard: "${transcript}"`, 'info');

        // Command routing
        if (transcript.includes('scan') || transcript.includes('camera') || transcript.includes('photo')) {
          setIsScannerOpen(true);
        } else if (transcript.includes('workout') || transcript.includes('exercise') || transcript.includes('gym')) {
          setActiveTab('workout');
        } else if (transcript.includes('grocery') || transcript.includes('market') || transcript.includes('shopping')) {
          setActiveTab('grocery');
        } else if (transcript.includes('meal') || transcript.includes('log') || transcript.includes('food') || transcript.includes('diet')) {
          setActiveTab('logs');
        } else if (transcript.includes('coach') || transcript.includes('ai') || transcript.includes('chat')) {
          setActiveTab('coach');
        } else if (transcript.includes('blood') || transcript.includes('medical') || transcript.includes('report') || transcript.includes('lab')) {
          setActiveTab('medical');
        } else if (transcript.includes('trainer') || transcript.includes('client')) {
          setActiveTab('trainer');
        } else if (transcript.includes('pdf') || transcript.includes('export') || transcript.includes('print')) {
          setIsPdfExportModalOpen(true);
        } else {
          setActiveTab('logs');
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        showToast('Voice input timeout or cancelled.', 'warning');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      showToast('Microphone access blocked.', 'error');
    }
  };

  const todayStart = getStartOfToday();
  const todayCalories = Math.round(
    mealLogs
      .filter((log) => new Date(log.loggedAt) >= todayStart)
      .reduce((sum, log) => sum + (log.calculatedNutrients?.calories || 0), 0)
  );
  const caloriePct = Math.min(100, Math.round((todayCalories / (user.dailyCalorieTarget || 2000)) * 100));

  const allMoreTools: Array<{ id: string; label: string; sub: string; icon: React.ComponentType<any>; color: string; action?: () => void }> = [
    { id: 'logs',        label: 'Meal Log & Planner', sub: '5-Meals daily history & budget', icon: Utensils,    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'coach',       label: 'AI Nutrition Coach', sub: 'Interactive clinical advice',     icon: Bot,         color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { id: 'medical',     label: 'Medical Biomarkers', sub: 'Blood test report risk audit',    icon: Activity,    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { id: 'workout',     label: 'Workout Generator',  sub: '1,322+ exercises & 1RM engine',   icon: Dumbbell,    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    { id: 'supplements', label: 'Supplement Advisor', sub: 'Clinical stack & buy links',      icon: Pill,        color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { id: 'grocery',     label: 'Grocery AI Planner', sub: '2026 Indian market prices',       icon: ShoppingBag, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
    { id: 'trainer',     label: 'Trainer & Coach View', sub: 'Client roster & compliance',    icon: Users,       color: 'text-indigo-300 bg-indigo-500/15 border-indigo-500/30' },
    { id: 'analytics',   label: 'Analytics & Trends', sub: 'Macro adherence charts',          icon: BarChart3,   color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  ];

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab as ActiveTab);
    setIsMoreDropdownOpen(false);
  };

  const isCurrentTabInMore = ['logs', 'coach', 'medical', 'workout', 'supplements', 'grocery', 'analytics', 'trainer'].includes(activeTab);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b px-4 py-2.5 transition-all duration-300 bg-slate-900/90 border-slate-800/80 shadow-md" data-testid="app-navbar">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">

        {/* ── Brand Logo ─────────────────────────────────────────── */}
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
              <h1 className="font-heading font-extrabold text-base tracking-tight text-slate-100">
                Forma <span className="text-indigo-400">AI</span>
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase font-mono border bg-indigo-500/10 text-indigo-300 border-indigo-500/20" data-testid="user-plan-badge">
                {userPlan || 'Pro'}
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400">
              WHO & ICMR-NIN Clinical Performance Suite
            </p>
          </div>
        </div>

        {/* ── Calorie Progress Bar (Center) ───────────────────────── */}
        <div className="hidden md:flex items-center gap-3 rounded-full px-4 py-1.5 border bg-slate-950/70 border-slate-800 shadow-inner" data-testid="calorie-progress-bar">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{todayCalories} / {Math.round(user.dailyCalorieTarget || 2000)} kcal</span>
          </div>
          <div className="w-16 h-2 rounded-full overflow-hidden bg-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${caloriePct}%` }}
            />
          </div>
        </div>

        {/* ── Right Navigation & Controls ─────────────────────────── */}
        <div className="flex items-center gap-2">

          {/* Phase 27: Language Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Change Language"
            >
              <span>{currentLang.flag}</span>
              <span className="hidden sm:inline uppercase text-[11px] font-mono">{currentLang.code}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in backdrop-blur-2xl">
                <div className="text-[10px] font-bold uppercase font-mono text-slate-400 px-2 py-1 border-b border-slate-800 mb-1">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                      language === l.code
                        ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.nativeLabel}</span>
                    </span>
                    {language === l.code && <span className="text-[10px] text-emerald-400 font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Phase 27: Voice Assistant Button */}
          <button
            onClick={handleToggleVoice}
            className={`p-2 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse border-rose-400 shadow-lg shadow-rose-500/30'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/70 text-slate-300'
            }`}
            title="Speech Voice Assistant (Speak meal or command)"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* More Options Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsMoreDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                isMoreDropdownOpen || isCurrentTabInMore
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/70 text-slate-200'
              }`}
              data-testid="btn-more-options-nav"
              aria-label="More Features"
            >
              <Menu className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">
                {isCurrentTabInMore ? allMoreTools.find((t) => t.id === activeTab)?.label.split(' ')[0] || 'Features' : 'More Options'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Panel */}
            {isMoreDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-3 z-50 animate-fade-in backdrop-blur-2xl max-h-[85vh] overflow-y-auto">
                <div className="px-2.5 py-1.5 border-b border-slate-800/80 mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase font-mono text-slate-400 tracking-wider">
                    All AI Features & Clinical Tools
                  </span>
                  <button onClick={() => setIsMoreDropdownOpen(false)} className="text-slate-500 hover:text-slate-300 p-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {allMoreTools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = activeTab === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleSelectTab(tool.id)}
                        className={`w-full flex items-center gap-3 p-2 rounded-2xl text-left transition-all ${
                          isActive
                            ? 'bg-indigo-500/20 text-indigo-200 font-bold border border-indigo-500/30'
                            : 'hover:bg-slate-800/80 text-slate-300 hover:text-slate-100'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${tool.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate">{tool.label}</div>
                          <div className="text-[10px] text-slate-400 truncate">{tool.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Additional Clinical Shortcuts */}
                <div className="pt-2 border-t border-slate-800/80 mt-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsPdfExportModalOpen(true);
                      setIsMoreDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-bold text-indigo-300 hover:bg-slate-800/80 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Export Clinical PDF Report (1-Click)</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsHealthModalOpen(true);
                      setIsMoreDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs font-bold text-emerald-300 hover:bg-slate-800/80 transition-colors"
                  >
                    <Server className="w-4 h-4 text-emerald-400" />
                    <span>Production Health & OWASP Security</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Scan Food Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
            data-testid="btn-scan-food-nav"
          >
            <Scan className="w-4 h-4" />
            <span className="hidden sm:inline">Scan Food</span>
          </button>

          {/* Dark/Light Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-slate-700/60 bg-slate-800/80 text-amber-400 hover:bg-slate-700/80 transition-all"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            data-testid="btn-theme-toggle"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Profile Avatar */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`p-1.5 rounded-xl border transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-500/20 border-indigo-500/40'
                : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-700/80'
            }`}
            data-testid="btn-profile"
            title="Profile & Settings"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center">
              {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
            </div>
          </button>

        </div>
      </div>
    </header>
  );
};
