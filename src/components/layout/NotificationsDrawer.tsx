import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, ShieldAlert, AlertTriangle, Clock, Fuel, Package } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ 
  isOpen, 
  onClose,
  onNavigateToTab 
}) => {
  const { state } = useApp();

  if (!isOpen) return null;

  const criticalDefectVehicles = state.vehicles.filter(v => v.hasCriticalDefect);
  const pendingTrips = state.trips.filter(t => t.status === 'pending_operations_approval' || t.status === 'pending_yard_verification');
  const lowStockParts = state.parts.filter(p => p.currentStock <= p.minimumStock);
  const fuelExceptions = state.fuelTransactions.filter(f => f.hasException);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Operational Action Queue
            </h3>
            <p className="text-xs text-slate-400">Items requiring supervisory intervention</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Critical Defects Section */}
          {criticalDefectVehicles.length > 0 && (
            <div className="bg-red-950/30 border border-red-800/60 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Critical Defects (Dispatch Blocked)
              </div>
              <div className="space-y-2">
                {criticalDefectVehicles.map(v => (
                  <div key={v.id} className="bg-slate-900/90 p-2.5 rounded border border-red-900/40 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>{v.fleetNumber} ({v.registrationNumber})</span>
                      <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded">LOCKED</span>
                    </div>
                    <p className="text-slate-400 mt-1 text-[11px]">{v.criticalDefectReason}</p>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToTab('safety');
                      }}
                      className="mt-2 text-red-400 hover:text-red-300 text-[11px] font-semibold underline flex items-center gap-1"
                    >
                      View in Safety & Inspections →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Trip Approvals */}
          {pendingTrips.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4 text-amber-500" />
                Pending Trip Clearances ({pendingTrips.length})
              </div>
              <div className="space-y-2">
                {pendingTrips.map(trip => (
                  <div key={trip.id} className="bg-slate-900/80 p-2.5 rounded border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-200">
                      <span>{trip.tripReference}</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded uppercase">
                        {trip.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-1">
                      {trip.origin} → {trip.destination}
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToTab('trips');
                      }}
                      className="mt-2 text-amber-400 hover:text-amber-300 text-[11px] font-semibold underline"
                    >
                      Process in Trips & Dispatch →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Parts */}
          {lowStockParts.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-orange-400 font-semibold text-xs uppercase tracking-wider">
                <Package className="w-4 h-4 text-orange-500" />
                Central Stores Low Stock ({lowStockParts.length})
              </div>
              <div className="space-y-2">
                {lowStockParts.map(part => (
                  <div key={part.id} className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{part.partName}</span>
                      <span className="font-mono text-red-400 font-bold text-xs">{part.currentStock} {part.unitOfMeasure}</span>
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5 flex items-center justify-between">
                      <span>Code: {part.partCode}</span>
                      <span>Min: {part.minimumStock} {part.unitOfMeasure}</span>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToTab('stores');
                      }}
                      className="mt-1.5 text-blue-400 hover:text-blue-300 text-[11px] font-semibold underline"
                    >
                      Restock via Stores →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fuel Exceptions */}
          {fuelExceptions.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-yellow-400 font-semibold text-xs uppercase tracking-wider">
                <Fuel className="w-4 h-4 text-yellow-500" />
                Fuel Consumption Anomalies ({fuelExceptions.length})
              </div>
              <div className="space-y-2">
                {fuelExceptions.map(f => (
                  <div key={f.id} className="bg-slate-900 p-2.5 rounded border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-200">
                      <span>{f.transactionReference}</span>
                      <span className="text-yellow-400 font-mono font-bold">{f.consumptionLitersPer100Km} L/100km</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">{f.exceptionReason}</p>
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateToTab('fuel');
                      }}
                      className="mt-1.5 text-yellow-400 hover:text-yellow-300 text-[11px] font-semibold underline"
                    >
                      Review Fuel Log →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {criticalDefectVehicles.length === 0 && pendingTrips.length === 0 && lowStockParts.length === 0 && fuelExceptions.length === 0 && (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-medium">All systems normal</p>
              <p className="text-xs text-slate-400">No urgent operational bottlenecks or critical defect blocks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
