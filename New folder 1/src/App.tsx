import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CustomMealPlanner } from './components/CustomMealPlanner';
import { FoodScannerView } from './components/FoodScannerView';
import { AnalyticsView } from './components/AnalyticsView';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { CookieConsentBanner, LegalModal } from './components/LegalModals';
import { SupportBugModal } from './components/SupportBugModal';

export function App() {
  const { activeTab, isDarkMode, isAuthenticated, checkAndResetForNewDay } = useAppStore();
  const [isWizardOpen, setIsWizardOpen]       = useState<boolean>(false);
  const [legalModalType, setLegalModalType]   = useState<'privacy' | 'terms' | null>(null);
  const [supportModalMode, setSupportModalMode] = useState<'support' | 'bug' | null>(null);

  // ── Sync dark mode class ──────────────────────────────────────────────────
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else            document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // ── Daily reset check on app mount ───────────────────────────────────────
  // Also set up a midnight check interval so a tab left open overnight auto-resets
  useEffect(() => {
    checkAndResetForNewDay();

    // Re-check every 60 seconds so an overnight open tab resets properly
    const interval = setInterval(() => {
      checkAndResetForNewDay();
    }, 60_000);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Open Auth Modal when not logged in ───────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) setIsWizardOpen(true);
  }, [isAuthenticated]);

  const bg        = isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-gray-900';
  const footerBg  = isDarkMode ? 'bg-zinc-950 border-zinc-900' : 'bg-white border-gray-200';
  const footerTxt = isDarkMode ? 'text-zinc-400' : 'text-gray-500';

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500 selection:text-white flex flex-col transition-colors duration-200 ${bg}`}>
      <Navbar onOpenAuth={() => setIsWizardOpen(true)} />

      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView onOpenWizard={() => setIsWizardOpen(true)} />
        )}
        {activeTab === 'meals' && (
          <div className="max-w-5xl mx-auto px-4 py-6">
            <CustomMealPlanner />
          </div>
        )}
        {activeTab === 'scanner'   && <FoodScannerView />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'profile'   && (
          <ProfileView onOpenWizard={() => setIsWizardOpen(true)} />
        )}
      </main>

      {/* Global Footer */}
      <footer className={`border-t py-8 px-4 text-xs ${footerBg} ${footerTxt}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`font-extrabold font-heading text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              TRAC<span className="text-[#4CAF50]">ker</span>
            </span>
            <span>•</span>
            <span className="font-body">AI Food Scanner &amp; Nutrition Coach</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold">
            <button onClick={() => setLegalModalType('privacy')}        className="hover:text-[#4CAF50] transition">Privacy Policy</button>
            <button onClick={() => setLegalModalType('terms')}          className="hover:text-[#4CAF50] transition">Terms of Service</button>
            <button onClick={() => setSupportModalMode('support')}      className="hover:text-[#4CAF50] transition">Contact Support</button>
            <button onClick={() => setSupportModalMode('bug')}          className="text-amber-500 hover:text-amber-400 transition">🐛 Report Bug</button>
          </div>
          <p>© 2026 TRACker AI. All rights reserved.</p>
        </div>
      </footer>

      <CookieConsentBanner />
      <LegalModal type={legalModalType} onClose={() => setLegalModalType(null)} />
      <SupportBugModal mode={supportModalMode} onClose={() => setSupportModalMode(null)} />

      {isWizardOpen && (
        <AuthModal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          initialTab={isAuthenticated ? 'wizard' : 'login'}
        />
      )}
    </div>
  );
}

export default App;
