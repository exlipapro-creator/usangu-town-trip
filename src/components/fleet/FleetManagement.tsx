import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vehicle, Trailer, Driver, Technician } from '../../types';
import { isVehicleAvailable } from '../../services/store';
import { 
  Truck, ShieldAlert, CheckCircle2, Wrench, Search, 
  Plus, Calendar, Gauge, User, Eye, X, MapPin, 
  AlertTriangle, Filter, Sparkles
} from 'lucide-react';

interface FleetManagementProps {
  onOpenCreateTripWithVehicle?: (vehicleId: string) => void;
  onOpenReportBreakdownWithVehicle?: (vehicleId: string) => void;
}

export const FleetManagement: React.FC<FleetManagementProps> = ({
  onOpenCreateTripWithVehicle,
  onOpenReportBreakdownWithVehicle
}) => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'trucks' | 'trailers' | 'drivers' | 'technicians'>('trucks');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleDetailTab, setVehicleDetailTab] = useState<'overview' | 'trips' | 'workshop' | 'fuel' | 'safety'>('overview');

  // Filter trucks
  const filteredVehicles = state.vehicles.filter(v => {
    const matchesSearch = v.fleetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    if (statusFilter === 'available') return matchesSearch && isVehicleAvailable(v).available;
    if (statusFilter === 'on_trip') return matchesSearch && !!v.currentTripId;
    if (statusFilter === 'workshop') return matchesSearch && (v.status === 'under_maintenance' || v.status === 'breakdown');
    if (statusFilter === 'critical') return matchesSearch && v.hasCriticalDefect;
    return matchesSearch && v.status === statusFilter;
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-amber-500" />
            Fleet & Asset Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Dedicated Town Trip asset register: Prime movers, skeletal trailers, drivers & technicians.
          </p>
        </div>

        {/* Sub-tabs with smooth horizontal scroll for mobile */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('trucks')}
            className={`min-h-[40px] px-3.5 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
              activeTab === 'trucks' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Trucks ({state.vehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('trailers')}
            className={`min-h-[40px] px-3.5 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
              activeTab === 'trailers' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Trailers ({state.trailers.length})
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`min-h-[40px] px-3.5 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
              activeTab === 'drivers' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Drivers ({state.drivers.length})
          </button>
          <button
            onClick={() => setActiveTab('technicians')}
            className={`min-h-[40px] px-3.5 py-2 rounded-lg transition-all whitespace-nowrap cursor-pointer touch-manipulation ${
              activeTab === 'technicians' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Technicians ({state.technicians.length})
          </button>
        </div>
      </div>

      {/* TRUCKS VIEW */}
      {activeTab === 'trucks' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Fleet #, Registration, Make (e.g. US-TRK-01, Scania)..."
                className="w-full min-h-[44px] bg-slate-950 text-slate-200 text-xs rounded-lg pl-9 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto min-h-[44px] bg-slate-950 text-slate-300 text-xs rounded-lg px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="all">All Operational Statuses</option>
                <option value="available">Available for Dispatch</option>
                <option value="on_trip">Currently on Trip</option>
                <option value="workshop">Under Maintenance / Workshop</option>
                <option value="critical">Critical Defect Locked</option>
                <option value="awaiting_inspection">Awaiting QA Inspection</option>
              </select>
            </div>
          </div>

          {/* Trucks Container: High-density Table on Desktop, Responsive Cards on Mobile */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                    <th className="py-3 px-4">Fleet Number</th>
                    <th className="py-3 px-4">Registration</th>
                    <th className="py-3 px-4">Make & Model</th>
                    <th className="py-3 px-4">Odometer</th>
                    <th className="py-3 px-4">Attached Trailer</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4">Compliance Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredVehicles.map((vehicle) => {
                    const avail = isVehicleAvailable(vehicle);
                    const trailer = state.trailers.find(t => t.id === vehicle.attachedTrailerId);
                    const currentTrip = state.trips.find(t => t.id === vehicle.currentTripId);

                    return (
                      <tr 
                        key={vehicle.id} 
                        className="hover:bg-slate-850/60 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          {vehicle.fleetNumber}
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {vehicle.registrationNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <div>{vehicle.make} {vehicle.model}</div>
                          <div className="text-[10px] text-slate-500">{vehicle.vehicleType} · {vehicle.capacityTonnes}T</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-200 tabular-nums">
                          {vehicle.currentOdometer.toLocaleString()} km
                        </td>
                        <td className="py-3 px-4">
                          {trailer ? (
                            <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-mono">
                              {trailer.trailerNumber} ({trailer.category.split(' ')[0]})
                            </span>
                          ) : (
                            <span className="text-slate-600 italic">None attached</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {vehicle.hasCriticalDefect ? (
                            <span className="inline-flex items-center gap-1 bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px] tracking-wide animate-pulse">
                              <ShieldAlert className="w-3 h-3" />
                              DEFECT LOCKED
                            </span>
                          ) : currentTrip ? (
                            <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                              ON TRIP ({currentTrip.tripReference})
                            </span>
                          ) : vehicle.status === 'under_maintenance' ? (
                            <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                              IN WORKSHOP
                            </span>
                          ) : vehicle.status === 'awaiting_inspection' ? (
                            <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                              AWAITING QA
                            </span>
                          ) : avail.available ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              AVAILABLE
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px] uppercase font-semibold">
                              {vehicle.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          <div>Ins: {vehicle.insuranceExpiry}</div>
                          <div>LATRA: {vehicle.inspectionExpiry}</div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setVehicleDetailTab('overview');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Profile</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (< 768px) */}
            <div className="md:hidden divide-y divide-slate-800/80">
              {filteredVehicles.map((vehicle) => {
                const avail = isVehicleAvailable(vehicle);
                const trailer = state.trailers.find(t => t.id === vehicle.attachedTrailerId);
                const currentTrip = state.trips.find(t => t.id === vehicle.currentTripId);

                return (
                  <div key={vehicle.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-amber-400 text-sm">{vehicle.fleetNumber}</span>
                          <span className="font-bold text-white text-sm">{vehicle.registrationNumber}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {vehicle.make} {vehicle.model} · {vehicle.capacityTonnes}T
                        </div>
                      </div>

                      {/* Status badge */}
                      <div>
                        {vehicle.hasCriticalDefect ? (
                          <span className="inline-flex items-center gap-1 bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px] animate-pulse">
                            <ShieldAlert className="w-3 h-3" />
                            LOCKED
                          </span>
                        ) : currentTrip ? (
                          <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                            ON TRIP
                          </span>
                        ) : vehicle.status === 'under_maintenance' ? (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                            WORKSHOP
                          </span>
                        ) : avail.available ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            AVAILABLE
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px] uppercase font-semibold">
                            {vehicle.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Odometer</span>
                        <span className="font-mono text-slate-200 tabular-nums font-semibold">{vehicle.currentOdometer.toLocaleString()} km</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Trailer</span>
                        <span className="text-slate-300 truncate block">
                          {trailer ? `${trailer.trailerNumber}` : 'Unattached'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">LATRA Expiry</span>
                        <span className="text-slate-400 text-[11px]">{vehicle.inspectionExpiry}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">Insurance</span>
                        <span className="text-slate-400 text-[11px]">{vehicle.insuranceExpiry}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedVehicle(vehicle);
                        setVehicleDetailTab('overview');
                      }}
                      className="w-full min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer touch-manipulation"
                    >
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span>View Vehicle 360° Profile</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TRAILERS VIEW */}
      {activeTab === 'trailers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Registered Town Trip Trailers & Skeletals</h3>
            <span className="text-xs text-slate-400">Total: {state.trailers.length} Assets</span>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                  <th className="py-3 px-4">Trailer ID</th>
                  <th className="py-3 px-4">Registration</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Attached Truck</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {state.trailers.map((tr) => {
                  const attachedTruck = state.vehicles.find(v => v.id === tr.attachedToVehicleId);
                  return (
                    <tr key={tr.id} className="hover:bg-slate-850">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">{tr.trailerNumber}</td>
                      <td className="py-3 px-4 font-semibold text-white">{tr.registrationNumber}</td>
                      <td className="py-3 px-4 text-slate-300">{tr.category}</td>
                      <td className="py-3 px-4 text-slate-300">{tr.capacityTonnes} Tonnes</td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px]">
                          {tr.condition}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          tr.status === 'in_trip' ? 'bg-blue-500/20 text-blue-300' :
                          tr.status === 'attached' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {tr.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {attachedTruck ? `${attachedTruck.fleetNumber} (${attachedTruck.registrationNumber})` : 'Unattached'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Trailer Cards */}
          <div className="md:hidden divide-y divide-slate-800/80">
            {state.trailers.map((tr) => {
              const attachedTruck = state.vehicles.find(v => v.id === tr.attachedToVehicleId);
              return (
                <div key={tr.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-mono font-bold text-amber-400 text-sm">{tr.trailerNumber}</div>
                      <div className="font-semibold text-white text-xs">{tr.registrationNumber}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      tr.status === 'in_trip' ? 'bg-blue-500/20 text-blue-300' :
                      tr.status === 'attached' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {tr.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/70">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Category</span>
                      <span className="text-slate-300 font-medium">{tr.category}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Capacity</span>
                      <span className="text-slate-300 font-medium">{tr.capacityTonnes} Tonnes</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Condition</span>
                      <span className="text-emerald-400 font-medium">{tr.condition}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Attached Truck</span>
                      <span className="text-slate-300 truncate block">
                        {attachedTruck ? attachedTruck.fleetNumber : 'Unattached'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DRIVERS VIEW */}
      {activeTab === 'drivers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Qualified Town Trip Heavy Articulated Drivers</h3>
            <span className="text-xs text-slate-400">Total: {state.drivers.length} Drivers</span>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Driver Name</th>
                  <th className="py-3 px-4">Phone Contact</th>
                  <th className="py-3 px-4">License Number</th>
                  <th className="py-3 px-4">License Class</th>
                  <th className="py-3 px-4">License Expiry</th>
                  <th className="py-3 px-4">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {state.drivers.map((drv) => (
                  <tr key={drv.id} className="hover:bg-slate-850">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{drv.staffId}</td>
                    <td className="py-3 px-4 font-semibold text-white">{drv.name}</td>
                    <td className="py-3 px-4 text-slate-300 font-mono">{drv.phone}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{drv.licenseNumber}</td>
                    <td className="py-3 px-4 text-slate-300">{drv.licenseClass}</td>
                    <td className="py-3 px-4 text-slate-400">{drv.licenseExpiry}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        drv.status === 'on_trip' ? 'bg-blue-500/20 text-blue-300' :
                        drv.status === 'available' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {drv.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Driver Cards */}
          <div className="md:hidden divide-y divide-slate-800/80">
            {state.drivers.map((drv) => (
              <div key={drv.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white text-sm">{drv.name}</div>
                    <div className="font-mono text-amber-400 text-xs">{drv.staffId}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    drv.status === 'on_trip' ? 'bg-blue-500/20 text-blue-300' :
                    drv.status === 'available' ? 'bg-emerald-500/20 text-emerald-300' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {drv.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/70">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Phone</span>
                    <a href={`tel:${drv.phone}`} className="text-amber-400 font-mono underline">{drv.phone}</a>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Class</span>
                    <span className="text-slate-300 font-medium">{drv.licenseClass}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">License #</span>
                    <span className="text-slate-400 font-mono text-[11px]">{drv.licenseNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Expiry</span>
                    <span className="text-slate-400 text-[11px]">{drv.licenseExpiry}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TECHNICIANS VIEW */}
      {activeTab === 'technicians' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Central Fleet Workshop Technical Staff</h3>
            <span className="text-xs text-slate-400">Total: {state.technicians.length} Technicians</span>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Technician Name</th>
                  <th className="py-3 px-4">Specialty & Trade</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Active Work Orders</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {state.technicians.map((tech) => (
                  <tr key={tech.id} className="hover:bg-slate-850">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{tech.staffId}</td>
                    <td className="py-3 px-4 font-semibold text-white">{tech.name}</td>
                    <td className="py-3 px-4 text-slate-300">{tech.specialty}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{tech.phone}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{tech.activeWorkOrdersCount} Active</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        tech.status === 'busy' ? 'bg-amber-500/20 text-amber-300' :
                        tech.status === 'available' ? 'bg-emerald-500/20 text-emerald-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {tech.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Technician Cards */}
          <div className="md:hidden divide-y divide-slate-800/80">
            {state.technicians.map((tech) => (
              <div key={tech.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-white text-sm">{tech.name}</div>
                    <div className="font-mono text-amber-400 text-xs">{tech.staffId} · {tech.specialty}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    tech.status === 'busy' ? 'bg-amber-500/20 text-amber-300' :
                    tech.status === 'available' ? 'bg-emerald-500/20 text-emerald-300' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {tech.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/70">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Phone</span>
                    <a href={`tel:${tech.phone}`} className="text-amber-400 font-mono underline">{tech.phone}</a>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Active Work Orders</span>
                    <span className="text-amber-400 font-bold font-mono">{tech.activeWorkOrdersCount} Assigned</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VEHICLE 360° PROFILE MODAL */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-base">{selectedVehicle.fleetNumber}</span>
                    <span className="text-white font-bold text-base">({selectedVehicle.registrationNumber})</span>
                    {selectedVehicle.hasCriticalDefect && (
                      <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                        DEFECT LOCKED
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {selectedVehicle.make} {selectedVehicle.model} • {selectedVehicle.year} • {selectedVehicle.vehicleType}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="px-4 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
              <button
                onClick={() => setVehicleDetailTab('overview')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  vehicleDetailTab === 'overview' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setVehicleDetailTab('trips')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  vehicleDetailTab === 'trips' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Trip History ({state.trips.filter(t => t.assignedVehicleId === selectedVehicle.id).length})
              </button>
              <button
                onClick={() => setVehicleDetailTab('workshop')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  vehicleDetailTab === 'workshop' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Workshop & Repairs ({state.workOrders.filter(w => w.vehicleId === selectedVehicle.id).length})
              </button>
              <button
                onClick={() => setVehicleDetailTab('fuel')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  vehicleDetailTab === 'fuel' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Fuel Consumption ({state.fuelTransactions.filter(f => f.vehicleId === selectedVehicle.id).length})
              </button>
              <button
                onClick={() => setVehicleDetailTab('safety')}
                className={`py-3 px-3 border-b-2 transition-colors ${
                  vehicleDetailTab === 'safety' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Inspections & Defect Status
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {vehicleDetailTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Current Odometer</div>
                      <div className="font-mono text-base font-bold text-white mt-0.5">
                        {selectedVehicle.currentOdometer.toLocaleString()} km
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Capacity</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {selectedVehicle.capacityTonnes} Tonnes (6x4)
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Fuel System</div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {selectedVehicle.fuelType} High-Idle
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Availability Status</div>
                      <div className="mt-0.5 font-bold text-xs">
                        {isVehicleAvailable(selectedVehicle).available ? (
                          <span className="text-emerald-400">Available For Town Shunts</span>
                        ) : (
                          <span className="text-amber-400">{isVehicleAvailable(selectedVehicle).reason}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedVehicle.hasCriticalDefect && (
                    <div className="bg-red-950/40 border border-red-800 p-4 rounded-xl space-y-1">
                      <div className="text-red-400 font-bold text-xs uppercase flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" />
                        Critical Safety Restriction
                      </div>
                      <p className="text-red-200 text-xs">
                        {selectedVehicle.criticalDefectReason}
                      </p>
                      <div className="text-[11px] text-red-300/80 pt-1">
                        Dispatch is blocked. Vehicle must undergo workshop rectification and pass QA inspection before release.
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Statutory Compliance & Expiries</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-500">LATRA Roadworthiness:</span>
                        <div className="font-semibold text-slate-200">{selectedVehicle.inspectionExpiry}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Commercial Insurance:</span>
                        <div className="font-semibold text-slate-200">{selectedVehicle.insuranceExpiry}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Registration Expiry:</span>
                        <div className="font-semibold text-slate-200">{selectedVehicle.registrationExpiry}</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Operational Notes</h4>
                    <p className="text-xs text-slate-400">{selectedVehicle.notes || 'No specific operational notes recorded.'}</p>
                  </div>
                </div>
              )}

              {vehicleDetailTab === 'trips' && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-400">Recorded Town Trips for {selectedVehicle.fleetNumber}:</div>
                  {state.trips.filter(t => t.assignedVehicleId === selectedVehicle.id).length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">No historical trips found for this vehicle.</div>
                  ) : (
                    state.trips.filter(t => t.assignedVehicleId === selectedVehicle.id).map(trip => (
                      <div key={trip.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-mono font-bold text-amber-400">{trip.tripReference}</div>
                          <div className="text-slate-200 font-semibold">{trip.origin} → {trip.destination}</div>
                          <div className="text-slate-400 text-[11px]">{trip.purpose}</div>
                        </div>
                        <div className="text-right">
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300 uppercase font-semibold">
                            {trip.status.replace(/_/g, ' ')}
                          </span>
                          <div className="text-slate-400 text-[11px] mt-1 font-mono">
                            {trip.distanceKm ? `${trip.distanceKm} km` : 'Active'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {vehicleDetailTab === 'workshop' && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-400">Workshop & Breakdown History:</div>
                  {state.workOrders.filter(w => w.vehicleId === selectedVehicle.id).length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">No work orders recorded for this vehicle.</div>
                  ) : (
                    state.workOrders.filter(w => w.vehicleId === selectedVehicle.id).map(wo => (
                      <div key={wo.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-amber-400 font-mono">{wo.workOrderReference}</span>
                          <span className="text-[10px] uppercase bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-semibold">
                            {wo.stage.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-slate-200">{wo.diagnosis}</div>
                        <div className="text-slate-400 text-[11px]">{wo.workDescription}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {vehicleDetailTab === 'fuel' && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-400">Fuel Issues & Burn Rate:</div>
                  {state.fuelTransactions.filter(f => f.vehicleId === selectedVehicle.id).length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">No fuel transactions on file for this vehicle.</div>
                  ) : (
                    state.fuelTransactions.filter(f => f.vehicleId === selectedVehicle.id).map(fl => (
                      <div key={fl.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-mono text-amber-400 font-bold">{fl.transactionReference}</div>
                          <div className="text-slate-300 font-semibold">{fl.supplierOrStation}</div>
                          <div className="text-slate-400 text-[11px]">{fl.litres}L Diesel @ TZS {fl.unitPriceTZS}/L</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-white">TZS {fl.totalCostTZS.toLocaleString()}</div>
                          <div className="text-[11px] font-mono text-amber-400 font-semibold mt-0.5">
                            {fl.consumptionLitersPer100Km ? `${fl.consumptionLitersPer100Km} L/100km` : 'Initial reading'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {vehicleDetailTab === 'safety' && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-400">Inspections & Roadworthiness Records:</div>
                  {state.inspections.filter(i => i.vehicleId === selectedVehicle.id).map(insp => (
                    <div key={insp.id} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-200">{insp.inspectionReference}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          insp.overallPassed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-600 text-white'
                        }`}>
                          {insp.overallPassed ? 'PASSED' : 'FAILED CRITICAL DEFECT'}
                        </span>
                      </div>
                      <div className="text-slate-300 text-[11px]">Type: {insp.inspectionType.toUpperCase()} • Inspected by: {insp.inspectedBy}</div>
                      {insp.remarks && <p className="text-slate-400 text-[11px] italic">"{insp.remarks}"</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Usangu Master Asset ID: {selectedVehicle.id}
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
