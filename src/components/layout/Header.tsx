import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_USERS } from '../../data/mockData';
import { 
  Menu, Bell, UserCheck, RotateCcw, Clock, 
  MapPin, Truck, Wrench, ShieldAlert, CheckCircle2, X
} from 'lucide-react';
import { BUTTON_VARIANTS, USANGU_BRAND } from '../../theme/brand';

interface HeaderProps {
  onOpenMobileNav: () => void;
  onOpenNotifications: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenMobileNav, 
  onOpenNotifications, 
  onNavigateToTab 
}) => {
  const { state, switchUser, resetToDemoData } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB', { 
        timeZone: 'Africa/Dar_es_Salaam',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }) + ' EAT');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeTripsCount = state.trips.filter(t => t.status === 'in_progress').length;
  const workshopCount = state.vehicles.filter(v => v.status === 'under_maintenance' || v.status === 'breakdown').length;
  const criticalDefectCount = state.vehicles.filter(v => v.hasCriticalDefect).length;
  const pendingApprovalsCount = state.trips.filter(t => t.status === 'pending_operations_approval' || t.status === 'pending_yard_verification').length;
  const lowStockCount = state.parts.filter(p => p.currentStock <= p.minimumStock).length;

  const totalAlerts = criticalDefectCount + pendingApprovalsCount + lowStockCount;

  return (
    <header className="no-print bg-[#05080f] border-b border-slate-800/80 sticky top-0 z-30 shadow-md">
      <div className="px-3 sm:px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Mobile Navigation Trigger & Brand Lockup */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Navigation Toggle (Visible on screens < 1024px) */}
          <button
            onClick={onOpenMobileNav}
            aria-label="Open Navigation Menu"
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-850 active:bg-slate-800 transition-colors touch-target flex items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            <Menu className="w-5 h-5 text-amber-400" />
          </button>

          {/* Official Usangu Logistics Brand Mark */}
          <div 
            onClick={() => onNavigateToTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            {/* Corporate Logo Badge (Navy Blue shield with Crimson & Gold wings) */}
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 border border-blue-700/60 flex items-center justify-center shadow-lg relative overflow-hidden shrink-0">
              {/* Crimson diagonal stripe accent */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rotate-45 transform"></div>
              <span className="font-black text-sm sm:text-base tracking-wider text-amber-400 font-sans">
                UL
              </span>
            </div>

            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm sm:text-base tracking-wide whitespace-nowrap">
                  USANGU LOGISTICS
                </span>
                <span className="hidden sm:inline-block bg-red-600/20 text-red-400 border border-red-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider whitespace-nowrap">
                  Tanzania
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                <span className="truncate hidden xs:inline">{USANGU_BRAND.tagline}</span>
                <span className="text-slate-600 hidden xs:inline">•</span>
                <span className="flex items-center gap-1 text-slate-300 whitespace-nowrap text-[10px] sm:text-[11px]">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  Dar es Salaam
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Operational Status Island (Visible on XL screens) */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-lg border border-slate-800/80 text-xs">
          <button 
            onClick={() => onNavigateToTab('trips')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-900 text-slate-300 transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Active Trips:</span>
            <span className="font-mono font-bold text-white bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded text-[11px] tabular-nums">
              {activeTripsCount}
            </span>
          </button>

          <button 
            onClick={() => onNavigateToTab('workshop')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-900 text-slate-300 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Workshop:</span>
            <span className="font-mono font-bold text-white bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded text-[11px] tabular-nums">
              {workshopCount}
            </span>
          </button>

          {criticalDefectCount > 0 ? (
            <button 
              onClick={() => onNavigateToTab('safety')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-950/60 hover:bg-red-900/60 text-red-200 border border-red-800/60 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Critical Defect:</span>
              <span className="font-mono font-bold text-white bg-red-600 text-white px-1.5 py-0.2 rounded text-[11px] tabular-nums">
                {criticalDefectCount}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Fleet Clear</span>
            </div>
          )}
        </div>

        {/* Right: Clock, Persona Dropdown, Alerts & Reset */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dar es Salaam Operational Clock */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950/70 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono text-slate-200 tabular-nums">{currentTime || '08:00:00 EAT'}</span>
          </div>

          {/* User & Role Switcher */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg p-1 sm:pr-2">
              <div className="w-7 h-7 rounded bg-blue-900/40 border border-blue-700/50 flex items-center justify-center text-blue-300 shrink-0">
                <UserCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="hidden lg:block text-left text-xs leading-tight">
                <div className="font-semibold text-slate-200 truncate max-w-[130px]">{state.currentUser.name}</div>
                <div className="text-[10px] text-amber-400 truncate max-w-[130px]">{state.currentUser.department}</div>
              </div>
              <select
                value={state.currentUser.id}
                onChange={(e) => switchUser(e.target.value)}
                aria-label="Switch User Persona and Operational Role"
                className="bg-slate-950 text-slate-200 text-xs rounded border border-slate-700 py-1 px-1.5 sm:px-2 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[180px] truncate"
              >
                {INITIAL_USERS.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role.replace(/_/g, ' ').toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            aria-label="Open Operational Action Queue"
            className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors touch-target flex items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-slate-950 tabular-nums">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Reset Baseline Data Button */}
          <button
            onClick={resetToDemoData}
            title="Reset verified baseline operational state"
            aria-label="Reset baseline state"
            className="hidden sm:flex p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors touch-target items-center justify-center focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
