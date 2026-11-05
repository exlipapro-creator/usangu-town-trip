import React from 'react';
import { useApp } from '../../context/AppContext';
import { isVehicleAvailable } from '../../services/store';
import { 
  Truck, CalendarCheck, Wrench, Package, Fuel, 
  ShieldCheck, Navigation, ArrowUpRight, ShieldAlert,
  AlertTriangle, CheckCircle2, Clock, PlusCircle
} from 'lucide-react';

interface OperationsDashboardProps {
  onNavigateToTab: (tab: string, filter?: string) => void;
  onOpenCreateTrip: () => void;
  onOpenReportBreakdown: () => void;
  onOpenRecordFuel: () => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  onNavigateToTab,
  onOpenCreateTrip,
  onOpenReportBreakdown,
  onOpenRecordFuel
}) => {
  const { state } = useApp();

  // A. Fleet Metrics
  const totalTrucks = state.vehicles.length;
  const totalTrailers = state.trailers.length;
  const operationalTrucks = state.vehicles.filter(v => v.status === 'active').length;
  const availableTrucks = state.vehicles.filter(v => isVehicleAvailable(v).available).length;
  const onTripTrucks = state.vehicles.filter(v => !!v.currentTripId).length;
  const workshopTrucks = state.vehicles.filter(v => v.status === 'under_maintenance' || v.status === 'breakdown').length;
  const awaitingInspTrucks = state.vehicles.filter(v => v.status === 'awaiting_inspection').length;
  const criticalDefectTrucks = state.vehicles.filter(v => v.hasCriticalDefect).length;

  // B. Trips Metrics
  const inProgressTrips = state.trips.filter(t => t.status === 'in_progress').length;
  const pendingApprovalTrips = state.trips.filter(t => t.status === 'pending_operations_approval' || t.status === 'pending_yard_verification').length;
  const completedTrips = state.trips.filter(t => t.status === 'completed').length;
  const totalTrips = state.trips.length;

  // C. Workshop Metrics
  const activeWorkOrders = state.workOrders.filter(w => w.stage !== 'released' && w.stage !== 'cancelled').length;
  const awaitingPartsWOs = state.workOrders.filter(w => w.stage === 'awaiting_spare_parts').length;
  const reportedBreakdowns = state.breakdowns.filter(b => b.status !== 'resolved').length;

  // D. Stores Metrics
  const totalStockItems = state.parts.length;
  const lowStockItems = state.parts.filter(p => p.currentStock <= p.minimumStock).length;
  const pendingSpareReqs = state.spareRequests.filter(s => s.status === 'pending_approval').length;
  const totalInventoryValTZS = state.parts.reduce((acc, p) => acc + (p.currentStock * p.unitCostTZS), 0);

  // E. Fuel Metrics
  const totalFuelLitres = state.fuelTransactions.reduce((acc, f) => acc + f.litres, 0);
  const totalFuelSpendTZS = state.fuelTransactions.reduce((acc, f) => acc + f.totalCostTZS, 0);
  const fuelExceptionsCount = state.fuelTransactions.filter(f => f.hasException).length;
  const validConsumptionRates = state.fuelTransactions
    .filter(f => f.consumptionLitersPer100Km && f.consumptionLitersPer100Km > 0)
    .map(f => f.consumptionLitersPer100Km as number);
  const avgFleetConsumption = validConsumptionRates.length > 0
    ? (validConsumptionRates.reduce((a, b) => a + b, 0) / validConsumptionRates.length).toFixed(1)
    : '41.5';

  // F. Safety Metrics
  const totalInspections = state.inspections.length;
  const openIncidents = state.incidents.filter(i => !i.isClosed).length;

  // G. GPS Metrics
  const liveGpsCount = state.gpsPositions.filter(p => p.trackingStatus === 'live').length;
  const delayedOrOfflineGps = state.gpsPositions.filter(p => p.trackingStatus !== 'live').length;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>Usangu Dedicated Town Trip Operations</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Dar es Salaam Corridor</span>
          </div>
          <h1 className="text-xl lg:text-2xl font-black text-white mt-1">
            Operations Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time fleet readiness, trip scheduling, workshop maintenance, and stores inventory.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCreateTrip}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Town Trip</span>
          </button>

          <button
            onClick={onOpenReportBreakdown}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Report Defect</span>
          </button>

          <button
            onClick={onOpenRecordFuel}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all cursor-pointer"
          >
            <Fuel className="w-4 h-4 text-yellow-400" />
            <span>Record Fuel Issue</span>
          </button>
        </div>
      </div>

      {/* Critical Defect Emergency Alert (if any) */}
      {criticalDefectTrucks > 0 && (
        <div className="bg-red-950/40 border border-red-800/80 p-4 rounded-xl flex items-start justify-between gap-3 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-600/30 text-red-400 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-200">
                CRITICAL SAFETY LOCKOUT ACTIVE: {criticalDefectTrucks} Vehicle(s) Restrained From Dispatch
              </h3>
              <p className="text-xs text-red-300/80 mt-0.5">
                Vehicles with failed brakes, steering or structural safety inspections are blocked server-side from trip allocation.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('safety')}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Review Safety Defect →
          </button>
        </div>
      )}

      {/* SECTION A & B: Core Operational Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Fleet Availability Card */}
        <div 
          onClick={() => onNavigateToTab('fleet')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:bg-slate-850 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fleet Readiness</span>
            <Truck className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{availableTrucks}</span>
            <span className="text-xs text-slate-400">/ {totalTrucks} Available</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {operationalTrucks} Active
            </span>
            <span className="text-blue-400 font-medium">
              {onTripTrucks} on trip
            </span>
          </div>
        </div>

        {/* Trips Overview Card */}
        <div 
          onClick={() => onNavigateToTab('trips')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:bg-slate-850 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Town Trips Today</span>
            <CalendarCheck className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{inProgressTrips}</span>
            <span className="text-xs text-slate-400">Dispatched & In Progress</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {pendingApprovalTrips} Pending clearance
            </span>
            <span className="text-slate-400">{completedTrips} closed</span>
          </div>
        </div>

        {/* Workshop Overview Card */}
        <div 
          onClick={() => onNavigateToTab('workshop')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:bg-slate-850 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Workshop Backlog</span>
            <Wrench className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{activeWorkOrders}</span>
            <span className="text-xs text-slate-400">Active Work Orders</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-orange-400 font-medium">
              {awaitingPartsWOs} awaiting spare parts
            </span>
            <span className="text-slate-400">{workshopTrucks} in yard</span>
          </div>
        </div>

        {/* Stores & Inventory Card */}
        <div 
          onClick={() => onNavigateToTab('stores')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-sm cursor-pointer transition-all hover:bg-slate-850 group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Stores Inventory</span>
            <Package className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{lowStockItems}</span>
            <span className="text-xs text-red-400 font-medium">Low Stock Alert(s)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-amber-400 font-medium">
              {pendingSpareReqs} pending requisitions
            </span>
            <span className="text-slate-400">{totalStockItems} SKUs</span>
          </div>
        </div>
      </div>

      {/* SECTION C & D: Operational Breakdown Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Trips Live Feed */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-white text-base">Active Town Trips & Movements</h2>
            </div>
            <button
              onClick={() => onNavigateToTab('trips')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>View All Trips</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {state.trips.slice(0, 4).map((trip) => {
              const vehicle = state.vehicles.find(v => v.id === trip.assignedVehicleId);
              const driver = state.drivers.find(d => d.id === trip.primaryDriverId);
              const trailer = state.trailers.find(t => t.id === trip.assignedTrailerId);

              const getStatusBadge = (status: string) => {
                switch(status) {
                  case 'in_progress':
                    return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[11px] font-medium">In Progress</span>;
                  case 'completed':
                    return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-medium">Completed</span>;
                  case 'pending_operations_approval':
                    return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-medium">Pending Ops Approval</span>;
                  case 'pending_yard_verification':
                    return <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded text-[11px] font-medium">Pending Yard Check</span>;
                  case 'approved_for_dispatch':
                    return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-medium">Approved for Exit</span>;
                  default:
                    return <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-medium">{status}</span>;
                }
              };

              return (
                <div 
                  key={trip.id}
                  onClick={() => onNavigateToTab('trips')}
                  className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400">{trip.tripReference}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs font-semibold text-white">{vehicle?.fleetNumber} ({vehicle?.registrationNumber})</span>
                      {trailer && (
                        <span className="text-[11px] text-slate-400">+{trailer.trailerNumber}</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                      <span>{trip.origin}</span>
                      <span className="text-slate-500">→</span>
                      <span>{trip.destination}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Driver: {driver?.name || 'Unassigned'}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{trip.purpose}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    {getStatusBadge(trip.status)}
                    <span className="text-[11px] font-mono text-slate-400">
                      {trip.actualDeparture ? new Date(trip.actualDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Expected ' + new Date(trip.expectedDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workshop & Safety Snapshot */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-white text-base">Workshop & Repairs</h2>
              </div>
              <button
                onClick={() => onNavigateToTab('workshop')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-3">
              {state.workOrders.slice(0, 3).map((wo) => {
                const vehicle = state.vehicles.find(v => v.id === wo.vehicleId);
                const tech = state.technicians.find(t => t.id === wo.assignedTechnicianId);

                return (
                  <div key={wo.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-200">{vehicle?.fleetNumber} ({vehicle?.registrationNumber})</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                        wo.priority === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {wo.priority}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-1">{wo.diagnosis}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
                      <span>Tech: {tech?.name || 'Unassigned'}</span>
                      <span className="text-amber-400 font-medium capitalize">{wo.stage.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Safety Summary Bar */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 mt-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Safety Status
              </span>
              <span className="text-emerald-400 font-mono">{totalInspections} Audited</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Open Incidents: {openIncidents}</span>
              <span>Critical Locks: {criticalDefectTrucks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION E, F, G: Secondary Dashboards (Fuel, Stores, GPS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fuel Summary */}
        <div 
          onClick={() => onNavigateToTab('fuel')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
              <Fuel className="w-4 h-4" /> Fuel Consumption
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-yellow-400" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{totalFuelLitres.toLocaleString()} Litres</div>
            <div className="text-xs text-slate-400 mt-0.5">TZS {totalFuelSpendTZS.toLocaleString()} recorded spend</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Fleet Avg: <strong className="text-slate-200">{avgFleetConsumption} L/100km</strong></span>
            {fuelExceptionsCount > 0 ? (
              <span className="text-yellow-400 font-bold">{fuelExceptionsCount} Flagged</span>
            ) : (
              <span className="text-emerald-400">Norm</span>
            )}
          </div>
        </div>

        {/* GPS Visibility */}
        <div 
          onClick={() => onNavigateToTab('gps')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Navigation className="w-4 h-4" /> GPS Telematics
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{liveGpsCount} Live Devices</div>
            <div className="text-xs text-slate-400 mt-0.5">Tramigo / Teltonika / Cartrack Adapters</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Delayed/Stale: <strong className="text-slate-200">{delayedOrOfflineGps}</strong></span>
            <span className="text-emerald-400 font-medium">Osm / Leaflet</span>
          </div>
        </div>

        {/* Central Stores Valuation */}
        <div 
          onClick={() => onNavigateToTab('stores')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl cursor-pointer transition-all space-y-3 group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Package className="w-4 h-4" /> Central Stores
            </span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
          </div>
          <div>
            <div className="text-xl font-black text-white">TZS {(totalInventoryValTZS / 1000000).toFixed(1)}M</div>
            <div className="text-xs text-slate-400 mt-0.5">Active Spares Inventory Valuation</div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Low Stock: <strong className="text-red-400">{lowStockItems} items</strong></span>
            <span className="text-amber-400 font-medium">{pendingSpareReqs} pending approval</span>
          </div>
        </div>
      </div>
    </div>
  );
};
