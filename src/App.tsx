import React, { useState, Suspense, lazy } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';

// Route-level code splitting to optimize bundle delivery
const OperationsDashboard = lazy(() => 
  import('./components/dashboard/OperationsDashboard').then(m => ({ default: m.OperationsDashboard }))
);
const FleetManagement = lazy(() => 
  import('./components/fleet/FleetManagement').then(m => ({ default: m.FleetManagement }))
);
const TripManagement = lazy(() => 
  import('./components/trips/TripManagement').then(m => ({ default: m.TripManagement }))
);
const WorkshopManagement = lazy(() => 
  import('./components/workshop/WorkshopManagement').then(m => ({ default: m.WorkshopManagement }))
);
const StoresManagement = lazy(() => 
  import('./components/stores/StoresManagement').then(m => ({ default: m.StoresManagement }))
);
const FuelManagement = lazy(() => 
  import('./components/fuel/FuelManagement').then(m => ({ default: m.FuelManagement }))
);
const GpsMonitoring = lazy(() => 
  import('./components/gps/GpsMonitoring').then(m => ({ default: m.GpsMonitoring }))
);
const SafetyManagement = lazy(() => 
  import('./components/safety/SafetyManagement').then(m => ({ default: m.SafetyManagement }))
);
const ReportsManagement = lazy(() => 
  import('./components/reports/ReportsManagement').then(m => ({ default: m.ReportsManagement }))
);
const AuditAndAdmin = lazy(() => 
  import('./components/admin/AuditAndAdmin').then(m => ({ default: m.AuditAndAdmin }))
);

const ModuleFallback = () => (
  <div className="flex-1 flex items-center justify-center p-12 text-center text-slate-400">
    <div className="space-y-3">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto"></div>
      <p className="text-xs font-medium text-slate-400">Loading module workspace...</p>
    </div>
  </div>
);

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Global Quick Action modal flags
  const [openCreateTripModal, setOpenCreateTripModal] = useState(false);
  const [openReportBreakdownModal, setOpenReportBreakdownModal] = useState(false);
  const [openRecordFuelModal, setOpenRecordFuelModal] = useState(false);

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    setIsMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Enterprise Top Navigation Bar */}
      <Header 
        onOpenMobileNav={() => setIsMobileNavOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onNavigateToTab={navigateToTab}
      />

      {/* Main Container with Desktop Sidebar & Content Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Navigation Sidebar / Drawer */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          mobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Dynamic Operational Module Workspace */}
        <main className="flex-1 overflow-y-auto bg-[#080d16] w-full min-w-0">
          <Suspense fallback={<ModuleFallback />}>
            {activeTab === 'dashboard' && (
              <OperationsDashboard 
                onNavigateToTab={navigateToTab}
                onOpenCreateTrip={() => {
                  setActiveTab('trips');
                  setOpenCreateTripModal(true);
                }}
                onOpenReportBreakdown={() => {
                  setActiveTab('workshop');
                  setOpenReportBreakdownModal(true);
                }}
                onOpenRecordFuel={() => {
                  setActiveTab('fuel');
                  setOpenRecordFuelModal(true);
                }}
              />
            )}

            {activeTab === 'fleet' && (
              <FleetManagement />
            )}

            {activeTab === 'trips' && (
              <TripManagement 
                initialCreateOpen={openCreateTripModal}
              />
            )}

            {activeTab === 'workshop' && (
              <WorkshopManagement 
                initialReportBreakdownOpen={openReportBreakdownModal}
              />
            )}

            {activeTab === 'stores' && (
              <StoresManagement />
            )}

            {activeTab === 'fuel' && (
              <FuelManagement 
                initialOpenRecord={openRecordFuelModal}
              />
            )}

            {activeTab === 'gps' && (
              <GpsMonitoring />
            )}

            {activeTab === 'safety' && (
              <SafetyManagement />
            )}

            {activeTab === 'reports' && (
              <ReportsManagement />
            )}

            {activeTab === 'admin' && (
              <AuditAndAdmin />
            )}
          </Suspense>
        </main>
      </div>

      {/* Slide-over Notifications & Action Alert Drawer */}
      <NotificationsDrawer 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToTab={(tab) => {
          setIsNotificationsOpen(false);
          setActiveTab(tab);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
