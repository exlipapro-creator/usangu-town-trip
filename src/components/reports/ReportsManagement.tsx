import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileSpreadsheet, Download, Printer, Filter, 
  Calendar, Truck, Wrench, Package, Fuel, ShieldCheck 
} from 'lucide-react';

export const ReportsManagement: React.FC = () => {
  const { state } = useApp();
  const [selectedReportType, setSelectedReportType] = useState<'shunting' | 'workshop' | 'spares' | 'fuel'>('shunting');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');

  // Filtered Trips for Shunting Report
  const filteredTrips = state.trips.filter(t => {
    if (vehicleFilter !== 'all' && t.assignedVehicleId !== vehicleFilter) return false;
    return true;
  });

  // Export to CSV Function
  const exportShuntingReportToCSV = () => {
    const headers = [
      'Date',
      'Trip Reference',
      'Vehicle Registration',
      'Fleet Number',
      'Trailer Registration',
      'Driver',
      'Assistant Driver',
      'Origin',
      'Destination',
      'Purpose',
      'Departure Time',
      'Return Time',
      'Opening Odometer',
      'Closing Odometer',
      'Distance (km)',
      'Trip Status',
      'Exception or Remarks'
    ];

    const rows = filteredTrips.map(trip => {
      const vehicle = state.vehicles.find(v => v.id === trip.assignedVehicleId);
      const trailer = state.trailers.find(t => t.id === trip.assignedTrailerId);
      const driver = state.drivers.find(d => d.id === trip.primaryDriverId);

      return [
        trip.tripDate,
        trip.tripReference,
        vehicle?.registrationNumber || '',
        vehicle?.fleetNumber || '',
        trailer?.registrationNumber || 'N/A',
        driver?.name || '',
        trip.assistantDriverId ? 'Assigned' : 'None',
        `"${trip.origin}"`,
        `"${trip.destination}"`,
        `"${trip.purpose}"`,
        trip.actualDeparture ? new Date(trip.actualDeparture).toLocaleTimeString() : 'N/A',
        trip.actualReturn ? new Date(trip.actualReturn).toLocaleTimeString() : 'N/A',
        trip.openingOdometer || '',
        trip.closingOdometer || '',
        trip.distanceKm || '',
        trip.status,
        `"${trip.returnRemarks || trip.defectNotes || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Usangu_General_Shunting_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-500" />
            General Shunting & Management Reporting
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Official Town Trip operational registers, vehicle shunting logs, and cost reconciliations.
          </p>
        </div>

        {/* Action buttons: Horizontal, touch-friendly min 44px */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportShuntingReportToCSV}
            className="flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/40 transition-colors cursor-pointer touch-manipulation"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer touch-manipulation"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs: smooth horizontal scroll on mobile */}
      <div className="no-print flex items-center gap-1 bg-slate-900 p-2 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full">
        <button
          onClick={() => setSelectedReportType('shunting')}
          className={`min-h-[40px] px-3.5 py-2 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer touch-manipulation ${
            selectedReportType === 'shunting' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          General Shunting Report
        </button>
        <button
          onClick={() => setSelectedReportType('workshop')}
          className={`min-h-[40px] px-3.5 py-2 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer touch-manipulation ${
            selectedReportType === 'workshop' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Workshop & Downtime Summary
        </button>
        <button
          onClick={() => setSelectedReportType('spares')}
          className={`min-h-[40px] px-3.5 py-2 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer touch-manipulation ${
            selectedReportType === 'spares' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Spares Consumption Ledger
        </button>
        <button
          onClick={() => setSelectedReportType('fuel')}
          className={`min-h-[40px] px-3.5 py-2 rounded-lg transition-all font-semibold whitespace-nowrap cursor-pointer touch-manipulation ${
            selectedReportType === 'fuel' ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Fuel Expenditure & Burn Rate
        </button>
      </div>

      {/* REPORT CONTENT VIEW */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4 print-card">
        {/* Printable Official Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-amber-500 font-bold text-xs uppercase tracking-wider">USANGU LOGISTICS (T) LTD</div>
            <h2 className="text-lg font-black text-white">
              {selectedReportType === 'shunting' && 'GENERAL SHUNTING REPORT — TOWN TRIP OPERATIONS'}
              {selectedReportType === 'workshop' && 'CENTRAL FLEET WORKSHOP DOWNTIME & REPAIR REPORT'}
              {selectedReportType === 'spares' && 'SPARE PARTS CONSUMPTION & COST LEDGER REPORT'}
              {selectedReportType === 'fuel' && 'FUEL DISPENSING & VEHICLE BURN RATE REPORT'}
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Hub: Dar es Salaam Kurasini Yard · Extracted: {new Date().toLocaleString()} EAT
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400">
            <div><strong>Generated by:</strong> {state.currentUser.name}</div>
            <div><strong>Role:</strong> {state.currentUser.department}</div>
          </div>
        </div>

        {/* 1. GENERAL SHUNTING REPORT (Exact PRD Section 14.4 Columns) */}
        {selectedReportType === 'shunting' && (
          <div>
            {/* Desktop 17-column Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Trip Ref</th>
                    <th className="py-2.5 px-3">Vehicle Reg</th>
                    <th className="py-2.5 px-3">Fleet #</th>
                    <th className="py-2.5 px-3">Trailer</th>
                    <th className="py-2.5 px-3">Driver</th>
                    <th className="py-2.5 px-3">Origin</th>
                    <th className="py-2.5 px-3">Destination</th>
                    <th className="py-2.5 px-3">Purpose</th>
                    <th className="py-2.5 px-3">Dep Time</th>
                    <th className="py-2.5 px-3">Ret Time</th>
                    <th className="py-2.5 px-3">Open Odo</th>
                    <th className="py-2.5 px-3">Close Odo</th>
                    <th className="py-2.5 px-3">Dist (km)</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-[11px]">
                  {filteredTrips.map((trip) => {
                    const vehicle = state.vehicles.find(v => v.id === trip.assignedVehicleId);
                    const trailer = state.trailers.find(t => t.id === trip.assignedTrailerId);
                    const driver = state.drivers.find(d => d.id === trip.primaryDriverId);

                    return (
                      <tr key={trip.id} className="hover:bg-slate-850/60">
                        <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">{trip.tripDate}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">{trip.tripReference}</td>
                        <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">{vehicle?.registrationNumber}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300">{vehicle?.fleetNumber}</td>
                        <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{trailer?.registrationNumber || 'None'}</td>
                        <td className="py-2.5 px-3 text-slate-200 whitespace-nowrap">{driver?.name}</td>
                        <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{trip.origin}</td>
                        <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{trip.destination}</td>
                        <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">{trip.purpose}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                          {trip.actualDeparture ? new Date(trip.actualDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-400 whitespace-nowrap">
                          {trip.actualReturn ? new Date(trip.actualReturn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300 tabular-nums">{trip.openingOdometer?.toLocaleString() || '-'}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-300 tabular-nums">{trip.closingOdometer?.toLocaleString() || '-'}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 tabular-nums">{trip.distanceKm ? `${trip.distanceKm} km` : '-'}</td>
                        <td className="py-2.5 px-3 uppercase text-[10px] font-semibold text-slate-300 whitespace-nowrap">{trip.status.replace(/_/g, ' ')}</td>
                        <td className="py-2.5 px-3 text-slate-400 text-[10px] max-w-xs truncate">{trip.returnRemarks || trip.defectNotes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Shunting Report Cards */}
            <div className="md:hidden divide-y divide-slate-800/80">
              {filteredTrips.map((trip) => {
                const vehicle = state.vehicles.find(v => v.id === trip.assignedVehicleId);
                const trailer = state.trailers.find(t => t.id === trip.assignedTrailerId);
                const driver = state.drivers.find(d => d.id === trip.primaryDriverId);

                return (
                  <div key={trip.id} className="py-3.5 space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-amber-400 text-sm">{trip.tripReference}</span>
                        <div className="text-[11px] text-slate-400">{trip.tripDate}</div>
                      </div>
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                        {trip.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 text-[11px]">
                      <div>
                        <span className="text-slate-500 block">Vehicle</span>
                        <span className="text-white font-semibold">{vehicle?.fleetNumber} ({vehicle?.registrationNumber})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Driver</span>
                        <span className="text-slate-200">{driver?.name || 'Unassigned'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Route</span>
                        <span className="text-slate-300 truncate block">{trip.origin} → {trip.destination}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Distance</span>
                        <span className="text-emerald-400 font-bold font-mono">{trip.distanceKm ? `${trip.distanceKm} km` : 'In transit'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. WORKSHOP SUMMARY */}
        {selectedReportType === 'workshop' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">WO Reference</th>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Diagnosis</th>
                  <th className="py-2.5 px-3">Technician</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Downtime (Hours)</th>
                  <th className="py-2.5 px-3">QA Released By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-[11px]">
                {state.workOrders.map((wo) => {
                  const vehicle = state.vehicles.find(v => v.id === wo.vehicleId);
                  const tech = state.technicians.find(t => t.id === wo.assignedTechnicianId);

                  return (
                    <tr key={wo.id} className="hover:bg-slate-850/60">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{wo.workOrderReference}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{vehicle?.fleetNumber} ({vehicle?.registrationNumber})</td>
                      <td className="py-2.5 px-3 text-slate-300">{wo.diagnosis}</td>
                      <td className="py-2.5 px-3 text-slate-300">{tech?.name || 'Unassigned'}</td>
                      <td className="py-2.5 px-3 uppercase font-semibold text-[10px]">{wo.stage.replace(/_/g, ' ')}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">{wo.downtimeHours || 1.5} hrs</td>
                      <td className="py-2.5 px-3 text-slate-400">{wo.releasedBy || 'Under repair'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. SPARES CONSUMPTION REPORT */}
        {selectedReportType === 'spares' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Part Code</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Unit Cost (TZS)</th>
                  <th className="py-2.5 px-3">Current Balance</th>
                  <th className="py-2.5 px-3">Issued to Date</th>
                  <th className="py-2.5 px-3">Total Inventory Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-[11px]">
                {state.parts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{p.partCode}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{p.partName}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">TZS {p.unitCostTZS.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{p.currentStock} {p.unitOfMeasure}</td>
                    <td className="py-2.5 px-3 font-mono text-blue-400">
                      {Math.abs(state.stockMovements.filter(sm => sm.partId === p.id && sm.movementType === 'issue').reduce((a, b) => a + b.quantity, 0))} {p.unitOfMeasure}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-200">
                      TZS {(p.currentStock * p.unitCostTZS).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. FUEL REPORT */}
        {selectedReportType === 'fuel' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Transaction</th>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Station</th>
                  <th className="py-2.5 px-3">Volume</th>
                  <th className="py-2.5 px-3">Total Spend</th>
                  <th className="py-2.5 px-3">Burn Rate</th>
                  <th className="py-2.5 px-3">Exception Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-[11px]">
                {state.fuelTransactions.map((tx) => {
                  const vehicle = state.vehicles.find(v => v.id === tx.vehicleId);

                  return (
                    <tr key={tx.id} className="hover:bg-slate-850/60">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{tx.transactionReference}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{vehicle?.fleetNumber}</td>
                      <td className="py-2.5 px-3 text-slate-300">{tx.supplierOrStation}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">{tx.litres} L</td>
                      <td className="py-2.5 px-3 font-mono text-slate-200">TZS {tx.totalCostTZS.toLocaleString()}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                        {tx.consumptionLitersPer100Km ? `${tx.consumptionLitersPer100Km} L/100km` : '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        {tx.hasException ? (
                          <span className="text-yellow-400 font-bold">Flagged Anomaly</span>
                        ) : (
                          <span className="text-emerald-400">Normal</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
