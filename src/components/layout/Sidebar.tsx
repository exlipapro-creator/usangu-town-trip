import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Truck, CalendarCheck, Wrench, Package, 
  Fuel, Navigation, ShieldCheck, FileSpreadsheet, History, X
} from 'lucide-react';
import { USANGU_BRAND } from '../../theme/brand';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  mobileOpen = false, 
  onCloseMobile 
}) => {
  const { state } = useApp();

  const activeTripsCount = state.trips.filter(t => t.status === 'in_progress').length;
  const pendingApprovalsCount = state.trips.filter(t => t.status === 'pending_operations_approval' || t.status === 'pending_yard_verification').length;
  const workshopActiveCount = state.workOrders.filter(w => w.stage !== 'released' && w.stage !== 'cancelled').length;
  const lowStockCount = state.parts.filter(p => p.currentStock <= p.minimumStock).length;
  const pendingPartsRequests = state.spareRequests.filter(s => s.status === 'pending_approval').length;
  const criticalDefectCount = state.vehicles.filter(v => v.hasCriticalDefect).length;
  const fuelExceptionsCount = state.fuelTransactions.filter(f => f.hasException).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Operations Dashboard',
      shortLabel: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'fleet',
      label: 'Fleet & Trailers',
      shortLabel: 'Fleet',
      icon: Truck,
      badge: state.vehicles.length.toString(),
      badgeColor: 'bg-slate-800 text-slate-300'
    },
    {
      id: 'trips',
      label: 'Trips & Dispatch',
      shortLabel: 'Trips',
      icon: CalendarCheck,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} req` : activeTripsCount > 0 ? `${activeTripsCount} active` : null,
      badgeColor: pendingApprovalsCount > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-blue-500/20 text-blue-300'
    },
    {
      id: 'workshop',
      label: 'Workshop & Repairs',
      shortLabel: 'Workshop',
      icon: Wrench,
      badge: workshopActiveCount > 0 ? `${workshopActiveCount} WOs` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300'
    },
    {
      id: 'stores',
      label: 'Stores & Spare Parts',
      shortLabel: 'Stores',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : pendingPartsRequests > 0 ? `${pendingPartsRequests} req` : null,
      badgeColor: lowStockCount > 0 ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
    },
    {
      id: 'fuel',
      label: 'Fuel Management',
      shortLabel: 'Fuel',
      icon: Fuel,
      badge: fuelExceptionsCount > 0 ? `${fuelExceptionsCount} flag` : null,
      badgeColor: 'bg-yellow-500/20 text-yellow-300'
    },
    {
      id: 'gps',
      label: 'GPS & Telematics',
      shortLabel: 'GPS Live',
      icon: Navigation,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300'
    },
    {
      id: 'safety',
      label: 'Safety & Compliance',
      shortLabel: 'Safety',
      icon: ShieldCheck,
      badge: criticalDefectCount > 0 ? `${criticalDefectCount} locked` : 'Clear',
      badgeColor: criticalDefectCount > 0 ? 'bg-red-600 text-white font-bold' : 'bg-emerald-500/20 text-emerald-300'
    },
    {
      id: 'reports',
      label: 'Shunting & Reports',
      shortLabel: 'Reports',
      icon: FileSpreadsheet,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'admin',
      label: 'Audit & System',
      shortLabel: 'Audit',
      icon: History,
      badge: null,
      badgeColor: ''
    }
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (
    <div className="flex flex-col h-full bg-[#05080f] select-none">
      {/* Mobile Drawer Header with Close Button */}
      {mobileOpen && (
        <div className="p-4 border-b border-slate-800 flex items-center justify-between lg:hidden bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-blue-900 border border-blue-700/60 flex items-center justify-center font-bold text-amber-400 text-xs">
              UL
            </div>
            <span className="font-extrabold text-white text-sm">USANGU LOGISTICS</span>
          </div>
          <button
            onClick={onCloseMobile}
            aria-label="Close Navigation Menu"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 touch-target flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation Links List */}
      <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Town Trip Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group cursor-pointer touch-target ${
                isActive
                  ? 'bg-blue-950/70 text-white border border-blue-700/60 shadow-sm relative'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {/* Active Brand Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r"></div>
              )}

              <div className="flex items-center gap-3 truncate pl-1">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-300'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 tabular-nums ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Fleet Scope:</span>
          <span className="text-slate-200 font-medium">Dedicated Town Trip</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Depot Hub:</span>
          <span className="text-amber-400 font-medium">Kurasini Yard</span>
        </div>
        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-900">
          Usangu Logistics (T) Ltd • 2026
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar (Visible on screens >= 1024px) */}
      <aside className="no-print hidden lg:flex flex-col w-64 shrink-0 border-r border-slate-800/80 bg-[#05080f] h-[calc(100vh-3.5rem)] sticky top-14 z-20">
        {navContent}
      </aside>

      {/* 2. Mobile / Tablet Slide-over Drawer (Visible on screens < 1024px when triggered) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Slide-over Drawer Container */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#05080f] shadow-2xl z-50 flex flex-col transform transition-transform ease-out duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
