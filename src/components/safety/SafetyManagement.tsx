import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InspectionItem, InspectionType, VehicleInspection, IncidentReport } from '../../types';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, Plus, CheckCircle2, 
  X, Check, FileText, UserCheck, Flame, Car, FileSpreadsheet
} from 'lucide-react';

export const SafetyManagement: React.FC = () => {
  const { 
    state, 
    submitInspection, 
    resolveCriticalDefect, 
    reportIncident, 
    closeIncident 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inspections' | 'critical_defects' | 'incidents'>('inspections');
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  // Form: Inspection
  const [inspVehicleId, setInspVehicleId] = useState(state.vehicles[0]?.id || '');
  const [inspType, setInspType] = useState<InspectionType>('pre_trip');
  const [inspOdo, setInspOdo] = useState<number>(state.vehicles[0]?.currentOdometer || 120000);
  const [inspRemarks, setInspRemarks] = useState('Routine pre-dispatch safety and roadworthiness walkaround.');
  const [inspItems, setInspItems] = useState<InspectionItem[]>([
    { id: 'item-1', category: 'Mechanical & Brakes', name: 'Service Brake Application & Line Pressure', isCritical: true, result: 'pass' },
    { id: 'item-2', category: 'Mechanical & Brakes', name: 'Air Compressor & Reservoir Pressure Retention (>6.5 bar)', isCritical: true, result: 'pass' },
    { id: 'item-3', category: 'Mechanical & Brakes', name: 'Steering Mechanism, Drag Link & Kingpin Play', isCritical: true, result: 'pass' },
    { id: 'item-4', category: 'Vehicle Exterior', name: 'Tyre Tread Depth, Inflation & Wheel Nut Torque', isCritical: true, result: 'pass' },
    { id: 'item-5', category: 'Vehicle Exterior', name: 'Headlamps, Indicators, Brake & Reverse Lights', isCritical: false, result: 'pass' },
    { id: 'item-6', category: 'Safety Equipment', name: 'Fire Extinguisher Gauge in Green Zone (Charged)', isCritical: true, result: 'pass' },
    { id: 'item-7', category: 'Safety Equipment', name: 'Reflective Warning Triangles (Pair)', isCritical: false, result: 'pass' },
    { id: 'item-8', category: 'Documentation & Compliance', name: 'LATRA Commercial License & Insurance Certificate', isCritical: true, result: 'pass' },
  ]);

  // Form: Incident
  const [incVehicleId, setIncVehicleId] = useState(state.vehicles[0]?.id || '');
  const [incDriverId, setIncDriverId] = useState(state.drivers[0]?.id || '');
  const [incLocation, setIncLocation] = useState('Dar Port Terminal Gate 4 Queue Area');
  const [incType, setIncType] = useState<IncidentReport['incidentType']>('Minor Scrape/Dent');
  const [incSeverity, setIncSeverity] = useState<IncidentReport['severity']>('low');
  const [incDesc, setIncDesc] = useState('');
  const [incImmediateAction, setIncImmediateAction] = useState('');
  const [incCorrectiveAction, setIncCorrectiveAction] = useState('');
  const [incCost, setIncCost] = useState<number>(0);

  const criticalDefectVehicles = state.vehicles.filter(v => v.hasCriticalDefect);

  const handleItemResultChange = (itemId: string, result: 'pass' | 'fail' | 'requires_attention') => {
    setInspItems(prev => prev.map(item => item.id === itemId ? { ...item, result } : item));
  };

  const handleInspectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitInspection({
      inspectionType: inspType,
      vehicleId: inspVehicleId,
      odometer: inspOdo,
      items: inspItems,
      remarks: inspRemarks
    });
    setIsInspectionModalOpen(false);
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportIncident({
      vehicleId: incVehicleId,
      driverId: incDriverId,
      date: new Date().toISOString().split('T')[0],
      location: incLocation,
      incidentType: incType,
      severity: incSeverity,
      description: incDesc,
      injuriesRecorded: false,
      estimatedDamageTZS: incCost,
      immediateActionTaken: incImmediateAction,
      correctiveAction: incCorrectiveAction,
      responsibleOfficer: state.currentUser.name
    });
    setIsIncidentModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            Safety, Compliance & Quality Inspection
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pre-trip & post-trip roadworthiness checks, critical defect lockout enforcement, and incident registers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInspectionModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Perform Safety Inspection</span>
          </button>
          <button
            onClick={() => setIsIncidentModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Log Safety Incident</span>
          </button>
        </div>
      </div>

      {/* Critical Defect Lockout Banner (if any) */}
      {criticalDefectVehicles.length > 0 && (
        <div className="bg-red-950/40 border border-red-800 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-red-400 font-bold text-xs uppercase flex items-center gap-1.5 tracking-wider">
              <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
              Active Dispatch Lockouts ({criticalDefectVehicles.length} Vehicles Under Safety Hold)
            </span>
            <span className="text-[11px] text-red-300 font-semibold bg-red-900/60 px-2 py-0.5 rounded">
              DISPATCH PROHIBITED
            </span>
          </div>
          <div className="space-y-2">
            {criticalDefectVehicles.map(v => (
              <div key={v.id} className="bg-slate-900/90 p-3 rounded-lg border border-red-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-200 flex items-center gap-2">
                    <span className="font-mono text-amber-400">{v.fleetNumber}</span>
                    <span>({v.registrationNumber})</span>
                    <span className="text-slate-400 font-normal">• {v.make} {v.model}</span>
                  </div>
                  <p className="text-red-300 mt-1 text-[11px]">
                    <strong>Critical Reason:</strong> {v.criticalDefectReason}
                  </p>
                </div>
                <button
                  onClick={() => resolveCriticalDefect(v.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 self-start sm:self-center transition-colors"
                >
                  Clear Safety Lockout
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('inspections')}
          className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
            activeTab === 'inspections' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Vehicle Inspection Audits ({state.inspections.length})
        </button>
        <button
          onClick={() => setActiveTab('critical_defects')}
          className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
            activeTab === 'critical_defects' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Critical Defect Restraints ({criticalDefectVehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
            activeTab === 'incidents' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Incidents & Corrective Actions ({state.incidents.length})
        </button>
      </div>

      {/* INSPECTIONS VIEW */}
      {activeTab === 'inspections' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Inspection Ref</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Odometer</th>
                  <th className="py-3.5 px-4">Audited Items</th>
                  <th className="py-3.5 px-4">Result</th>
                  <th className="py-3.5 px-4">Inspected By / Date</th>
                  <th className="py-3.5 px-4 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {state.inspections.map((insp) => {
                  const vehicle = state.vehicles.find(v => v.id === insp.vehicleId);

                  return (
                    <tr key={insp.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{insp.inspectionReference}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{vehicle?.fleetNumber}</div>
                        <div className="text-[11px] text-slate-400">{vehicle?.registrationNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[10px] font-semibold text-slate-300">
                        {insp.inspectionType.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {insp.odometer?.toLocaleString()} km
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {insp.items.length} Checked
                      </td>
                      <td className="py-3.5 px-4">
                        {insp.overallPassed ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            PASSED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                            <ShieldAlert className="w-3 h-3" />
                            FAILED CRITICAL
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        <div>{insp.inspectedBy}</div>
                        <div className="text-[10px] text-slate-500">{new Date(insp.inspectedAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] text-right italic max-w-xs truncate">
                        {insp.remarks || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRITICAL DEFECTS VIEW */}
      {activeTab === 'critical_defects' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Critical Roadworthiness Restraint Roster</h3>
            <span className="text-xs text-slate-400">Total Locked: {criticalDefectVehicles.length} Vehicles</span>
          </div>

          {criticalDefectVehicles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-white">All Town Trip Vehicles Clear</div>
              <p className="text-xs text-slate-400">Zero active critical defect lockouts across the active fleet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {criticalDefectVehicles.map(v => (
                <div key={v.id} className="bg-slate-950 p-4 rounded-xl border border-red-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 text-sm">{v.fleetNumber}</span>
                      <span className="font-bold text-white">({v.registrationNumber})</span>
                      <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                        DISPATCH BLOCKED
                      </span>
                    </div>
                    <p className="text-xs text-red-200 mt-1">
                      <strong>Defect Detail:</strong> {v.criticalDefectReason}
                    </p>
                    <div className="text-[11px] text-slate-400">
                      Odometer: {v.currentOdometer.toLocaleString()} km • Make: {v.make} {v.model}
                    </div>
                  </div>
                  <button
                    onClick={() => resolveCriticalDefect(v.id)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0"
                  >
                    Authorize Re-inspection & Clear Lock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INCIDENTS VIEW */}
      {activeTab === 'incidents' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Incident Ref</th>
                  <th className="py-3.5 px-4">Date / Location</th>
                  <th className="py-3.5 px-4">Vehicle & Driver</th>
                  <th className="py-3.5 px-4">Incident Type & Description</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Damage Cost (TZS)</th>
                  <th className="py-3.5 px-4">Corrective Action</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {state.incidents.map((inc) => {
                  const vehicle = state.vehicles.find(v => v.id === inc.vehicleId);
                  const driver = state.drivers.find(d => d.id === inc.driverId);

                  return (
                    <tr key={inc.id} className="hover:bg-slate-850/60">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{inc.incidentReference}</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{inc.date}</div>
                        <div className="text-[11px] text-slate-500">{inc.location}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{vehicle?.fleetNumber}</div>
                        <div className="text-[11px] text-slate-400">{driver?.name}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs">
                        <div className="font-semibold text-slate-200">{inc.incidentType}</div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{inc.description}</p>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-slate-300">
                        {inc.severity}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200">
                        TZS {inc.estimatedDamageTZS.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-xs line-clamp-1">
                        {inc.correctiveAction}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {inc.isClosed ? (
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                            CLOSED
                          </span>
                        ) : (
                          <button
                            onClick={() => closeIncident(inc.id, 'Investigation completed; corrective measures applied.')}
                            className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px]"
                          >
                            Close Case
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

      {/* INSPECTION FORM MODAL */}
      {isInspectionModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                Perform Vehicle Roadworthiness Inspection
              </h3>
              <button
                onClick={() => setIsInspectionModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInspectionSubmit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Prime Mover</label>
                  <select
                    value={inspVehicleId}
                    onChange={(e) => setInspVehicleId(e.target.value)}
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
                  <label className="block font-semibold text-slate-300 mb-1">Inspection Type</label>
                  <select
                    value={inspType}
                    onChange={(e) => setInspType(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
                  >
                    <option value="pre_trip">Pre-Trip Gate Departure</option>
                    <option value="post_trip">Post-Trip Return Inspection</option>
                    <option value="workshop">Workshop QA Release Inspection</option>
                    <option value="periodic_safety">Periodic 5,000km Audit</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Odometer (km)</label>
                  <input
                    type="number"
                    value={inspOdo}
                    onChange={(e) => setInspOdo(Number(e.target.value))}
                    className="w-full bg-slate-950 text-white font-mono font-bold text-xs rounded-lg p-2 border border-slate-800"
                  />
                </div>
              </div>

              {/* Inspection Checklist Items */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Standardised Roadworthiness Checklist</span>
                  <span className="text-[10px] text-red-400 font-semibold">*Critical items block dispatch if failed</span>
                </div>

                <div className="space-y-2">
                  {inspItems.map(item => (
                    <div key={item.id} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.isCritical && (
                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                              [CRITICAL]
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">{item.category}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleItemResultChange(item.id, 'pass')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                            item.result === 'pass' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          Pass
                        </button>
                        <button
                          type="button"
                          onClick={() => handleItemResultChange(item.id, 'fail')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                            item.result === 'fail' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          Fail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Inspector Remarks</label>
                <textarea
                  value={inspRemarks}
                  onChange={(e) => setInspRemarks(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2.5 border border-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInspectionModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Submit & Enforce Roadworthiness Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INCIDENT FORM MODAL */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Log Fleet Safety Incident
              </h3>
              <button
                onClick={() => setIsIncidentModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIncidentSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Involved Vehicle</label>
                  <select
                    value={incVehicleId}
                    onChange={(e) => setIncVehicleId(e.target.value)}
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
                  <label className="block font-semibold text-slate-300 mb-1">Driver</label>
                  <select
                    value={incDriverId}
                    onChange={(e) => setIncDriverId(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
                  >
                    {state.drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.staffId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Incident Type</label>
                  <select
                    value={incType}
                    onChange={(e) => setIncType(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
                  >
                    <option value="Minor Scrape/Dent">Minor Scrape/Dent</option>
                    <option value="Near Miss">Near Miss</option>
                    <option value="Tyre Blowout">Tyre Blowout</option>
                    <option value="Cargo Shift">Cargo Shift</option>
                    <option value="Traffic Violation">Traffic Violation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Severity</label>
                  <select
                    value={incSeverity}
                    onChange={(e) => setIncSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Location of Occurrence</label>
                <input
                  type="text"
                  value={incLocation}
                  onChange={(e) => setIncLocation(e.target.value)}
                  required
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Incident Description</label>
                <textarea
                  value={incDesc}
                  onChange={(e) => setIncDesc(e.target.value)}
                  rows={2}
                  required
                  placeholder="Detail exact sequence of events..."
                  className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Immediate Action Taken</label>
                  <input
                    type="text"
                    value={incImmediateAction}
                    onChange={(e) => setIncImmediateAction(e.target.value)}
                    required
                    placeholder="e.g. Breathalyzer test, vehicle parked"
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Corrective Action</label>
                  <input
                    type="text"
                    value={incCorrectiveAction}
                    onChange={(e) => setIncCorrectiveAction(e.target.value)}
                    required
                    placeholder="e.g. Driver refresher session"
                    className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg p-2 border border-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsIncidentModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Log Incident Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
