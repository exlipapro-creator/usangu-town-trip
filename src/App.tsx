import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { NotificationsDrawer } from './components/layout/NotificationsDrawer';
import { OperationsDashboard } from './components/dashboard/OperationsDashboard';
import { FleetManagement } from './components/fleet/FleetManagement';
import { TripManagement } from './components/trips/TripManagement';
import { WorkshopManagement } from './components/workshop/WorkshopManagement';
import { StoresManagement } from './components/stores/StoresManagement';
import { FuelManagement } from './components/fuel/FuelManagement';
import { GpsMonitoring } from './components/gps/GpsMonitoring';
import { SafetyManagement } from './components/safety/SafetyManagement';
import { ReportsManagement } from './components/reports/ReportsManagement';
import { AuditAndAdmin } from './components/admin/AuditAndAdmin';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Global Quick Action triggers
  const [openCreateTripModal, setOpenCreateTripModal] = useState(false);
  const [openReportBreakdownModal, setOpenReportBreakdownModal] = useState(false);
  const [openRecordFuelModal, setOpenRecordFuelModal] = useState(false);

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Enterprise Top Header */}
      <Header 
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onNavigateToTab={navigateToTab}
      />

      {/* Main Workspace with Sidebar & Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {/* Dynamic Operational Module Display */}
        <main className="flex-1 overflow-y-auto bg-slate-900/40">
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
        </main>
      </div>

      {/* Notifications Drawer */}
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
