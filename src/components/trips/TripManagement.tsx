import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Trip, TripStatus } from '../../types';
import { isVehicleAvailable, isTrailerAvailable, isDriverAvailable } from '../../services/store';
import { 
  CalendarCheck, PlusCircle, CheckCircle2, Clock, 
  Truck, ArrowRight, ShieldAlert, X, AlertTriangle, 
  RotateCcw, Filter, FileText, Check, Ban
} from 'lucide-react';

interface TripManagementProps {
  initialCreateOpen?: boolean;
}

export const TripManagement: React.FC<TripManagementProps> = ({ initialCreateOpen = false }) => {
  const { 
    state, 
    createTrip, 
    approveTripOps, 
    verifyTripYard, 
    dispatchTrip, 
    recordTripReturn, 
    cancelTrip 
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialCreateOpen);
  const [dispatchModalTrip, setDispatchModalTrip] = useState<Trip | null>(null);
  const [returnModalTrip, setReturnModalTrip] = useState<Trip | null>(null);
  const [cancelModalTrip, setCancelModalTrip] = useState<Trip | null>(null);

  // Form states for Create Trip
  const [newOrigin, setNewOrigin] = useState('Dar Port Gate 4 (TICTS)');
  const [newDestination, setNewDestination] = useState('Kurasini Central Yard');
  const [newPurpose, setNewPurpose] = useState('Import Container Shunting (40ft)');
  const [newCustomer, setNewCustomer] = useState('TICTS / Shipping Line Shunt');
  const [newCargo, setNewCargo] = useState('1x 40ft High Cube Container (General)');
  const [newVehicleId, setNewVehicleId] = useState(state.vehicles[0]?.id || '');
  const [newTrailerId, setNewTrailerId] = useState(state.trailers[0]?.id || '');
  const [newDriverId, setNewDriverId] = useState(state.drivers[0]?.id || '');
  const [newInstructions, setNewInstructions] = useState('Inspect container seal numbers at terminal gate prior to departure.');
  const [createError, setCreateError] = useState<string | null>(null);

  // Form states for Dispatch
  const [dispatchOdometer, setDispatchOdometer] = useState<number>(0);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  // Form states for Return
  const [returnOdometer, setReturnOdometer] = useState<number>(0);
  const [returnDefectReported, setReturnDefectReported] = useState<boolean>(false);
  const [returnDefectNotes, setReturnDefectNotes] = useState<string>('');
  const [returnRemarks, setReturnRemarks] = useState<string>('Safe return to yard. Consignment verified.');
  const [returnError, setReturnError] = useState<string | null>(null);

  // Form state for Cancel
  const [cancelReason, setCancelReason] = useState('Client rescheduled container release window.');

  // Filter trips
  const filteredTrips = state.trips.filter(t => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'in_progress') return t.status === 'in_progress';
    if (statusFilter === 'pending') return t.status === 'pending_operations_approval' || t.status === 'pending_yard_verification' || t.status === 'approved_for_dispatch';
    if (statusFilter === 'completed') return t.status === 'completed';
    return t.status === statusFilter;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const now = new Date();
    const expectedReturn = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    const res = createTrip({
      tripDate: now.toISOString().split('T')[0],
      purpose: newPurpose,
      customerOrDept: newCustomer,
      origin: newOrigin,
      destination: newDestination,
      cargoDetails: newCargo,
      assignedVehicleId: newVehicleId,
      assignedTrailerId: newTrailerId ? newTrailerId : null,
      primaryDriverId: newDriverId,
      expectedDeparture: now.toISOString(),
      expectedReturn: expectedReturn.toISOString(),
      operationalInstructions: newInstructions
    });

    if (!res.success) {
      setCreateError(res.error || 'Failed to create trip');
    } else {
      setIsCreateModalOpen(false);
      setCreateError(null);
    }
  };

  const handleOpenDispatch = (trip: Trip) => {
    const vehicle = state.vehicles.find(v => v.id === trip.assignedVehicleId);
    setDispatchOdometer(vehicle?.currentOdometer || 100000);
    setDispatchError(null);
    setDispatchModalTrip(trip);
  };

  const handleConfirmDispatch = () => {
    if (!dispatchModalTrip) return;
    const res = dispatchTrip(dispatchModalTrip.id, dispatchOdometer);
    if (!res.success) {
      setDispatchError(res.error || 'Dispatch rejected');
    } else {
      setDispatchModalTrip(null);
    }
  };

  const handleOpenReturn = (trip: Trip) => {
    const minOdo = trip.openingOdometer || 100000;
    setReturnOdometer(minOdo + 35); // realistic default +35km shunting round-trip
    setReturnDefectReported(false);
    setReturnDefectNotes('');
    setReturnError(null);
    setReturnModalTrip(trip);
  };

  const handleConfirmReturn = () => {
    if (!returnModalTrip) return;
    const res = recordTripReturn(
      returnModalTrip.id, 
      returnOdometer, 
      returnDefectReported, 
      returnDefectNotes, 
      returnRemarks
    );
    if (!res.success) {
      setReturnError(res.error || 'Return submission failed');
    } else {
      setReturnModalTrip(null);
    }
  };

  const handleConfirmCancel = () => {
    if (!cancelModalTrip) return;
    cancelTrip(cancelModalTrip.id, cancelReason);
    setCancelModalTrip(null);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-amber-500" />
            Town Trip Management & Dispatch Control
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Port shunting, container transfers, yard clearances, and multi-trip daily turnaround.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/40 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Town Trip Schedule</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
              statusFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Trips ({state.trips.length})
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
              statusFilter === 'in_progress' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            In Progress ({state.trips.filter(t => t.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
              statusFilter === 'pending' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Clearance ({state.trips.filter(t => t.status.startsWith('pending') || t.status === 'approved_for_dispatch').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
              statusFilter === 'completed' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({state.trips.filter(t => t.status === 'completed').length})
          </button>
        </div>

        <div className="text-slate-400 text-[11px] pr-2">
          Strict Multi-Trip Day Rule: Non-overlapping sequential assignments verified
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Trip Reference</th>
                <th className="py-3.5 px-4">Assigned Prime Mover</th>
                <th className="py-3.5 px-4">Trailer / Cargo</th>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4">Town Route</th>
                <th className="py-3.5 px-4">Odometer & Distance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Workflow Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTrips.map((trip) => {
                const vehicle = state.vehicles.find(v => v.id === trip.assignedVehicleId);
                const trailer = state.trailers.find(t => t.id === trip.assignedTrailerId);
                const driver = state.drivers.find(d => d.id === trip.primaryDriverId);

                return (
                  <tr key={trip.id} className="hover:bg-slate-850/60 transition-colors">
                    {/* Trip Ref */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-amber-400">{trip.tripReference}</div>
                      <div className="text-[10px] text-slate-500">{trip.tripDate}</div>
                    </td>

                    {/* Truck */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{vehicle?.fleetNumber}</div>
                      <div className="text-[11px] text-slate-400">{vehicle?.registrationNumber}</div>
                      {vehicle?.hasCriticalDefect && (
                        <span className="text-[10px] font-bold text-red-400 flex items-center gap-1 mt-0.5">
                          <ShieldAlert className="w-3 h-3" /> Critical Defect
                        </span>
                      )}
                    </td>

                    {/* Trailer & Cargo */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">
                        {trailer ? `${trailer.trailerNumber} (${trailer.category.split(' ')[0]})` : 'Tractor Only'}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{trip.cargoDetails || trip.purpose}</div>
                    </td>

                    {/* Driver */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">{driver?.name || 'Unassigned'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{driver?.staffId}</div>
                    </td>

                    {/* Route */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-slate-200">
                        <span>{trip.origin}</span>
                        <span className="text-slate-500">→</span>
                        <span>{trip.destination}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{trip.customerOrDept}</div>
                    </td>

                    {/* Odo */}
                    <td className="py-3.5 px-4 font-mono">
                      {trip.openingOdometer ? (
                        <div>
                          <span className="text-slate-400 text-[10px]">Start: </span>
                          <span className="text-slate-200">{trip.openingOdometer.toLocaleString()} km</span>
                        </div>
                      ) : (
                        <span className="text-slate-600">Pending exit</span>
                      )}
                      {trip.distanceKm !== null && trip.distanceKm !== undefined ? (
                        <div className="text-emerald-400 font-bold text-[11px]">
                          Net: {trip.distanceKm} km
                        </div>
                      ) : null}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {trip.status === 'pending_operations_approval' && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                          Awaiting Ops Approval
                        </span>
                      )}
                      {trip.status === 'pending_yard_verification' && (
                        <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                          Awaiting Yard Check
                        </span>
                      )}
                      {trip.status === 'approved_for_dispatch' && (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                          Approved for Exit
                        </span>
                      )}
                      {trip.status === 'in_progress' && (
                        <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-max">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                          In Transit
                        </span>
                      )}
                      {trip.status === 'completed' && (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                          Returned & Closed
                        </span>
                      )}
                      {trip.status === 'cancelled' && (
                        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-semibold">
                          Cancelled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Ops Approval */}
                        {trip.status === 'pending_operations_approval' && (
                          <button
                            onClick={() => approveTripOps(trip.id)}
                            className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>Ops Approve</span>
                          </button>
                        )}

                        {/* Yard Verification */}
                        {trip.status === 'pending_yard_verification' && (
                          <button
                            onClick={() => verifyTripYard(trip.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Yard Verify</span>
                          </button>
                        )}

                        {/* Dispatch */}
                        {trip.status === 'approved_for_dispatch' && (
                          <button
                            onClick={() => handleOpenDispatch(trip)}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Dispatch</span>
                          </button>
                        )}

                        {/* Return */}
                        {trip.status === 'in_progress' && (
                          <button
                            onClick={() => handleOpenReturn(trip)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Record Return</span>
                          </button>
                        )}

                        {/* Cancel */}
                        {trip.status !== 'completed' && trip.status !== 'cancelled' && (
                          <button
                            onClick={() => setCancelModalTrip(trip)}
                            title="Cancel Trip"
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TRIP MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-amber-500" />
                Schedule New Town Shunting Trip
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              {createError && (
                <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg text-xs text-red-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Origin Point</label>
                  <select
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Dar Port Gate 4 (TICTS)">Dar Port Gate 4 (TICTS)</option>
                    <option value="Dar Port Gate 8 (General Cargo)">Dar Port Gate 8 (General Cargo)</option>
                    <option value="Kurasini Central Yard">Kurasini Central Yard</option>
                    <option value="Bandari Dry Port (TPA)">Bandari Dry Port (TPA)</option>
                    <option value="Vingunguti ICD (VICD)">Vingunguti ICD (VICD)</option>
                    <option value="Ubungo Freight Terminal">Ubungo Freight Terminal</option>
                    <option value="Kibaha Corridor Hub">Kibaha Corridor Hub</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Point</label>
                  <select
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Kurasini Central Yard">Kurasini Central Yard</option>
                    <option value="Dar Port Gate 4 (TICTS)">Dar Port Gate 4 (TICTS)</option>
                    <option value="Bandari Dry Port (TPA)">Bandari Dry Port (TPA)</option>
                    <option value="Vingunguti ICD (VICD)">Vingunguti ICD (VICD)</option>
                    <option value="Ubungo Freight Terminal">Ubungo Freight Terminal</option>
                    <option value="Mbagala Industrial Depot">Mbagala Industrial Depot</option>
                    <option value="Kibaha Corridor Hub">Kibaha Corridor Hub</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Town Trip Purpose</label>
                  <input
                    type="text"
                    value={newPurpose}
                    onChange={(e) => setNewPurpose(e.target.value)}
                    required
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. 40ft Loaded Shunt"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Customer / Line</label>
                  <input
                    type="text"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    required
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800 focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Maersk / MSC / TPA"
                  />
                </div>
              </div>

              {/* Asset Allocations */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Asset Allocation Checks</div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Prime Mover (Truck)</label>
                    <select
                      value={newVehicleId}
                      onChange={(e) => setNewVehicleId(e.target.value)}
                      className="w-full bg-slate-900 text-slate-200 text-xs rounded-lg p-2 border border-slate-700"
                    >
                      {state.vehicles.map(v => {
                        const avail = isVehicleAvailable(v);
                        return (
                          <option key={v.id} value={v.id}>
                            {v.fleetNumber} ({v.registrationNumber}) {avail.available ? '✓ Ready' : `✗ [${avail.reason}]`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Skeletal / Trailer</label>
                    <select
                      value={newTrailerId}
                      onChange={(e) => setNewTrailerId(e.target.value)}
                      className="w-full bg-slate-900 text-slate-200 text-xs rounded-lg p-2 border border-slate-700"
                    >
                      <option value="">None (Tractor Only)</option>
                      {state.trailers.map(tr => {
                        const avail = isTrailerAvailable(tr);
                        return (
                          <option key={tr.id} value={tr.id}>
                            {tr.trailerNumber} ({tr.category.split(' ')[0]}) {avail ? '✓ Ready' : '✗ Busy'}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">Primary Driver</label>
                    <select
                      value={newDriverId}
                      onChange={(e) => setNewDriverId(e.target.value)}
                      className="w-full bg-slate-900 text-slate-200 text-xs rounded-lg p-2 border border-slate-700"
                    >
                      {state.drivers.map(drv => {
                        const avail = isDriverAvailable(drv);
                        return (
                          <option key={drv.id} value={drv.id}>
                            {drv.name} ({drv.staffId}) {avail ? '✓ Ready' : '✗ On Trip'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo Details / Seal #</label>
                <input
                  type="text"
                  value={newCargo}
                  onChange={(e) => setNewCargo(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                  placeholder="e.g. 1x 40ft (MSCU 884920-1) Seal # 094821"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Operational Instructions</label>
                <textarea
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Submit for Operations Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH CONFIRMATION MODAL */}
      {dispatchModalTrip && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400" />
                Yard Gate Dispatch Authorization
              </h3>
              <button
                onClick={() => setDispatchModalTrip(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {dispatchError && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-200">
                  {dispatchError}
                </div>
              )}

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="font-mono font-bold text-amber-400">{dispatchModalTrip.tripReference}</div>
                <div className="font-semibold text-slate-200">{dispatchModalTrip.origin} → {dispatchModalTrip.destination}</div>
                <div className="text-slate-400 text-[11px]">{dispatchModalTrip.cargoDetails}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Gate Departure Odometer (km)
                </label>
                <input
                  type="number"
                  value={dispatchOdometer}
                  onChange={(e) => setDispatchOdometer(Number(e.target.value))}
                  className="w-full bg-slate-950 text-white font-mono font-bold text-sm rounded-lg p-2.5 border border-slate-800 focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-500">Verified by Yard Supervisor at yard security gate</span>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-[11px] text-emerald-300">
                ✓ Pre-trip physical readiness checked: Tyres, lights, trailer kingpin locked, driver license on person.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setDispatchModalTrip(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDispatch}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Confirm Dispatch & Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECORD RETURN MODAL */}
      {returnModalTrip && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                Yard Return Recording & Trip Closure
              </h3>
              <button
                onClick={() => setReturnModalTrip(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {returnError && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-200">
                  {returnError}
                </div>
              )}

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400">{returnModalTrip.tripReference}</span>
                  <span className="text-[11px] text-slate-400">Opening: {returnModalTrip.openingOdometer?.toLocaleString()} km</span>
                </div>
                <div className="font-semibold text-slate-200">{returnModalTrip.origin} → {returnModalTrip.destination}</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Arrival Closing Odometer (km)
                </label>
                <input
                  type="number"
                  value={returnOdometer}
                  onChange={(e) => setReturnOdometer(Number(e.target.value))}
                  className="w-full bg-slate-950 text-white font-mono font-bold text-sm rounded-lg p-2.5 border border-slate-800 focus:border-amber-500"
                />
                <div className="text-[11px] text-emerald-400 font-mono mt-1 font-semibold">
                  Calculated Net Town Distance: {Math.max(0, returnOdometer - (returnModalTrip.openingOdometer || 0))} km
                </div>
              </div>

              {/* Defect Check */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={returnDefectReported}
                    onChange={(e) => setReturnDefectReported(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 border-slate-700 bg-slate-900 focus:ring-0"
                  />
                  <span className="font-bold text-slate-200">
                    Defect or Mechanical Fault Reported on Return?
                  </span>
                </label>

                {returnDefectReported && (
                  <div className="pt-2 space-y-1">
                    <label className="block text-[11px] font-semibold text-red-400">
                      Defect Description (will trigger workshop intake workflow):
                    </label>
                    <textarea
                      value={returnDefectNotes}
                      onChange={(e) => setReturnDefectNotes(e.target.value)}
                      rows={2}
                      required
                      placeholder="e.g. Brake air pressure warning light illuminated; clutch slipping under load."
                      className="w-full bg-slate-900 text-slate-200 text-xs rounded-lg p-2 border border-red-800/80"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Return Remarks</label>
                <input
                  type="text"
                  value={returnRemarks}
                  onChange={(e) => setReturnRemarks(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setReturnModalTrip(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReturn}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Complete Return & Close Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL TRIP DIALOG */}
      {cancelModalTrip && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm">Cancel Town Trip {cancelModalTrip.tripReference}</h3>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Cancellation Reason</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setCancelModalTrip(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
              >
                Back
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
