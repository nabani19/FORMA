import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastContainer } from './components/ToastContainer';
import { Navbar } from './components/Navbar';
import { BottomNavigation } from './components/BottomNavigation';
import { OnboardingWizard } from './components/OnboardingWizard';
import { Dashboard } from './components/Dashboard';
import { MealLogView } from './components/MealLogView';
import { AnalyticsView } from './components/AnalyticsView';
import { CoachView } from './components/CoachView';
import { MedicalReportView } from './components/MedicalReportView';
import { WorkoutPlanView } from './components/WorkoutPlanView';
import { AestheticPhysiqueView } from './components/AestheticPhysiqueView';
import { SupplementView } from './components/SupplementView';
import { GroceryPlannerView } from './components/GroceryPlannerView';
import { ProfileView } from './components/ProfileView';
import { TrainerPortalView } from './components/TrainerPortalView';
import { ScannerModal } from './components/ScannerModal';
import { SaaSModals } from './components/SaaSModals';
import { PdfExportModal } from './components/PdfExportModal';
import { ProductionHealthModal } from './components/ProductionHealthModal';
import { SmoothScrollProvider } from './components/SmoothScrollProvider';
import { WifiOff } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { 
    activeTab, 
    isOnboardingCompleted, 
    isDarkMode,
    isOnline,
    isPdfExportModalOpen,
    setIsPdfExportModalOpen,
    isHealthModalOpen,
    setIsHealthModalOpen,
    t
  } = useApp();

  // Apply/remove .dark class on <html> for full-app dark/light mode
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!isOnboardingCompleted) {
    return (
      <div className={`min-h-screen flex flex-col font-body selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${
        isDarkMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-indigo-50 text-indigo-950'
      }`}>
        <OnboardingWizard />
        <SaaSModals />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-body selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${
      isDarkMode
        ? 'bg-slate-950 text-slate-100'
        : 'bg-indigo-50 text-indigo-950'
    }`}>
      
      {/* Phase 28: Offline Status Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 shadow-md animate-fade-in z-50">
          <WifiOff className="w-4 h-4" />
          <span>{t('offline_mode')}</span>
        </div>
      )}

      <Navbar />

      <main className="flex-1 pb-28 sm:pb-20">
        {activeTab === 'dashboard'   && <Dashboard />}
        {activeTab === 'logs'        && <MealLogView />}
        {activeTab === 'analytics'   && <AnalyticsView />}
        {activeTab === 'coach'       && <CoachView />}
        {activeTab === 'medical'     && <MedicalReportView />}
        {activeTab === 'workout'     && <WorkoutPlanView />}
        {activeTab === 'aesthetic'   && <AestheticPhysiqueView />}
        {activeTab === 'supplements' && <SupplementView />}
        {activeTab === 'grocery'     && <GroceryPlannerView />}
        {activeTab === 'profile'     && <ProfileView />}
        {activeTab === 'trainer'     && <TrainerPortalView />}
      </main>

      <ScannerModal />
      <SaaSModals />
      <PdfExportModal
        isOpen={isPdfExportModalOpen}
        onClose={() => setIsPdfExportModalOpen(false)}
      />
      <ProductionHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
      />
      <BottomNavigation />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <SmoothScrollProvider>
        <ToastContainer />
        <MainLayout />
      </SmoothScrollProvider>
    </AppProvider>
  );
}

export default App;
