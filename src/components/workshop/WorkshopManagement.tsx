import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WorkOrder, BreakdownReport, WorkOrderStage, BreakdownSeverity } from '../../types';
import { 
  Wrench, ShieldAlert, CheckCircle2, AlertTriangle, 
  Clock, Plus, X, User, Package, Check, ArrowRight,
  Filter, FileText
} from 'lucide-react';

interface WorkshopManagementProps {
  initialReportBreakdownOpen?: boolean;
}

export const WorkshopManagement: React.FC<WorkshopManagementProps> = ({
  initialReportBreakdownOpen = false
}) => {
  const { 
    state, 
    reportBreakdown, 
    createWorkOrder, 
    updateWorkOrderStage, 
    requestSparePart, 
    releaseVehicleFromWorkshop 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'work_orders' | 'breakdowns'>('work_orders');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [isReportBreakdownOpen, setIsReportBreakdownOpen] = useState(initialReportBreakdownOpen);
  const [isCreateWorkOrderOpen, setIsCreateWorkOrderOpen] = useState(false);
  const [selectedBreakdownForWo, setSelectedBreakdownForWo] = useState<BreakdownReport | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);

  // Form: Report Breakdown
  const [breakdownVehicleId, setBreakdownVehicleId] = useState(state.vehicles[0]?.id || '');
  const [faultCategory, setFaultCategory] = useState<BreakdownReport['faultCategory']>('Braking System');
  const [faultDescription, setFaultDescription] = useState('Excessive play in steering wheel and grinding sound from front hub.');
  const [severity, setSeverity] = useState<BreakdownSeverity>('high');
  const [vehicleLocation, setVehicleLocation] = useState('Kurasini Yard Staging Bay 2');
  const [immediateAction, setImmediateAction] = useState('Vehicle marked with maintenance warning tag.');
  const [safetyImplications, setSafetyImplications] = useState('Steering instability under full 40ft container load.');
  const [breakdownError, setBreakdownError] = useState<string | null>(null);

  // Form: Create Work Order
  const [woVehicleId, setWoVehicleId] = useState(state.vehicles[0]?.id || '');
  const [woDiagnosis, setWoDiagnosis] = useState('');
  const [woPriority, setWoPriority] = useState<WorkOrder['priority']>('high');
  const [woTechId, setWoTechId] = useState(state.technicians[0]?.id || '');
  const [woDescription, setWoDescription] = useState('');
  const [woCompletionHours, setWoCompletionHours] = useState(8);

  // Form: Request Spare Part
  const [reqPartId, setReqPartId] = useState(state.parts[0]?.id || '');
  const [reqQuantity, setReqQuantity] = useState(2);
  const [reqJustification, setReqJustification] = useState('Worn beyond safe tolerance, immediate replacement needed.');
  const [reqError, setReqError] = useState<string | null>(null);

  // Form: Release Vehicle
  const [releaseNotes, setReleaseNotes] = useState('Road tested inside Kurasini yard; pneumatic pressure verified at 7.5 bar. Fit for service.');
  const [releaseInspectionPassed, setReleaseInspectionPassed] = useState(true);
  const [releaseError, setReleaseError] = useState<string | null>(null);

  const filteredWorkOrders = state.workOrders.filter(w => {
    if (stageFilter === 'all') return true;
    if (stageFilter === 'active') return w.stage !== 'released' && w.stage !== 'cancelled';
    if (stageFilter === 'awaiting_parts') return w.stage === 'awaiting_spare_parts';
    if (stageFilter === 'released') return w.stage === 'released';
    return w.stage === stageFilter;
  });

  const handleReportBreakdownSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBreakdownError(null);

    const res = reportBreakdown({
      vehicleId: breakdownVehicleId,
      faultCategory,
      faultDescription,
      severity,
      vehicleLocation,
      immediateAction,
      safetyImplications
    });

    if (!res.success) {
      setBreakdownError(res.error || 'Failed to submit breakdown');
    } else {
      setIsReportBreakdownOpen(false);
    }
  };

  const handleCreateWoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const exp = new Date(now.getTime() + woCompletionHours * 60 * 60 * 1000);

    const res = createWorkOrder({
      vehicleId: woVehicleId,
      breakdownId: selectedBreakdownForWo?.id,
      diagnosis: woDiagnosis,
      priority: woPriority,
      assignedTechnicianId: woTechId,
      workDescription: woDescription,
      expectedCompletion: exp.toISOString()
    });

    if (res.success) {
      setIsCreateWorkOrderOpen(false);
      setSelectedBreakdownForWo(null);
    }
  };

  const handleRequestPartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkOrder) return;
    setReqError(null);

    const res = requestSparePart({
      workOrderId: selectedWorkOrder.id,
      vehicleId: selectedWorkOrder.vehicleId,
      partId: reqPartId,
      quantityRequested: reqQuantity,
      justification: reqJustification,
      priority: selectedWorkOrder.priority
    });

    if (!res.success) {
      setReqError(res.error || 'Failed to request part');
    } else {
      // refresh selected work order
      const updated = state.workOrders.find(w => w.id === selectedWorkOrder.id);
      if (updated) setSelectedWorkOrder(updated);
    }
  };

  const handleReleaseSubmit = () => {
    if (!selectedWorkOrder) return;
    setReleaseError(null);

    const res = releaseVehicleFromWorkshop(
      selectedWorkOrder.id,
      releaseInspectionPassed,
      releaseNotes
    );

    if (!res.success) {
      setReleaseError(res.error || 'Release authorization failed');
    } else {
      setSelectedWorkOrder(null);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-500" />
            Central Fleet Workshop & Breakdown Control
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Defect logging, work order diagnosis, technician job cards, spare requisition, and QA release sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setBreakdownError(null);
              setIsReportBreakdownOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-950/40 transition-all cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Report Breakdown / Defect</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('work_orders')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
              activeTab === 'work_orders' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Work Orders ({state.workOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('breakdowns')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
              activeTab === 'breakdowns' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Breakdown Log ({state.breakdowns.length})
          </button>
        </div>

        {activeTab === 'work_orders' && (
          <div className="flex items-center gap-2 pr-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-slate-950 text-slate-300 text-xs rounded-lg px-2.5 py-1 border border-slate-800 focus:outline-none"
            >
              <option value="all">All Stages</option>
              <option value="active">Active In Workshop</option>
              <option value="awaiting_parts">Awaiting Spare Parts</option>
              <option value="released">Released / Completed</option>
            </select>
          </div>
        )}
      </div>

      {/* WORK ORDERS VIEW */}
      {activeTab === 'work_orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Work Order</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Diagnosis & Scope</th>
                  <th className="py-3.5 px-4">Assigned Technician</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Repair Stage</th>
                  <th className="py-3.5 px-4">Downtime</th>
                  <th className="py-3.5 px-4 text-right">Job Card Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredWorkOrders.map((wo) => {
                  const vehicle = state.vehicles.find(v => v.id === wo.vehicleId);
                  const tech = state.technicians.find(t => t.id === wo.assignedTechnicianId);

                  return (
                    <tr key={wo.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {wo.workOrderReference}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{vehicle?.fleetNumber}</div>
                        <div className="text-[11px] text-slate-400">{vehicle?.registrationNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs">
                        <div className="font-semibold text-slate-200">{wo.diagnosis}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{wo.workDescription}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{tech?.name || 'Unassigned'}</div>
                        <div className="text-[10px] text-slate-500">{tech?.specialty}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          wo.priority === 'critical' ? 'bg-red-600 text-white' :
                          wo.priority === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {wo.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          wo.stage === 'released' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          wo.stage === 'awaiting_spare_parts' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          wo.stage === 'repair_in_progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {wo.stage.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {wo.downtimeHours ? `${wo.downtimeHours} hrs` : '1.5 hrs'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedWorkOrder(wo)}
                          className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                        >
                          Manage Job Card →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BREAKDOWNS VIEW */}
      {activeTab === 'breakdowns' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Breakdown Ref</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Fault Category & Details</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Reported By / Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {state.breakdowns.map((bd) => {
                  const vehicle = state.vehicles.find(v => v.id === bd.vehicleId);

                  return (
                    <tr key={bd.id} className="hover:bg-slate-850">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{bd.breakdownReference}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{vehicle?.fleetNumber}</div>
                        <div className="text-[11px] text-slate-400">{vehicle?.registrationNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-sm">
                        <div className="font-semibold text-slate-200">{bd.faultCategory}</div>
                        <p className="text-[11px] text-slate-400">{bd.faultDescription}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          bd.severity === 'critical' ? 'bg-red-600 text-white' :
                          bd.severity === 'high' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {bd.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                        <div>{bd.reportedBy}</div>
                        <div className="text-slate-500">{bd.vehicleLocation}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-slate-800 text-slate-300">
                          {bd.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {bd.status === 'reported' && (
                          <button
                            onClick={() => {
                              setSelectedBreakdownForWo(bd);
                              setWoVehicleId(bd.vehicleId);
                              setWoDiagnosis(bd.faultDescription);
                              setWoPriority(bd.severity);
                              setWoDescription(`Address defect: ${bd.faultDescription}`);
                              setIsCreateWorkOrderOpen(true);
                            }}
                            className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                          >
                            Create Work Order
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT BREAKDOWN MODAL */}
      {isReportBreakdownOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                Report Vehicle Breakdown or Mechanical Defect
              </h3>
              <button
                onClick={() => setIsReportBreakdownOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportBreakdownSubmit} className="p-5 space-y-4 text-xs">
              {breakdownError && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-200">
                  {breakdownError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Vehicle</label>
                  <select
                    value={breakdownVehicleId}
                    onChange={(e) => setBreakdownVehicleId(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                  >
                    {state.vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.fleetNumber} ({v.registrationNumber}) - {v.make}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Severity Classification</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as BreakdownSeverity)}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                  >
                    <option value="critical">Critical: Locks Dispatch Immediately</option>
                    <option value="high">High: Requires Urgent Attention</option>
                    <option value="medium">Medium: Scheduled Workshop Check</option>
                    <option value="low">Low: Minor Observation / Non-critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Fault Category</label>
                <select
                  value={faultCategory}
                  onChange={(e) => setFaultCategory(e.target.value as any)}
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                >
                  <option value="Braking System">Braking System (Pneumatics / Pads / Drums)</option>
                  <option value="Engine & Transmission">Engine & Transmission (Power / Oil Pressure)</option>
                  <option value="Electrical & Lights">Electrical & Lights (Starter / Alternator / Wiring)</option>
                  <option value="Tyres & Wheels">Tyres & Wheels (Punctures / Blowouts / Studs)</option>
                  <option value="Suspension & Steering">Suspension & Steering (Air Springs / Kingpins)</option>
                  <option value="Cooling System">Cooling System (Radiator / Water Pump / Belts)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Fault Description</label>
                <textarea
                  value={faultDescription}
                  onChange={(e) => setFaultDescription(e.target.value)}
                  rows={2}
                  required
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Current Vehicle Location</label>
                  <input
                    type="text"
                    value={vehicleLocation}
                    onChange={(e) => setVehicleLocation(e.target.value)}
                    required
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Immediate Safety Action</label>
                  <input
                    type="text"
                    value={immediateAction}
                    onChange={(e) => setImmediateAction(e.target.value)}
                    required
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReportBreakdownOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Log Breakdown Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE WORK ORDER MODAL */}
      {isCreateWorkOrderOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-500" />
                Open Workshop Work Order
              </h3>
              <button
                onClick={() => setIsCreateWorkOrderOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWoSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Vehicle</label>
                  <select
                    value={woVehicleId}
                    onChange={(e) => setWoVehicleId(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
                  >
                    {state.vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.fleetNumber} ({v.registrationNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={woPriority}
                    onChange={(e) => setWoPriority(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Primary Assigned Technician</label>
                <select
                  value={woTechId}
                  onChange={(e) => setWoTechId(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                >
                  {state.technicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.specialty}) • {t.activeWorkOrdersCount} Active
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Technical Diagnosis</label>
                <input
                  type="text"
                  value={woDiagnosis}
                  onChange={(e) => setWoDiagnosis(e.target.value)}
                  required
                  placeholder="e.g. Scored brake drums and leaking seal"
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Detailed Repair Instructions</label>
                <textarea
                  value={woDescription}
                  onChange={(e) => setWoDescription(e.target.value)}
                  rows={2}
                  required
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateWorkOrderOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Issue Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE WORK ORDER DETAIL MODAL */}
      {selectedWorkOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-amber-400 text-base">{selectedWorkOrder.workOrderReference}</span>
                <span className="text-xs text-slate-400 ml-2">Job Card Detail</span>
              </div>
              <button
                onClick={() => setSelectedWorkOrder(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
              {releaseError && (
                <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-200">
                  {releaseError}
                </div>
              )}

              {/* WO Info Header */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Vehicle</span>
                  <div className="font-bold text-slate-200 mt-0.5">
                    {state.vehicles.find(v => v.id === selectedWorkOrder.vehicleId)?.fleetNumber}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Technician</span>
                  <div className="font-semibold text-slate-200 mt-0.5">
                    {state.technicians.find(t => t.id === selectedWorkOrder.assignedTechnicianId)?.name || 'Unassigned'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Current Stage</span>
                  <div className="font-semibold text-amber-400 mt-0.5 uppercase">
                    {selectedWorkOrder.stage.replace(/_/g, ' ')}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase">Priority</span>
                  <div className="font-semibold text-red-400 mt-0.5 uppercase">
                    {selectedWorkOrder.priority}
                  </div>
                </div>
              </div>

              {/* Stage Progression Buttons */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Update Repair Stage:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(['diagnosed', 'awaiting_spare_parts', 'repair_in_progress', 'repair_completed', 'awaiting_quality_inspection'] as WorkOrderStage[]).map(stage => (
                    <button
                      key={stage}
                      onClick={() => updateWorkOrderStage(selectedWorkOrder.id, stage)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                        selectedWorkOrder.stage === stage 
                          ? 'bg-amber-500 text-slate-950 font-bold' 
                          : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {stage.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Requisition Spare Parts Section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Package className="w-4 h-4" /> Requisition Spare Parts From Central Stores
                  </span>
                </div>

                {reqError && (
                  <div className="p-2 bg-red-950/60 border border-red-800 rounded text-red-200 text-[11px]">
                    {reqError}
                  </div>
                )}

                <form onSubmit={handleRequestPartSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="md:col-span-2">
                    <select
                      value={reqPartId}
                      onChange={(e) => setReqPartId(e.target.value)}
                      className="w-full bg-slate-900 text-slate-200 text-xs rounded-lg p-2 border border-slate-700"
                    >
                      {state.parts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.partCode} - {p.partName} (Stock: {p.currentStock} {p.unitOfMeasure})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min={1}
                      value={reqQuantity}
                      onChange={(e) => setReqQuantity(Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full bg-slate-900 text-slate-200 text-xs rounded-lg p-2 border border-slate-700"
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                    >
                      Submit Requisition to Stores
                    </button>
                  </div>
                </form>

                {/* Show existing requisitions for this WO */}
                {state.spareRequests.filter(s => s.workOrderId === selectedWorkOrder.id).length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold">Active Requisitions on File:</span>
                    {state.spareRequests.filter(s => s.workOrderId === selectedWorkOrder.id).map(sr => {
                      const part = state.parts.find(p => p.id === sr.partId);
                      return (
                        <div key={sr.id} className="bg-slate-900 p-2 rounded border border-slate-800 text-[11px] flex items-center justify-between">
                          <span>{sr.quantityRequested}x {part?.partName} ({part?.partCode})</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            sr.status === 'issued' ? 'bg-emerald-500/20 text-emerald-300' :
                            sr.status === 'approved' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-amber-500/20 text-amber-300'
                          }`}>
                            {sr.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Release Vehicle Authorization (PRD 9.8 Rule) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Vehicle QA Inspection & Workshop Release Sign-off
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Per Usangu PRD Section 9.8: Repair completion alone does NOT release the vehicle. Release requires QA inspection clearance and supervisor authorization.
                </p>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={releaseInspectionPassed}
                      onChange={(e) => setReleaseInspectionPassed(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 bg-slate-900 border-slate-700 rounded"
                    />
                    <span className="font-semibold text-slate-200">
                      I certify that post-repair QA testing has passed and no critical safety defects remain.
                    </span>
                  </label>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Supervisor Release Notes</label>
                    <textarea
                      value={releaseNotes}
                      onChange={(e) => setReleaseNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900 text-slate-200 text-xs rounded-lg p-2 border border-slate-700"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleReleaseSubmit}
                    disabled={selectedWorkOrder.stage === 'released'}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {selectedWorkOrder.stage === 'released' ? 'Already Released' : 'Authorise Vehicle Release to Operational Fleet'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
