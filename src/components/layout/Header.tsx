import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_USERS } from '../../data/mockData';
import { 
  Truck, ShieldAlert, Wrench, Bell, UserCheck, 
  RotateCcw, Clock, MapPin, CheckCircle2 
} from 'lucide-react';

interface HeaderProps {
  onOpenNotifications: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNotifications, onNavigateToTab }) => {
  const { state, switchUser, resetToDemoData } = useApp();
  const [currentTime, setCurrentTime] = useState<string>('');

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
    <header className="no-print bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
      <div className="px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Context */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-950/40 text-slate-950 font-black text-xl tracking-wider">
            UL
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-wide">USANGU LOGISTICS</span>
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                Tanzania Operations
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Town Trip Fleet Management System</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-3 h-3 text-amber-500" />
                Dar es Salaam Hub
              </span>
            </div>
          </div>
        </div>

        {/* Live Operational Counters */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-950/60 p-1 rounded-lg border border-slate-800 text-xs">
          <button 
            onClick={() => onNavigateToTab('trips')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Active Trips:</span>
            <span className="font-bold text-white bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded text-[11px]">{activeTripsCount}</span>
          </button>

          <button 
            onClick={() => onNavigateToTab('workshop')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span>Workshop:</span>
            <span className="font-bold text-white bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded text-[11px]">{workshopCount}</span>
          </button>

          {criticalDefectCount > 0 ? (
            <button 
              onClick={() => onNavigateToTab('safety')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-950/40 hover:bg-red-900/50 text-red-200 border border-red-800/50 transition-colors animate-pulse"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span>Critical Defects:</span>
              <span className="font-bold text-white bg-red-500/30 text-red-200 px-1.5 py-0.2 rounded text-[11px]">{criticalDefectCount}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Safety Clear</span>
            </div>
          )}
        </div>

        {/* Right Section: Role Switcher, Clock, Notifications, Reset */}
        <div className="flex items-center gap-3">
          {/* Dar Clock */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/50 px-2.5 py-1.5 rounded border border-slate-800/80">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-slate-200">{currentTime || '08:00:00 EAT'}</span>
          </div>

          {/* User & Role Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700/60 rounded-lg p-1">
            <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-left text-xs pr-1">
              <div className="font-semibold text-slate-200 leading-tight">{state.currentUser.name}</div>
              <div className="text-[10px] text-amber-400 leading-tight">{state.currentUser.department}</div>
            </div>
            <select
              value={state.currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              aria-label="Switch User Persona & Role"
              className="bg-slate-900 text-slate-200 text-xs rounded border border-slate-700 py-1 px-2 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer"
            >
              {INITIAL_USERS.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role.replace('_', ' ').toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            aria-label="Open Operational Alerts"
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-slate-900">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={resetToDemoData}
            title="Reset system to verified demo baseline"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
